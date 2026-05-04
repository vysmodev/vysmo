import { defineTransition } from "./define.js";

export const crossZoom = defineTransition({
  name: "cross-zoom",
  defaults: {
    strength: 1.2,
    blur: 0.04,
  },
  glsl: `
uniform float uStrength;
uniform float uBlur;

vec2 zoomUv(vec2 uv, float scale) {
  return (uv - 0.5) / scale + 0.5;
}

vec4 sampleFromBlurred(vec2 uv, float amount) {
  if (amount < 0.001) return getFromColor(uv);
  const int N = 5;
  vec4 sum = vec4(0.0);
  for (int i = 0; i < N; i++) {
    float t = (float(i) - 2.0) / 4.0;
    vec2 offset = (uv - 0.5) * amount * t;
    sum += getFromColor(uv + offset);
  }
  return sum / float(N);
}

vec4 sampleToBlurred(vec2 uv, float amount) {
  if (amount < 0.001) return getToColor(uv);
  const int N = 5;
  vec4 sum = vec4(0.0);
  for (int i = 0; i < N; i++) {
    float t = (float(i) - 2.0) / 4.0;
    vec2 offset = (uv - 0.5) * amount * t;
    sum += getToColor(uv + offset);
  }
  return sum / float(N);
}

vec4 transition(vec2 uv) {
  float fromScale = 1.0 + uProgress * uStrength;
  float toScale = 1.0 + (1.0 - uProgress) * uStrength;

  vec2 fromUv = zoomUv(uv, fromScale);
  vec2 toUv = zoomUv(uv, toScale);

  // Velocity-scaled radial blur (peak at midpoint, zero at endpoints).
  float motion = 4.0 * uProgress * (1.0 - uProgress) * uBlur;

  vec4 fromColor = sampleFromBlurred(fromUv, motion);
  vec4 toColor = sampleToBlurred(toUv, motion);

  // Crossfade concentrated in the middle 40% of the transition.
  float mixW = smoothstep(0.3, 0.7, uProgress);
  return mix(fromColor, toColor, mixW);
}
`,
});
