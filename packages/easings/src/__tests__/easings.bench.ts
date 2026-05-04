import { bench, describe } from "vitest";
import {
  backOut,
  bezier,
  bounceOut,
  circOut,
  elasticOut,
  linear,
  parseEasing,
  power2Out,
  rough,
  sineOut,
  spring,
  steps,
  toCSSLinear,
  wiggle,
} from "../index.js";

const ITERS = 1000;

function runIter(fn: (t: number) => number) {
  for (let i = 0; i < ITERS; i++) fn(i / ITERS);
}

describe("core easings (1000 samples)", () => {
  bench("linear", () => runIter(linear));
  bench("power2Out (cubic)", () => runIter(power2Out));
  bench("sineOut", () => runIter(sineOut));
  bench("circOut", () => runIter(circOut));
});

describe("parametric easings (1000 samples)", () => {
  bench("backOut", () => runIter(backOut));
  bench("elasticOut", () => runIter(elasticOut));
  bench("bounceOut", () => runIter(bounceOut));
  bench("steps (count=5)", () => runIter(steps));
});

describe("builders (1000 samples)", () => {
  const bez = bezier(0.42, 0, 0.58, 1);
  const rgh = rough.with({ seed: 1 });
  const wgl = wiggle.with({ wiggles: 5 });

  bench("bezier (Newton + subdivision)", () => runIter(bez));
  bench("spring", () => runIter(spring));
  bench("rough", () => runIter(rgh));
  bench("wiggle", () => runIter(wgl));
});

describe("factory + one-shot usage (100 iterations)", () => {
  bench("backOut.with({overshoot: n}) each loop", () => {
    for (let i = 0; i < 100; i++) {
      const fn = backOut.with({ overshoot: 1 + i / 100 });
      fn(0.5);
    }
  });
  bench("parseEasing('power2.out')", () => {
    for (let i = 0; i < 100; i++) parseEasing("power2.out");
  });
});

describe("CSS export (40 samples)", () => {
  bench("toCSSLinear(power2Out)", () => {
    for (let i = 0; i < 50; i++) toCSSLinear(power2Out);
  });
});
