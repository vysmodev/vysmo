import { defineTransition } from "./define.js";

/**
 * Directional linear blur. 32 samples along a configurable axis, avoiding
 * the 2D grid artifacts that box-blur kernels produce at high displacement.
 * Blur amount peaks at the midpoint (triangular envelope), linear crossfade
 * across the full progress range.
 */
export const linearBlur = defineTransition({
  name: "linear-blur",
  defaults: {
    direction: [1, 0],
    intensity: 0.1,
  },
  glsl: `
uniform vec2 uDirection;
uniform float uIntensity;

const int SAMPLES = 32;

vec4 transition(vec2 uv) {
  vec2 d = normalize(uDirection);
  // Triangular envelope: zero at endpoints, peaks at p=0.5.
  float disp = uIntensity * (0.5 - distance(0.5, uProgress)) * 2.0;

  vec4 c1 = vec4(0.0);
  vec4 c2 = vec4(0.0);
  for (int i = 0; i < SAMPLES; i++) {
    float t = (float(i) - float(SAMPLES - 1) * 0.5) / float(SAMPLES - 1);
    vec2 off = d * disp * t;
    c1 += getFromColor(uv + off);
    c2 += getToColor(uv + off);
  }
  c1 /= float(SAMPLES);
  c2 /= float(SAMPLES);

  return mix(c1, c2, uProgress);
}
`,
});
