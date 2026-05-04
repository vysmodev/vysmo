import { defineEasing } from "../define.js";
import type { EasingFn } from "../types.js";

/** Play the ease backward: f(t) → 1 - f(1 - t). Useful to turn any "in" into an "out". */
export function reverse(ease: EasingFn): EasingFn {
  return defineEasing(`reverse(${ease.easingName})`, (t) => 1 - ease(1 - t));
}
