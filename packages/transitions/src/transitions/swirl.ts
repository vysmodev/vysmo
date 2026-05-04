import { defineTransition } from "./define.js";

/**
 * Ported from gl-transitions' Swirl (by Sergey Kosarevsky). Both images are
 * sampled at the same swirled UV — so the symmetric swirl envelope does NOT
 * cause a visual freeze, because the linear crossfade keeps opacity changing
 * throughout. Rotation uses a quadratic falloff from center: strongest at
 * the center, zero at the edge of the active radius.
 */
export const swirl = defineTransition({
  name: "swirl",
  defaults: {
    radius: 1.0,
    strength: 25.13,
  },
  glsl: `
uniform float uRadius;
uniform float uStrength;

vec4 transition(vec2 uv) {
  vec2 centered = uv - 0.5;
  float dist = length(centered);

  if (dist < uRadius) {
    float pct = (uRadius - dist) / uRadius;
    // Symmetric ramp: 0 → 1 → 0 as progress goes 0 → 0.5 → 1.
    float a = uProgress <= 0.5
              ? uProgress / 0.5
              : 1.0 - (uProgress - 0.5) / 0.5;
    float theta = pct * pct * a * uStrength;
    float s = sin(theta);
    float c = cos(theta);
    centered = vec2(dot(centered, vec2(c, -s)), dot(centered, vec2(s, c)));
  }

  vec2 swirledUv = clamp(centered + 0.5, 0.0, 1.0);
  vec4 c0 = getFromColor(swirledUv);
  vec4 c1 = getToColor(swirledUv);
  return mix(c0, c1, uProgress);
}
`,
});
