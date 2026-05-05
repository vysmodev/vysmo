import { defineParametricEasing } from "../define.js";

export type GravityParams = {
  /**
   * How heavy the falling object feels. 0 = floats (linear), 1 ≈ Earth
   * gravity (quadratic fall, equivalent to power1.in), 2 = cubic fall
   * (power2.in), higher = molasses. Continuous, so designers get a
   * single "weight" knob instead of choosing between named power
   * curves.
   */
  weight: number;
};

const DEFAULTS: GravityParams = { weight: 1 };

// Math: f(t) = t^(1 + weight). Keeps endpoints exact, monotonic for
// weight ≥ 0, and continuously interpolates the catalog's power-in
// family so a designer can dial "heavier" without picking a number
// from a discrete set.
export const gravity = defineParametricEasing(
  "gravity",
  DEFAULTS,
  ({ weight }) => {
    const exp = 1 + Math.max(0, weight);
    return (t) => Math.pow(t, exp);
  },
);
