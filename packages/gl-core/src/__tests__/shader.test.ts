import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  FULLSCREEN_VERTEX_SHADER,
  buildProgram,
  compileShader,
  linkProgram,
} from "../index.js";

let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;

beforeEach(() => {
  canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  gl = canvas.getContext("webgl2")!;
  if (!gl) throw new Error("WebGL2 unavailable in test browser");
});

afterEach(() => {
  const ext = gl.getExtension("WEBGL_lose_context");
  ext?.loseContext();
});

const TRIVIAL_FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
void main() { fragColor = vec4(1.0, 0.0, 0.0, 1.0); }
`;

describe("compileShader", () => {
  it("compiles valid vertex shader", () => {
    const shader = compileShader(gl, gl.VERTEX_SHADER, FULLSCREEN_VERTEX_SHADER);
    expect(shader).toBeInstanceOf(WebGLShader);
    gl.deleteShader(shader);
  });

  it("compiles valid fragment shader", () => {
    const shader = compileShader(gl, gl.FRAGMENT_SHADER, TRIVIAL_FRAG);
    expect(shader).toBeInstanceOf(WebGLShader);
    gl.deleteShader(shader);
  });

  it("throws with info log on invalid GLSL", () => {
    const bad = "#version 300 es\nthis is not glsl;";
    expect(() => compileShader(gl, gl.FRAGMENT_SHADER, bad)).toThrow(
      /Shader compile failed/,
    );
  });

  it("includes the offending source in error message", () => {
    const bad = "#version 300 es\nvoid main() { nonexistentFunction(); }";
    try {
      compileShader(gl, gl.FRAGMENT_SHADER, bad);
      throw new Error("compile should have thrown");
    } catch (err) {
      expect(String(err)).toContain("nonexistentFunction");
    }
  });
});

describe("linkProgram", () => {
  it("links valid vertex + fragment", () => {
    const vs = compileShader(gl, gl.VERTEX_SHADER, FULLSCREEN_VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, TRIVIAL_FRAG);
    const program = linkProgram(gl, vs, fs);
    expect(program).toBeInstanceOf(WebGLProgram);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteProgram(program);
  });

  it("throws on incompatible varyings", () => {
    const vs = compileShader(
      gl,
      gl.VERTEX_SHADER,
      `#version 300 es
       out vec3 vMissing;
       void main() { vMissing = vec3(0); gl_Position = vec4(0,0,0,1); }`,
    );
    const fs = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      `#version 300 es
       precision highp float;
       in vec4 vMissing; // type mismatch: vec3 in VS, vec4 in FS
       out vec4 fragColor;
       void main() { fragColor = vMissing; }`,
    );
    expect(() => linkProgram(gl, vs, fs)).toThrow(/Program link failed/);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  });
});

describe("buildProgram", () => {
  it("defaults to the fullscreen vertex shader when omitted", () => {
    const program = buildProgram(gl, TRIVIAL_FRAG);
    expect(program).toBeInstanceOf(WebGLProgram);
    gl.deleteProgram(program);
  });

  it("accepts a custom vertex shader", () => {
    const customVs = `#version 300 es
      void main() { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); }`;
    const program = buildProgram(gl, TRIVIAL_FRAG, customVs);
    expect(program).toBeInstanceOf(WebGLProgram);
    gl.deleteProgram(program);
  });

  it("cleans up shaders after linking (program still usable)", () => {
    const program = buildProgram(gl, TRIVIAL_FRAG);
    gl.useProgram(program);
    const err = gl.getError();
    expect(err).toBe(gl.NO_ERROR);
    gl.deleteProgram(program);
  });
});

describe("FULLSCREEN_VERTEX_SHADER", () => {
  it("declares vUv varying", () => {
    expect(FULLSCREEN_VERTEX_SHADER).toMatch(/out vec2 vUv/);
  });

  it("is valid WebGL2 (#version 300 es)", () => {
    expect(FULLSCREEN_VERTEX_SHADER).toMatch(/#version 300 es/);
  });

  it("renders a fullscreen triangle (clear-then-draw covers the viewport)", () => {
    const program = buildProgram(gl, TRIVIAL_FRAG);
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // Sample the centre pixel; the trivial shader writes pure red.
    const pixels = new Uint8Array(4);
    gl.readPixels(
      canvas.width / 2,
      canvas.height / 2,
      1,
      1,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels,
    );
    expect(pixels[0]).toBe(255);
    expect(pixels[1]).toBe(0);
    expect(pixels[2]).toBe(0);
    expect(pixels[3]).toBe(255);
    gl.deleteProgram(program);
    gl.deleteVertexArray(vao);
  });
});
