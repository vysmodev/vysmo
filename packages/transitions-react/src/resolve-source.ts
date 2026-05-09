import type { TextureSource } from "@vysmo/transitions";

/**
 * What the React wrapper accepts as a `from` / `to`. Strings are
 * convenience for `<img src=…>`-style URLs; everything else passes
 * straight through to the runner.
 */
export type Source =
  | string
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement
  | ImageBitmap;

export type ResolvedSource = Exclude<Source, string>;

/**
 * Resolve a `Source` to a paint-ready `TextureSource`. Strings load via
 * a fresh `Image` with `crossOrigin="anonymous"` and `decode()` so the
 * transition can render on the next frame without showing a blank
 * canvas. Non-string sources await `decode()` if applicable, then
 * pass through.
 */
export async function resolveSource(source: Source): Promise<TextureSource> {
  if (typeof source === "string") {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = source;
    if ("decode" in img) await img.decode();
    return img;
  }
  if (source instanceof HTMLImageElement && !source.complete) {
    await source.decode();
  }
  return source;
}
