import { describe, expect, it } from "vitest";
import { interpolate } from "../interpolate.js";

describe("interpolate(number)", () => {
  it("lerps", () => {
    expect(interpolate(0, 10, 0)).toBe(0);
    expect(interpolate(0, 10, 0.5)).toBe(5);
    expect(interpolate(0, 10, 1)).toBe(10);
  });
  it("supports negatives and reverse direction", () => {
    expect(interpolate(100, -100, 0.5)).toBe(0);
    expect(interpolate(-50, 50, 0.25)).toBe(-25);
  });
  it("extrapolates outside [0, 1]", () => {
    expect(interpolate(0, 10, 2)).toBe(20);
    expect(interpolate(0, 10, -0.5)).toBe(-5);
  });
});

describe("interpolate(array)", () => {
  it("lerps component-wise", () => {
    expect(interpolate([0, 10], [10, 20], 0.5)).toEqual([5, 15]);
  });
  it("handles nested arrays", () => {
    expect(
      interpolate(
        [
          [0, 0],
          [0, 10],
        ],
        [
          [10, 0],
          [0, 20],
        ],
        0.5,
      ),
    ).toEqual([
      [5, 0],
      [0, 15],
    ]);
  });
});

describe("interpolate(object)", () => {
  it("lerps all keys", () => {
    expect(interpolate({ x: 0, y: 100 }, { x: 10, y: 200 }, 0.5)).toEqual({ x: 5, y: 150 });
  });
  it("preserves from-only keys", () => {
    const result = interpolate({ x: 0, y: 10 }, { x: 10 } as { x: number; y: number }, 0.5);
    expect(result.y).toBe(10);
  });
  it("handles nested objects", () => {
    const a = { position: { x: 0, y: 0 }, rotation: 0 };
    const b = { position: { x: 100, y: 50 }, rotation: 90 };
    expect(interpolate(a, b, 0.5)).toEqual({
      position: { x: 50, y: 25 },
      rotation: 45,
    });
  });
});

describe("interpolate(mixed/invalid)", () => {
  it("throws on mismatched types", () => {
    expect(() => interpolate(0 as unknown as number[], [10, 20], 0.5)).toThrow(TypeError);
  });
});
