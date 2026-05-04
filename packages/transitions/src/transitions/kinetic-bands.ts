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

vec4 transition(vec2 uv) {
  // Which horizontal band this pixel belongs to, 0..1 from top to bottom.
  float band = floor(uv.y * uCount);
  float bandPos = (band + 0.5) / uCount;

  // Each band starts at bandPos * stagger and runs for (1 - stagger) of time.
  float start = bandPos * uStagger;
  float window = max(0.0001, 1.0 - uStagger);
  float localProgress = clamp((uProgress - start) / window, 0.0, 1.0);

  // Within the band, run a slide-style sweep so each band has its own
  // endpoint-correct mini-transition.
  vec2 d = normalize(uDirection);
  // Scale the boundary range by maxProj so diagonal directions sweep
  // fully off-screen at endpoints (see paint-bleed.ts for the full
  // explanation).
  float maxProj = max((abs(d.x) + abs(d.y)) * 0.5, 0.0001);
  float projected = dot(uv - 0.5, -d);
  float boundary = (maxProj + uSoftness) * (1.0 - 2.0 * localProgress);
  float w = smoothstep(boundary - uSoftness, boundary + uSoftness, projected);

  return mix(getFromColor(uv), getToColor(uv), w);
}
`,
});
