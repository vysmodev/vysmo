import { defineEffect } from "../define.js";

/**
 * Bayer-matrix ordered dither. Each pixel's RGB is offset by a 4×4
 * threshold pattern before quantising into `levels` discrete steps per
 * channel — the noise breaks up colour banding so the limited palette
 * reads cleaner than `posterize` alone.
 *
 * Pairs nicely with `posterize` by mimicking the look of an 8-bit
 * indexed-colour image. At `intensity = 0` the shader returns the source
 * verbatim — identity by construction.
 */
export const dither = defineEffect({
  name: "dither",
  defaults: {
    intensity: 1,
    levels: 4,
  },
  glsl: `
uniform float uIntensity;
uniform float uLevels;

float bayer4(int x, int y) {
  int idx = y * 4 + x;
  if (idx ==  0) return  0.0;
  if (idx ==  1) return  8.0;
  if (idx ==  2) return  2.0;
  if (idx ==  3) return 10.0;
  if (idx ==  4) return 12.0;
  if (idx ==  5) return  4.0;
  if (idx ==  6) return 14.0;
  if (idx ==  7) return  6.0;
  if (idx ==  8) return  3.0;
  if (idx ==  9) return 11.0;
  if (idx == 10) return  1.0;
  if (idx == 11) return  9.0;
  if (idx == 12) return 15.0;
  if (idx == 13) return  7.0;
  if (idx == 14) return 13.0;
  return 5.0;
}

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uIntensity <= 0.0) return src;

  vec2 px = mod(uv * uResolution, 4.0);
  int x = int(px.x);
  int y = int(px.y);
  // Bayer noise in [0, 1) — used as a stochastic-rounding bias so each
  // pixel rounds up with probability equal to its bayer cell.
  float bayer = bayer4(x, y) / 16.0;
  float steps = max(uLevels, 2.0);
  vec3 dithered = clamp(floor(src.rgb * steps + bayer) / steps, 0.0, 1.0);
  return vec4(mix(src.rgb, dithered, uIntensity), src.a);
}
`,
});
