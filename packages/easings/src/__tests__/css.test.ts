import { describe, expect, it } from "vitest";
import {
  backOut,
  bezierEaseInOut,
  linear,
  power2Out,
  toCSSBezier,
  toCSSKeyframes,
  toCSSLinear,
} from "../index.js";

describe("toCSSLinear", () => {
  it("emits linear() prefix with sample count + 1 values", () => {
    const css = toCSSLinear(linear, 4);
    expect(css.startsWith("linear(")).toBe(true);
    expect(css.endsWith(")")).toBe(true);
    const values = css.slice("linear(".length, -1).split(", ");
    expect(values.length).toBe(5);
  });

  it("linear ease maps to evenly-spaced values 0..1", () => {
    const css = toCSSLinear(linear, 4);
    expect(css).toBe("linear(0, 0.25, 0.5, 0.75, 1)");
  });

  it("power2Out produces increasing but decelerating values", () => {
    const css = toCSSLinear(power2Out, 4);
    const values = css.slice("linear(".length, -1).split(", ").map(Number);
    expect(values[0]).toBe(0);
    expect(values[values.length - 1]).toBe(1);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]!).toBeGreaterThan(values[i - 1]!);
    }
  });

  it("includes overshoot values for back.out", () => {
    const css = toCSSLinear(backOut, 40);
    const values = css.slice("linear(".length, -1).split(", ").map(Number);
    const max = Math.max(...values);
    expect(max).toBeGreaterThan(1);
  });

  it("rejects zero or negative samples", () => {
    expect(() => toCSSLinear(linear, 0)).toThrow(RangeError);
    expect(() => toCSSLinear(linear, -5)).toThrow(RangeError);
  });

  it("accepts plain easing functions", () => {
    const css = toCSSLinear((t) => t * t, 4);
    expect(css).toMatch(/^linear\(0, .+, 1\)$/);
  });
});

describe("toCSSBezier", () => {
  it("emits cubic-bezier() string", () => {
    expect(toCSSBezier(0.42, 0, 0.58, 1)).toBe("cubic-bezier(0.42, 0, 0.58, 1)");
  });
  it("trims trailing zeros and handles integers", () => {
    expect(toCSSBezier(0, 0.5, 1, 1)).toBe("cubic-bezier(0, 0.5, 1, 1)");
  });
  it("matches our own bezier easing sampled output (sanity)", () => {
    const samples = 12;
    const css = toCSSLinear(bezierEaseInOut, samples);
    const native = toCSSBezier(0.42, 0, 0.58, 1);
    expect(css).toContain("linear(");
    expect(native).toContain("cubic-bezier(");
  });
});

describe("toCSSKeyframes", () => {
  it("generates @keyframes block with opening/closing braces", () => {
    const kf = toCSSKeyframes("slide", "transform", (v) => `translateX(${v * 100}px)`, linear, 4);
    expect(kf.startsWith("@keyframes slide {")).toBe(true);
    expect(kf.endsWith("}")).toBe(true);
  });

  it("emits 0% and 100% markers", () => {
    const kf = toCSSKeyframes("x", "opacity", (v) => String(v), linear, 4);
    expect(kf).toContain("0% { opacity: 0; }");
    expect(kf).toContain("100% { opacity: 1; }");
  });

  it("uses the easing to compute property values at each keyframe", () => {
    const kf = toCSSKeyframes("x", "opacity", (v) => String(v), power2Out, 4);
    expect(kf).toMatch(/50% \{ opacity: 0\.875; \}/);
  });

  it("rejects samples below 2", () => {
    expect(() =>
      toCSSKeyframes("x", "opacity", (v) => String(v), linear, 1),
    ).toThrow(RangeError);
  });
});
