import { defineEffect } from "../define.js";
import { GAUSSIAN_BLUR_AXIS_GLSL } from "./shared/gaussian-blur.js";

/**
 * Bloom — bright-highlight halo. Four passes:
 *
 *   0. Bright-pass: keep only pixels above the luminance threshold.
 *   1. Horizontal blur of pass 0.
 *   2. Vertical blur of pass 1.
 *   3. Composite: source + blurred bright-pass × intensity.
 *
 * `hdr: true` requests `RGBA16F` ping-pong targets so bright-pass values
 * above 1.0 survive the blur before being additively composited. Falls
 * back to LDR when `EXT_color_buffer_float` isn't available.
 *
 * At `intensity = 0` the shader short-circuits on every pass and the
 * final output is pixel-pure source.
 */
export const bloom = defineEffect({
  name: "bloom",
  passes: 4,
  hdr: true,
  defaults: {
    intensity: 1,
    threshold: 0.8,
    softness: 0.1,
    radius: 32,
  },
  glsl: `
uniform float uIntensity;
uniform float uThreshold;
uniform float uSoftness;
uniform float uRadius;

float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

#define _blurSample(uv) getPrevious(uv)
${GAUSSIAN_BLUR_AXIS_GLSL}

vec4 effect(vec2 uv) {
  if (uIntensity <= 0.0) return getSource(uv);

  // Pass 0: bright-pass — soft-knee luminance threshold.
  if (uPass == 0) {
    vec4 c = getSource(uv);
    float l = luma(c.rgb);
    float lo = uThreshold - uSoftness;
    float hi = uThreshold + uSoftness;
    float keep = smoothstep(lo, hi, l);
    return vec4(c.rgb * keep, c.a);
  }

  // Passes 1 & 2: separable Gaussian of the previous pass.
  if (uPass == 1 || uPass == 2) {
    vec2 axis = (uPass == 1) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    return _gaussianBlurAxis(uv, axis, uRadius);
  }

  // Pass 3 (final): source + blurred bright-pass.
  vec4 src = getSource(uv);
  vec4 halo = getPrevious(uv);
  return vec4(src.rgb + halo.rgb * uIntensity, src.a);
}
`,
});
