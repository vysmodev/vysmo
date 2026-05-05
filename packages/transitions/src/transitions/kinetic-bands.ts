import { defineTransition } from "./define.js";

export const kineticBands = defineTransition({
  name: "kinetic-bands",
  defaults: {
    count: 12,
    stagger: 0.6,
    softness: 0.02,
    direction: [1, 0],
  },
  glsl: `
uniform float uCount;
uniform float uStagger;
uniform float uSoftness;
uniform vec2 uDirection;

// Snap to nearest axis-aligned unit. Diagonals would tilt the bands away
// from the natural horizontal stack and the boundary math would no longer
// align with the band's own progress envelope. Enforced in-shader so the
// UI's axis-only picker matches.
vec2 snapAxis(vec2 v) {
  vec2 dn = normalize(v);
  return abs(dn.x) > abs(dn.y) ? vec2(sign(dn.x), 0.0) : vec2(0.0, sign(dn.y));
}

vec4 transition(vec2 uv) {
  // count=1 collapses to a single full-frame slide; not "kinetic bands".
  // Clamp here so the transition is reliable regardless of caller input.
  float count = max(uCount, 2.0);

  vec2 d = snapAxis(uDirection);

  // Bands run perpendicular to the sweep direction. For a horizontal sweep
  // (Right/Left), bands are horizontal stripes stacked vertically (indexed
  // by uv.y). For a vertical sweep (Up/Down), bands are vertical stripes
  // stacked horizontally (indexed by uv.x). Otherwise the bands and sweep
  // axis are mismatched and the effect looks broken.
  bool horizontalBands = abs(d.x) > abs(d.y);
  float bandCoord = horizontalBands ? uv.y : uv.x;
  float band = floor(bandCoord * count);
  float bandPos = (band + 0.5) / count;

  // Each band starts at bandPos * stagger and runs for (1 - stagger) of time.
  float start = bandPos * uStagger;
  float window = max(0.0001, 1.0 - uStagger);
  float localProgress = clamp((uProgress - start) / window, 0.0, 1.0);

  // Within the band, run a slide-style sweep so each band has its own
  // endpoint-correct mini-transition.
  float maxProj = 0.5;
  float projected = dot(uv - 0.5, -d);
  float boundary = (maxProj + uSoftness) * (1.0 - 2.0 * localProgress);
  float w = smoothstep(boundary - uSoftness, boundary + uSoftness, projected);

  return mix(getFromColor(uv), getToColor(uv), w);
}
`,
});
