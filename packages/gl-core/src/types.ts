export type TextureSource =
  | HTMLCanvasElement
  | HTMLImageElement
  | HTMLVideoElement
  | ImageBitmap
  | OffscreenCanvas
  | WebGLTexture;

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
