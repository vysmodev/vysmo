import { defineTransition } from "./define.js";

/**
 * Ink-like directional bleed: a dominant gradient sweeps across, with noise
 * perturbing the wavefront edge so it feels organic (watercolor / ink on
 * paper) rather than a clean wipe or a uniform dissolve.
 */
export const paintBleed = defineTransition({
  name: "paint-bleed",
  defaults: {
    direction: [-1, 0],
    scale: 10,
    softness: 0.02,
    noiseStrength: 0.35,
  },
  glsl: `
uniform vec2 uDirection;
uniform float uScale;
uniform float uSoftness;
uniform float uNoiseStrength;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec4 transition(vec2 uv) {
  vec2 d = normalize(uDirection);
  // Max |dot(uv - 0.5, -d)| over uv ∈ [0,1]² is (|dx| + |dy|) * 0.5.
  // Without dividing by it, gradient extends beyond [0, 1] for diagonal
  // directions and the threshold-based smoothstep can't fully reveal the
  // corners at progress=1 — leaving a sliver of the previous image.
  float maxProj = max((abs(d.x) + abs(d.y)) * 0.5, 0.0001);
  float gradient = 0.5 + dot(uv - 0.5, -d) / (2.0 * maxProj);

  // Noise only perturbs the wavefront edge, not the overall progression.
  float perturbation = (valueNoise(uv * uScale) - 0.5) * uNoiseStrength;
  float fieldValue = gradient + perturbation;

  // Extend threshold range to accommodate noise extrema → endpoints stay clean.
  float noiseRange = uNoiseStrength * 0.5;
  float totalEdge = uSoftness + noiseRange;
  float threshold = uProgress * (1.0 + 2.0 * totalEdge) - totalEdge;
  float w = smoothstep(threshold - uSoftness, threshold + uSoftness, fieldValue);

  return mix(getToColor(uv), getFromColor(uv), w);
}
`,
});
