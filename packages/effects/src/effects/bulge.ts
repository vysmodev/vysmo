import { defineEffect } from "../define.js";

/**
 * Radial pinch (negative `strength`) or bulge (positive). UVs inside a
 * disc of `radius` (UV-space, aspect-corrected) are pulled toward or
 * pushed away from `centre` with a quadratic falloff so the effect dies
 * off smoothly at the disc boundary.
 *
 * At `strength = 0` the shader returns the source verbatim — identity
 * by construction.
 */
export const bulge = defineEffect({
  name: "bulge",
  defaults: {
    strength: 0.5,
    centre: [0.5, 0.5] as const,
    radius: 0.5,
  },
  glsl: `
uniform float uStrength;
uniform vec2 uCentre;
uniform float uRadius;

vec4 effect(vec2 uv) {
  if (abs(uStrength) <= 0.0001) return getSource(uv);

  float aspect = uResolution.x / uResolution.y;
  vec2 d = (uv - uCentre) * vec2(aspect, 1.0);
  float dist = length(d);
  float r = max(uRadius, 0.0001);
  if (dist > r) return getSource(uv);

  float t = 1.0 - dist / r;
  float factor = 1.0 - uStrength * t * t;
  vec2 sampleUv = uCentre + (uv - uCentre) * factor;
  return getSource(clamp(sampleUv, 0.0, 1.0));
}
`,
});
