import { defineTransition } from "./define.js";

/**
 * Radial dot-grid reveal: every cell of an N×N grid contains a dot that
 * grows to cover its cell, with cells near the center revealing first.
 * Stylized but kept premium by softening the dot edge with smoothstep
 * and bounding maxDotRadius so each dot fully covers its cell at the
 * end (no leftover background between dots).
 */
export const polkaDotsCurtain = defineTransition({
  name: "polka-dots-curtain",
  defaults: {
    dots: 15,
    center: [0.5, 0.5],
    softness: 0.05,
  },
  glsl: `
uniform float uDots;
uniform vec2 uCenter;
uniform float uSoftness;

vec4 transition(vec2 uv) {
  vec2 cellPos = fract(uv * uDots);
  float dotDist = distance(cellPos, vec2(0.5));
  float distToCenter = distance(uv, uCenter);

  // Per-cell ignition time: cells near uCenter reveal first.
  float cellRevealTime = distToCenter / 1.4142136;
  float window = 0.6;
  float start = cellRevealTime * (1.0 - window);
  float localP = clamp((uProgress - start) / max(window, 0.0001), 0.0, 1.0);

  // Dot radius grows from -softness (off) to maxDotRadius+softness (covers
  // cell corners cleanly). 0.85 > sqrt(2)/2 so corners are guaranteed inside.
  float maxDotRadius = 0.85;
  float radius = localP * (maxDotRadius + 2.0 * uSoftness) - uSoftness;

  float w = 1.0 - smoothstep(radius - uSoftness, radius + uSoftness, dotDist);

  return mix(getFromColor(uv), getToColor(uv), w);
}
`,
});
