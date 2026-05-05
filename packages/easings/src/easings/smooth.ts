import { defineEasing } from "../define.js";

// Hermite smoothstep. C¹-continuous at both endpoints — zero velocity
// at t=0 AND t=1. The canonical inOut shape from GLSL `smoothstep`,
// distinct from `power2.inOut` whose first derivative is non-zero at
// the endpoints. The in/out variants are derived by rescaling halves
// of the smoothstep curve, so they preserve Hermite smoothness on the
// "interior" endpoint (t=0 for in, t=1 for out).

const smoothstep = (t: number) => t * t * (3 - 2 * t);

export const smoothInOut = defineEasing("smooth.inOut", smoothstep);

// 2·smoothstep(t/2): first half of the inOut curve, scaled to [0, 1].
// f(0)=0, f(1)=1, f'(0)=0, f'(1)=1.5 — slow start, accelerates out.
export const smoothIn = defineEasing("smooth.in", (t) => {
  const u = t / 2;
  return 2 * smoothstep(u);
});

// Mirror of smoothIn. Fast start, decelerates to zero velocity at t=1.
export const smoothOut = defineEasing("smooth.out", (t) => {
  const u = (1 - t) / 2;
  return 1 - 2 * smoothstep(u);
});
