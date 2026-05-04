import { defineTransition } from "./define.js";

/**
 * Ported from gl-transitions' directionalwarp. Uses L1-normalized direction
 * so the wavefront covers the full image regardless of direction, and a
 * shrink-to-center sampling that never needs to clamp outside [0,1] — so
 * there are no stretched edge artifacts (the "bars" a naive displacement
 * approach produces).
 */
export const directionalWarp = defineTransition({
  name: "directional-warp",
  defaults: {
    direction: [-1, 1],
    smoothness: 0.5,
  },
  glsl: `
uniform vec2 uDirection;
uniform float uSmoothness;

vec4 transition(vec2 uv) {
  // L1 normalization: ensures the projection v.x*uv.x + v.y*uv.y covers a
  // range of length 1 regardless of direction.
  vec2 v = uDirection;
  float l = abs(v.x) + abs(v.y);
  if (l < 0.0001) v = vec2(1.0, 0.0);
  else v = v / l;

  vec2 center = vec2(0.5);
  float d = v.x * center.x + v.y * center.y;

  float m = 1.0 - smoothstep(
    -uSmoothness,
    0.0,
    v.x * uv.x + v.y * uv.y - (d - 0.5 + uProgress * (1.0 + uSmoothness))
  );

  // Shrink-to-center sampling: fromUv shrinks toward center as m grows,
  // toUv grows out from center. UVs stay in [0,1] — no clamping needed.
  return mix(
    getFromColor((uv - 0.5) * (1.0 - m) + 0.5),
    getToColor((uv - 0.5) * m + 0.5),
    m
  );
}
`,
});
