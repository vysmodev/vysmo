export {
  FULLSCREEN_VERTEX_SHADER as VERTEX_SHADER,
  compileShader,
  linkProgram,
  buildProgram,
  paramKeyToUniformName,
} from "@vysmo/gl-core";

export const MESH_VERTEX_SHELL_HEAD = `#version 300 es
precision highp float;
uniform float uProgress;
uniform vec2 uResolution;
uniform int uPass;
uniform int uPassCount;
uniform int uInstances;
in vec2 aPosition;
in vec2 aUv;
in float aOffset;
in vec2 aCentroid;
in vec3 aBary;
in float aRandom;
out vec2 vUv;

`;

export const FRAGMENT_SHELL_HEAD = `#version 300 es
precision highp float;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform sampler2D uDisplacement;
uniform sampler2D uEnvironment;
uniform sampler2D uPrevious;
uniform float uProgress;
uniform vec2 uResolution;
uniform int uPass;
uniform int uPassCount;
uniform int uInstances;
in vec2 vUv;
out vec4 fragColor;

vec4 getFromColor(vec2 uv) { return texture(uFrom, uv); }
vec4 getToColor(vec2 uv) { return texture(uTo, uv); }
vec4 getDisplacement(vec2 uv) { return texture(uDisplacement, uv); }
vec4 getEnvironment(vec2 uv) { return texture(uEnvironment, uv); }
vec4 getPrevious(vec2 uv) { return texture(uPrevious, uv); }

// Reflect out-of-range UVs back into [0,1] instead of clamping to edge.
// Use this when a shader displaces UVs (warp, flow, etc.) and you want
// the displaced regions to sample real interior content rather than
// streaked edge texels.
vec2 mirrorUv(vec2 uv) {
  return abs(mod(uv + 1.0, 2.0) - 1.0);
}

`;

export const FRAGMENT_SHELL_TAIL = `
void main() {
  fragColor = transition(vUv);
}
`;

export function wrapFragmentShader(userBody: string): string {
  return FRAGMENT_SHELL_HEAD + userBody + FRAGMENT_SHELL_TAIL;
}

export function wrapMeshVertexShader(userBody: string): string {
  return MESH_VERTEX_SHELL_HEAD + userBody;
}
