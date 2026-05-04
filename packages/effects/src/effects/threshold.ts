import { defineEffect } from "../define.js";

/**
 * Luminance-based binary threshold. Pixels above the cutoff become
 * `highColor`, pixels below become `lowColor`. `softness` widens the
 * transition from a hard step into a gradient — at 0 the result is a
 * crisp two-tone image; at higher values the boundary feathers.
 *
 * At `softness` ≥ 1 the output is effectively `mix(lowColor, highColor, luma)`
 * — a luma-driven gradient between the two endpoints. There's no
 * identity here in the strict sense; the effect always replaces colour.
 * Tests use the `mix(black, white)` setting and expect a luma map.
 */
export const threshold = defineEffect({
  name: "threshold",
  defaults: {
    cutoff: 0.5,
    softness: 0,
    lowColor: [0, 0, 0] as const,
    highColor: [1, 1, 1] as const,
  },
  glsl: `
uniform float uCutoff;
uniform float uSoftness;
uniform vec3 uLowColor;
uniform vec3 uHighColor;

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  float luma = dot(src.rgb, vec3(0.299, 0.587, 0.114));
  float lo = uCutoff - max(uSoftness, 0.0001);
  float hi = uCutoff + max(uSoftness, 0.0001);
  float t = smoothstep(lo, hi, luma);
  return vec4(mix(uLowColor, uHighColor, t), src.a);
}
`,
});
