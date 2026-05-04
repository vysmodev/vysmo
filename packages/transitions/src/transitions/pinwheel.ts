import { defineTransition } from "./define.js";

/**
 * Multi-spoke angular sweep: `spokes` wedges each open simultaneously around
 * a center, sweeping through their angular slice as progress grows. A
 * rotating "fan" reveal, aspect-corrected so spokes stay radial.
 */
export const pinwheel = defineTransition({
  name: "pinwheel",
  defaults: {
    center: [0.5, 0.5],
    spokes: 8,
    rotation: 0,
    softness: 0.05,
  },
  glsl: `
uniform vec2 uCenter;
uniform float uSpokes;
uniform float uRotation;
uniform float uSoftness;

const float TWO_PI = 6.2831853;

vec4 transition(vec2 uv) {
  // Aspect-correct so spokes remain radial on non-square canvases.
  vec2 delta = (uv - uCenter) * vec2(uResolution.x / uResolution.y, 1.0);
  float angle = atan(delta.y, delta.x) - uRotation;
  float slice = TWO_PI / max(uSpokes, 2.0);

  // Position within a single spoke's angular range, 0 to slice.
  float folded = mod(angle, slice);

  // Softness expressed as a fraction of the slice so it scales with spoke count.
  float s = slice * uSoftness;
  // Threshold sweeps from -s (outside range) to slice+s (outside range), so
  // feather never reaches visible pixels at the endpoints.
  float threshold = -s + uProgress * (slice + 2.0 * s);
  float w = smoothstep(threshold - s, threshold + s, folded);
  return mix(getToColor(uv), getFromColor(uv), w);
}
`,
});
