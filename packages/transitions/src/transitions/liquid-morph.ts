import { defineTransition } from "./define.js";

export const liquidMorph = defineTransition({
  name: "liquid-morph",
  defaults: {
    scale: 3,
    strength: 0.1,
    flow: 3,
  },
  glsl: `
uniform float uScale;
uniform float uStrength;
uniform float uFlow;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Evolving 2D flow field: noise shifts over progress so the distortion
// pattern moves, not just scales.
vec2 flow(vec2 p, float t) {
  float nx = valueNoise(p + vec2(t, 0.0));
  float ny = valueNoise(p + vec2(0.0, t) + vec2(13.7, 7.2));
  return vec2(nx, ny) - 0.5;
}

vec4 transition(vec2 uv) {
  // Envelope zeroes at endpoints, peaks mid-transition.
  float env = 4.0 * uProgress * (1.0 - uProgress);
  vec2 offset = flow(uv * uScale, uProgress * uFlow) * uStrength * env;

  vec2 fromUv = clamp(uv + offset, 0.0, 1.0);
  vec2 toUv = clamp(uv - offset, 0.0, 1.0);

  float mixW = smoothstep(0.3, 0.7, uProgress);
  return mix(getFromColor(fromUv), getToColor(toUv), mixW);
}
`,
});
