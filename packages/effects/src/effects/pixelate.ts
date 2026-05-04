import { defineEffect } from "../define.js";

/**
 * Mosaic / chunky-pixel effect. Quantises UV lookups to `size`-pixel
 * blocks, sampling the centre of each block. At `size ≤ 1` returns the
 * source verbatim (identity).
 */
export const pixelate = defineEffect({
  name: "pixelate",
  defaults: {
    size: 8,
  },
  glsl: `
uniform float uSize;

vec4 effect(vec2 uv) {
  if (uSize <= 1.0) return getSource(uv);

  vec2 block = uSize / uResolution;
  vec2 snapped = (floor(uv / block) + 0.5) * block;
  return getSource(snapped);
}
`,
});
