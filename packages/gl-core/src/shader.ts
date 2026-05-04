/**
 * Fullscreen-triangle vertex shader. Draws a single triangle covering the
 * viewport; `gl_VertexID ∈ {0,1,2}` derives clip-space positions without
 * any attribute buffers. Used by both transitions and effects for their
 * fragment-only passes.
 */
export const FULLSCREEN_VERTEX_SHADER = `#version 300 es
out vec2 vUv;
void main() {
  vec2 pos = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = pos;
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}
`;

/**
 * Compile a single GLSL shader stage. Throws an `Error` with the GL info
 * log appended (and the source in the error message) when compilation
 * fails — much more useful than the silent failure mode you get from
 * raw WebGL.
 *
 * @param gl     A WebGL2 context.
 * @param type   `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`.
 * @param source GLSL source code.
 * @throws Error if `gl.createShader` returns null or compilation fails.
 */
export function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("gl.createShader returned null");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "(no log)";
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed:\n${log}\n---\n${source}`);
  }
  return shader;
}

/**
 * Link a vertex + fragment pair into a `WebGLProgram`. Caller still owns
 * the input shaders — `buildProgram()` deletes them for you, this lower-
 * level call does not.
 *
 * @throws Error if `gl.createProgram` returns null or linking fails.
 */
export function linkProgram(
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("gl.createProgram returned null");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "(no log)";
    gl.deleteProgram(program);
    throw new Error(`Program link failed:\n${log}`);
  }
  return program;
}

/**
 * One-shot: compile a fragment + vertex shader, link them, delete the
 * intermediate shader objects, return the linked program. The vertex
 * shader defaults to `FULLSCREEN_VERTEX_SHADER`, which is what you want
 * for filter / transition passes that draw a single screen-covering
 * triangle.
 *
 * @throws Error if compilation or linking fails (see `compileShader` /
 *   `linkProgram` for details).
 */
export function buildProgram(
  gl: WebGL2RenderingContext,
  fragmentSource: string,
  vertexSource: string = FULLSCREEN_VERTEX_SHADER,
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = linkProgram(gl, vs, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}
