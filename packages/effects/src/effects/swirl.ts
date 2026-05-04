import { defineEffect } from "../define.js";

/**
 * Angular UV rotation around `centre` whose magnitude falls off with
 * radial distance — pixels near the centre rotate by `angle`, pixels
 * outside `radius` are unaffected, with a smooth transition between.
 *
 * At `angle = 0` the shader returns the source verbatim — identity by
 * construction.
 */
export const swirl = defineEffect({
  name: "swirl",
  defaults: {
    angle: 1.5,
    centre: [0.5, 0.5] as const,
    radius: 0.5,
  },
  glsl: `
uniform float uAngle;
uniform vec2 uCentre;
uniform float uRadius;

vec4 effect(vec2 uv) {
  if (abs(uAngle) <= 0.0001) return getSource(uv);

  float aspect = uResolution.x / uResolution.y;
  vec2 d = (uv - uCentre) * vec2(aspect, 1.0);
  float dist = length(d);
  float r = max(uRadius, 0.0001);
  float falloff = 1.0 - smoothstep(0.0, r, dist);
  float a = uAngle * falloff;
  float c = cos(a);
  float s = sin(a);

  vec2 off = uv - uCentre;
  vec2 rotated = vec2(c * off.x - s * off.y, s * off.x + c * off.y);
  return getSource(clamp(uCentre + rotated, 0.0, 1.0));
}
`,
});
