import { defineEffect } from "../define.js";
import { GAUSSIAN_BLUR_AXIS_GLSL } from "./shared/gaussian-blur.js";

/**
 * Tilt-shift — selective separable blur with a horizontal in-focus band.
 * Three passes: horizontal Gaussian of source, vertical Gaussian of pass
 * 0, then a final composite that mixes source with the blurred pass by
 * vertical distance from `focusY`.
 *
 * `focusY` is the band's centre in UV space (0 = bottom, 1 = top per the
 * runner's UV convention). `focusWidth` is the band's full height in UV
 * units; pixels inside it stay sharp, pixels outside are blurred.
 *
 * At `blurRadius = 0` every pass short-circuits to source, giving a
 * pixel-pure identity.
 */
export const tiltShift = defineEffect({
  name: "tilt-shift",
  passes: 3,
  defaults: {
    focusY: 0.5,
    focusWidth: 0.25,
    blurRadius: 16,
  },
  glsl: `
uniform float uFocusY;
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
  float dist = abs(uv.y - uFocusY);
  float halfBand = max(uFocusWidth * 0.5, 0.0001);
  float t = smoothstep(halfBand, halfBand + 0.15, dist);
  return vec4(mix(src.rgb, blurred.rgb, t), src.a);
}
`,
});
