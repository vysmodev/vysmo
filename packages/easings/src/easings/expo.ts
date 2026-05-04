import { defineEasing } from "../define.js";

export const expoIn = defineEasing("expo.in", (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)));
export const expoOut = defineEasing("expo.out", (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)));
export const expoInOut = defineEasing("expo.inOut", (t) => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2;
});
