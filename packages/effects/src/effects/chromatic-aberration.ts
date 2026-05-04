import { defineEffect } from "../define.js";

/**
 * RGB channel offset — splits the three colour channels along an axis
 * to fake prismatic lens dispersion. `offset` is in pixels; `direction`
 * is a 2D vector controlling the split axis (normalised internally).
 *
 * At `offset = 0` the shader returns the source verbatim.
 */
export const chromaticAberration = defineEffect({
  name: "chromatic-aberration",
  defaults: {
    offset: 3,
    direction: [1, 0] as const,
  },
  glsl: `
uniform float uOffset;
uniform vec2 uDirection;

vec4 effect(vec2 uv) {
  if (uOffset <= 0.001) return getSource(uv);
  vec2 dir = uDirection;
  float mag = length(dir);
  if (mag < 0.0001) return getSource(uv);
  dir /= mag;

  vec2 texel = 1.0 / uResolution;
  vec2 d = dir * uOffset * texel;
  float r = getSource(uv - d).r;
  float g = getSource(uv).g;
  float b = getSource(uv + d).b;
  float a = getSource(uv).a;
  return vec4(r, g, b, a);
}
`,
});
