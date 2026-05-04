import { describe, expect, it } from "vitest";

/**
 * SSR safety: the module graph must load in Node without DOM globals,
 * because @vysmo/gl-core powers @vysmo/transitions and @vysmo/effects which
 * are loaded by SSR frameworks (Astro, Next, etc.) at build time.
 *
 * Anything that touches WebGL needs a live context — those code paths
 * aren't exercised here. This test only asserts that *importing* the
 * module + reading the pure-data exports + calling the string helpers
 * works without `window` / `WebGLTexture` / `HTMLImageElement` defined.
 */
describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("module loads without DOM globals", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
    expect(typeof mod.compileShader).toBe("function");
    expect(typeof mod.linkProgram).toBe("function");
    expect(typeof mod.buildProgram).toBe("function");
    expect(typeof mod.paramKeyToUniformName).toBe("function");
    expect(typeof mod.setUniform).toBe("function");
    expect(typeof mod.TextureCache).toBe("function");
    expect(typeof mod.FramebufferPool).toBe("function");
    expect(typeof mod.FULLSCREEN_VERTEX_SHADER).toBe("string");
  });

  it("FULLSCREEN_VERTEX_SHADER is a valid GLSL ES 3.0 shader source", async () => {
    const { FULLSCREEN_VERTEX_SHADER } = await import("../index.js");
    expect(FULLSCREEN_VERTEX_SHADER).toMatch(/^#version 300 es/);
    expect(FULLSCREEN_VERTEX_SHADER).toContain("gl_Position");
  });

  it("paramKeyToUniformName is pure and runs in Node", async () => {
    const { paramKeyToUniformName } = await import("../index.js");
    expect(paramKeyToUniformName("softness")).toBe("uSoftness");
    expect(paramKeyToUniformName("blurAmount")).toBe("uBlurAmount");
    expect(paramKeyToUniformName("x")).toBe("uX");
  });
});
