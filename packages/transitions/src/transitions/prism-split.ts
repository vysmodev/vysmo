import { defineTransition } from "./define.js";

/**
 * Directional RGB chromatic split. Like looking through a prism along a
 * fixed axis: red and blue channels separate along `direction` while
 * green stays put, then recombine on the to-image. Distinct from
 * chromatic-pulse (which is radial outward from center).
 */
export const prismSplit = defineTransition({
  name: "prism-split",
  defaults: {
    direction: [1, 0],
    intensity: 0.04,
    softness: 0.2,
  },
  glsl: `
uniform vec2 uDirection;
uniform float uIntensity;
uniform float uSoftness;

vec4 transition(vec2 uv) {
  vec2 d = normalize(uDirection);
  float env = 4.0 * uProgress * (1.0 - uProgress);
  // Cap the per-channel split. Past ~0.07 the R/B samples come from
  // unrelated parts of the scene and edge clamping turns the offsets into
  // colored stripes — no longer reads as chromatic aberration. Hard-clamp
  // here so the transition is reliable regardless of caller input.
  float split = env * min(uIntensity, 0.07);

  vec2 offR = clamp(uv + d * split, 0.0, 1.0);
  vec2 offB = clamp(uv - d * split, 0.0, 1.0);

  vec3 fromRGB = vec3(
    getFromColor(offR).r,
    getFromColor(uv).g,
    getFromColor(offB).b
  );
  vec3 toRGB = vec3(
    getToColor(offR).r,
    getToColor(uv).g,
    getToColor(offB).b
  );

  // Crossfade width controlled by softness: 0.7 → fade across middle 70%
  // of progress (range [0.15, 0.85]); higher = gentler, lower = punchier.
  float fadeHalf = clamp(uSoftness, 0.05, 0.95) * 0.5;
  float mixW = smoothstep(0.5 - fadeHalf, 0.5 + fadeHalf, uProgress);
  vec3 rgb = mix(fromRGB, toRGB, mixW);
  return vec4(rgb, 1.0);
}
`,
});
