import { defineTransition } from "./define.js";

/**
 * Geometric shape reveal from a center point. `sides` controls the shape:
 * 3 = triangle, 4 = diamond (with rotation 45°), 5 = pentagon, 6 = hexagon,
 * 8 = octagon, 12 = dodecagon, 20+ approaches a circle.
 */
export const shapeReveal = defineTransition({
  name: "shape-reveal",
  defaults: {
    center: [0.5, 0.5],
    sides: 6,
    rotation: 0,
    softness: 0.05,
  },
  glsl: `
uniform vec2 uCenter;
uniform float uSides;
uniform float uRotation;
uniform float uSoftness;

const float TWO_PI = 6.2831853;

vec4 transition(vec2 uv) {
  // Work in screen pixel space so the polygon is geometrically regular
  // regardless of canvas aspect ratio.
  vec2 pixel = uv * uResolution;
  vec2 pixelCenter = uCenter * uResolution;
  vec2 delta = pixel - pixelCenter;

  float slice = TWO_PI / max(uSides, 3.0);
  float halfSlice = slice * 0.5;

  // Fold the pixel's angle into one polygon sector; distance to the sector's
  // edge midpoint direction gives the regular-polygon distance from center.
  float angle = atan(delta.y, delta.x) - uRotation;
  float folded = mod(angle + halfSlice, slice) - halfSlice;

  // Normalize so canvas corners map to ≤ 1 (guaranteed by the max-corner
  // division, since cos(folded) ≤ 1).
  float maxDist = max(
    max(length(pixelCenter), length(pixelCenter - vec2(uResolution.x, 0.0))),
    max(length(pixelCenter - vec2(0.0, uResolution.y)), length(pixelCenter - uResolution))
  );
  float dist = length(delta) * cos(folded) / max(maxDist, 0.0001);

  float radius = uProgress * (1.0 + 2.0 * uSoftness) - uSoftness;
  float w = smoothstep(radius - uSoftness, radius + uSoftness, dist);

  return mix(getToColor(uv), getFromColor(uv), w);
}
`,
});
