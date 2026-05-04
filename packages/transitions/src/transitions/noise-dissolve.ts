import { defineTransition } from "./define.js";

export const noiseDissolve = defineTransition({
  name: "noise-dissolve",
  defaults: {
    scale: 20,
    softness: 0.05,
  },
  glsl: `
uniform float uScale;
uniform float uSoftness;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Bilinearly-smoothed value noise.
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
  // Sample a noise field; each pixel gets a "transition time" in [0,1].
  float n = valueNoise(uv * uScale);

  // Threshold moves from just-below-0 to just-above-1, so the feather
  // is fully off the noise range at the endpoints.
  float threshold = uProgress * (1.0 + 2.0 * uSoftness) - uSoftness;
  float w = smoothstep(threshold - uSoftness, threshold + uSoftness, n);

  return mix(getToColor(uv), getFromColor(uv), w);
}
`,
});
