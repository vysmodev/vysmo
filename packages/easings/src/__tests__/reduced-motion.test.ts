import { afterEach, describe, expect, it, vi } from "vitest";
import {
  linear,
  power2Out,
  prefersReducedMotion,
  respectReducedMotion,
  steps,
} from "../index.js";

describe("prefersReducedMotion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when window is undefined (SSR)", () => {
    vi.stubGlobal("window", undefined);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("returns false when matchMedia is unavailable", () => {
    vi.stubGlobal("window", {} as unknown);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("returns true when media query matches", () => {
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: true }),
    } as unknown);
    expect(prefersReducedMotion()).toBe(true);
  });

  it("returns false when media query does not match", () => {
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: false }),
    } as unknown);
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("respectReducedMotion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the original ease when reduced motion is off", () => {
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: false }),
    } as unknown);
    expect(respectReducedMotion(power2Out)).toBe(power2Out);
  });

  it("returns linear fallback by default when reduced motion is on", () => {
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: true }),
    } as unknown);
    expect(respectReducedMotion(power2Out)).toBe(linear);
  });

  it("accepts a custom fallback", () => {
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: true }),
    } as unknown);
    const fallback = steps;
    expect(respectReducedMotion(power2Out, fallback)).toBe(fallback);
  });
});
