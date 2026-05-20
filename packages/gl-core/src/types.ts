/**
 * Raw RGBA8 pixel data with dimensions, accepted as a `TextureSource`
 * variant. Lets callers bridge from another renderer (Skia / CanvasKit /
 * native code) that already produced a pixel buffer without an
 * intermediate `<canvas>` / `ImageData` / `ImageBitmap` round-trip.
 *
 * Layout: `pixels.length >= width * height * 4`, interpreted as
 * tightly-packed RGBA bytes. Both `Uint8Array` and `Uint8ClampedArray`
 * are accepted (zero-copy upload — the underlying buffer is passed
 * straight to `gl.texImage2D`).
 *
 * Orientation: the bytes are treated the same way DOM sources are.
 * When the owning `TextureCache` has `flipY: true` (the default), the
 * upload's row order is flipped (via `UNPACK_FLIP_Y_WEBGL`) so y=0 of
 * `pixels` ends up at the top of the rendered output — matching how
 * `HTMLImageElement` / canvas sources behave. Set `flipY: false` on
 * the cache to skip the flip; suitable for callers in GL-native
 * bottom-up orientation.
 *
 * Cache behavior: RawPixels sources are keyed by the wrapper object's
 * identity (the `{ pixels, width, height }` object you pass in). Each
 * `resolve()` re-uploads `pixels` to the cached GL texture, so mutating
 * the buffer between renders Just Works as long as you keep the same
 * wrapper. If you allocate a fresh wrapper every frame, you'll allocate
 * a fresh GL texture every frame (old ones are GC'd via WeakMap when
 * the wrapper is dropped) — usually wasteful. Reuse the wrapper.
 */
export interface RawPixels {
  pixels: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
}

/**
 * A `WebGLTexture` paired with its dimensions. Useful when bridging
 * from another renderer that already has GPU-resident content (Skia /
 * CanvasKit, Three.js, a parent WebGL context) — pass the wrapper
 * instead of a bare `WebGLTexture` to document the source's size
 * explicitly and stay symmetric with `RawPixels`.
 *
 * The cache returns the inner texture as-is (zero upload, zero copy);
 * the `width` / `height` fields are forward-compat for future
 * source-aspect-aware features and serve as documentation today.
 *
 * Requires a shared WebGL2 context with whatever renderer owns the
 * texture — see `RunnerOptions.gl` for the integration pattern.
 */
export interface SizedTexture {
  texture: WebGLTexture;
  width: number;
  height: number;
}

export type TextureSource =
  | HTMLCanvasElement
  | HTMLImageElement
  | HTMLVideoElement
  | ImageBitmap
  | OffscreenCanvas
  | WebGLTexture
  | RawPixels
  | SizedTexture;

/**
 * Per-render options for `Runner.render()` / `Runner.renderToPixels()`.
 * Shared across `@vysmo/transitions` and `@vysmo/effects`; the same
 * object shape works against either runner.
 *
 * Default behavior (no `RenderOptions` passed, or both fields
 * `undefined`) is byte-for-byte identical to v0.4.0: the Runner binds
 * the default framebuffer for the final draw and uses the full canvas
 * as the viewport.
 *
 * Use this to enable **zero-copy bridging** with another GL-based
 * renderer (Skia / CanvasKit, Three.js, etc.): the host renderer
 * supplies a texture-backed FBO and Vysmo writes directly into the
 * host's texture, eliminating the `readPixels` + re-upload round-trip
 * that shared-context mode alone still required (~9 MB / 1080p frame,
 * ~36 MB / 4K frame per Runner invocation).
 */
export interface RenderOptions {
  /**
   * Bind this framebuffer for the final output pass instead of the
   * default (null) framebuffer. The Runner does **not** take ownership
   * — caller is responsible for creating, attaching colour / depth, and
   * disposing.
   *
   * **Behaviour:**
   * - `undefined` → bind to default framebuffer (current behaviour, no
   *   change).
   * - `null` → identical to `undefined` (explicit default).
   * - `WebGLFramebuffer` → bind to caller's FBO. Runner does **not**
   *   unbind to null at end of `render()`; the caller's FBO stays
   *   bound. Caller is expected to rebind whatever they need before
   *   their next draw (same contract as the v0.4.0 state-leak cleanup
   *   for `useProgram` / texture units).
   *
   * **Vysmo clears the bound FBO** to (0, 0, 0, 0) before drawing — it
   * is a frame producer, not a compositor. To composite onto existing
   * FBO contents, render Vysmo to a separate FBO and blend in your
   * own pass.
   *
   * **Mesh transitions require a depth attachment.** Mesh-based
   * transitions (`pageCurl`, `polygonFlip`, anything with
   * `Transition.mesh`) enable depth-test and clear depth before
   * drawing. If your FBO has no depth attachment, overlapping mesh
   * triangles will z-fight or composite incorrectly. Attach a
   * `DEPTH24` or `DEPTH16` renderbuffer. Single-pass shader
   * transitions and all `@vysmo/effects` are unaffected.
   */
  outputFramebuffer?: WebGLFramebuffer | null;
  /**
   * Viewport `[x, y, width, height]` for the final output pass.
   * Defaults to `[0, 0, canvas.width, canvas.height]` (current
   * behaviour). Standalone-usable: meaningful with or without
   * `outputFramebuffer`. Use case: "render Vysmo into the bottom-right
   * quadrant of my visible canvas".
   *
   * **`uResolution` follows this viewport.** When set, the shader's
   * `uResolution` uniform becomes `[width, height]` rather than the
   * canvas dimensions. This is correctness, not a tradeoff: any shader
   * that does pixel-space math (blur radius in pixels,
   * `1.0 / uResolution` sample steps, aspect correction) would produce
   * incorrect output otherwise — a multi-pass effect that "looks fine
   * at 1080p" would be wrong at 720p because the sample stride no
   * longer matches the actual draw size.
   *
   * **Intermediate ping-pong FBOs follow viewport dims.** For
   * multi-pass effects / transitions, the pool's intermediate FBOs are
   * allocated at `[width, height]` rather than canvas dims — saves
   * memory and avoids oversampling. The pool keeps an LRU of distinct
   * `(width, height, hdr)` slots (default capacity 4); if you render
   * at more than the pool capacity distinct sizes per frame, slots
   * are evicted and reallocated each frame. Use
   * `framebufferPoolSize` on the Runner to raise the cap.
   *
   * **Y-axis convention.** GL viewport `y` is bottom-up, like
   * `glViewport`. To render into the bottom-right quadrant of a
   * 1920×1080 canvas, pass `[960, 0, 960, 540]` — not
   * `[960, 540, 960, 540]`. Same convention as `vUv.y` in WebGL2
   * fragment shaders.
   *
   * **`renderToPixels` interaction.** When `viewport` is set,
   * `renderToPixels` reads back `(viewport[0], viewport[1],
   * viewport[2], viewport[3])` — the region just drawn — and the
   * `dst` buffer must be at least `viewport[2] * viewport[3] * 4`
   * bytes (rather than `canvas.width * canvas.height * 4`).
   */
  viewport?: readonly [x: number, y: number, width: number, height: number];
}

export type UniformValue =
  | number
  | boolean
  | readonly [number, number]
  | readonly [number, number, number]
  | readonly [number, number, number, number];

export type UniformParams = Record<string, UniformValue>;

/**
 * Widens literal defaults (e.g. `readonly [-1, 0]`) back to the general uniform
 * types (e.g. `readonly [number, number]`) so callers can override freely.
 */
export type Widen<P> = {
  [K in keyof P]: P[K] extends number
    ? number
    : P[K] extends boolean
      ? boolean
      : P[K] extends readonly [number, number]
        ? readonly [number, number]
        : P[K] extends readonly [number, number, number]
          ? readonly [number, number, number]
          : P[K] extends readonly [number, number, number, number]
            ? readonly [number, number, number, number]
            : never;
};
