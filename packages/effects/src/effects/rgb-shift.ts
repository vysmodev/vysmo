import { defineEffect } from "../define.js";

/**
 * Glitchy chromatic shift — the three RGB channels are sampled at
 * independent horizontal offsets that vary per scanline via a hash. Sits
 * between `chromaticAberration` (smooth, symmetric) and full digital
 * glitch — a noisy, broken-tape look.
 *
 * `seed` is animatable; increment per frame for a flickering glitch. At
 * `intensity = 0` the shader returns the source verbatim — identity by
 * construction.
 */
export const rgbShift = defineEffect({
  name: "rgb-shift",
  defaults: {
    intensity: 0.5,
    seed: 0,
  },
  glsl: `
uniform float uIntensity;
uniform float uSeed;

float hash11(float p) {
  return fract(sin(p * 12.9898 + uSeed) * 43758.5453);
}

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uIntensity <= 0.0) return src;

  float row = floor(uv.y * 80.0);
  float dxR = (hash11(row + 1.0) * 2.0 - 1.0) * uIntensity * 0.05;
  float dxG = (hash11(row + 2.0) * 2.0 - 1.0) * uIntensity * 0.05;
  float dxB = (hash11(row + 3.0) * 2.0 - 1.0) * uIntensity * 0.05;
  float r = getSource(clamp(uv + vec2(dxR, 0.0), 0.0, 1.0)).r;
  float g = getSource(clamp(uv + vec2(dxG, 0.0), 0.0, 1.0)).g;
  float b = getSource(clamp(uv + vec2(dxB, 0.0), 0.0, 1.0)).b;
  return vec4(r, g, b, src.a);
}
`,
});
