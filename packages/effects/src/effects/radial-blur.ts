import { defineEffect } from "../define.js";

/**
 * Radial / zoom blur — accumulates 16 samples along the line from
 * `centre` to the current pixel, with each sample at progressively
 * smaller radial scale. Produces a streaked "pulled-into-the-frame"
 * look classic to comic action panels.
 *
 * At `strength = 0` the shader returns the source verbatim — identity
 * by construction.
 */
export const radialBlur = defineEffect({
  name: "radial-blur",
  defaults: {
    strength: 0.1,
    centre: [0.5, 0.5] as const,
  },
  glsl: `
uniform float uStrength;
uniform vec2 uCentre;

vec4 effect(vec2 uv) {
  if (uStrength <= 0.0) return getSource(uv);

  vec2 dir = uv - uCentre;
  vec4 sum = vec4(0.0);
  const int SAMPLES = 16;
  for (int i = 0; i < SAMPLES; i++) {
    float t = float(i) / float(SAMPLES - 1);
    float scale = 1.0 - uStrength * t;
    vec2 sampleUv = uCentre + dir * scale;
    sum += getSource(clamp(sampleUv, 0.0, 1.0));
  }
  return sum / float(SAMPLES);
}
`,
});
