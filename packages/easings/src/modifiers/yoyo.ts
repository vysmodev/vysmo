import { defineEasing } from "../define.js";
import type { EasingFn } from "../types.js";

/**
 * Round-trip an ease: 0 → 1 → 0 over t in [0, 1]. First half runs the ease
 * forward, second half runs it reversed. Unlike `mirror` which produces an
 * inOut, `yoyo` returns to the start.
 */
export function yoyo(ease: EasingFn): EasingFn {
  return defineEasing(
    `yoyo(${ease.easingName})`,
    (t) => (t < 0.5 ? ease(t * 2) : ease((1 - t) * 2)),
    { exactEndpoints: false },
  );
}
