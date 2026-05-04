import type { UniformValue } from "./types.js";

/**
 * Maps a camelCase parameter key (`softness`) to its uniform name
 * (`uSoftness`). Authors declare `defaults: { softness: 0.1 }` and the
 * runner finds the corresponding `uniform float uSoftness` in the shader.
 */
export function paramKeyToUniformName(key: string): string {
  return "u" + key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Type-dispatched uniform upload. Handles scalars (float/bool) and 2/3/4-
 * component vectors. Matrix uniforms and integer vectors are out of scope
 * — libraries that need them can extend.
 */
export function setUniform(
  gl: WebGL2RenderingContext,
  loc: WebGLUniformLocation,
  value: UniformValue,
): void {
  if (typeof value === "number") {
    gl.uniform1f(loc, value);
    return;
  }
  if (typeof value === "boolean") {
    gl.uniform1i(loc, value ? 1 : 0);
    return;
  }
  if (value.length === 2) gl.uniform2f(loc, value[0], value[1]);
  else if (value.length === 3) gl.uniform3f(loc, value[0], value[1], value[2]);
  else if (value.length === 4)
    gl.uniform4f(loc, value[0], value[1], value[2], value[3]);
}
