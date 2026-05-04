import type { PageSource } from "./types.js";

export type ResolvedPage = HTMLImageElement | HTMLCanvasElement;

/**
 * Normalise a single page source into an element the `Runner` can use
 * as a `TextureSource`. Strings are loaded into a new `Image`; existing
 * image elements are awaited on; canvases pass through instantly.
 */
export async function resolvePage(source: PageSource): Promise<ResolvedPage> {
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
  sources: readonly PageSource[],
): Promise<ResolvedPage[]> {
  return Promise.all(sources.map(resolvePage));
}
