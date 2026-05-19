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

export type TextureSource =
  | HTMLCanvasElement
  | HTMLImageElement
  | HTMLVideoElement
  | ImageBitmap
  | OffscreenCanvas
  | WebGLTexture
  | RawPixels;

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
