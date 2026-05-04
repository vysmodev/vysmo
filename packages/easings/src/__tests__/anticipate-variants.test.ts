import { describe, expect, it } from "vitest";
import {
  anticipate,
  anticipateIn,
  anticipateInOut,
  anticipateOut,
} from "../index.js";

describe("anticipate variants", () => {
  it("anticipate alias equals anticipateIn", () => {
    expect(anticipate).toBe(anticipateIn);
  });

  it("all variants hit endpoints exactly", () => {
    for (const fn of [anticipateIn, anticipateOut, anticipateInOut]) {
      expect(fn(0)).toBe(0);
      expect(fn(1)).toBe(1);
    }
  });

  it("anticipateIn dips below zero early", () => {
    let min = 0;
    for (let i = 0; i <= 100; i++) min = Math.min(min, anticipateIn(i / 100));
    expect(min).toBeLessThan(-0.01);
  });

  it("anticipateOut overshoots above one late", () => {
    let max = 0;
    for (let i = 0; i <= 100; i++) max = Math.max(max, anticipateOut(i / 100));
    expect(max).toBeGreaterThan(1.01);
  });

  it("anticipateInOut both dips and overshoots", () => {
    let min = 0;
    let max = 0;
    for (let i = 0; i <= 100; i++) {
      const v = anticipateInOut(i / 100);
      if (v < min) min = v;
      if (v > max) max = v;
    }
    expect(min).toBeLessThan(-0.01);
    expect(max).toBeGreaterThan(1.01);
  });

  it("anticipateOut is approximately reverse of anticipateIn", () => {
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      expect(anticipateOut(t)).toBeCloseTo(1 - anticipateIn(1 - t), 6);
    }
  });

  it("anticipateInOut is symmetric around t=0.5", () => {
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      expect(anticipateInOut(t) + anticipateInOut(1 - t)).toBeCloseTo(1, 6);
    }
  });
});
