import { defineEffect } from "../define.js";

/**
 * Directional motion blur — averages 16 samples taken along `direction`
 * (normalised internally) over a span of `distance` pixels centred on
 * the current pixel. Produces a linear smear in the direction of motion.
 *
 * At `distance = 0` the shader returns the source verbatim — identity
 * by construction.
 */
export const motionBlur = defineEffect({
  name: "motion-blur",
  defaults: {
    distance: 16,
    direction: [1, 0] as const,
  },
  glsl: `
uniform float uDistance;
uniform vec2 uDirection;

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uDistance <= 0.0) return src;
  vec2 dir = uDirection;
  float mag = length(dir);
  if (mag < 0.0001) return src;
  dir /= mag;

  vec2 texel = 1.0 / uResolution;
  vec4 sum = vec4(0.0);
  const int SAMPLES = 16;
  for (int i = 0; i < SAMPLES; i++) {
    float t = (float(i) - float(SAMPLES - 1) * 0.5) / float(SAMPLES);
    vec2 sampleUv = uv + dir * uDistance * t * texel;
    sum += getSource(clamp(sampleUv, 0.0, 1.0));
  }
  return sum / float(SAMPLES);
}
`,
});
