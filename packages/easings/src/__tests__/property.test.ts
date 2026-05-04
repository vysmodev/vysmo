import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  circIn,
  circInOut,
  circOut,
  cubicIn,
  cubicInOut,
  cubicOut,
  expoIn,
  expoInOut,
  expoOut,
  linear,
  quartIn,
  quartInOut,
  quartOut,
  quintIn,
  quintInOut,
  quintOut,
  sineIn,
  sineInOut,
  sineOut,
  type EasingFn,
} from "../index.js";

// Non-overshooting easings: output in [0, 1] for t in [0, 1]
const NON_OVERSHOOT: Array<[string, EasingFn]> = [
  ["linear", linear],
  ["cubicIn", cubicIn],
  ["cubicOut", cubicOut],
  ["cubicInOut", cubicInOut],
  ["quartIn", quartIn],
  ["quartOut", quartOut],
  ["quartInOut", quartInOut],
  ["quintIn", quintIn],
  ["quintOut", quintOut],
  ["quintInOut", quintInOut],
  ["sineIn", sineIn],
  ["sineOut", sineOut],
  ["sineInOut", sineInOut],
  ["circIn", circIn],
  ["circOut", circOut],
  ["circInOut", circInOut],
  ["expoIn", expoIn],
  ["expoOut", expoOut],
  ["expoInOut", expoInOut],
];

const tArb = fc.double({ min: 0, max: 1, noNaN: true });

describe("property: endpoints always clamp", () => {
  it.each(NON_OVERSHOOT)("%s(0) is exactly 0", (_, fn) => {
    expect(fn(0)).toBe(0);
  });
  it.each(NON_OVERSHOOT)("%s(1) is exactly 1", (_, fn) => {
    expect(fn(1)).toBe(1);
  });
});

describe("property: output stays in [0, 1] for non-overshoot eases", () => {
  it.each(NON_OVERSHOOT)("%s output is always in [0, 1]", (_, fn) => {
    fc.assert(
      fc.property(tArb, (t) => {
        const y = fn(t);
        return y >= -1e-9 && y <= 1 + 1e-9;
      }),
      { numRuns: 200 },
    );
  });
});

describe("property: monotonicity for non-overshoot eases", () => {
  it.each(NON_OVERSHOOT)("%s is monotonically non-decreasing", (_, fn) => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 0.9999, noNaN: true }),
        fc.double({ min: 0, max: 0.01, noNaN: true }),
        (t, delta) => {
          const a = fn(t);
          const b = fn(Math.min(1, t + delta));
          return b >= a - 1e-9;
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe("property: defensive input handling", () => {
  it("all eases return finite output for any finite input", () => {
    const EXTENDED: EasingFn[] = NON_OVERSHOOT.map(([, fn]) => fn);
    fc.assert(
      fc.property(
        fc.double({ min: -100, max: 100, noNaN: true }),
        fc.integer({ min: 0, max: EXTENDED.length - 1 }),
        (t, idx) => {
          const result = EXTENDED[idx]!(t);
          return Number.isFinite(result);
        },
      ),
      { numRuns: 300 },
    );
  });

  it("all eases return 0 on NaN input", () => {
    for (const [, fn] of NON_OVERSHOOT) {
      expect(fn(Number.NaN)).toBe(0);
    }
  });
});
