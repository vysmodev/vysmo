import { defineParametricEasing } from "../define.js";

export type SlowParams = {
  /** Fraction of duration spent in the slow linear middle. 0–1. Default 0.7. */
  linearRatio: number;
  /** Strength of the fast edges. Higher = more dramatic edges + slower middle. Default 0.7. */
  power: number;
  /** If true, reverse the second half so the curve returns to start. */
  yoyoMode: boolean;
};

const DEFAULTS: SlowParams = {
  linearRatio: 0.7,
  power: 0.7,
  yoyoMode: false,
};

/**
 * "Slow motion" ease: fast at the start and end, slow (nearly constant)
 * through the middle. Opposite of an inOut shape — the linear middle
 * section lives off the diagonal, so the midpoint value changes slowly
 * with time.
 */
export const slow = defineParametricEasing(
  "slow",
  DEFAULTS,
  ({ linearRatio, power, yoyoMode }) => {
    const lr = Math.max(0, Math.min(1, linearRatio));
    const p = Math.max(0, power);
    const edge = (1 - lr) / 2;
    // Off-diagonal offset of the linear section. At power=0 the linear
    // section sits ON the diagonal (slow degenerates to linear); at higher
    // powers it collapses toward y=0.5, making the middle genuinely slow.
    const edgeY = (0.5 - edge) / (1 + p * 2);
    const mid1 = 0.5 - edgeY;
    const mid2 = 0.5 + edgeY;
    const middleSpan = mid2 - mid1;
    const middleSlope = lr === 0 ? 0 : middleSpan / lr;
    // Edges blend a power-n ease-out with a linear segment whose slope
    // matches the middle. That way the corner is a smooth curve, not a
    // visible kink. Higher `power` sharpens the edge initial rise.
    const edgeN = 2 + p * 6;
    // Fraction contributed by the linear component of the blend, chosen so
    // that the edge's end-slope equals the middle slope exactly → C¹
    // continuity at the join. (Derived: y'(u=1) in edge = mid1 * (1-a) / edge.)
    const linearShare = edge === 0 || mid1 === 0 ? 0 : Math.min(1, (middleSlope * edge) / mid1);
    const powerShare = 1 - linearShare;

    return (t: number) => {
      let result: number;
      if (edge === 0) {
        result = t;
      } else if (t < edge) {
        const u = t / edge;
        const v = powerShare * (1 - (1 - u) ** edgeN) + linearShare * u;
        result = mid1 * v;
      } else if (t > 1 - edge) {
        const u = (t - (1 - edge)) / edge;
        const v = powerShare * (u ** edgeN) + linearShare * u;
        result = mid2 + (1 - mid2) * v;
      } else {
        const u = (t - edge) / lr;
        result = mid1 + middleSpan * u;
      }
      if (yoyoMode) {
        return result < 0.5 ? result * 2 : (1 - result) * 2;
      }
      return result;
    };
  },
  { exactEndpoints: false },
);
