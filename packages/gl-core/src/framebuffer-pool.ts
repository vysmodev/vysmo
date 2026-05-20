export interface PooledFramebuffer {
  readonly fb: WebGLFramebuffer;
  readonly tex: WebGLTexture;
  readonly width: number;
  readonly height: number;
}

export interface EnsureOptions {
  /**
   * Allocate `RGBA16F` colour attachments instead of `RGBA8`. Required
   * for multi-pass effects that produce intermediate values outside
   * [0, 1] — bright-pass / bloom / glow / any HDR composite.
   *
   * Requires the `EXT_color_buffer_float` extension. When unavailable,
   * the pool silently falls back to LDR; check `isHdrActive` if
   * correctness matters.
   */
  hdr?: boolean;
}

export interface FramebufferPoolOptions {
  /**
   * Maximum number of distinct `(width, height, hdr)` slots the pool
   * holds simultaneously. Each slot owns the FBO `count` requested by
   * the last `ensure()` for that key. When the pool is at capacity
   * and a new key is requested, the least-recently-used slot is
   * disposed.
   *
   * Default: `4`. Resident GL objects ≤ `capacity × count_per_slot`.
   *
   * Set to `1` to preserve pre-0.5.0 behaviour: a single slot that
   * reallocates whenever any of `(count, width, height, hdr)` changes
   * — no LRU, no per-size persistence.
   *
   * Raise above 4 if your application renders into more than 4
   * distinct sizes per frame (e.g. per-element effects on a canvas
   * with many heterogeneously-sized elements). Cost is roughly
   * `2 × (capacity - 4)` additional GL textures held resident.
   */
  capacity?: number;
}

interface Slot {
  fbs: PooledFramebuffer[];
  width: number;
  height: number;
  hdr: boolean;
}

/**
 * Reusable ping-pong framebuffer allocator. Holds an LRU of slots
 * keyed by `(width, height, hdr)`; each slot owns a fixed count of
 * framebuffers at that size and format.
 *
 * Default capacity (4) covers the common case where most content
 * clusters into a handful of sizes (full-frame backgrounds, fit-to-
 * canvas media, captions at a couple of sizes). Per-frame size
 * alternations between cached sizes are O(1); sizes that fall outside
 * the LRU window evict the least-recently-used slot.
 *
 * **Important call-site pattern:** `ensure()` creates textures by
 * binding them to `gl.TEXTURE_2D` on the currently-active texture
 * unit. If you bind a source texture first and THEN call `ensure()`,
 * the source's unit will be clobbered. Always call `ensure()` BEFORE
 * any `activeTexture` / `bindTexture` for sampler inputs.
 */
export class FramebufferPool {
  private gl: WebGL2RenderingContext;
  /** Slots in LRU order: index 0 = most recently used. */
  private slots: Slot[] = [];
  private readonly capacity: number;
  private hdrExtensionChecked = false;
  private hdrExtensionAvailable = false;

  /**
   * @param gl  Owning WebGL2 context. The pool's allocations are tied to
   *            this context's lifetime; on context loss + restore call
   *            `resetContextState()` before the next `ensure()`.
   * @param options  Pool configuration; see `FramebufferPoolOptions`.
   */
  constructor(gl: WebGL2RenderingContext, options: FramebufferPoolOptions = {}) {
    this.gl = gl;
    this.capacity = Math.max(1, Math.floor(options.capacity ?? 4));
  }

  /**
   * Return at least `count` framebuffers sized `width × height` with the
   * requested format. Matching slot is moved to most-recently-used and
   * returned. On miss, a fresh slot is allocated; if the pool is at
   * capacity, the least-recently-used slot is disposed first.
   *
   * Requesting the same `(width, height, hdr)` with a `count` larger
   * than the slot currently holds reallocates *that slot only*; other
   * slots are untouched.
   *
   * **Bind order matters:** `ensure()` creates new textures by binding
   * them to `gl.TEXTURE_2D` on the active unit. If you have a source
   * texture bound and then call `ensure()`, that unit gets clobbered.
   * Always call `ensure()` BEFORE binding sampler inputs.
   *
   * @throws Error if texture or framebuffer allocation fails (e.g. an
   *   incomplete framebuffer status — usually a sign of an unsupported
   *   format combination).
   */
  ensure(
    count: number,
    width: number,
    height: number,
    options: EnsureOptions = {},
  ): readonly PooledFramebuffer[] {
    let hdr = options.hdr === true;
    if (hdr && !this.ensureHdrExtension()) hdr = false;

    const existingIdx = this.slots.findIndex(
      (s) => s.width === width && s.height === height && s.hdr === hdr,
    );

    if (existingIdx >= 0) {
      const slot = this.slots[existingIdx]!;
      if (slot.fbs.length >= count) {
        // Hit. Promote to MRU and return.
        if (existingIdx !== 0) {
          this.slots.splice(existingIdx, 1);
          this.slots.unshift(slot);
        }
        return count === slot.fbs.length ? slot.fbs : slot.fbs.slice(0, count);
      }
      // Same (w,h,hdr) but the caller wants a larger count — realloc
      // this slot in place. Other slots untouched.
      this.freeSlot(slot);
      this.slots.splice(existingIdx, 1);
    }

    // Miss. Evict LRU if at capacity.
    while (this.slots.length >= this.capacity) {
      const evicted = this.slots.pop();
      if (evicted) this.freeSlot(evicted);
    }

    // Allocate fresh slot at MRU.
    const fbs: PooledFramebuffer[] = [];
    for (let i = 0; i < count; i++) {
      const tex = this.createTexture(width, height, hdr);
      const fb = this.createFramebuffer(tex);
      fbs.push({ fb, tex, width, height });
    }
    const slot: Slot = { fbs, width, height, hdr };
    this.slots.unshift(slot);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    return slot.fbs;
  }

  /**
   * `true` when the most-recently-touched slot was allocated with HDR
   * (`RGBA16F`) attachments. `false` when HDR was requested but
   * `EXT_color_buffer_float` is unavailable — in which case
   * `ensure({ hdr: true })` silently fell back to LDR (`RGBA8`).
   *
   * Reflects the *last* `ensure()` call, not pool-wide state — under
   * the LRU, distinct HDR and LDR slots can coexist; this getter
   * answers "did my last call get HDR?".
   */
  get isHdrActive(): boolean {
    return this.slots[0]?.hdr ?? false;
  }

  /**
   * Total number of framebuffers across all live slots. Useful for
   * test assertions and resource accounting; not a per-slot count.
   */
  get count(): number {
    let total = 0;
    for (const s of this.slots) total += s.fbs.length;
    return total;
  }

  /** Free every framebuffer + colour attachment owned by the pool. */
  dispose(): void {
    for (const s of this.slots) this.freeSlot(s);
    this.slots = [];
  }

  /**
   * Reset HDR extension state and drop all slot bookkeeping — call
   * after a context-loss + restore so the pool re-queries the
   * extension rather than trusting a stale flag, and so it doesn't
   * try to delete framebuffers/textures from the lost context (those
   * are gone with the context).
   */
  resetContextState(): void {
    this.hdrExtensionChecked = false;
    this.hdrExtensionAvailable = false;
    this.slots = [];
  }

  private freeSlot(slot: Slot): void {
    const gl = this.gl;
    for (const f of slot.fbs) {
      gl.deleteFramebuffer(f.fb);
      gl.deleteTexture(f.tex);
    }
  }

  private ensureHdrExtension(): boolean {
    if (this.hdrExtensionChecked) return this.hdrExtensionAvailable;
    const ext = this.gl.getExtension("EXT_color_buffer_float");
    this.hdrExtensionAvailable = ext !== null;
    this.hdrExtensionChecked = true;
    return this.hdrExtensionAvailable;
  }

  private createTexture(w: number, h: number, hdr: boolean): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) throw new Error("gl.createTexture returned null");
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (hdr) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA16F,
        w,
        h,
        0,
        gl.RGBA,
        gl.HALF_FLOAT,
        null,
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        w,
        h,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  private createFramebuffer(tex: WebGLTexture): WebGLFramebuffer {
    const gl = this.gl;
    const fb = gl.createFramebuffer();
    if (!fb) throw new Error("gl.createFramebuffer returned null");
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(
        `Framebuffer allocation incomplete: 0x${status.toString(16)}`,
      );
    }
    return fb;
  }
}
