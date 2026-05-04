import { defineTransition } from "./define.js";

/**
 * Inspired by chungeric's codepen MWQoLqV. The reveal pattern is a
 * `mod()` modulation of an oblique sine field — which creates
 * curved stripes following the iso-contours of `cos(x) + 0.8*sin(y)`.
 * A moving threshold (biased by uv.x for a left-to-right sweep) flips
 * stripes from from→to one by one. The original used a hard `step()`;
 * we soften with smoothstep to honor the no-hard-cuts rule while
 * keeping the curved-stripe character.
 */
export const waveStripes = defineTransition({
  name: "wave-stripes",
  defaults: {
    scale: 1.0,
    softness: 0.003,
  },
  glsl: `
uniform float uScale;
uniform float uSoftness;

vec4 transition(vec2 uv) {
  // Oblique sine field; mod creates stripes following its iso-contours.
  float field = cos(uv.x * uScale) + sin(uv.y * uScale) * 0.8;
  float stripe = mod(field, 0.05);

  // Threshold sweeps from above-max-stripe (0.05+) to below-zero, with
  // a uv.x bias so the reveal progresses left-to-right.
  float xBias = uv.x * 0.05;
  float threshold = (0.05 + 2.0 * uSoftness + xBias) * (1.0 - uProgress) - uSoftness;

  float d = smoothstep(threshold - uSoftness, threshold + uSoftness, stripe);

  return mix(getFromColor(uv), getToColor(uv), d);
}
`,
});
