import { defineEffect } from "../define.js";

/**
 * Cheap pixel-sort approximation. Real pixel-sort needs a CPU pass; this
 * is a procedural fake — bright pixels (luma above `threshold`) are
 * stretched into horizontal bars by averaging samples taken to the left
 * over a short horizontal window. Reads as a hot-streak / VHS-tearing
 * artefact.
 *
 * At `intensity = 0` the shader returns the source verbatim — identity
 * by construction.
 */
export const pixelSort = defineEffect({
  name: "pixel-sort",
  defaults: {
    intensity: 0.6,
    threshold: 0.5,
  },
  glsl: `
uniform float uIntensity;
uniform float uThreshold;

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uIntensity <= 0.0) return src;
  float l = dot(src.rgb, vec3(0.299, 0.587, 0.114));
  if (l < uThreshold) return src;

  vec3 sum = vec3(0.0);
  const int SAMPLES = 12;
  for (int i = 0; i < SAMPLES; i++) {
    float t = float(i) / float(SAMPLES);
    sum += getSource(clamp(uv - vec2(t * 0.1, 0.0), 0.0, 1.0)).rgb;
  }
  vec3 stretched = sum / float(SAMPLES);
  return vec4(mix(src.rgb, stretched, uIntensity), src.a);
}
`,
});
