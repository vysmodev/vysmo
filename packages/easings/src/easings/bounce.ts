import { defineEasing } from "../define.js";

function bounceOutImpl(t: number): number {
  const n = 7.5625;
  const d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) {
    const u = t - 1.5 / d;
    return n * u * u + 0.75;
  }
  if (t < 2.5 / d) {
    const u = t - 2.25 / d;
    return n * u * u + 0.9375;
  }
  const u = t - 2.625 / d;
  return n * u * u + 0.984375;
}

export const bounceOut = defineEasing("bounce.out", bounceOutImpl);
export const bounceIn = defineEasing("bounce.in", (t) => 1 - bounceOutImpl(1 - t));
export const bounceInOut = defineEasing("bounce.inOut", (t) =>
  t < 0.5 ? (1 - bounceOutImpl(1 - 2 * t)) / 2 : (1 + bounceOutImpl(2 * t - 1)) / 2,
);
