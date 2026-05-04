/**
 * Compile-time inference assertions. Not a runtime test — `pnpm typecheck`
 * must pass with ZERO emitted errors, and every `@ts-expect-error` must
 * actually catch a real type error. Guards against regressions in the
 * parametric .with() API and the defineEasing factories.
 */

import {
  anticipateIn,
  backOut,
  bezier,
  custom,
  defineEasing,
  defineParametricEasing,
  elasticOut,
  linear,
  parseEasing,
  power2Out,
  spring,
  steps,
  toCSSLinear,
  type EasingFn,
  type ParametricEasing,
} from "../index.js";

// --------- Valid usage: should compile ---------

const _a: EasingFn = power2Out;
const _b: number = power2Out(0.5);
const _c: string = power2Out.easingName;

// Parametric eases: callable AND have .with() + .defaults
const _d: EasingFn = backOut;
const _e: EasingFn = backOut.with({ overshoot: 2 });
const _f: EasingFn = backOut.with({});
const _g: Readonly<{ overshoot: number }> = backOut.defaults;

// Spring with full params
const _h = spring.with({ stiffness: 200, damping: 20, mass: 1, velocity: 0 });

// Partial is allowed
const _i = spring.with({ stiffness: 200 });

// Elastic params
const _j = elasticOut.with({ amplitude: 1.2, period: 0.4 });

// Steps params with correct string literal
const _k = steps.with({ count: 5, position: "start" });
const _l = steps.with({ count: 5, position: "end" });
const _m = steps.with({ count: 5, position: "none" });

// Anticipate
const _n = anticipateIn.with({ overshoot: 2 });

// Builders
const _o: EasingFn = bezier(0.42, 0, 0.58, 1);
const _p: EasingFn = custom([
  [0, 0],
  [0.5, 0.8],
  [1, 1],
]);

// parseEasing returns EasingFn
const _q: EasingFn = parseEasing("power2.out");

// CSS
const _r: string = toCSSLinear(power2Out);
const _s: string = toCSSLinear((t: number) => t);

// defineEasing factory
const _customEase: EasingFn = defineEasing("myEase", (t) => t * t);
const _customParametric: ParametricEasing<{ strength: number }> = defineParametricEasing(
  "myParam",
  { strength: 1 },
  ({ strength }) => (t) => t * strength,
);

// Linear is a plain EasingFn, not parametric
const _t: EasingFn = linear;

// --------- Invalid usage: must be caught ---------

// @ts-expect-error — power2Out has no .with() method (not parametric)
power2Out.with({});

// @ts-expect-error — unknown param key
backOut.with({ nonexistent: 1 });

// @ts-expect-error — wrong value type (string for numeric param)
backOut.with({ overshoot: "big" });

// @ts-expect-error — wrong value type for steps.position
steps.with({ count: 5, position: "both" });

// @ts-expect-error — input must be number
power2Out("not a number");

// @ts-expect-error — no args
power2Out();

// @ts-expect-error — linear is not parametric
linear.with({});

export {};
