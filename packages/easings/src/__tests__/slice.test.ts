import { describe, expect, it } from "vitest";
import { linear, power2Out, slice } from "../index.js";

describe("slice", () => {
  it("slice of linear across full range is identity", () => {
    const s = slice(linear, 0, 1);
    expect(s).toBe(linear);
  });

  it("slice of linear over a sub-range is still linear", () => {
    const s = slice(linear, 0.25, 0.75);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(s(t)).toBeCloseTo(t, 10);
    }
  });

  it("hits new endpoints exactly", () => {
    const s = slice(power2Out, 0.2, 0.8);
    expect(s(0)).toBe(0);
    expect(s(1)).toBe(1);
  });

  it("slice output at t=0 corresponds to ease(start) remapped", () => {
    const ease = power2Out;
    const s = slice(ease, 0.3, 0.9);
    // At t=0.5 inside the slice, we should see ease(0.6) normalized
    const expected = (ease(0.6) - ease(0.3)) / (ease(0.9) - ease(0.3));
    expect(s(0.5)).toBeCloseTo(expected, 10);
  });

  it("rejects invalid ranges", () => {
    expect(() => slice(linear, -0.1, 0.5)).toThrow(RangeError);
    expect(() => slice(linear, 0.5, 0.5)).toThrow(RangeError);
    expect(() => slice(linear, 0.8, 0.2)).toThrow(RangeError);
    expect(() => slice(linear, 0, 1.1)).toThrow(RangeError);
  });
});
