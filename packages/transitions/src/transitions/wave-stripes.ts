import { defineTransition } from "./define.js";

/**
 * Inspired by chungeric's codepen MWQoLqV. The reveal pattern is a
 * `mod()` modulation of an oblique sine field — which creates curved
 * stripes following the iso-contours of `cos(x) + 0.8*sin(y)`. A moving
 * threshold biased along `direction` flips stripes from from→to one by
 * one. The original used a hard `step()`; we soften with smoothstep to
 * honor the no-hard-cuts rule while keeping the curved-stripe character.
 *
 * `scale` and `softness` are baked-in — they don't expose meaningful
 * tuning at this scale (single sine field, single stripe period). Only
 * `direction` is user-tunable.
 */
export const waveStripes = defineTransition({
  name: "wave-stripes",
  defaults: {
    direction: [1, 0],
  },
  glsl: `
uniform vec2 uDirection;

// Snap to nearest axis-aligned unit. The sweep math projects uv onto -d
// for the threshold bias; diagonals give an out-of-range projection that
// breaks endpoint correctness. Enforced in-shader so the UI's axis-only
// picker matches.
vec2 snapAxis(vec2 v) {
  vec2 dn = normalize(v);
  return abs(dn.x) > abs(dn.y) ? vec2(sign(dn.x), 0.0) : vec2(0.0, sign(dn.y));
}

vec4 transition(vec2 uv) {
  const float SCALE = 1.0;
  const float SOFTNESS = 0.003;

  vec2 d = snapAxis(uDirection);

  // Oblique sine field; mod creates stripes following its iso-contours.
  float field = cos(uv.x * SCALE) + sin(uv.y * SCALE) * 0.8;
  float stripe = mod(field, 0.05);

  // Threshold sweeps from above-max-stripe to below-zero. Pixels flip
  // earliest where threshold-bias is lowest, so the reveal travels in
  // the direction +d. d=[1,0] (default) → bias = uv.x*0.05 → reveal
  // moves left-to-right, matching the original hardcoded behavior.
  float proj = dot(uv - vec2(0.5), d) + 0.5;
  float bias = proj * 0.05;
  float threshold = (0.05 + 2.0 * SOFTNESS + bias) * (1.0 - uProgress) - SOFTNESS;

  float dMix = smoothstep(threshold - SOFTNESS, threshold + SOFTNESS, stripe);

  return mix(getFromColor(uv), getToColor(uv), dMix);
}
`,
});
