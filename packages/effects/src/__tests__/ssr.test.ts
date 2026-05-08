import { describe, expect, it } from "vitest";

/**
 * SSR safety: module must load in Node without DOM globals. Uses the
 * vitest.ssr.config.ts Node runner (see package.json scripts). The main
 * vitest.config.ts runs all other tests in a browser for WebGL coverage;
 * this file is the one exception that runs in plain Node.
 */

describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("module loads without DOM globals", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
    expect(typeof mod.defineEffect).toBe("function");
    expect(typeof mod.blur).toBe("object");
  });

  it("effects are plain data objects — constructible without GL", async () => {
    const { blur, defineEffect } = await import("../index.js");
    expect(blur.name).toBe("blur");
    expect(blur.defaults.radius).toBe(16);
    expect(blur.passes).toBe(2);

    const custom = defineEffect({
      name: "custom",
      defaults: { radius: 4 },
      glsl: "vec4 effect(vec2 uv) { return getSource(uv); }",
    });
    expect(custom.name).toBe("custom");
    expect(custom.defaults.radius).toBe(4);
  });

  it("Runner import does not trigger DOM access at module load", async () => {
    const { Runner } = await import("../index.js");
    expect(typeof Runner).toBe("function");
    // Constructing the runner would require a canvas, which this runtime
    // doesn't have — so we stop here. The import itself is the check.
  });
});
