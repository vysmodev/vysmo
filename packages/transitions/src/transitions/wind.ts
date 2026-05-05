import { defineTransition } from "./define.js";

/**
 * Ported from gl-transitions' wind. Per-row random offset creates a ragged,
 * wind-blown edge sweeping across the frame.
 */
export const wind = defineTransition({
  name: "wind",
  defaults: {
    size: 0.2,
    direction: [1, 0],
  },
  glsl: `
uniform float uSize;
uniform vec2 uDirection;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 transition(vec2 uv) {
  vec2 d = normalize(uDirection);
  // Perpendicular coordinate: one random value per "row" along the direction.
  vec2 perp = vec2(-d.y, d.x);
  float rowCoord = dot(uv, perp);
  float r = hash(vec2(rowCoord, 0.0));

  // Projected position along direction, normalized to [0, 1] regardless
  // of direction (axis-aligned or diagonal). See paint-bleed.ts.
  float maxProj = max((abs(d.x) + abs(d.y)) * 0.5, 0.0001);
  float projected = 0.5 + dot(uv - 0.5, -d) / (2.0 * maxProj);

  // size is a fractional ratio in [0, 1]: how much per-row jitter the
  // wavefront has. Values >1 break endpoint correctness because the
  // smoothstep range no longer covers the projected coordinate at p=0 or
  // p=1, leaving per-row stripes visible. Clamp here so the transition
  // is reliable regardless of caller input.
  float size = clamp(uSize, 0.0, 1.0);

  // Wavefront sweeps from 0 to 1 + size. Per-row random shift gives ragged edge.
  // Note: smoothstep(edge0, edge1, x) is undefined when edge0 > edge1, so
  // express the inverted form as 1 - smoothstep(low, high, x) instead.
  float arg = projected * (1.0 - size) + size * r - uProgress * (1.0 + size);
  float m = 1.0 - smoothstep(-size, 0.0, arg);
  return mix(getFromColor(uv), getToColor(uv), m);
}
`,
});
