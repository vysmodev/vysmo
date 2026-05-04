import { defineEffect } from "../define.js";

/**
 * Kaleidoscope — radial-symmetry mirror. Folds the angular range into
 * `segments` equal slices and reflects within each, producing a classic
 * kaleidoscope tile. `rotation` rotates the whole tile pattern.
 *
 * `centre` is the focal point in UV space; `segments` is an integer
 * symmetry order (≥ 2 for any visible effect). At `segments ≤ 1` the
 * shader returns the source verbatim — identity by construction.
 */
export const kaleidoscope = defineEffect({
  name: "kaleidoscope",
  defaults: {
    segments: 6,
    centre: [0.5, 0.5] as const,
    rotation: 0,
  },
  glsl: `
uniform float uSegments;
uniform vec2 uCentre;
uniform float uRotation;

// Mirror-wrap UV into [0,1] so out-of-range samples fold back into the
// source rather than streaking against the edge clamp.
vec2 mirrorWrap(vec2 uv) {
  vec2 a = abs(uv);
  vec2 m = mod(a, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

vec4 effect(vec2 uv) {
  if (uSegments <= 1.0) return getSource(uv);

  float aspect = uResolution.x / uResolution.y;
  vec2 d = (uv - uCentre) * vec2(aspect, 1.0);
  float r = length(d);
  float angle = atan(d.y, d.x) - uRotation;

  float seg = 6.28318530 / max(uSegments, 1.0);
  float folded = mod(angle, seg);
  if (folded > seg * 0.5) folded = seg - folded;

  float a = folded + uRotation;
  vec2 newD = vec2(cos(a), sin(a)) * r;
  newD /= vec2(aspect, 1.0);
  return getSource(mirrorWrap(uCentre + newD));
}
`,
});
