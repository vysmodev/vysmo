import { describe, expect, it } from "vitest";
import {
  backOut,
  bounceInOut,
  elasticOut,
  linear,
  parseEasing,
  power2Out,
  sineInOut,
} from "../index.js";

describe("parseEasing", () => {
  it("parses plain linear", () => {
    expect(parseEasing("linear")).toBe(linear);
  });

  it("parses dotted variants", () => {
    expect(parseEasing("power2.out")).toBe(power2Out);
    expect(parseEasing("sine.inOut")).toBe(sineInOut);
    expect(parseEasing("bounce.inOut")).toBe(bounceInOut);
  });

  it("parses parametric with one arg", () => {
    const fn = parseEasing("back.out(2)");
    const native = backOut.with({ overshoot: 2 });
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(fn(t)).toBeCloseTo(native(t), 10);
    }
  });

  it("parses parametric with multiple args", () => {
    const fn = parseEasing("elastic.out(1.2, 0.4)");
    const native = elasticOut.with({ amplitude: 1.2, period: 0.4 });
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(fn(t)).toBeCloseTo(native(t), 10);
    }
  });

  it("parses steps with numeric + string arg", () => {
    const fn = parseEasing("steps(4, start)");
    expect(fn(0)).toBe(0.25);
    expect(fn(1)).toBe(1);
  });

  it("parses CSS cubic-bezier() form", () => {
    const fn = parseEasing("cubic-bezier(0.42, 0, 0.58, 1)");
    expect(fn(0)).toBe(0);
    expect(fn(1)).toBe(1);
    expect(fn(0.5)).toBeCloseTo(0.5, 3);
  });

  it("trims whitespace", () => {
    expect(parseEasing("  power2.out  ")).toBe(power2Out);
  });

  it("throws on unknown names", () => {
    expect(() => parseEasing("unknownEase")).toThrow(RangeError);
    expect(() => parseEasing("power2.foo")).toThrow(RangeError);
  });

  it("throws on malformed input", () => {
    expect(() => parseEasing("")).toThrow(RangeError);
    expect(() => parseEasing(".power2")).toThrow(RangeError);
  });

  it("throws when passing args to non-parametric", () => {
    expect(() => parseEasing("linear(2)")).toThrow(RangeError);
  });
});
