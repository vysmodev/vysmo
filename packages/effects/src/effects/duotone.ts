import { defineEffect } from "../define.js";

/**
 * Luma-driven gradient mapping. Each pixel's brightness picks a colour
 * between `shadow` (luma 0) and `highlight` (luma 1). Mixed with the
 * original at `intensity` so the effect can dial in/out smoothly.
 *
 * At `intensity = 0` the shader returns the source verbatim — identity
 * by construction. The classic Spotify-style two-tone is `intensity = 1`
 * with strong contrasting `shadow` and `highlight` colours.
 */
export const duotone = defineEffect({
  name: "duotone",
  defaults: {
    intensity: 1,
    shadow: [0.13, 0.18, 0.55] as const,
    highlight: [0.96, 0.78, 0.34] as const,
  },
  glsl: `
uniform float uIntensity;
uniform vec3 uShadow;
uniform vec3 uHighlight;

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uIntensity <= 0.0) return src;
  float luma = dot(src.rgb, vec3(0.299, 0.587, 0.114));
  vec3 mapped = mix(uShadow, uHighlight, luma);
  return vec4(mix(src.rgb, mapped, uIntensity), src.a);
}
`,
});
