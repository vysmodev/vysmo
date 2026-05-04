import { defineEffect } from "../define.js";

/**
 * Brightness / contrast / saturation / hue colour grading — four knobs,
 * one pass.
 *
 * - `brightness`: additive, range ≈ [-1, 1], 0 = identity.
 * - `contrast`: multiplicative around 0.5, range ≈ [0, 2], 1 = identity.
 * - `saturation`: lerp between luma and colour, range ≈ [0, 2], 1 = identity.
 * - `hue`: rotation in YIQ space, in radians, 0 = identity.
 *
 * At {brightness: 0, contrast: 1, saturation: 1, hue: 0} the output is
 * pixel-equal to the source (within one LSB from the YIQ roundtrip).
 */
export const colorGrade = defineEffect({
  name: "color-grade",
  defaults: {
    brightness: 0,
    contrast: 1,
    saturation: 1,
    hue: 0,
  },
  glsl: `
uniform float uBrightness;
uniform float uContrast;
uniform float uSaturation;
uniform float uHue;

vec3 applyHue(vec3 rgb, float angle) {
  if (abs(angle) < 0.0001) return rgb;
  float y = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  float i = 0.596 * rgb.r - 0.274 * rgb.g - 0.322 * rgb.b;
  float q = 0.211 * rgb.r - 0.523 * rgb.g + 0.312 * rgb.b;
  float c = cos(angle);
  float s = sin(angle);
  float ni = i * c - q * s;
  float nq = i * s + q * c;
  return vec3(
    y + 0.956 * ni + 0.621 * nq,
    y - 0.272 * ni - 0.647 * nq,
    y - 1.106 * ni + 1.703 * nq
  );
}

vec4 effect(vec2 uv) {
  vec4 color = getSource(uv);
  if (uBrightness == 0.0 && uContrast == 1.0 && uSaturation == 1.0 && uHue == 0.0) {
    return color;
  }

  vec3 c = color.rgb + uBrightness;
  c = (c - 0.5) * uContrast + 0.5;
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(vec3(luma), c, uSaturation);
  c = applyHue(c, uHue);
  return vec4(c, color.a);
}
`,
});
