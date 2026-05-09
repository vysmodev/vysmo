import { describe, expect, it } from "vitest";

describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("module loads without DOM globals", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
    expect(typeof mod.Slideshow).toBe("function");
    expect(typeof mod.useSlideshow).toBe("function");
  });
});
