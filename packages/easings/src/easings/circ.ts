import { defineEasing } from "../define.js";

export const circIn = defineEasing("circ.in", (t) => 1 - Math.sqrt(1 - t * t));
export const circOut = defineEasing("circ.out", (t) => Math.sqrt(1 - (t - 1) * (t - 1)));
export const circInOut = defineEasing("circ.inOut", (t) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2
    : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2,
);
