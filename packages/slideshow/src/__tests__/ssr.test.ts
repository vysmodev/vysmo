import { describe, expect, it } from "vitest";

describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("module loads without DOM globals", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
    expect(typeof mod.createSlideshow).toBe("function");
  });

  it("loader utilities can be imported at module load", async () => {
    // Internal module — still SSR-safe since it doesn't touch DOM at load.
    const { resolveSlide } = await import("../loader.js");
    expect(typeof resolveSlide).toBe("function");
  });
});
