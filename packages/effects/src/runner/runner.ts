import {
  FramebufferPool,
  TextureCache,
  buildProgram,
  flipRgba8RowsInPlace,
  paramKeyToUniformName,
  setUniform,
  type RenderOptions,
  type TextureCacheOptions,
  type TextureSource,
  type UniformParams,
  type UniformValue,
} from "@vysmo/gl-core";
import type { Effect, RenderArgs } from "../types.js";
import { wrapFragmentShader } from "./shell.js";

interface CompiledEffect {
  program: WebGLProgram;
  uniforms: Map<string, WebGLUniformLocation | null>;
}

export interface RunnerOptions {
  /**
   * Render target. `OffscreenCanvas` works in workers; `HTMLCanvasElement`
   * on the main thread. Optional when `gl` is provided (the canvas is
   * derived from `gl.canvas`); required otherwise.
   */
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  /**
   * **Advanced — shared-context mode.** Existing `WebGL2RenderingContext`
   * to render into instead of creating a new one. Use this to integrate
   * with another GL-based renderer (Skia / CanvasKit, Three.js, etc.)
   * in the same browser context: when you and the upstream renderer
   * share a context, you can pass `WebGLTexture` or `SizedTexture`
   * handles as `source` with zero CPU↔GPU readback.
   *
   * **Ownership semantics when `gl` is provided:**
   * - The Runner does **not** own the context. `dispose()` cleans up
   *   Runner-allocated GL resources (VAO, compiled programs, internal
   *   default texture, framebuffers) but does **not** delete the
   *   context itself.
   * - The Runner does **not** attach `webglcontextlost` /
   *   `webglcontextrestored` listeners. You manage context lifecycle.
   * - `contextAttributes` is ignored (the context already exists).
   *
   * **State the Runner DOES reset at end of `render()`**: `useProgram`,
   * `bindVertexArray`, `bindFramebuffer`, touched texture units
   * unbound, and pixelStorei flags reset to defaults.
   *
   * **GPU pipeline ordering:** if the upstream renderer wrote to a
   * texture you're about to pass as `source`, call its `flush()`
   * before `runner.render()` so the GPU commands are ordered correctly.
   */
  gl?: WebGL2RenderingContext;
  /**
   * Forwarded to `canvas.getContext("webgl2", …)`. Defaults are
   * `{ alpha: true, antialias: false, premultipliedAlpha: false,
   * preserveDrawingBuffer: false }` — overrideable via this field.
   * Ignored when `gl` is provided (the context already exists).
   */
  contextAttributes?: WebGLContextAttributes;
  /**
   * Invoked when the WebGL context is lost. `render()` throws until the
   * context is restored — either automatically via the
   * `webglcontextrestored` event (when the canvas is an `EventTarget`)
   * or by re-creating the Runner.
   */
  onContextLost?: () => void;
  /**
   * Invoked once the runner has re-initialised after a
   * `webglcontextrestored` event. `render()` works again afterwards.
   */
  onContextRestored?: () => void;
  /**
   * Options forwarded to the internal `TextureCache`. The effects
   * Runner defaults to `{ minFilter: LINEAR, generateMipmaps: false }`
   * (effects sample neighbours, not LOD); passing your own options
   * merges with those defaults. Pass `{ maxUrlEntries: N }` to bound
   * URL-keyed GPU texture memory under lazy-loading consumers.
   */
  textureCache?: TextureCacheOptions;
  /**
   * Maximum number of distinct `(width, height, hdr)` slots the
   * internal ping-pong framebuffer pool holds at once. Defaults to
   * `4`, which covers the common case where most content clusters
   * into a handful of sizes (full-frame backgrounds, fit-to-canvas
   * media, captions at a couple of sizes).
   *
   * Only relevant when consumers pass `RenderOptions.viewport` with
   * varying dimensions across `render()` calls — without `viewport`,
   * every call uses canvas dims and only one slot is ever needed.
   *
   * Set to `1` to preserve pre-0.5.0 behaviour: a single slot that
   * reallocates on any dimension change. Raise above 4 if you
   * routinely render per-element effects at more than 4 distinct
   * sizes per frame; cost is roughly `2 × (capacity - 4)` additional
   * GL textures held resident.
   */
  framebufferPoolSize?: number;
}

/**
 * The single object that owns a WebGL2 context, compiles effect shaders
 * on first use, and renders frames. One Runner per canvas; one canvas
 * per Runner.
 *
 * Usage shape:
 *
 *     const runner = new Runner({ canvas });
 *     runner.render(blur, { source: image, params: { radius: 8 } });
 *     // … re-render with new params or sources as needed …
 *     runner.dispose();
 *
 * Programs are cached per-`Effect` reference (WeakMap), so passing the
 * same effect repeatedly compiles once and reuses thereafter. Source
 * textures are likewise cached by identity via `@vysmo/gl-core`'s
 * `TextureCache`. Multi-pass effects (e.g. bloom, glow) auto-allocate
 * a ping-pong framebuffer pool — HDR (`RGBA16F`) when `effect.hdr` is
 * set and the `EXT_color_buffer_float` extension is available.
 *
 * @throws Error if WebGL2 is unavailable in the host environment.
 */
export class Runner {
  readonly gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private textures: TextureCache;
  private readonly textureCacheOptions: TextureCacheOptions;
  private readonly flipY: boolean;
  private programs = new WeakMap<Effect<UniformParams>, CompiledEffect>();
  private vao: WebGLVertexArrayObject;
  private defaultPrevious: WebGLTexture;
  private fbPool: FramebufferPool;
  private disposed = false;
  private contextLost = false;
  /**
   * True when the Runner created its own WebGL2 context. False in
   * shared-context mode (`new Runner({ gl })`), where the consumer
   * owns the context: we skip context-loss listeners and leave the
   * context alive on `dispose()`.
   */
  private readonly ownsContext: boolean;
  private readonly onContextLost: (() => void) | undefined;
  private readonly onContextRestored: (() => void) | undefined;
  private readonly handleContextLost = (e: Event): void => {
    e.preventDefault();
    this.contextLost = true;
    this.programs = new WeakMap();
    this.onContextLost?.();
  };
  private readonly handleContextRestored = (): void => {
    this.contextLost = false;
    const vao = this.gl.createVertexArray();
    if (vao) this.vao = vao;
    this.textures = new TextureCache(this.gl, this.textureCacheOptions);
    this.defaultPrevious = createSolidTexture(this.gl, 0, 0, 0);
    this.fbPool.resetContextState();
    this.onContextRestored?.();
  };

  constructor(options: RunnerOptions) {
    this.onContextLost = options.onContextLost;
    this.onContextRestored = options.onContextRestored;
    this.ownsContext = options.gl === undefined;

    let gl: WebGL2RenderingContext | null;
    let canvas: HTMLCanvasElement | OffscreenCanvas;

    if (options.gl) {
      gl = options.gl;
      const inferred = options.canvas ?? (gl.canvas as HTMLCanvasElement | OffscreenCanvas);
      if (!inferred) {
        throw new Error(
          "Runner: when constructing with `gl`, either pass `canvas` or " +
            "ensure `gl.canvas` is set (it normally is — this should not " +
            "happen in practice).",
        );
      }
      canvas = inferred;
    } else {
      if (!options.canvas) {
        throw new Error(
          "Runner: must pass either `canvas` (Runner creates a WebGL2 " +
            "context) or `gl` (Runner shares an existing context).",
        );
      }
      canvas = options.canvas;
      gl = options.canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        ...options.contextAttributes,
      }) as WebGL2RenderingContext | null;
    }

    if (!gl) {
      throw new Error(
        "WebGL2 is not available. This environment does not support the effects library.",
      );
    }
    this.canvas = canvas;
    this.gl = gl;
    // Effects default to LINEAR + no mipmaps (effects sample neighbours,
    // not LOD); merge any caller-provided options on top.
    this.textureCacheOptions = {
      minFilter: gl.LINEAR,
      generateMipmaps: false,
      ...options.textureCache,
    };
    this.flipY = this.textureCacheOptions.flipY ?? true;
    this.textures = new TextureCache(gl, this.textureCacheOptions);
    this.fbPool = new FramebufferPool(
      gl,
      options.framebufferPoolSize !== undefined
        ? { capacity: options.framebufferPoolSize }
        : {},
    );

    const vao = gl.createVertexArray();
    if (!vao) throw new Error("gl.createVertexArray returned null");
    this.vao = vao;

    this.defaultPrevious = createSolidTexture(gl, 0, 0, 0);

    if (
      this.ownsContext &&
      typeof EventTarget !== "undefined" &&
      canvas instanceof EventTarget
    ) {
      canvas.addEventListener("webglcontextlost", this.handleContextLost);
      canvas.addEventListener("webglcontextrestored", this.handleContextRestored);
    }
  }

  /**
   * Apply `effect` to `args.source` and write the result to the canvas.
   * Single-pass effects (most) draw straight to the canvas; multi-pass
   * effects (bloom, glow) ping-pong through framebuffers, with each
   * pass reading the previous via the `getPrevious(uv)` shader helper.
   *
   * @param effect  Any `Effect` — built-in or one returned from `defineEffect()`.
   * @param args    `source` (image / canvas / video / texture) and
   *                optional `params` overrides.
   *
   * @throws Error if the runner is disposed or the WebGL context is lost.
   * @throws Error if shader compilation or program linking fails.
   */
  /**
   * Pre-load URL string sources so that subsequent synchronous
   * `render()` calls can reference them without throwing. DOM-source
   * inputs (`HTMLImageElement`, canvas, video, etc.) are ignored — they
   * carry their own pixel data and don't need to be fetched.
   *
   * Typical use:
   *
   *     const sourceUrl = "/photo.jpg";
   *     await runner.preload([sourceUrl]);
   *     runner.render(blur, { source: sourceUrl, params: { radius: 8 } });
   *
   * Resolves once every URL has been fetched, decoded, and uploaded.
   * Calls for the same URL are deduplicated (concurrent and repeat
   * calls share one in-flight load).
   *
   * @throws Error if any source fails to fetch / decode (rejected
   *               promise from the underlying `TextureCache.resolveAsync`).
   */
  async preload(sources: ReadonlyArray<TextureSource | string>): Promise<void> {
    await Promise.all(
      sources
        .filter((s): s is string => typeof s === "string")
        .map((url) => this.textures.resolveAsync(url)),
    );
  }

  /**
   * Internal: resolve a render-args source to its GL texture. Strings
   * go through the synchronous URL cache; if the URL hasn't been
   * pre-loaded via `preload()`, throws with a clear pointer at the fix.
   */
  private resolveForRender(source: TextureSource | string): WebGLTexture {
    if (typeof source !== "string") {
      return this.textures.resolve(source);
    }
    const cached = this.textures.getUrlTexture(source);
    if (!cached) {
      throw new Error(
        `Runner.render(): "source" URL is not loaded: ${source}. ` +
          `Call runner.preload(["${source}"]) before render() (URL inputs must be ` +
          `fetched + decoded + uploaded before render(), which is synchronous).`,
      );
    }
    return cached;
  }

  render<P extends UniformParams>(
    effect: Effect<P>,
    args: RenderArgs<P>,
    opts?: RenderOptions,
  ): void {
    if (this.disposed) {
      throw new Error("Runner has been disposed. Create a new Runner to render.");
    }
    if (this.contextLost) {
      throw new Error(
        "WebGL context is lost. Wait for onContextRestored before rendering again.",
      );
    }

    const gl = this.gl;
    const compiled = this.getOrCompile(effect);
    const passes = Math.max(1, Math.floor(effect.passes ?? 1));
    const wantsHdr = effect.hdr === true;

    // Resolve the output target up-front: where the final pass writes,
    // what viewport applies, and what `uResolution` reports.
    const outputFb = opts?.outputFramebuffer ?? null;
    const vp = opts?.viewport;
    const passWidth = vp ? vp[2] : this.canvas.width;
    const passHeight = vp ? vp[3] : this.canvas.height;
    const vpX = vp ? vp[0] : 0;
    const vpY = vp ? vp[1] : 0;

    // Allocate/resize framebuffers BEFORE any source texture binding. FBO
    // texture creation binds `gl.TEXTURE_2D` to whichever unit is active,
    // which would otherwise clobber the source unit on the first render.
    // Intermediate FBOs follow viewport dims when set — saves memory and
    // matches the actual sampling rate of the final output.
    const pingPong =
      passes > 1
        ? this.fbPool.ensure(2, passWidth, passHeight, { hdr: wantsHdr })
        : undefined;

    gl.useProgram(compiled.program);

    const sourceTex = this.resolveForRender(args.source);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sourceTex);
    gl.uniform1i(this.uniformLoc(compiled, "uSource"), 0);

    // uResolution follows the active viewport (correctness, not perf):
    // multi-tap effects (blur, bloom, glow) compute sample steps as
    // `1.0/uResolution`; if the shader's "screen size" disagrees with
    // the actual draw size, the effect comes out the wrong scale.
    gl.uniform2f(
      this.uniformLoc(compiled, "uResolution"),
      passWidth,
      passHeight,
    );

    const passCountLoc = this.uniformLoc(compiled, "uPassCount");
    if (passCountLoc) gl.uniform1i(passCountLoc, passes);

    const merged = { ...effect.defaults, ...(args.params ?? {}) };
    for (const key of Object.keys(merged)) {
      const name = paramKeyToUniformName(key);
      const loc = this.uniformLoc(compiled, name);
      if (!loc) continue;
      const value = (merged as Record<string, UniformValue>)[key];
      if (value === undefined) continue;
      setUniform(gl, loc, value);
    }

    gl.bindVertexArray(this.vao);

    const passLoc = this.uniformLoc(compiled, "uPass");
    const previousLoc = this.uniformLoc(compiled, "uPrevious");

    for (let i = 0; i < passes; i++) {
      const isFinal = i === passes - 1;

      // Destination: final pass renders to the caller's FBO (or the
      // default framebuffer); intermediate passes ping-pong between
      // pool slots 0 and 1.
      if (isFinal || !pingPong) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, outputFb);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, pingPong[i % 2]!.fb);
      }

      let prevTex: WebGLTexture;
      if (i === 0 || !pingPong) {
        prevTex = this.defaultPrevious;
      } else {
        prevTex = pingPong[(i - 1) % 2]!.tex;
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, prevTex);
      if (previousLoc) gl.uniform1i(previousLoc, 1);
      if (passLoc) gl.uniform1i(passLoc, i);

      // Intermediate passes always write the full pool-FBO; only the
      // final pass honours the caller's viewport offset.
      if (isFinal) {
        gl.viewport(vpX, vpY, passWidth, passHeight);
      } else {
        gl.viewport(0, 0, passWidth, passHeight);
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Cleanup: when the caller supplied an FBO, leave it bound — they
    // own follow-on draws. Otherwise restore the default framebuffer.
    if (!outputFb) gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindVertexArray(null);

    // Restore GL state so we don't leak into an upstream renderer in
    // shared-context mode. Cheap (~4 calls) and protective even for the
    // owned-context case. pixelStorei flags are reset inside
    // TextureCache after every upload.
    gl.useProgram(null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
  }

  /**
   * Apply `effect` and read the result back into the caller-owned `dst`
   * buffer as tightly-packed RGBA8 bytes. Sibling of `render()` for
   * hosts that aren't displaying the runner's canvas directly — e.g.
   * bridging into another renderer (Skia / CanvasKit / a parent WebGL
   * context). Skips the `<canvas>` → `Image` → upload round-trip those
   * bridges otherwise need.
   *
   * `dst` is caller-owned: pass the same buffer every frame to avoid
   * per-frame GC churn. Must be at least `canvas.width * canvas.height
   * * 4` bytes; oversize buffers are fine (the rest is left untouched).
   *
   * Orientation matches `render()` + the runner's `TextureCache.flipY`
   * option: by default (`flipY: true`) the output is top-down — row 0 =
   * top of frame — matching how `HTMLImageElement` / canvas sources are
   * uploaded. Combined with the `RawPixels` upload variant, this gives
   * symmetric "top-down in, top-down out" semantics.
   *
   * @throws Error if `dst` is too small for the canvas dimensions.
   * @throws Error if the runner is disposed or the WebGL context is lost.
   */
  renderToPixels<P extends UniformParams>(
    effect: Effect<P>,
    args: RenderArgs<P> & { dst: Uint8Array | Uint8ClampedArray },
    opts?: RenderOptions,
  ): void {
    const { dst, ...renderArgs } = args;
    // The read region matches the draw region: caller-supplied viewport
    // when set, full canvas otherwise. `dst` is sized against the same
    // region so a viewport-bounded render doesn't require a canvas-sized
    // buffer.
    const vp = opts?.viewport;
    const readX = vp ? vp[0] : 0;
    const readY = vp ? vp[1] : 0;
    const width = vp ? vp[2] : this.canvas.width;
    const height = vp ? vp[3] : this.canvas.height;
    const required = width * height * 4;
    if (dst.length < required) {
      throw new Error(
        `Runner.renderToPixels(): dst buffer is too small (${dst.length} bytes, ` +
          `need at least ${required} for ${width}×${height} RGBA8).`,
      );
    }
    this.render(effect, renderArgs as RenderArgs<P>, opts);
    const gl = this.gl;
    // render() left the right framebuffer bound: the caller's
    // `outputFramebuffer` when set (so readPixels reads back out of the
    // caller's texture), or the default framebuffer otherwise. No
    // re-bind needed.
    gl.readPixels(readX, readY, width, height, gl.RGBA, gl.UNSIGNED_BYTE, dst);
    if (this.flipY) {
      flipRgba8RowsInPlace(dst, width, height);
    }
  }

  /**
   * Whether the underlying WebGL context is currently lost. While lost,
   * `render()` throws; wait for the `onContextRestored` callback.
   */
  get isContextLost(): boolean {
    return this.contextLost;
  }

  /**
   * Free every GPU resource the runner owns (default texture, VAO,
   * compiled programs, framebuffers, texture cache) and detach the
   * context-loss listeners. Idempotent; further `render()` calls throw.
   *
   * Call when the canvas is going away. The WebGL context itself is
   * freed by the canvas, but disposing here releases the in-process
   * bookkeeping early and removes the canvas listeners so the runner
   * can be GC'd.
   *
   * In shared-context mode (`new Runner({ gl })`), the context itself
   * is left alive — the consumer owns it and may still be using it for
   * the upstream renderer.
   */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (
      this.ownsContext &&
      typeof EventTarget !== "undefined" &&
      this.canvas instanceof EventTarget
    ) {
      this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
      this.canvas.removeEventListener(
        "webglcontextrestored",
        this.handleContextRestored,
      );
    }
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteTexture(this.defaultPrevious);
    this.fbPool.dispose();
    this.textures.dispose();
  }

  private getOrCompile<P extends UniformParams>(
    effect: Effect<P>,
  ): CompiledEffect {
    const erased = effect as Effect<UniformParams>;
    const existing = this.programs.get(erased);
    if (existing) return existing;

    const fragmentSource = wrapFragmentShader(effect.shader.glsl);
    let program: WebGLProgram;
    try {
      program = buildProgram(this.gl, fragmentSource);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Effect "${effect.name}" failed to compile. ${message}`);
    }
    const compiled: CompiledEffect = { program, uniforms: new Map() };
    this.programs.set(erased, compiled);
    return compiled;
  }

  private uniformLoc(
    compiled: CompiledEffect,
    name: string,
  ): WebGLUniformLocation | null {
    const cached = compiled.uniforms.get(name);
    if (cached !== undefined) return cached;
    const loc = this.gl.getUniformLocation(compiled.program, name);
    compiled.uniforms.set(name, loc);
    return loc;
  }
}

function createSolidTexture(
  gl: WebGL2RenderingContext,
  r: number,
  g: number,
  b: number,
): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error("gl.createTexture returned null");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([r, g, b, 255]),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return tex;
}
