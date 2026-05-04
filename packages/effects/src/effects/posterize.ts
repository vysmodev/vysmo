import { defineEffect } from "../define.js";

/**
 * Per-channel colour quantisation — collapses the continuous RGB range
 * into `levels` discrete steps per channel. Output palette size is
 * `levels^3` (8 levels = 512 colours, 4 = 64).
 *
 * At `levels` ≥ 256 the quantisation becomes a no-op since 8-bit
 * channels already have 256 levels — the shader returns the source
 * verbatim. The identity case in tests uses `levels: 256`.
 */
export const posterize = defineEffect({
  name: "posterize",
  defaults: {
    levels: 4,
  },
  glsl: `
uniform float uLevels;

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uLevels >= 256.0) return src;
  float steps = max(uLevels, 1.0);
  vec3 q = floor(src.rgb * steps + 0.5) / steps;
  return vec4(clamp(q, 0.0, 1.0), src.a);
}
`,
});
