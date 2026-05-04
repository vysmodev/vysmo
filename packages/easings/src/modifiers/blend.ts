import { defineEasing } from "../define.js";
import type { EasingFn } from "../types.js";

/**
 * Linearly interpolate between two eases. At weight=0 returns pure `a`;
 * at weight=1 returns pure `b`; between is the weighted sum. Useful for
 * morphing between easings or dialling in a custom shape from known eases.
 */
export function blend(a: EasingFn, b: EasingFn, weight: number): EasingFn {
  if (weight <= 0) return a;
  if (weight >= 1) return b;
  return defineEasing(
    `blend(${a.easingName}, ${b.easingName}, ${weight})`,
    (t) => a(t) * (1 - weight) + b(t) * weight,
  );
}

/**
 * Compose two eases: apply `a` first, then `b` to `a`'s output. The result
 * is `b(a(t))`. Useful for doubly-applied curves ("ease then ease again").
 */
export function compose(a: EasingFn, b: EasingFn): EasingFn {
  return defineEasing(`compose(${b.easingName}, ${a.easingName})`, (t) => b(a(t)));
}
