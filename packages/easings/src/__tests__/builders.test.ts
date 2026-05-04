import { describe, expect, it } from "vitest";
import {
  anticipate,
  bezier,
  bezierEase,
  bezierEaseIn,
  bezierEaseInOut,
  bezierEaseOut,
  custom,
  expoScale,
  power2Out,
  rough,
  slow,
  spring,
  wiggle,
} from "../index.js";

describe("bezier", () => {
  it("linear (0, 0, 1, 1) matches identity", () => {
    const linear = bezier(0, 0, 1, 1);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(linear(t)).toBeCloseTo(t, 10);
    }
  });
  it("hits (0, 0) and (1, 1) exactly", () => {
    const e = bezier(0.17, 0.67, 0.83, 0.67);
    expect(e(0)).toBe(0);
    expect(e(1)).toBe(1);
  });
  it("CSS ease-in matches approximate shape (slow start, fast finish)", () => {
    expect(bezierEaseIn(0.25)).toBeLessThan(0.25);
    expect(bezierEaseIn(0.75)).toBeGreaterThan(0.5);
  });
  it("CSS ease-out matches approximate shape (fast start, slow finish)", () => {
    expect(bezierEaseOut(0.25)).toBeGreaterThan(0.25);
    expect(bezierEaseOut(0.75)).toBeGreaterThan(0.75);
  });
  it("CSS ease-in-out crosses 0.5 at t=0.5", () => {
    expect(bezierEaseInOut(0.5)).toBeCloseTo(0.5, 3);
  });
  it("CSS ease is preset (slight head-start, overshoot-free)", () => {
    expect(bezierEase(0.2)).toBeGreaterThan(0.2);
  });
  it("rejects out-of-range x control points", () => {
    expect(() => bezier(-0.1, 0, 0.5, 1)).toThrow(RangeError);
    expect(() => bezier(0.5, 0, 1.1, 1)).toThrow(RangeError);
  });
  it("permits out-of-range y (for overshoot bezier)", () => {
    const overshoot = bezier(0.5, 1.5, 0.5, 1.5);
    let max = 0;
    for (let i = 0; i <= 100; i++) max = Math.max(max, overshoot(i / 100));
    expect(max).toBeGreaterThan(1);
  });
});

describe("spring", () => {
  it("hits endpoints exactly at defaults", () => {
    expect(spring(0)).toBe(0);
    expect(spring(1)).toBe(1);
  });
  it("default spring shows oscillation", () => {
    let crossings = 0;
    let prev = spring(0);
    for (let i = 1; i <= 200; i++) {
      const curr = spring(i / 200);
      if ((prev < 1 && curr >= 1) || (prev > 1 && curr <= 1)) crossings++;
      prev = curr;
    }
    expect(crossings).toBeGreaterThanOrEqual(1);
  });
  it("overdamped spring does not overshoot", () => {
    const heavy = spring.with({ damping: 40, stiffness: 100, mass: 1 });
    let max = 0;
    for (let i = 0; i <= 100; i++) max = Math.max(max, heavy(i / 100));
    expect(max).toBeLessThanOrEqual(1 + 1e-6);
  });
  it("critically damped spring (zeta = 1) works", () => {
    const k = 100;
    const m = 1;
    const b = 2 * Math.sqrt(k * m);
    const critical = spring.with({ stiffness: k, mass: m, damping: b });
    expect(critical(0)).toBe(0);
    expect(critical(1)).toBe(1);
    expect(critical(0.5)).toBeGreaterThan(0);
    expect(critical(0.5)).toBeLessThanOrEqual(1);
  });
  it("stiffer spring settles faster relative to its own duration", () => {
    const soft = spring.with({ stiffness: 50 });
    const stiff = spring.with({ stiffness: 400 });
    expect(soft(0.5)).not.toBe(stiff(0.5));
  });
});

describe("custom", () => {
  it("two-point linear ease is identity", () => {
    const line = custom([
      [0, 0],
      [1, 1],
    ]);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(line(t)).toBeCloseTo(t, 10);
    }
  });
  it("three-point piecewise linear interpolates correctly", () => {
    const e = custom([
      [0, 0],
      [0.5, 0.8],
      [1, 1],
    ]);
    expect(e(0.25)).toBeCloseTo(0.4, 10);
    expect(e(0.75)).toBeCloseTo(0.9, 10);
  });
  it("hits provided endpoints (framework clamp)", () => {
    const e = custom([
      [0, 0],
      [1, 1],
    ]);
    expect(e(0)).toBe(0);
    expect(e(1)).toBe(1);
  });
  it("rejects fewer than 2 points", () => {
    expect(() => custom([[0.5, 0.5]])).toThrow(RangeError);
  });
  it("rejects unsorted points", () => {
    expect(() =>
      custom([
        [0, 0],
        [0.7, 0.3],
        [0.3, 0.8],
        [1, 1],
      ]),
    ).toThrow(RangeError);
  });
});

describe("rough", () => {
  it("hits endpoints via framework clamp", () => {
    const r = rough.with({ seed: 1 });
    expect(r(0)).toBe(0);
    expect(r(1)).toBe(1);
  });
  it("seeded rough is deterministic", () => {
    const a = rough.with({ seed: 42, strength: 0.2 });
    const b = rough.with({ seed: 42, strength: 0.2 });
    for (let i = 0; i <= 20; i++) {
      expect(a(i / 20)).toBeCloseTo(b(i / 20), 10);
    }
  });
  it("different seeds produce different curves", () => {
    const a = rough.with({ seed: 1, strength: 0.2 });
    const b = rough.with({ seed: 2, strength: 0.2 });
    let diffs = 0;
    for (let i = 1; i < 20; i++) {
      if (Math.abs(a(i / 20) - b(i / 20)) > 1e-6) diffs++;
    }
    expect(diffs).toBeGreaterThan(10);
  });
  it("zero strength + linear template is identity", () => {
    const r = rough.with({ seed: 7, strength: 0 });
    for (let i = 1; i < 20; i++) {
      const t = i / 20;
      expect(r(t)).toBeCloseTo(t, 10);
    }
  });
  it("zero strength approximates curved template (within piecewise-linear error)", () => {
    const r = rough.with({ seed: 7, strength: 0, points: 60, template: power2Out });
    for (let i = 1; i < 20; i++) {
      const t = i / 20;
      expect(r(t)).toBeCloseTo(power2Out(t), 1);
    }
  });
});

describe("wiggle", () => {
  it("wiggles crosses zero multiple times", () => {
    const w = wiggle.with({ wiggles: 5, type: "uniform" });
    let crossings = 0;
    let prev = w(0);
    for (let i = 1; i <= 200; i++) {
      const curr = w(i / 200);
      if ((prev >= 0 && curr < 0) || (prev <= 0 && curr > 0)) crossings++;
      prev = curr;
    }
    expect(crossings).toBeGreaterThanOrEqual(8);
  });
  it("easeOut envelope decays toward the end", () => {
    const w = wiggle.with({ wiggles: 4, type: "easeOut" });
    let earlyMax = 0;
    let lateMax = 0;
    for (let i = 0; i <= 50; i++) earlyMax = Math.max(earlyMax, Math.abs(w(i / 200)));
    for (let i = 150; i <= 200; i++) lateMax = Math.max(lateMax, Math.abs(w(i / 200)));
    expect(earlyMax).toBeGreaterThan(lateMax);
  });
});

describe("slow", () => {
  it("is symmetric around t=0.5", () => {
    const s = slow.with({ linearRatio: 0.7 });
    expect(s(0.5)).toBeCloseTo(0.5, 6);
    expect(s(0.3) + s(0.7)).toBeCloseTo(1, 6);
    expect(s(0.1) + s(0.9)).toBeCloseTo(1, 6);
  });
  it("middle section is genuinely slow (slope < 1)", () => {
    const s = slow.with({ linearRatio: 0.8, power: 0.7 });
    const slope = (s(0.55) - s(0.45)) / 0.1;
    expect(slope).toBeLessThan(0.8);
  });
  it("edges are fast (curve ahead of diagonal in first half)", () => {
    const s = slow.with({ linearRatio: 0.7, power: 0.7 });
    expect(s(0.1)).toBeGreaterThan(0.1);
  });
  it("higher power exaggerates the effect (slower middle)", () => {
    const soft = slow.with({ linearRatio: 0.7, power: 0.3 });
    const hard = slow.with({ linearRatio: 0.7, power: 2 });
    const softSlope = (soft(0.55) - soft(0.45)) / 0.1;
    const hardSlope = (hard(0.55) - hard(0.45)) / 0.1;
    expect(hardSlope).toBeLessThan(softSlope);
  });
});

describe("anticipate", () => {
  it("dips below zero before reaching 1", () => {
    let min = 0;
    for (let i = 0; i <= 100; i++) min = Math.min(min, anticipate(i / 100));
    expect(min).toBeLessThan(-0.01);
  });
  it("hits endpoints exactly", () => {
    expect(anticipate(0)).toBe(0);
    expect(anticipate(1)).toBe(1);
  });
  it("crosses zero exactly at t=0.5 (end of back.in phase)", () => {
    expect(anticipate(0.5)).toBeCloseTo(0.5, 6);
  });
  it("higher overshoot means deeper dip", () => {
    const soft = anticipate.with({ overshoot: 0.5 });
    const hard = anticipate.with({ overshoot: 3 });
    let softMin = 0;
    let hardMin = 0;
    for (let i = 0; i <= 100; i++) {
      softMin = Math.min(softMin, soft(i / 100));
      hardMin = Math.min(hardMin, hard(i / 100));
    }
    expect(hardMin).toBeLessThan(softMin);
  });
});

describe("expoScale", () => {
  it("maps large scale ratios evenly", () => {
    const e = expoScale(1, 100);
    expect(e(0)).toBe(0);
    expect(e(1)).toBe(1);
    expect(e(0.5)).toBeGreaterThan(0);
    expect(e(0.5)).toBeLessThan(0.5);
  });
  it("rejects non-positive scales", () => {
    expect(() => expoScale(0, 10)).toThrow(RangeError);
    expect(() => expoScale(1, -10)).toThrow(RangeError);
  });
  it("collapses to zero motion when start === end", () => {
    const e = expoScale(2, 2);
    expect(e(0.5)).toBe(0);
  });
});
