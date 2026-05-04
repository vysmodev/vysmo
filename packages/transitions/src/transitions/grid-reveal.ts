import { defineTransition } from "./define.js";

/**
 * Pattern values:
 *  0 = sequential (left-to-right, top-to-bottom)
 *  1 = radial (from center outward)
 *  2 = pseudo-random
 */
export const gridReveal = defineTransition({
  name: "grid-reveal",
  defaults: {
    count: 8,
    stagger: 0.7,
    pattern: 1,
  },
  glsl: `
uniform float uCount;
uniform float uStagger;
uniform float uPattern;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 transition(vec2 uv) {
  vec2 cell = floor(uv * uCount);

  float priority;
  if (uPattern < 0.5) {
    // Sequential left-to-right, top-to-bottom
    priority = (cell.y * uCount + cell.x) / (uCount * uCount);
  } else if (uPattern < 1.5) {
    // Radial from center of the grid
    vec2 center = vec2(uCount * 0.5 - 0.5);
    float dist = length(cell - center);
    float maxDist = length(center);
    priority = dist / max(maxDist, 0.0001);
  } else {
    // Pseudo-random per cell
    priority = hash21(cell);
  }

  float start = priority * uStagger;
  float window = max(0.0001, 1.0 - uStagger);
  float localProgress = clamp((uProgress - start) / window, 0.0, 1.0);

  return mix(getFromColor(uv), getToColor(uv), localProgress);
}
`,
});
