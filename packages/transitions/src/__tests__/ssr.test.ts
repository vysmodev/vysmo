import { describe, expect, it } from "vitest";

/**
 * SSR safety: the module graph must load in Node without DOM globals,
 * because @vysmo/transitions is loaded by SSR frameworks (Astro, Next,
 * etc.) at build time.
 *
 * Constructing a `Runner` requires a live WebGL2 context — that's
 * exercised in the browser tests. This file only asserts that
 * *importing* the module + reading the pure-data exports works without
 * `window` / `WebGLTexture` / `HTMLCanvasElement` defined.
 */
describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("module loads without DOM globals", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
    expect(typeof mod.Runner).toBe("function");
    expect(typeof mod.defineTransition).toBe("function");
  });

  it("transitions are plain-data and safe to read in Node", async () => {
    const { dissolve, crossZoom, pageCurl } = await import("../index.js");
    expect(dissolve.name).toBe("dissolve");
    expect(typeof dissolve.shader.glsl).toBe("string");
    expect(dissolve.defaults).toBeDefined();
    expect(crossZoom.name).toBe("cross-zoom");
    expect(pageCurl.mesh).toBeDefined();
  });

  it("defineTransition is pure and runs in Node", async () => {
    const { defineTransition } = await import("../index.js");
    const t = defineTransition({
      name: "test/passthrough",
      glsl: "vec4 transition(vec2 uv) { return mix(getFromColor(uv), getToColor(uv), uProgress); }",
      defaults: { strength: 1 },
    });
    expect(t.name).toBe("test/passthrough");
    expect(t.defaults.strength).toBe(1);
    expect(t.shader.glsl).toContain("transition");
  });
});
