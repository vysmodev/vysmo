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
  const int N = 5;
  vec4 sum = vec4(0.0);
  for (int i = 0; i < N; i++) {
    float t = (float(i) - 2.0) / 4.0;
    sum += getToColor(clamp(uv + motion * amount * t, 0.0, 1.0));
  }
  return sum / float(N);
}

vec4 transition(vec2 uv) {
  vec2 d = normalize(uDirection);

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
  float motion = 4.0 * uProgress * (1.0 - uProgress) * uBlur;
  vec4 toColor = sampleToBlurred(toUv, -d, motion);

  return mix(fromColor, toColor, w);
}
`,
});
