import { defineTransition } from "./define.js";

/**
 * The image is partitioned into small rectangular cells; each cell
 * translates as a rigid block along its own per-cell random direction,
 * with a 4·p·(1-p) envelope so displacement is zero at both endpoints
 * and peaks at mid-progress. Neighbouring cells with different flight
 * directions tear apart, producing visible seams that read as discrete
 * particle boundaries — the key difference from per-pixel noise
 * displacement, which only ever blurs continuously.
 *
 * Update param is density (cells per unit height) rather than
 * scatter-only, so authors directly control particle grain. Aspect
 * is compensated so cells stay roughly square regardless of canvas
 * shape.
 *
 * Endpoints: envelope = 0 at progress 0/1, so displacement collapses
 * and each pixel samples from/to at its own uv. Crossfade smoothstep
 * saturates to 0 at progress 0 and 1 at progress 1.
 */
export const particleAssemble = defineTransition({
  name: "particle-assemble",
  defaults: {
    scatter: 0.22,
    density: 48,
  },
  glsl: `
uniform float uScatter;
uniform float uDensity;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 hash22(vec2 p) {
  return vec2(hash21(p), hash21(p + vec2(17.3, 23.7)));
}

vec4 transition(vec2 uv) {
  float aspect = uResolution.x / uResolution.y;

  // Aspect-square cells. Density is cells per unit height.
  vec2 cellSize = vec2(1.0 / (aspect * uDensity), 1.0 / uDensity);
  vec2 cellId = floor(uv / cellSize);

  // One random flight direction per cell → pixels in the same cell
  // share displacement, so the cell moves as a rigid block. Adjacent
  // cells with different directions tear apart visibly.
  vec2 dir = normalize(hash22(cellId) * 2.0 - 1.0 + vec2(1e-4));

  float envelope = 4.0 * uProgress * (1.0 - uProgress);
  vec2 disp = dir * envelope * uScatter;

  // Sample source as if the cell is showing at its displaced position.
  // Approximation: sample at uv - d(uv). Neighbouring cells with
  // different d produce hard seams = particle boundaries.
  vec2 homeUv = clamp(uv - disp, 0.0, 1.0);

  // Wide crossfade so both images overlap through most of the peak
  // scatter, giving the eye time to read the particle motion.
  float blend = smoothstep(0.15, 0.85, uProgress);
  return mix(getFromColor(homeUv), getToColor(homeUv), blend);
}
`,
});
