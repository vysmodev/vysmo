import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Runner, blur, defineEffect } from "../index.js";

const SIZE = 16;

let canvas: HTMLCanvasElement;
let runner: Runner;

beforeEach(() => {
  canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  runner = new Runner({ canvas });
});

afterEach(() => {
  runner.dispose();
});

function makeSolid(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "rgb(80, 160, 240)";
  ctx.fillRect(0, 0, SIZE, SIZE);
  return c;
}

describe("Runner contract", () => {
  it("throws a descriptive error if the shader fails to compile", () => {
    const broken = defineEffect({
      name: "broken",
      defaults: {},
      glsl: "vec4 effect(vec2 uv) { this is not glsl }",
    });
    expect(() => runner.render(broken, { source: makeSolid() })).toThrow(
      /Effect "broken" failed to compile/,
    );
  });

  it("throws if rendered after dispose", () => {
    runner.dispose();
    expect(() => runner.render(blur, { source: makeSolid() })).toThrow(
      /Runner has been disposed/,
    );
  });

  it("tolerates missing optional params (uses effect defaults)", () => {
    expect(() => runner.render(blur, { source: makeSolid() })).not.toThrow();
  });

  it("tolerates partial params (merges over defaults)", () => {
    expect(() =>
      runner.render(blur, { source: makeSolid(), params: { radius: 4 } }),
    ).not.toThrow();
  });

  it("tolerates extreme radius values (no NaN propagation)", () => {
    runner.render(blur, { source: makeSolid(), params: { radius: 9999 } });
    const pixels = new Uint8Array(4);
    runner.gl.readPixels(
      SIZE / 2,
      SIZE / 2,
      1,
      1,
      runner.gl.RGBA,
      runner.gl.UNSIGNED_BYTE,
      pixels,
    );
    // Source is solid rgb(80,160,240); blur of a solid should still be ≈ that.
    expect(pixels[0]).toBeGreaterThan(60);
    expect(pixels[0]).toBeLessThan(100);
    expect(pixels[1]).toBeGreaterThan(140);
    expect(pixels[1]).toBeLessThan(180);
    expect(pixels[2]).toBeGreaterThan(220);
    expect(pixels[3]).toBe(255);
  });

  it("accepts canvas, image, and WebGLTexture sources", () => {
    const canvasSrc = makeSolid();
    expect(() => runner.render(blur, { source: canvasSrc })).not.toThrow();

    const tex = runner.gl.createTexture()!;
    runner.gl.bindTexture(runner.gl.TEXTURE_2D, tex);
    runner.gl.texImage2D(
      runner.gl.TEXTURE_2D,
      0,
      runner.gl.RGBA,
      1,
      1,
      0,
      runner.gl.RGBA,
      runner.gl.UNSIGNED_BYTE,
      new Uint8Array([80, 160, 240, 255]),
    );
    runner.gl.texParameteri(
      runner.gl.TEXTURE_2D,
      runner.gl.TEXTURE_MIN_FILTER,
      runner.gl.NEAREST,
    );
    runner.gl.texParameteri(
      runner.gl.TEXTURE_2D,
      runner.gl.TEXTURE_MAG_FILTER,
      runner.gl.NEAREST,
    );
    expect(() => runner.render(blur, { source: tex })).not.toThrow();
    runner.gl.deleteTexture(tex);
  });
});

describe("defineEffect contract", () => {
  it("preserves name, defaults, passes, hdr", () => {
    const e = defineEffect({
      name: "test",
      defaults: { x: 1, y: [0, 0] as const },
      passes: 3,
      hdr: true,
      glsl: "vec4 effect(vec2 uv) { return getSource(uv); }",
    });
    expect(e.name).toBe("test");
    expect(e.defaults.x).toBe(1);
    expect(e.defaults.y).toEqual([0, 0]);
    expect(e.passes).toBe(3);
    expect(e.hdr).toBe(true);
  });

  it("omits passes/hdr when not specified", () => {
    const e = defineEffect({
      name: "minimal",
      defaults: {},
      glsl: "vec4 effect(vec2 uv) { return getSource(uv); }",
    });
    expect(e.passes).toBeUndefined();
    expect(e.hdr).toBeUndefined();
  });
});
