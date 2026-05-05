import { defineParametricEasing } from "../define.js";

export type BreatheParams = {
  /**
   * Number of in-out breath cycles across [0, 1]. 0.5 = single inhale
   * (0 → 1). 1 = inhale + exhale (0 → 1 → 0). 2 = two full cycles. The
   * curve oscillates in [0, 1] so it maps cleanly to opacity / scale /
   * any normalised animatable.
   */
  cycles: number;
};

const DEFAULTS: BreatheParams = { cycles: 1 };

const TAU = Math.PI * 2;

// (1 - cos(τ·c·t)) / 2 — cosine wave shifted into [0, 1]. Distinct from
// `wiggle` (which oscillates [-1, 1] for shake/vibration); breathe
// stays positive and is intended for idle/ambient animations.
//
// exactEndpoints: false — for cycles ≠ 0.5n, the natural curve doesn't
// land at 1 at t=1, and clamping defeats the rhythmic intent.
export const breathe = defineParametricEasing(
  "breathe",
  DEFAULTS,
  ({ cycles }) => {
    const c = Math.max(0, cycles);
    return (t) => (1 - Math.cos(TAU * c * t)) / 2;
  },
  { exactEndpoints: false },
);
