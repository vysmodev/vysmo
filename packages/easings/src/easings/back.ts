import { defineParametricEasing } from "../define.js";

type BackParams = { overshoot: number };

const DEFAULTS: BackParams = { overshoot: 1.70158 };

export const backIn = defineParametricEasing("back.in", DEFAULTS, ({ overshoot: s }) => (t) => {
  return t * t * ((s + 1) * t - s);
});

export const backOut = defineParametricEasing("back.out", DEFAULTS, ({ overshoot: s }) => (t) => {
  const u = t - 1;
  return u * u * ((s + 1) * u + s) + 1;
});

export const backInOut = defineParametricEasing("back.inOut", DEFAULTS, ({ overshoot }) => {
  const s = overshoot * 1.525;
  return (t) => {
    const u = t * 2;
    if (u < 1) return 0.5 * (u * u * ((s + 1) * u - s));
    const v = u - 2;
    return 0.5 * (v * v * ((s + 1) * v + s) + 2);
  };
});
