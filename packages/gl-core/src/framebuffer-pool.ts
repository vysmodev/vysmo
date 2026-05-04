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

/**
 * Reusable ping-pong framebuffer allocator. Owns a set of framebuffers
 * at a fixed size and format; re-allocates when any of (count, width,
 * height, hdr) changes.
 *
 * **Important call-site pattern:** `ensure()` creates textures by
 * binding them to `gl.TEXTURE_2D` on the currently-active texture unit.
 * If you bind a source texture first and THEN call `ensure()`, the
 * source's unit will be clobbered and your effect will sample the
 * freshly-created FBO texture instead. Always call `ensure()` BEFORE
 * any `activeTexture` / `bindTexture` for sampler inputs.
 */
export class FramebufferPool {
  private gl: WebGL2RenderingContext;
  private fbs: PooledFramebuffer[] = [];
  private width = 0;
  private height = 0;
  private hdr = false;
  private hdrExtensionChecked = false;
  private hdrExtensionAvailable = false;

  /**
   * @param gl  Owning WebGL2 context. The pool's allocations are tied to
   *            this context's lifetime; on context loss + restore call
   *            `resetContextState()` before the next `ensure()`.
   */
  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * Return at least `count` framebuffers sized `width × height` with the
   * requested format. Reuses the existing pool when shape and format
   * match; reallocates from scratch otherwise. The returned array is a
   * live view into the pool — do not retain references across an
   * `ensure()` call that resizes.
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

    if (
      this.fbs.length >= count &&
      this.width === width &&
      this.height === height &&
      this.hdr === hdr
    ) {
      return count === this.fbs.length ? this.fbs : this.fbs.slice(0, count);
    }

    this.dispose();
    for (let i = 0; i < count; i++) {
      const tex = this.createTexture(width, height, hdr);
      const fb = this.createFramebuffer(tex);
      this.fbs.push({ fb, tex, width, height });
    }
    this.width = width;
    this.height = height;
    this.hdr = hdr;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    return this.fbs;
  }

  /**
   * `true` when the pool successfully allocated HDR (`RGBA16F`)
   * attachments. `false` when HDR was requested but `EXT_color_buffer_float`
   * isn't available — in which case `ensure({ hdr: true })` silently fell
   * back to LDR (`RGBA8`).
   */
  get isHdrActive(): boolean {
    return this.hdr;
  }

  /** Number of framebuffers currently allocated. */
  get count(): number {
    return this.fbs.length;
  }

  /** Free every framebuffer + colour attachment owned by the pool. */
  dispose(): void {
    const gl = this.gl;
    for (const f of this.fbs) {
      gl.deleteFramebuffer(f.fb);
      gl.deleteTexture(f.tex);
    }
    this.fbs = [];
    this.width = 0;
    this.height = 0;
    this.hdr = false;
  }

  /**
   * Reset HDR extension state — call after a context-loss + restore so
   * the pool re-queries the extension rather than trusting a stale flag.
   */
  resetContextState(): void {
    this.hdrExtensionChecked = false;
    this.hdrExtensionAvailable = false;
    this.fbs = [];
    this.width = 0;
    this.height = 0;
    this.hdr = false;
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
