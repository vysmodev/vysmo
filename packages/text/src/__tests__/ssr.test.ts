import { describe, expect, it } from "vitest";

/**
 * SSR safety: the module graph must load in Node without DOM globals.
 * Uses the vitest.ssr.config.ts Node runner (see package.json scripts).
 * The main vitest.config.ts runs all other tests in a browser for DOM
 * coverage; this file is the exception that runs in plain Node.
 */

describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("module loads without DOM globals", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
    expect(typeof mod.animateText).toBe("function");
    expect(typeof mod.splitText).toBe("function");
    expect(typeof mod.applyProps).toBe("function");
    expect(typeof mod.resolvePreset).toBe("function");
  });

  it("presets are plain-data and safe to access in Node", async () => {
    const { fadeUp, listPresets, resolvePreset } = await import("../index.js");
    const { HANDCURATED_NAMES } = await import("../presets/index.js");
    expect(fadeUp.name).toBe("enter/fade-up");
    expect(fadeUp.animations.length).toBeGreaterThan(0);
    // Hand-curated catalog has the 15 starter entries; the registry
    // returned by listPresets() may be larger if the Studio has
    // ingested generated presets.
    expect(HANDCURATED_NAMES).toHaveLength(15);
    expect(listPresets().length).toBeGreaterThanOrEqual(15);
    const emphasis = resolvePreset("emphasis/pulse");
    expect(emphasis.animations[0]!.prop).toBe("scale");
  });

  it("splitText throws a readable error when called without DOM", async () => {
    const { splitText } = await import("../index.js");
    expect(() => splitText({} as unknown as HTMLElement)).toThrow(/browser environment/);
  });

  it("evaluateSpecs is pure and runs in Node", async () => {
    const { evaluateSpecs } = await import("../index.js");
    const v = evaluateSpecs([{ prop: "opacity", from: 0, to: 1, duration: 100 }], 50);
    expect(v.opacity).toBeCloseTo(0.5, 3);
  });
});
