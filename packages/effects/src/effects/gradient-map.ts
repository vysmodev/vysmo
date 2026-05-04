import { defineEffect } from "../define.js";

/**
 * Three-stop gradient mapping. Per-pixel luminance picks a colour along
 * the `shadow → midtone → highlight` ramp, blended back over the source
 * by `intensity`. Generalises `duotone` with a midtone hinge that lets
 * gradients curve through a third hue (e.g. teal-to-magenta-to-gold).
 *
 * At `intensity = 0` the shader returns the source verbatim — identity
 * by construction.
 */
export const gradientMap = defineEffect({
  name: "gradient-map",
  defaults: {
    intensity: 1,
    shadow: [0.05, 0.05, 0.15] as const,
    midtone: [0.65, 0.18, 0.55] as const,
    highlight: [1.0, 0.85, 0.45] as const,
  },
  glsl: `
uniform float uIntensity;
uniform vec3 uShadow;
uniform vec3 uMidtone;
uniform vec3 uHighlight;

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uIntensity <= 0.0) return src;

  float luma = dot(src.rgb, vec3(0.299, 0.587, 0.114));
  vec3 mapped;
  if (luma < 0.5) {
    mapped = mix(uShadow, uMidtone, luma * 2.0);
  } else {
    mapped = mix(uMidtone, uHighlight, (luma - 0.5) * 2.0);
  }
  return vec4(mix(src.rgb, mapped, uIntensity), src.a);
}
`,
});
