import { defineEasing } from "../define.js";
import type { EasingFn } from "../types.js";

/**
 * Mirror an ease across the midpoint. The first half plays the ease forward,
 * scaled into [0, 0.5]; the second half plays it reversed, scaled into
 * [0.5, 1]. Turns any ease into its inOut variant.
 */
export function mirror(ease: EasingFn): EasingFn {
  return defineEasing(`mirror(${ease.easingName})`, (t) => {
    if (t < 0.5) return ease(t * 2) / 2;
    return 1 - ease((1 - t) * 2) / 2;
  });
}
