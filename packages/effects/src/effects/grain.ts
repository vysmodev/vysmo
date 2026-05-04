import { defineEffect } from "../define.js";

/**
 * Film grain / white-noise overlay. Cheap procedural hash per pixel,
 * offset by `seed` so consumers can animate the grain between frames
 * by incrementing a time value.
 *
 * At `intensity = 0` the shader returns the source verbatim.
 *
 * `size` controls grain granularity: 1 = per-pixel noise, larger values
 * scale up the grain cell.
 */
export const grain = defineEffect({
  name: "grain",
  defaults: {
    intensity: 0.1,
    size: 1,
    seed: 0,
  },
  glsl: `
uniform float uIntensity;
uniform float uSize;
uniform float uSeed;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 effect(vec2 uv) {
  vec4 color = getSource(uv);
  if (uIntensity <= 0.0) return color;

  vec2 cell = floor(uv * uResolution / max(uSize, 1.0)) + uSeed;
  float noise = hash21(cell) * 2.0 - 1.0;
  return vec4(color.rgb + noise * uIntensity, color.a);
}
`,
});
