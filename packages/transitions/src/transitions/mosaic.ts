import { defineTransition } from "./define.js";

/**
 * Tile-shuffle reveal: the frame is partitioned into cells that transition
 * on staggered start times. Each tile picks a random direction; its
 * `from` sample slides OUT in that direction while its `to` sample
 * arrives from the SAME direction — so every tile reads as one continuous
 * flow from a to b instead of reversing at the midpoint.
 */
export const mosaic = defineTransition({
  name: "mosaic",
  defaults: {
    count: 14,
    jitter: 0.08,
    stagger: 0.4,
  },
  glsl: `
uniform float uCount;
uniform float uJitter;
uniform float uStagger;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
vec2 hash22(vec2 p) {
  return vec2(
    fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453),
    fract(sin(dot(p, vec2(39.3468, 11.1357))) * 24678.1234)
  );
}

vec4 transition(vec2 uv) {
  // 1×1 = full fade, 2×2 = quad-split — neither reads as "mosaic".
  // Clamp here so the transition is reliable regardless of caller input.
  float count = max(uCount, 3.0);
  vec2 cell = floor(uv * count);

  // Random unit direction per cell.
  vec2 rawDir = hash22(cell) * 2.0 - 1.0;
  vec2 dir = rawDir / max(length(rawDir), 0.0001);

  // Staggered per-cell transition, monotonic in uProgress.
  float priority = hash21(cell);
  float start = priority * uStagger;
  float localP = clamp((uProgress - start) / max(1.0 - uStagger, 0.0001), 0.0, 1.0);

  // One-way flow: from-sample slides out in dir, to-sample arrives from
  // the same dir. Same velocity + direction through the crossfade, so the
  // tile reads as one continuous movement instead of out-and-back.
  // Mirror-sample so out-of-range UVs reflect into in-bounds content
  // instead of clamping into edge-color streaks.
  vec2 fromUv = mirrorUv(uv + dir * uJitter * localP);
  vec2 toUv = mirrorUv(uv + dir * uJitter * (localP - 1.0));

  return mix(getFromColor(fromUv), getToColor(toUv), localP);
}
`,
});
