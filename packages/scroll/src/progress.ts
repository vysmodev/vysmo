import { sharedScrollObserver } from "./observer.js";
import type { Handle, ScrollProgressOptions } from "./types.js";

/**
 * Emits a continuous [0, 1] value as `element` sweeps across the viewport.
 *
 *   progress = 0  → element's top edge is at the viewport's bottom edge
 *                   (element has just entered from below)
 *   progress = 1  → element's bottom edge is at the viewport's top edge
 *                   (element has just exited through the top)
 *
 * The curve is linear by default; pass `ease: (t) => ...` to remap —
 * any easing from `@vysmo/easings` works without importing it here.
 */
export function createScrollProgress(
  options: ScrollProgressOptions,
): Handle {
  const observer = sharedScrollObserver();
  let lastProgress = Number.NaN;

  const unsubscribe = observer.subscribe(options.element, {
    onScroll(rect, viewport) {
      const span = viewport.height + rect.height;
      if (span <= 0) return;
      const raw = (viewport.height - rect.top) / span;
      const clamped = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      const mapped = options.ease ? options.ease(clamped) : clamped;
      if (mapped === lastProgress) return;
      lastProgress = mapped;
      options.onProgress(mapped);
    },
  });

  return {
    destroy(): void {
      unsubscribe();
    },
  };
}
