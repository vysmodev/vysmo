import { defineTransition } from "./define.js";

export const warpZoom = defineTransition({
  name: "warp-zoom",
  defaults: {
    center: [0.5, 0.5],
    strength: 1.0,
    rotation: 1.0,
    blur: 0.02,
  },
  glsl: `
uniform vec2 uCenter;
uniform float uStrength;
uniform float uRotation;
uniform float uBlur;

vec2 warpAround(vec2 uv, vec2 center, float angle, float scale) {
  vec2 d = uv - center;
  float c = cos(angle);
  float s = sin(angle);
  mat2 rot = mat2(c, -s, s, c);
  return rot * d / scale + center;
}

vec4 sampleFromBlurred(vec2 uv, float amount) {
  if (amount < 0.001) return getFromColor(clamp(uv, 0.0, 1.0));
  const int N = 5;
  vec4 sum = vec4(0.0);
  for (int i = 0; i < N; i++) {
    float t = (float(i) - 2.0) / 4.0;
    vec2 offset = (uv - 0.5) * amount * t;
    sum += getFromColor(clamp(uv + offset, 0.0, 1.0));
  }
  return sum / float(N);
}

vec4 sampleToBlurred(vec2 uv, float amount) {
  if (amount < 0.001) return getToColor(clamp(uv, 0.0, 1.0));
  const int N = 5;
  vec4 sum = vec4(0.0);
  for (int i = 0; i < N; i++) {
    float t = (float(i) - 2.0) / 4.0;
    vec2 offset = (uv - 0.5) * amount * t;
    sum += getToColor(clamp(uv + offset, 0.0, 1.0));
  }
  return sum / float(N);
}

vec4 transition(vec2 uv) {
  // From: rotates clockwise + zooms outward (gets bigger, we see less of it)
  float fromAngle = uProgress * uRotation;
  float fromScale = 1.0 + uProgress * uStrength;

  // To: rotates counter-clockwise + zooms in (starts big, settles to native)
  float toAngle = -(1.0 - uProgress) * uRotation;
  float toScale = 1.0 + (1.0 - uProgress) * uStrength;

  vec2 fromUv = warpAround(uv, uCenter, fromAngle, fromScale);
  vec2 toUv = warpAround(uv, uCenter, toAngle, toScale);

  // Velocity-scaled radial blur
  float motion = 4.0 * uProgress * (1.0 - uProgress) * uBlur;
  vec4 fromColor = sampleFromBlurred(fromUv, motion);
  vec4 toColor = sampleToBlurred(toUv, motion);

  float mixW = smoothstep(0.3, 0.7, uProgress);
  return mix(fromColor, toColor, mixW);
}
`,
});
