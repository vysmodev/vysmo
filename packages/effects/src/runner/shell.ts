/**
 * Fragment-shader shell injected around every effect's GLSL body. Declares
 * the standard uniforms + helper samplers, then appends the author body,
 * then calls `effect(vUv)` and writes to fragColor.
 *
 * Authors write just:  vec4 effect(vec2 uv) { ... }
 */
export const FRAGMENT_SHELL_HEAD = `#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform sampler2D uPrevious;
uniform vec2 uResolution;
uniform int uPass;
uniform int uPassCount;
in vec2 vUv;
out vec4 fragColor;

vec4 getSource(vec2 uv) { return texture(uSource, uv); }
vec4 getPrevious(vec2 uv) { return texture(uPrevious, uv); }

`;

export const FRAGMENT_SHELL_TAIL = `
void main() {
  fragColor = effect(vUv);
}
`;

export function wrapFragmentShader(userBody: string): string {
  return FRAGMENT_SHELL_HEAD + userBody + FRAGMENT_SHELL_TAIL;
}
