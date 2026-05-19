import { FramebufferPool, TextureCache, flipRgba8RowsInPlace } from "@vysmo/gl-core";
import type { TextureCacheOptions, TextureSource } from "@vysmo/gl-core";
import type {
  RenderArgs,
  Transition,
  UniformParams,
  UniformValue,
} from "../types.js";
import {
  buildProgram,
  paramKeyToUniformName,
  wrapFragmentShader,
  wrapMeshVertexShader,
} from "./gl.js";
import { buildSubdividedPlane } from "./mesh.js";

interface CompiledTransition {
  program: WebGLProgram;
  uniforms: Map<string, WebGLUniformLocation | null>;
  mesh?: MeshResources;
}

interface MeshResources {
  vao: WebGLVertexArrayObject;
  buffers: WebGLBuffer[];
  vertexCount: number;
  instances: number;
}

const MESH_ATTRIBS: ReadonlyArray<{
  name: string;
  size: number;
  bufferKey: "position" | "uv" | "offset" | "centroid" | "bary" | "random";
}> = [
  { name: "aPosition", size: 2, bufferKey: "position" },
  { name: "aUv", size: 2, bufferKey: "uv" },
  { name: "aOffset", size: 1, bufferKey: "offset" },
  { name: "aCentroid", size: 2, bufferKey: "centroid" },
  { name: "aBary", size: 3, bufferKey: "bary" },
  { name: "aRandom", size: 1, bufferKey: "random" },
];

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
   * handles as `from` / `to` sources with zero CPU↔GPU readback.
   *
   * **Ownership semantics when `gl` is provided:**
   * - The Runner does **not** own the context. `dispose()` cleans up
   *   Runner-allocated GL resources (VAOs, compiled programs, internal
   *   default textures, framebuffers) but does **not** delete the
   *   context itself.
   * - The Runner does **not** attach `webglcontextlost` /
   *   `webglcontextrestored` listeners. You manage context lifecycle.
   * - `contextAttributes` is ignored (the context already exists).
   *
   * **State you own (Runner does NOT restore at end of `render()`):**
   * - Depth-test enable / depth-func state (only relevant for mesh
   *   transitions; disabled at end of mesh render so single-pass
   *   transitions are unaffected).
   * - Blend-mode enable (same — only set by mesh path, restored to
   *   disabled at end of that path).
   *
   * **State the Runner DOES reset at end of `render()`** (added in 0.4.0
   * specifically for shared-context safety): `useProgram`,
   * `bindVertexArray`, `bindFramebuffer`, all touched texture units
   * unbound, and pixelStorei flags (`UNPACK_FLIP_Y_WEBGL`,
   * `UNPACK_PREMULTIPLY_ALPHA_WEBGL`) reset to defaults.
   *
   * **GPU pipeline ordering:** if the upstream renderer wrote to a
   * texture you're about to pass as `from` / `to`, call its `flush()`
   * (e.g. `skSurface.flush()`) before `runner.render()` so the GPU
   * commands are ordered correctly.
   */
  gl?: WebGL2RenderingContext;
  /**
   * Forwarded to `canvas.getContext("webgl2", …)`. Defaults are
   * `{ alpha: true, antialias: true, premultipliedAlpha: false,
   * preserveDrawingBuffer: false }` — overrideable via this field.
   * Ignored when `gl` is provided (the context already exists).
   */
  contextAttributes?: WebGLContextAttributes;
  /**
   * Optional callback invoked when the WebGL context is lost. After this
   * fires, `render()` throws until the context is restored — either
   * automatically via the `webglcontextrestored` event (when the canvas
   * is an `EventTarget`) or by re-creating the Runner.
   */
  onContextLost?: () => void;
  /**
   * Optional callback invoked once the runner has re-initialised after a
   * `webglcontextrestored` event. After this, `render()` works again.
   */
  onContextRestored?: () => void;
  /**
   * Options forwarded to the internal `TextureCache`. Most callers can
   * ignore this; pass `{ maxUrlEntries: N }` if you're driving the
   * runner from a lazy-loading consumer (e.g. a slideshow with hundreds
   * of slides) to keep GPU memory bounded — least-recently-used URL
   * textures are evicted when the cache size exceeds N. DOM-source
   * textures are not subject to LRU.
   */
  textureCache?: TextureCacheOptions;
}

/**
 * The single object that owns a WebGL2 context, compiles transition
 * shaders on first use, and renders frames. One Runner per canvas;
 * one canvas per Runner.
 *
 * Usage shape:
 *
 *     const runner = new Runner({ canvas });
 *     runner.render(crossZoom, { from: imgA, to: imgB, progress: 0.4 });
 *     // … animate progress 0 → 1 with your driver of choice …
 *     runner.dispose();
 *
 * Programs are cached per-`Transition` reference (WeakMap), so passing
 * the same transition repeatedly compiles once and reuses thereafter.
 * Source textures are likewise cached by identity via `@vysmo/gl-core`'s
 * `TextureCache` — static images upload once.
 *
 * @throws Error if WebGL2 is unavailable in the host environment.
 */
export class Runner {
  readonly gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private textures: TextureCache;
  private readonly textureCacheOptions: TextureCacheOptions | undefined;
  private readonly flipY: boolean;
  private programs = new WeakMap<Transition<UniformParams>, CompiledTransition>();
  private vao: WebGLVertexArrayObject;
  private defaultDisplacement: WebGLTexture;
  private defaultEnvironment: WebGLTexture;
  private defaultPrevious: WebGLTexture;
  // Ping-pong framebuffers for multi-pass transitions; lazy-allocated.
  private fbPool: FramebufferPool;
  private disposed = false;
  private contextLost = false;
  /**
   * True when the Runner created its own WebGL2 context (the common
   * case). False in shared-context mode (`new Runner({ gl })`), where
   * the consumer owns the context: we skip context-loss listeners and
   * leave the context alive on `dispose()`.
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
    this.defaultDisplacement = this.createDefaultDisplacement();
    this.defaultEnvironment = this.createDefaultEnvironment();
    this.defaultPrevious = this.createDefaultPrevious();
    // Drop cached framebuffers — they're tied to the lost context.
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
      // Shared-context mode: consumer brings the context. Pull the
      // backing canvas off it (every WebGL context has one), unless
      // the consumer also passed `canvas` explicitly (allowed for
      // ergonomics — keeps render-target size decoupled if needed).
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
        antialias: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        ...options.contextAttributes,
      }) as WebGL2RenderingContext | null;
    }

    if (!gl) {
      throw new Error(
        "WebGL2 is not available. This environment does not support the transitions library.",
      );
    }
    this.canvas = canvas;
    this.gl = gl;
    this.textureCacheOptions = options.textureCache;
    this.flipY = options.textureCache?.flipY ?? true;
    this.textures = new TextureCache(gl, options.textureCache);
    this.fbPool = new FramebufferPool(gl);

    const vao = gl.createVertexArray();
    if (!vao) throw new Error("gl.createVertexArray returned null");
    this.vao = vao;

    this.defaultDisplacement = this.createDefaultDisplacement();
    this.defaultEnvironment = this.createDefaultEnvironment();
    this.defaultPrevious = this.createDefaultPrevious();

    // Only attach context-loss listeners when we own the context.
    // In shared-context mode the consumer manages context lifecycle.
    if (
      this.ownsContext &&
      typeof EventTarget !== "undefined" &&
      canvas instanceof EventTarget
    ) {
      canvas.addEventListener("webglcontextlost", this.handleContextLost);
      canvas.addEventListener("webglcontextrestored", this.handleContextRestored);
    }
  }

  private createDefaultDisplacement(): WebGLTexture {
    // 1×1 mid-gray = "no displacement" for shaders that interpret
    // (rg - 0.5) as a centered offset vector.
    return this.createSolidTexture(128, 128, 128);
  }

  private createDefaultEnvironment(): WebGLTexture {
    // 1×1 mid-gray = neutral environment. Transitions that sample it
    // for reflections get a constant gray, which blends to no visible
    // effect when combined with multiplicative / additive gain.
    return this.createSolidTexture(128, 128, 128);
  }

  private createDefaultPrevious(): WebGLTexture {
    // 1×1 transparent black — pass 0's uPrevious fallback. Transitions
    // that run with passes > 1 are expected to handle uPass == 0
    // explicitly (seed from uFrom/uTo/uDisplacement/etc. rather than
    // reading getPrevious).
    return this.createSolidTexture(0, 0, 0);
  }

  private createSolidTexture(r: number, g: number, b: number): WebGLTexture {
    const gl = this.gl;
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

  /**
   * Render one frame of `transition` at the given `progress` (0..1).
   * `from` and `to` are the source and target images; the runner samples
   * both via the same shader and crossfades / displaces / warps according
   * to whatever GLSL the transition declares.
   *
   * Endpoint correctness is enforced by tests: at `progress === 0` the
   * output is pixel-identical to `from`; at `progress === 1` it's
   * pixel-identical to `to`.
   *
   * @param transition  Any `Transition` — built-in (`crossZoom`, `pageCurl`, …)
   *                    or one returned from `defineTransition()`.
   * @param args        `from`, `to`, `progress`, optional `params`
   *                    overrides, optional `displacement` / `environment`
   *                    aux textures (see `RenderArgs`).
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
   *     const fromUrl = "/photo-a.jpg";
   *     const toUrl = "/photo-b.jpg";
   *     await runner.preload([fromUrl, toUrl]);
   *     animate({
   *       ...,
   *       onUpdate: (p) => runner.render(crossZoom, {
   *         from: fromUrl, to: toUrl, progress: p,
   *       }),
   *     });
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
   * Internal: resolve a single render-args source to its GL texture.
   * Strings go through the synchronous URL cache; if the URL hasn't
   * been pre-loaded via `preload()`, throws with a clear pointer at
   * the fix.
   */
  private resolveForRender(
    source: TextureSource | string,
    role: string,
  ): WebGLTexture {
    if (typeof source !== "string") {
      return this.textures.resolve(source);
    }
    const cached = this.textures.getUrlTexture(source);
    if (!cached) {
      throw new Error(
        `Runner.render(): "${role}" URL is not loaded: ${source}. ` +
          `Call runner.preload(["${source}"]) before render() (URL inputs must be ` +
          `fetched + decoded + uploaded before render(), which is synchronous).`,
      );
    }
    return cached;
  }

  render<P extends UniformParams>(
    transition: Transition<P>,
    args: RenderArgs<P>,
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
    const compiled = this.getOrCompile(transition);

    // Allocate/resize framebuffers BEFORE any source texture binding. FBO
    // texture creation binds `gl.TEXTURE_2D` to whichever unit is active;
    // hoisting this call avoids clobbering a previously-bound source on
    // the first render.
    const multiPass =
      compiled.mesh === undefined && (transition.passes ?? 1) > 1;
    if (multiPass) {
      this.fbPool.ensure(2, this.canvas.width, this.canvas.height);
    }

    gl.useProgram(compiled.program);

    // Resolve all textures up front. TextureCache.resolve() calls
    // gl.bindTexture() against whichever unit is currently active (to
    // upload pixels), so if we interleave resolves with activeTexture()
    // calls, each resolve clobbers the most recently bound unit.
    const fromTex = this.resolveForRender(args.from, "from");
    const toTex = this.resolveForRender(args.to, "to");
    const displacementTex = args.displacement
      ? this.resolveForRender(args.displacement, "displacement")
      : this.defaultDisplacement;
    const environmentTex = args.environment
      ? this.resolveForRender(args.environment, "environment")
      : this.defaultEnvironment;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fromTex);
    gl.uniform1i(this.uniformLoc(compiled, "uFrom"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, toTex);
    gl.uniform1i(this.uniformLoc(compiled, "uTo"), 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, displacementTex);
    gl.uniform1i(this.uniformLoc(compiled, "uDisplacement"), 2);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, environmentTex);
    gl.uniform1i(this.uniformLoc(compiled, "uEnvironment"), 3);

    gl.uniform1f(this.uniformLoc(compiled, "uProgress"), args.progress);
    gl.uniform2f(
      this.uniformLoc(compiled, "uResolution"),
      this.canvas.width,
      this.canvas.height,
    );

    const merged = { ...transition.defaults, ...(args.params ?? {}) };
    for (const key of Object.keys(merged)) {
      const name = paramKeyToUniformName(key);
      const loc = this.uniformLoc(compiled, name);
      if (!loc) continue;
      const value = (merged as Record<string, UniformValue>)[key];
      if (value === undefined) continue;
      this.setUniform(loc, value);
    }

    if (compiled.mesh) {
      this.renderMesh(compiled);
    } else {
      this.renderFullscreen(compiled, transition);
    }

    // Restore GL state so we don't leak into an upstream renderer in
    // shared-context mode. Cheap (~6 calls) and protective even for the
    // owned-context case. State we explicitly leave alone: depth-test
    // and blend (mesh path manages them internally and disables them
    // before returning); pixelStorei flags (reset inside TextureCache
    // after every upload).
    gl.useProgram(null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
  }

  /**
   * Render one frame of `transition` and read the result back into the
   * caller-owned `dst` buffer as tightly-packed RGBA8 bytes. Sibling of
   * `render()` for hosts that aren't displaying the runner's canvas
   * directly — e.g. bridging into another renderer (Skia / CanvasKit /
   * a parent WebGL context). Skips the `<canvas>` → `Image` → upload
   * round-trip those bridges otherwise need.
   *
   * `dst` is caller-owned: pass the same buffer every frame to avoid
   * per-frame GC churn. Must be at least `canvas.width * canvas.height *
   * 4` bytes; oversize buffers are fine (the rest is left untouched).
   *
   * Orientation matches `render()` + the runner's `TextureCache.flipY`
   * option: by default (`flipY: true`) the output is top-down — row 0 =
   * top of frame — matching how `HTMLImageElement` / canvas sources are
   * uploaded. Combined with the `RawPixels` upload variant, this gives
   * symmetric "top-down in, top-down out" semantics. Construct the
   * runner with `textureCache: { flipY: false }` to opt into raw GL
   * bottom-up readback (saves a row flip; suitable when the downstream
   * consumer expects bottom-up bytes).
   *
   * @throws Error if `dst` is too small for the canvas dimensions.
   * @throws Error if the runner is disposed or the WebGL context is lost.
   */
  renderToPixels<P extends UniformParams>(
    transition: Transition<P>,
    args: RenderArgs<P> & { dst: Uint8Array | Uint8ClampedArray },
  ): void {
    const { dst, ...renderArgs } = args;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const required = width * height * 4;
    if (dst.length < required) {
      throw new Error(
        `Runner.renderToPixels(): dst buffer is too small (${dst.length} bytes, ` +
          `need at least ${required} for ${width}×${height} RGBA8).`,
      );
    }
    this.render(transition, renderArgs as RenderArgs<P>);
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, dst);
    if (this.flipY) {
      flipRgba8RowsInPlace(dst, width, height);
    }
  }

  private renderFullscreen<P extends UniformParams>(
    compiled: CompiledTransition,
    transition: Transition<P>,
  ): void {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);

    const passes = Math.max(1, Math.floor(transition.passes ?? 1));
    const passLoc = this.uniformLoc(compiled, "uPass");
    const passCountLoc = this.uniformLoc(compiled, "uPassCount");
    const previousLoc = this.uniformLoc(compiled, "uPrevious");
    const instancesLoc = this.uniformLoc(compiled, "uInstances");
    if (passCountLoc) gl.uniform1i(passCountLoc, passes);
    if (instancesLoc) gl.uniform1i(instancesLoc, 1);

    const pingPong = passes > 1 ? this.fbPool.ensure(2, this.canvas.width, this.canvas.height) : undefined;

    for (let i = 0; i < passes; i++) {
      const isFinal = i === passes - 1;

      // Destination: final pass renders to the canvas; intermediate
      // passes ping-pong between pool slots 0 and 1.
      if (isFinal || !pingPong) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, pingPong[i % 2]!.fb);
      }

      // uPrevious: at pass 0, bind the default black 1×1. Otherwise
      // bind the FBO texture we just wrote on pass i-1.
      let prevTex: WebGLTexture;
      if (i === 0 || !pingPong) {
        prevTex = this.defaultPrevious;
      } else {
        prevTex = pingPong[(i - 1) % 2]!.tex;
      }
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, prevTex);
      if (previousLoc) gl.uniform1i(previousLoc, 4);
      if (passLoc) gl.uniform1i(passLoc, i);

      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Leave the canvas framebuffer bound for any subsequent draws.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindVertexArray(null);
  }

  private renderMesh(compiled: CompiledTransition): void {
    const gl = this.gl;
    const mesh = compiled.mesh;
    if (!mesh) return;

    // Mesh path is single-pass in v1: passes is ignored. Report uPass=0,
    // uPassCount=1 to the shader so uniform branches stay predictable.
    const passLoc = this.uniformLoc(compiled, "uPass");
    const passCountLoc = this.uniformLoc(compiled, "uPassCount");
    const previousLoc = this.uniformLoc(compiled, "uPrevious");
    const instancesLoc = this.uniformLoc(compiled, "uInstances");
    if (passLoc) gl.uniform1i(passLoc, 0);
    if (passCountLoc) gl.uniform1i(passCountLoc, 1);
    if (instancesLoc) gl.uniform1i(instancesLoc, mesh.instances);

    // Bind the default previous texture so uPrevious samples predictably.
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, this.defaultPrevious);
    if (previousLoc) gl.uniform1i(previousLoc, 4);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindVertexArray(mesh.vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, mesh.vertexCount, mesh.instances);
    gl.bindVertexArray(null);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
  }

  /**
   * Whether the underlying WebGL context is currently lost. While lost,
   * `render()` throws; wait for the `onContextRestored` callback.
   */
  get isContextLost(): boolean {
    return this.contextLost;
  }

  /**
   * Free every GPU resource the runner owns (default textures, VAO,
   * compiled programs, framebuffers, texture cache) and detach the
   * context-loss listeners. Idempotent; further `render()` calls throw.
   *
   * Call when the canvas is going away (component unmount, route change,
   * etc.) — the WebGL context itself is freed by the canvas, but
   * disposing here releases the in-process bookkeeping early and removes
   * the canvas listeners so the runner can be GC'd.
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
    this.gl.deleteTexture(this.defaultDisplacement);
    this.gl.deleteTexture(this.defaultEnvironment);
    this.gl.deleteTexture(this.defaultPrevious);
    this.fbPool.dispose();
    this.textures.dispose();
  }

  private getOrCompile<P extends UniformParams>(
    transition: Transition<P>,
  ): CompiledTransition {
    const erased = transition as Transition<UniformParams>;
    const existing = this.programs.get(erased);
    if (existing) return existing;

    const isMesh = transition.mesh !== undefined;
    if (isMesh && transition.shader.vertex === undefined) {
      throw new Error(
        `Transition "${transition.name}" declares a mesh but has no vertex shader. ` +
          "Mesh transitions must provide `vertex` source alongside `glsl`.",
      );
    }

    const fragmentSource = wrapFragmentShader(transition.shader.glsl);
    const vertexSource = isMesh
      ? wrapMeshVertexShader(transition.shader.vertex as string)
      : undefined;

    let program: WebGLProgram;
    try {
      program = vertexSource
        ? buildProgram(this.gl, fragmentSource, vertexSource)
        : buildProgram(this.gl, fragmentSource);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Transition "${transition.name}" failed to compile. ${message}`,
      );
    }
    const compiled: CompiledTransition = { program, uniforms: new Map() };
    if (isMesh) {
      compiled.mesh = this.createMeshResources(program, transition.mesh!);
    }
    this.programs.set(erased, compiled);
    return compiled;
  }

  private createMeshResources(
    program: WebGLProgram,
    geometry: { subdivisions: readonly [number, number]; instances?: number },
  ): MeshResources {
    const gl = this.gl;
    const [nx, ny] = geometry.subdivisions;
    const buffers = buildSubdividedPlane(nx, ny);

    const vao = gl.createVertexArray();
    if (!vao) throw new Error("gl.createVertexArray returned null");
    gl.bindVertexArray(vao);

    const glBuffers: WebGLBuffer[] = [];
    for (const attr of MESH_ATTRIBS) {
      const loc = gl.getAttribLocation(program, attr.name);
      if (loc < 0) continue;
      const buf = gl.createBuffer();
      if (!buf) throw new Error("gl.createBuffer returned null");
      glBuffers.push(buf);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, buffers[attr.bufferKey], gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, attr.size, gl.FLOAT, false, 0, 0);
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
      vao,
      buffers: glBuffers,
      vertexCount: buffers.vertexCount,
      instances: Math.max(1, Math.floor(geometry.instances ?? 1)),
    };
  }

  private uniformLoc(
    compiled: CompiledTransition,
    name: string,
  ): WebGLUniformLocation | null {
    const cached = compiled.uniforms.get(name);
    if (cached !== undefined) return cached;
    const loc = this.gl.getUniformLocation(compiled.program, name);
    compiled.uniforms.set(name, loc);
    return loc;
  }

  private setUniform(
    loc: WebGLUniformLocation,
    value: UniformValue,
  ): void {
    const gl = this.gl;
    if (typeof value === "number") {
      gl.uniform1f(loc, value);
      return;
    }
    if (typeof value === "boolean") {
      gl.uniform1i(loc, value ? 1 : 0);
      return;
    }
    if (value.length === 2) gl.uniform2f(loc, value[0], value[1]);
    else if (value.length === 3) gl.uniform3f(loc, value[0], value[1], value[2]);
    else if (value.length === 4)
      gl.uniform4f(loc, value[0], value[1], value[2], value[3]);
  }
}
