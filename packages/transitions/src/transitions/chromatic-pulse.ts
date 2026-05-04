import { defineTransition } from "./define.js";

export const chromaticPulse = defineTransition({
  name: "chromatic-pulse",
  defaults: {
    intensity: 0.6,
  },
  glsl: `
uniform float uIntensity;

vec4 transition(vec2 uv) {
  // Envelope peaks at midpoint, zero at endpoints.
  float env = 4.0 * uProgress * (1.0 - uProgress);
  float aberration = env * uIntensity * 0.03;

  // Radial direction from center → outward chromatic shift feels lens-like.
  vec2 toCenter = uv - 0.5;
  float r = length(toCenter);
  vec2 dir = r > 0.0001 ? toCenter / r : vec2(1.0, 0.0);

  vec2 offR = clamp(uv + dir * aberration, 0.0, 1.0);
  vec2 offG = uv;
  vec2 offB = clamp(uv - dir * aberration, 0.0, 1.0);

  vec3 fromRGB = vec3(
    getFromColor(offR).r,
    getFromColor(offG).g,
    getFromColor(offB).b
  );
  vec3 toRGB = vec3(
    getToColor(offR).r,
    getToColor(offG).g,
    getToColor(offB).b
  );

  float mixW = smoothstep(0.3, 0.7, uProgress);
  return vec4(mix(fromRGB, toRGB, mixW), 1.0);
}
`,
});
