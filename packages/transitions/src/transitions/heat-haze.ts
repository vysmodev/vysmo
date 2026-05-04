import { defineTransition } from "./define.js";

/**
 * Heat-haze shimmer: horizontal displacement driven by an animated noise
 * field that flows upward over progress, simulating the look-through-
 * hot-air effect. Both images receive the same displacement so they
 * blend through a shared shimmer at the midpoint. Displacement envelope
 * gates the effect to zero at endpoints.
 */
export const heatHaze = defineTransition({
  name: "heat-haze",
  defaults: {
    intensity: 0.04,
    frequency: 14,
    flow: 5.0,
  },
  glsl: `
uniform float uIntensity;
uniform float uFrequency;
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

vec4 transition(vec2 uv) {
  float env = 4.0 * uProgress * (1.0 - uProgress);

  // Horizontal column noise that drifts upward over progress (noise sampled
  // at uv.y - progress*flow → rising pattern). Vertical frequency lower so
  // bands are tall and column-like, matching real heat-haze.
  float n = valueNoise(vec2(uv.x * uFrequency, uv.y * uFrequency * 0.4 - uProgress * uFlow));
  float disp = (n - 0.5) * uIntensity * env;

  vec2 sampleUv = clamp(vec2(uv.x + disp, uv.y), 0.0, 1.0);

  return mix(getFromColor(sampleUv), getToColor(sampleUv), uProgress);
}
`,
});
