import { defineEffect } from "../define.js";

/**
 * Datamosh — block-snapped UV warp driven by hashed noise. Mimics codec
 * corruption where macroblocks slide off-grid. `seed` is animatable for
 * an evolving glitch.
 *
 * At `intensity = 0` the shader returns the source verbatim — identity
 * by construction.
 */
export const datamosh = defineEffect({
  name: "datamosh",
  defaults: {
    intensity: 0.5,
    seed: 0,
  },
  glsl: `
uniform float uIntensity;
uniform float uSeed;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed) * 43758.5453);
}

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uIntensity <= 0.0) return src;

  vec2 block = floor(uv * uResolution / 16.0);
  vec2 noise = vec2(hash21(block), hash21(block + 7.0)) - 0.5;
  vec2 warpedUv = clamp(uv + noise * uIntensity * 0.1, 0.0, 1.0);
  vec3 warped = getSource(warpedUv).rgb;
  return vec4(mix(src.rgb, warped, uIntensity), src.a);
}
`,
});
