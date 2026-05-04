import { defineEffect } from "../define.js";
import { GAUSSIAN_BLUR_AXIS_GLSL } from "./shared/gaussian-blur.js";

/**
 * Glow — softer, broader, and tintable sibling of bloom. Same four-pass
 * pipeline shape, but:
 *
 *   - Lower default threshold so more of the image contributes.
 *   - Wider default radius for a hazier halo.
 *   - Tint colour multiplies the halo, so glow can be coloured.
 *   - Composites via screen blend rather than additive, producing a
 *     softer integration that resists clipping midtones.
 *
 * At `intensity = 0` the shader short-circuits on every pass and the
 * final output is pixel-pure source.
 */
export const glow = defineEffect({
  name: "glow",
  passes: 4,
  hdr: true,
  defaults: {
    intensity: 0.7,
    threshold: 0.3,
    softness: 0.2,
    radius: 48,
    tint: [1, 1, 1] as const,
  },
  glsl: `
uniform float uIntensity;
uniform float uThreshold;
uniform float uSoftness;
uniform float uRadius;
uniform vec3 uTint;

float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

vec3 screenBlend(vec3 a, vec3 b) {
  return 1.0 - (1.0 - a) * (1.0 - clamp(b, 0.0, 1.0));
}

#define _blurSample(uv) getPrevious(uv)
${GAUSSIAN_BLUR_AXIS_GLSL}

vec4 effect(vec2 uv) {
  if (uIntensity <= 0.0) return getSource(uv);

  // Pass 0: soft-threshold + tint.
  if (uPass == 0) {
    vec4 c = getSource(uv);
    float l = luma(c.rgb);
    float lo = uThreshold - uSoftness;
    float hi = uThreshold + uSoftness;
    float keep = smoothstep(lo, hi, l);
    return vec4(c.rgb * keep * uTint, c.a);
  }

  // Passes 1 & 2: wide separable Gaussian of the tinted pass.
  if (uPass == 1 || uPass == 2) {
    vec2 axis = (uPass == 1) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    return _gaussianBlurAxis(uv, axis, uRadius);
  }

  // Pass 3 (final): screen-blend the halo over the source.
  vec4 src = getSource(uv);
  vec3 halo = getPrevious(uv).rgb * uIntensity;
  return vec4(screenBlend(src.rgb, halo), src.a);
}
`,
});
