import { defineEffect } from "../define.js";

/**
 * Sinusoidal UV displacement — pixels are shifted along `axis` by a sine
 * wave whose phase is driven by the orthogonal projection of UV. The
 * result is a rolling-ribbon distortion. `phase` is animatable for a
 * scrolling wave.
 *
 * `amplitude` is the peak displacement in pixels. `frequency` is in
 * cycles across the full UV range. At `amplitude = 0` the shader
 * returns the source verbatim — identity by construction.
 */
export const wave = defineEffect({
  name: "wave",
  defaults: {
    amplitude: 8,
    frequency: 4,
    axis: [0, 1] as const,
    phase: 0,
  },
  glsl: `
uniform float uAmplitude;
uniform float uFrequency;
uniform vec2 uAxis;
uniform float uPhase;

vec4 effect(vec2 uv) {
  if (uAmplitude <= 0.0) return getSource(uv);

  vec2 axis = uAxis;
  float mag = length(axis);
  if (mag < 0.0001) return getSource(uv);
  axis /= mag;

  vec2 perp = vec2(-axis.y, axis.x);
  float drive = dot(uv, perp) * uFrequency * 6.28318530 + uPhase;
  vec2 offset = axis * sin(drive) * uAmplitude / uResolution;
  return getSource(clamp(uv + offset, 0.0, 1.0));
}
`,
});
