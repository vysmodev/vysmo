import { defineTransition } from "./define.js";

/**
 * Cover slide: the "to" image slides in and covers the stationary "from".
 * Distinct from `push` (which scrolls both images together as a unit).
 */
export const slide = defineTransition({
  name: "slide",
  defaults: {
    direction: [-1, 0],
    feather: 0.015,
    blur: 0,
  },
  glsl: `
uniform vec2 uDirection;
uniform float uFeather;
uniform float uBlur;

vec4 sampleToBlurred(vec2 uv, vec2 motion, float amount) {
  if (amount < 0.001) return getToColor(clamp(uv, 0.0, 1.0));
  // 8 Gaussian-weighted samples along the motion axis. Center samples
  // dominate; trailing ones fade out so the blur reads as continuous, not
  // as discrete ghost copies. Effective spread is capped at the call site
  // — past ~0.05 UV the eye sees stripes regardless of sample count.
  const int N = 8;
  const float sigma = 0.25;
  vec4 sum = vec4(0.0);
  float wSum = 0.0;
  for (int i = 0; i < N; i++) {
    float t = float(i) / float(N - 1) - 0.5;
    float w = exp(-(t * t) / (2.0 * sigma * sigma));
    sum += getToColor(clamp(uv + motion * amount * t, 0.0, 1.0)) * w;
    wSum += w;
  }
  return sum / wSum;
}

// Snap to nearest axis-aligned unit. Slide's seam math is built around
// axis-aligned motion; diagonals leave triangular gaps at the corners.
// Enforced in-shader so the UI's axis-only picker matches.
vec2 snapAxis(vec2 v) {
  vec2 d = normalize(v);
  return abs(d.x) > abs(d.y) ? vec2(sign(d.x), 0.0) : vec2(0.0, sign(d.y));
}

vec4 transition(vec2 uv) {
  vec2 d = snapAxis(uDirection);

  // "to" is translated from off-screen (behind the trailing edge) into place.
  // At progress=0, to is offset by +d (fully off-screen). At progress=1, to is at origin.
  vec2 toUv = uv + d * (1.0 - uProgress);

  // Feathered seam between from (stationary) and to (moving into frame).
  // The projected coordinate's range is ±maxProj where maxProj = (|dx|+|dy|)/2,
  // so we scale by it to keep the feather zone off-screen at the endpoints
  // for any direction (axis-aligned OR diagonal).
  float maxProj = max((abs(d.x) + abs(d.y)) * 0.5, 0.0001);
  float boundary = (maxProj + uFeather) * (1.0 - 2.0 * uProgress);
  float projected = dot(uv - 0.5, -d);
  float w = smoothstep(boundary - uFeather, boundary + uFeather, projected);

  // From is stationary → sample cleanly, no blur.
  vec4 fromColor = getFromColor(uv);

  // To is the moving layer → velocity-scaled motion blur along motion axis.
  // uBlur is the peak spread radius in UV units, capped at 0.1: past that
  // the discrete sample structure shows as visible stripes regardless of
  // sample count. Hard-clamp here so the transition is reliable for any
  // caller input.
  float motion = 4.0 * uProgress * (1.0 - uProgress) * min(uBlur, 0.1);
  vec4 toColor = sampleToBlurred(toUv, -d, motion);

  return mix(fromColor, toColor, w);
}
`,
});
