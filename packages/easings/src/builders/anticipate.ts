import { defineParametricEasing } from "../define.js";

export type AnticipateParams = {
  /** Depth of the backward dip before the forward motion. Default 1.525 (Framer Motion default). */
  overshoot: number;
};

const DEFAULTS: AnticipateParams = { overshoot: 1.525 };

function anticipateInBuild({ overshoot: s }: AnticipateParams) {
  const n = Math.max(1, s + 3);
  return (t: number) => {
    if (t < 0.5) {
      const p = t * 2;
      return 0.5 * (p * p * ((s + 1) * p - s));
    }
    const p = t * 2 - 1;
    return 0.5 + 0.5 * (1 - (1 - p) ** n);
  };
}

function anticipateOutBuild({ overshoot: s }: AnticipateParams) {
  const n = Math.max(1, s + 3);
  return (t: number) => {
    if (t < 0.5) {
      const p = t * 2;
      return 0.5 * (p ** n);
    }
    const u = 1 - t;
    const p = u * 2;
    return 1 - 0.5 * (p * p * ((s + 1) * p - s));
  };
}

function anticipateInOutBuild({ overshoot: s }: AnticipateParams) {
  return (t: number) => {
    if (t < 0.5) {
      const p = t * 2;
      return 0.5 * (p * p * ((s + 1) * p - s));
    }
    const u = 1 - t;
    const p = u * 2;
    return 1 - 0.5 * (p * p * ((s + 1) * p - s));
  };
}

/**
 * Character-animation-style anticipation: wind-up before the forward motion.
 *
 * - `anticipateIn` (formerly just `anticipate`): dip at start, smooth arrival.
 * - `anticipateOut`: smooth departure, overshoot dip near the end.
 * - `anticipateInOut`: dip at start AND overshoot near the end (wind-up + follow-through).
 *
 * The second half of `anticipateIn` uses a power-n ease where n matches the
 * first-half slope at t=0.5, giving C¹ continuity regardless of overshoot.
 */
export const anticipateIn = defineParametricEasing("anticipate.in", DEFAULTS, anticipateInBuild);
export const anticipateOut = defineParametricEasing("anticipate.out", DEFAULTS, anticipateOutBuild);
export const anticipateInOut = defineParametricEasing(
  "anticipate.inOut",
  DEFAULTS,
  anticipateInOutBuild,
);

/** Alias for `anticipateIn` (Framer Motion's default shape). */
export const anticipate = anticipateIn;
