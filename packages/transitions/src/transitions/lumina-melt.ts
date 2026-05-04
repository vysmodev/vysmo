import { defineTransition } from "./define.js";

/**
 * Inspired by gl-transitions' luminamelt. Content-aware dissolve: each pixel
 * transitions based on its brightness in the "from" image. Brighter pixels
 * transition first, darker pixels last — creating a melt-like effect driven
 * by image content, not a uniform or noise threshold.
 */
export const luminaMelt = defineTransition({
  name: "lumina-melt",
  defaults: {
    softness: 0.15,
    invert: 0,
  },
  glsl: `
uniform float uSoftness;
uniform float uInvert;

vec4 transition(vec2 uv) {
  vec4 fromColor = getFromColor(uv);
  vec4 toColor = getToColor(uv);

  // ITU-R BT.601 luminance.
  float luma = dot(fromColor.rgb, vec3(0.299, 0.587, 0.114));

  // invert=0: bright pixels transition first (fieldValue = 1 - luma)
  // invert=1: dark pixels transition first (fieldValue = luma)
  float fieldValue = mix(1.0 - luma, luma, uInvert);

  float threshold = uProgress * (1.0 + 2.0 * uSoftness) - uSoftness;
  float w = smoothstep(threshold - uSoftness, threshold + uSoftness, fieldValue);
  // w=1: pixel hasn't melted yet (still from)
  return mix(toColor, fromColor, w);
}
`,
});
