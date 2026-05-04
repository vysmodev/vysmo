import { defineEasing } from "../define.js";
import { linear } from "../easings/linear.js";
import type { EasingFn } from "../types.js";

/**
 * Ease tuned for scale animations spanning large ratios (e.g. 0.01 → 100).
 * Linear interpolation across such ranges feels jerky because perception
 * is logarithmic. `expoScale` maps t so that when used as
 * `scale = startScale + (endScale - startScale) * expoScale(t)`, the
 * visual motion is uniform across orders of magnitude.
 *
 * Optionally combine with another ease: the result of `ease(t)` is what
 * gets log-mapped.
 */
export function expoScale(startScale: number, endScale: number, ease: EasingFn = linear): EasingFn {
  if (startScale <= 0 || endScale <= 0) {
    throw new RangeError(
      `expoScale: startScale and endScale must be positive; got ${startScale}, ${endScale}`,
    );
  }
  if (startScale === endScale) {
    return defineEasing(`expoScale(${startScale}, ${endScale})`, () => 0);
  }
  const ratio = endScale / startScale;
  const span = endScale - startScale;
  return defineEasing(`expoScale(${startScale}, ${endScale})`, (t) => {
    const eased = ease(t);
    return (startScale * ratio ** eased - startScale) / span;
  });
}
