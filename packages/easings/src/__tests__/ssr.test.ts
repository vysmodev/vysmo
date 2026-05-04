import { describe, expect, it } from "vitest";

/**
 * easings vitest config runs in Node (no `browser.enabled`) so the mere
 * fact these tests execute proves the library is SSR-safe at import time.
 * Additional checks verify no DOM globals are required.
 */

describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("module loads without DOM globals", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
    expect(typeof mod.linear).toBe("function");
    expect(typeof mod.defineEasing).toBe("function");
    expect(typeof mod.parseEasing).toBe("function");
  });

  it("all catalog functions execute without DOM", async () => {
    const {
      linear,
      power2Out,
      backOut,
      elasticOut,
      bounceOut,
      steps,
      spring,
      bezier,
      rough,
      wiggle,
    } = await import("../index.js");
    expect(linear(0.5)).toBe(0.5);
    expect(power2Out(0.5)).toBeCloseTo(0.875, 3);
    expect(backOut(0.5)).toBeGreaterThan(0.9);
    expect(elasticOut(0.5)).toBeGreaterThan(0);
    expect(bounceOut(0.5)).toBeGreaterThan(0);
    expect(steps(0.5)).toBe(0.4);
    expect(spring(0.5)).toBeGreaterThan(0);
    expect(bezier(0.42, 0, 0.58, 1)(0.5)).toBeCloseTo(0.5, 3);
    expect(rough.with({ seed: 1 })(0.5)).toBeGreaterThan(0);
    expect(wiggle.with({ wiggles: 5 })(0.5)).toBeCloseTo(0, 6);
  });

  it("CSS subpath loads without DOM", async () => {
    const { toCSSLinear, toCSSBezier } = await import("../css.js");
    expect(typeof toCSSLinear).toBe("function");
    expect(typeof toCSSBezier).toBe("function");
  });

  it("parse subpath loads without DOM", async () => {
    const { parseEasing } = await import("../parse.js");
    expect(typeof parseEasing).toBe("function");
  });

  it("reduced-motion subpath loads without DOM and returns false", async () => {
    const { prefersReducedMotion } = await import("../reduced-motion.js");
    expect(prefersReducedMotion()).toBe(false);
  });
});
