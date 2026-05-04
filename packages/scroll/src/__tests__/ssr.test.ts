import { describe, expect, it } from "vitest";

describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("the narrowed factory set imports without touching DOM", async () => {
    const mod = await import("../index.js");
    expect(typeof mod.createScrollProgress).toBe("function");
    expect(typeof mod.createScrollTransition).toBe("function");
    expect(typeof mod.createScrollEffect).toBe("function");
    expect(typeof mod.sharedScrollObserver).toBe("function");
    expect(typeof mod.scrollRange).toBe("function");
    expect(typeof mod.scrollZones).toBe("function");
    expect(typeof mod.scrollPlateau).toBe("function");
    expect(typeof mod.smoothstep).toBe("function");
  });

  it("scroll zone helpers run purely in Node", async () => {
    const { scrollRange, scrollZones, scrollPlateau, smoothstep } =
      await import("../index.js");
    expect(scrollRange(0.1, 0.5)(0.3)).toBeCloseTo(0.5, 5);
    expect(scrollZones(0.25, 0.85)(0.5)).toBe(0);
    expect(scrollPlateau(0.3, 0.7)(0.5)).toBe(1);
    expect(smoothstep(0.5)).toBeCloseTo(0.5, 5);
    expect(smoothstep(0.25)).toBeCloseTo(0.15625, 5);
  });

  it("sharedScrollObserver can be constructed without window access", async () => {
    const { sharedScrollObserver } = await import("../index.js");
    const obs = sharedScrollObserver();
    expect(obs).toBeDefined();
    // flush() with no window is a no-op rather than a throw.
    expect(() => obs.flush()).not.toThrow();
  });
});
