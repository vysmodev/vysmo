import { defineEffect } from "../define.js";

/**
 * Radial lens distortion — barrel (positive `strength`) or pincushion
 * (negative). The classic GoPro / fisheye look at higher strengths.
 *
 * The displacement is renormalised by the corner factor so the image
 * always fills the frame: corners land exactly at the edge whether
 * barrel (centre shrinks, edges push out) or pincushion (centre
 * magnifies, edges stay put). No edge streaks.
 *
 * At `strength = 0` the shader returns the source verbatim — identity
 * by construction.
 */
export const lensDistortion = defineEffect({
  name: "lens-distortion",
  defaults: {
    strength: 0.3,
  },
  glsl: `
uniform float uStrength;

vec4 effect(vec2 uv) {
  if (abs(uStrength) <= 0.0001) return getSource(uv);
  vec2 centred = uv - 0.5;
  float r2 = dot(centred, centred);
  // Renormalise barrel only. For barrel (s>0) the factor is largest at
  // corners (r²=0.5) and we shrink it back so the corner samples land at
  // the edge. Pincushion (s<0) has the opposite shape — factor is largest
  // at edge midpoints, smallest at corners — so renormalising would push
  // edges past the source. Pincushion is already in-bounds without it.
  float norm = uStrength > 0.0 ? (1.0 + uStrength * 0.5) : 1.0;
  vec2 distorted = 0.5 + centred * (1.0 + uStrength * r2) / norm;
  return getSource(clamp(distorted, 0.0, 1.0));
}
`,
});
