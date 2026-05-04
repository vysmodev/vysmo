import { defineParametricEasing } from "../define.js";
import { linear } from "../easings/linear.js";
import type { EasingFn } from "../types.js";

export type RoughParams = {
  /** Base ease to perturb. Default linear. */
  template: EasingFn;
  /** Magnitude of jitter. Typical 0.05–0.3. Default 0.15. */
  strength: number;
  /** Number of jitter points along the curve. More = finer noise. Default 20. */
  points: number;
  /** Taper the jitter so it dies toward endpoints. */
  taper: "none" | "in" | "out" | "both";
  /** Randomize x-spacing of jitter points. Default true. */
  randomize: boolean;
  /** Seed for deterministic output. Pass to get the same rough curve every call. */
  seed: number;
};

const DEFAULTS: RoughParams = {
  template: linear,
  strength: 0.15,
  points: 20,
  taper: "both",
  randomize: true,
  seed: 0,
};

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function taperAmount(taper: RoughParams["taper"], x: number): number {
  switch (taper) {
    case "in":
      return x;
    case "out":
      return 1 - x;
    case "both":
      return 2 * (0.5 - Math.abs(x - 0.5));
    case "none":
      return 1;
  }
}

export const rough = defineParametricEasing(
  "rough",
  DEFAULTS,
  ({ template, strength, points, taper, randomize, seed }) => {
    const seedValue = seed === 0 ? Math.floor(Math.random() * 2 ** 31) : seed;
    const rng = mulberry32(seedValue);
    const n = Math.max(3, Math.floor(points));
    const xs: number[] = [0];
    for (let i = 1; i < n - 1; i++) xs.push(randomize ? rng() : i / (n - 1));
    xs.push(1);
    xs.sort((a, b) => a - b);
    const ys: number[] = xs.map((x) => {
      const base = template(x);
      const jitter = (rng() - 0.5) * 2 * strength * taperAmount(taper, x);
      return base + jitter;
    });
    return (t: number) => {
      for (let i = 1; i < xs.length; i++) {
        const x1 = xs[i]!;
        if (t <= x1) {
          const x0 = xs[i - 1]!;
          const span = x1 - x0;
          if (span === 0) return ys[i]!;
          const u = (t - x0) / span;
          return ys[i - 1]! + (ys[i]! - ys[i - 1]!) * u;
        }
      }
      return ys[ys.length - 1]!;
    };
  },
);
