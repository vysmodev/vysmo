import { defineEffect } from "../define.js";
import { GAUSSIAN_BLUR_AXIS_GLSL } from "./shared/gaussian-blur.js";

/**
 * Tilt-shift — selective separable blur with an in-focus band that can
 * be positioned anywhere and rotated to any angle, emulating a real
 * tilt-shift lens. Three passes: horizontal Gaussian of source,
 * vertical Gaussian of pass 0, then a final composite that mixes source
 * with the blurred pass by perpendicular distance from the band axis.
 *
 * `focus` is the band's centre point in UV space. `angle` is the band's
 * rotation in radians (0 = horizontal band, π/2 = vertical band).
 * `focusWidth` is the band's full thickness perpendicular to its axis.
 * Pixels inside the band stay sharp, pixels outside are blurred.
 *
 * At `blurRadius = 0` every pass short-circuits to source, giving a
 * pixel-pure identity.
 */
export const tiltShift = defineEffect({
  name: "tilt-shift",
  passes: 3,
  defaults: {
    focus: [0.5, 0.5] as const,
    angle: 0,
    focusWidth: 0.25,
    blurRadius: 16,
  },
  glsl: `
uniform vec2 uFocus;
uniform float uAngle;
uniform float uFocusWidth;
uniform float uBlurRadius;

#define _blurSample(uv) (uPass == 0 ? getSource(uv) : getPrevious(uv))
${GAUSSIAN_BLUR_AXIS_GLSL}

vec4 effect(vec2 uv) {
  if (uBlurRadius <= 0.001) return getSource(uv);

  if (uPass == 0) return _gaussianBlurAxis(uv, vec2(1.0, 0.0), uBlurRadius);
  if (uPass == 1) return _gaussianBlurAxis(uv, vec2(0.0, 1.0), uBlurRadius);

  vec4 src = getSource(uv);
  vec4 blurred = getPrevious(uv);

  // Perpendicular distance from this pixel to the band's axis.
  // axis = (cos a, sin a); perp = (-sin a, cos a). Project the offset
  // from focus onto perp.
  vec2 perp = vec2(-sin(uAngle), cos(uAngle));
  float dist = abs(dot(uv - uFocus, perp));
  float halfBand = max(uFocusWidth * 0.5, 0.0001);
  float t = smoothstep(halfBand, halfBand + 0.15, dist);
  return vec4(mix(src.rgb, blurred.rgb, t), src.a);
}
`,
});
