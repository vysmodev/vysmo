import type { EasingFn, ParametricEasing } from "./types.js";

export type DefineEasingOptions = {
  /**
   * When true (default), t ≤ 0 returns 0 and t ≥ 1 returns 1 regardless of
   * the underlying formula. Disable for easings that intentionally don't
   * hit (0, 0) or (1, 1) — notably `steps(n, "start")`.
   */
  exactEndpoints?: boolean;
};

export function defineEasing(
  name: string,
  fn: (t: number) => number,
  options: DefineEasingOptions = {},
): EasingFn {
  const { exactEndpoints = true } = options;
  const wrapped = ((t: number) => {
    // Defensive: NaN and non-finite inputs collapse to 0. Better than
    // propagating NaN through a whole animation pipeline.
    if (!Number.isFinite(t)) return 0;
    if (exactEndpoints) {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
    }
    return fn(t);
  }) as EasingFn;
  Object.defineProperty(wrapped, "easingName", { value: name, enumerable: true });
  return wrapped;
}

export function defineParametricEasing<P extends object>(
  name: string,
  defaults: P,
  build: (params: P) => (t: number) => number,
  options: DefineEasingOptions = {},
): ParametricEasing<P> {
  const base = defineEasing(name, build(defaults), options) as ParametricEasing<P>;
  Object.defineProperty(base, "defaults", {
    value: Object.freeze({ ...defaults }),
    enumerable: true,
  });
  Object.defineProperty(base, "with", {
    value: (params: Partial<P>): EasingFn =>
      defineEasing(name, build({ ...defaults, ...params }), options),
    enumerable: true,
  });
  return base;
}
