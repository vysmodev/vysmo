import { defineParametricEasing } from "../define.js";

type ElasticParams = { amplitude: number; period: number };

const DEFAULTS: ElasticParams = { amplitude: 1, period: 0.3 };
const TAU = Math.PI * 2;

function resolveAmplitude(a: number): number {
  return a < 1 ? 1 : a;
}

function resolvePhase(a: number, p: number): number {
  return a < 1 ? p / 4 : (p / TAU) * Math.asin(1 / a);
}

export const elasticIn = defineParametricEasing(
  "elastic.in",
  DEFAULTS,
  ({ amplitude, period }) => {
    const a = resolveAmplitude(amplitude);
    const s = resolvePhase(amplitude, period);
    return (t) => -(a * 2 ** (10 * (t - 1)) * Math.sin(((t - 1 - s) * TAU) / period));
  },
);

export const elasticOut = defineParametricEasing(
  "elastic.out",
  DEFAULTS,
  ({ amplitude, period }) => {
    const a = resolveAmplitude(amplitude);
    const s = resolvePhase(amplitude, period);
    return (t) => a * 2 ** (-10 * t) * Math.sin(((t - s) * TAU) / period) + 1;
  },
);

export const elasticInOut = defineParametricEasing(
  "elastic.inOut",
  DEFAULTS,
  ({ amplitude, period }) => {
    const a = resolveAmplitude(amplitude);
    const p = period * 1.5;
    const s = resolvePhase(amplitude, p);
    return (t) => {
      const u = t * 2;
      if (u < 1) {
        return -0.5 * (a * 2 ** (10 * (u - 1)) * Math.sin(((u - 1 - s) * TAU) / p));
      }
      const v = u - 1;
      return 0.5 * a * 2 ** (-10 * v) * Math.sin(((v - s) * TAU) / p) + 1;
    };
  },
);
