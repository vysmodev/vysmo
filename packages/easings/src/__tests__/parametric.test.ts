import { describe, expect, it } from "vitest";
import {
  backIn,
  backInOut,
  backOut,
  bounceIn,
  bounceInOut,
  bounceOut,
  elasticIn,
  elasticInOut,
  elasticOut,
  steps,
  type EasingFn,
  type ParametricEasing,
} from "../index.js";

const PARAMETRIC = [
  ["back.in", backIn],
  ["back.out", backOut],
  ["back.inOut", backInOut],
  ["elastic.in", elasticIn],
  ["elastic.out", elasticOut],
  ["elastic.inOut", elasticInOut],
  ["steps", steps],
] as const;

const BOUNCE = [
  ["bounce.in", bounceIn],
  ["bounce.out", bounceOut],
  ["bounce.inOut", bounceInOut],
] as const;

describe("parametric easings hit endpoints", () => {
  it.each(PARAMETRIC)("%s(0) === 0 at defaults", (_, fn) => {
    expect((fn as EasingFn)(0)).toBe(0);
  });
  it.each(PARAMETRIC)("%s(1) === 1 at defaults", (_, fn) => {
    expect((fn as EasingFn)(1)).toBe(1);
  });
  it.each(BOUNCE)("%s(0) === 0", (_, fn) => {
    expect(fn(0)).toBe(0);
  });
  it.each(BOUNCE)("%s(1) === 1", (_, fn) => {
    expect(fn(1)).toBe(1);
  });
});

describe("back has overshoot", () => {
  it("back.out exceeds 1 somewhere in (0, 1)", () => {
    let max = 0;
    for (let i = 0; i <= 100; i++) max = Math.max(max, backOut(i / 100));
    expect(max).toBeGreaterThan(1);
  });
  it("back.in goes below 0 somewhere in (0, 1)", () => {
    let min = 1;
    for (let i = 0; i <= 100; i++) min = Math.min(min, backIn(i / 100));
    expect(min).toBeLessThan(0);
  });
  it("custom overshoot changes curve shape", () => {
    const soft = backOut.with({ overshoot: 0.5 });
    const hard = backOut.with({ overshoot: 4 });
    let softMax = 0;
    let hardMax = 0;
    for (let i = 0; i <= 100; i++) {
      softMax = Math.max(softMax, soft(i / 100));
      hardMax = Math.max(hardMax, hard(i / 100));
    }
    expect(hardMax).toBeGreaterThan(softMax);
  });
});

describe("elastic oscillates", () => {
  it("elastic.out crosses 1 multiple times (oscillation)", () => {
    let crossings = 0;
    let prev = 0;
    for (let i = 1; i <= 100; i++) {
      const curr = elasticOut(i / 100);
      if ((prev < 1 && curr >= 1) || (prev > 1 && curr <= 1)) crossings++;
      prev = curr;
    }
    expect(crossings).toBeGreaterThanOrEqual(2);
  });
  it("custom amplitude changes overshoot", () => {
    const big = elasticOut.with({ amplitude: 3 });
    const small = elasticOut.with({ amplitude: 1 });
    let bigMax = 0;
    let smallMax = 0;
    for (let i = 0; i <= 100; i++) {
      bigMax = Math.max(bigMax, big(i / 100));
      smallMax = Math.max(smallMax, small(i / 100));
    }
    expect(bigMax).toBeGreaterThan(smallMax);
  });
});

describe("bounce produces stepped peaks", () => {
  it("bounce.out has multiple local maxima between 0 and 1", () => {
    let peaks = 0;
    let prev = bounceOut(0);
    let trend: 1 | -1 = 1;
    for (let i = 1; i <= 200; i++) {
      const curr = bounceOut(i / 200);
      if (trend === 1 && curr < prev) {
        peaks++;
        trend = -1;
      } else if (trend === -1 && curr > prev) {
        trend = 1;
      }
      prev = curr;
    }
    expect(peaks).toBeGreaterThanOrEqual(3);
  });
});

describe("steps produces discrete values", () => {
  it("steps (default end, count 5) produces exactly 5 unique values across [0, 1)", () => {
    const values = new Set<number>();
    for (let i = 0; i < 100; i++) values.add(steps(i / 100));
    expect(values.size).toBeLessThanOrEqual(5);
  });
  it("steps with count 10 produces finer granularity", () => {
    const fine = steps.with({ count: 10 });
    const values = new Set<number>();
    for (let i = 0; i < 100; i++) values.add(fine(i / 100));
    expect(values.size).toBeGreaterThan(5);
  });
  it("steps position: start outputs 1/n at t=0", () => {
    const s = steps.with({ count: 4, position: "start" });
    expect(s(0)).toBeCloseTo(0.25, 10);
  });
  it("steps position: none outputs 0 at t=0 and 1 at t=1", () => {
    const s = steps.with({ count: 5, position: "none" });
    expect(s(0)).toBe(0);
    expect(s(1)).toBe(1);
  });
});

describe("parametric factories preserve defaults immutably", () => {
  it.each(PARAMETRIC)("%s.defaults is frozen", (_, fn) => {
    const parametric = fn as ParametricEasing<object>;
    expect(Object.isFrozen(parametric.defaults)).toBe(true);
  });
  it(".with() produces independent EasingFn", () => {
    const a = backOut.with({ overshoot: 2 });
    const b = backOut.with({ overshoot: 5 });
    expect(a(0.5)).not.toBe(b(0.5));
  });
});
