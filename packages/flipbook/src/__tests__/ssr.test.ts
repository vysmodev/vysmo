import { describe, expect, it } from "vitest";

describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("module loads without DOM globals", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
    expect(typeof mod.createFlipbook).toBe("function");
  });

  it("loader utilities can be imported at module load", async () => {
    const { resolvePage } = await import("../loader.js");
    expect(typeof resolvePage).toBe("function");
  });
});
