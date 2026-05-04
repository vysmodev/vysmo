import { describe, expect, it, beforeEach } from "vitest";
import { buildProgram, paramKeyToUniformName, setUniform } from "../index.js";

describe("paramKeyToUniformName", () => {
  it("prefixes with u and capitalises first letter", () => {
    expect(paramKeyToUniformName("softness")).toBe("uSoftness");
    expect(paramKeyToUniformName("radius")).toBe("uRadius");
  });

  it("preserves interior camelCase", () => {
    expect(paramKeyToUniformName("tileCount")).toBe("uTileCount");
    expect(paramKeyToUniformName("maxOffsetPx")).toBe("uMaxOffsetPx");
  });

  it("handles single-letter keys", () => {
    expect(paramKeyToUniformName("x")).toBe("uX");
  });
});

describe("setUniform", () => {
  let canvas: HTMLCanvasElement;
  let gl: WebGL2RenderingContext;
  let program: WebGLProgram;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 4;
    gl = canvas.getContext("webgl2")!;
    const frag = `#version 300 es
      precision highp float;
      uniform float uScalar;
      uniform bool uFlag;
      uniform vec2 uVec2;
      uniform vec3 uVec3;
      uniform vec4 uVec4;
      out vec4 fragColor;
      void main() {
        // Reference every uniform so none are optimised away.
        float s = uScalar + (uFlag ? 1.0 : 0.0) + uVec2.x + uVec3.x + uVec4.x;
        fragColor = vec4(s, 0.0, 0.0, 1.0);
      }
    `;
    program = buildProgram(gl, frag);
    gl.useProgram(program);
  });

  it("uploads a float scalar", () => {
    const loc = gl.getUniformLocation(program, "uScalar")!;
    setUniform(gl, loc, 0.42);
    expect(gl.getUniform(program, loc)).toBeCloseTo(0.42, 5);
  });

  it("uploads a boolean as int 1/0", () => {
    const loc = gl.getUniformLocation(program, "uFlag")!;
    setUniform(gl, loc, true);
    expect(gl.getUniform(program, loc)).toBe(true);
    setUniform(gl, loc, false);
    expect(gl.getUniform(program, loc)).toBe(false);
  });

  it("uploads a vec2", () => {
    const loc = gl.getUniformLocation(program, "uVec2")!;
    setUniform(gl, loc, [0.1, 0.2]);
    const result = gl.getUniform(program, loc) as Float32Array;
    expect(result[0]).toBeCloseTo(0.1, 5);
    expect(result[1]).toBeCloseTo(0.2, 5);
  });

  it("uploads a vec3", () => {
    const loc = gl.getUniformLocation(program, "uVec3")!;
    setUniform(gl, loc, [1, 2, 3]);
    const result = gl.getUniform(program, loc) as Float32Array;
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(2);
    expect(result[2]).toBe(3);
  });

  it("uploads a vec4", () => {
    const loc = gl.getUniformLocation(program, "uVec4")!;
    setUniform(gl, loc, [0.1, 0.2, 0.3, 0.4]);
    const result = gl.getUniform(program, loc) as Float32Array;
    expect(result[0]).toBeCloseTo(0.1, 5);
    expect(result[1]).toBeCloseTo(0.2, 5);
    expect(result[2]).toBeCloseTo(0.3, 5);
    expect(result[3]).toBeCloseTo(0.4, 5);
  });
});
