import { defineTransition } from "./define.js";

/**
 * Port of akella demo8. Pixels are pulled vertically toward `center` over
 * the transition: from-image moves toward center by `progress * intensity`,
 * to-image starts displaced AWAY from center and converges back. A fine
 * noise field perturbs the magnitude per pixel so the pull reads as
 * organic. Crossfade is linear so there's no freeze through the midpoint.
 *
 * Shrink-to-center: at midpoint the canvas samples from a smaller central
 * region so the to-image's away-from-center displacement never samples
 * outside `[0,1]` and clamps into vertical bars at the top/bottom edges.
 */
export const gravityPull = defineTransition({
  name: "gravity-pull",
  defaults: {
    center: [0.5, 0.5],
    intensity: 0.15,
  },
  glsl: `
uniform vec2 uCenter;
uniform float uIntensity;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec4 transition(vec2 uv) {
  float env = 4.0 * uProgress * (1.0 - uProgress);
  float n = valueNoise(uv * 10.0);

  // Vertical signed unit vector pointing toward the center.
  vec2 toCenter = uCenter - uv;
  float lenTC = length(toCenter);
  float dy = lenTC > 0.001 ? toCenter.y / lenTC : 0.0;
  vec2 d = vec2(0.0, dy);

  float pullMag = uIntensity * (1.0 + n * 0.5);

  // Shrink-to-center at midpoint so the away-from-center displacement
  // stays in source bounds. At endpoints env=0 → shrunkUv=uv (no zoom),
  // so endpoints are pixel-pure. Capped to keep image visible at high
  // intensities.
  float maxPull = uIntensity * 1.5;
  float shrinkAmount = max(1.0 - env * 2.0 * maxPull, 0.2);
  vec2 shrunkUv = (uv - 0.5) * shrinkAmount + 0.5;

  vec2 fromUv = clamp(shrunkUv + d * uProgress * pullMag, 0.0, 1.0);
  vec2 toUv = clamp(shrunkUv - d * (1.0 - uProgress) * pullMag, 0.0, 1.0);

  return mix(getFromColor(fromUv), getToColor(toUv), uProgress);
}
`,
});
