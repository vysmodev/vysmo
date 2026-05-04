import { defineEffect } from "../define.js";

/**
 * Darkens (or tints) the corners of the frame. The effect is radial
 * around the image centre and fully off at `intensity = 0` — identity
 * by construction.
 *
 * `radius` sets where the darkening starts (0 = from centre, 1 = only
 * the extreme corners). `softness` controls the transition width
 * between clean and darkened regions. `color` is the tint applied in
 * the darkened zone, defaulting to black.
 */
export const vignette = defineEffect({
  name: "vignette",
  defaults: {
    intensity: 0.6,
    radius: 0.5,
    softness: 0.4,
    color: [0, 0, 0] as const,
  },
  glsl: `
uniform float uIntensity;
uniform float uRadius;
uniform float uSoftness;
uniform vec3 uColor;

vec4 effect(vec2 uv) {
  vec4 color = getSource(uv);
  if (uIntensity <= 0.0) return color;

  // Distance from centre, corrected for aspect so the vignette is round
  // rather than stretched with the frame.
  vec2 centred = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float dist = length(centred) * 2.0 / max(uResolution.x / uResolution.y, 1.0);

  float softStart = uRadius;
  float softEnd = uRadius + max(uSoftness, 0.001);
  float t = smoothstep(softStart, softEnd, dist) * uIntensity;
  return vec4(mix(color.rgb, uColor, t), color.a);
}
`,
});
