import type { SlideSource } from "./types.js";

export type ResolvedSlide = HTMLImageElement | HTMLCanvasElement;

/**
 * Normalise a single slide source into an element the `Runner` can use
 * as a `TextureSource`. Strings are loaded into a new `Image`; existing
 * image elements are awaited on; canvases pass through instantly.
 *
 * Runs with `crossOrigin: "anonymous"` on newly-created images so
 * cross-origin textures can be uploaded without tainting the canvas.
 */
export async function resolveSlide(source: SlideSource): Promise<ResolvedSlide> {
  if (typeof source === "string") {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = source;
    await img.decode();
    return img;
  }
  if (source instanceof HTMLCanvasElement) {
    return source;
  }
  // HTMLImageElement — wait for it if it's not yet complete.
  if (source.complete && source.naturalWidth > 0) return source;
  await source.decode();
  return source;
}

export function resolveAll(
  sources: readonly SlideSource[],
): Promise<ResolvedSlide[]> {
  return Promise.all(sources.map(resolveSlide));
}
