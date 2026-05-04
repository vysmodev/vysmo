import { defineTransition } from "./define.js";

/**
 * Multi-pass transition. As to reveals through a noise mask, its
 * bright highlights emit volumetric-looking light shafts toward a
 * source point, built up by iterative radial blur — each pass samples
 * from the previous pass's output at progressively finer steps along
 * the ray from every pixel to the source. Impossible single-pass: a
 * full-length radial streak would need ~30 samples across the ray,
 * and after five iterations of 6 samples each, the shafts have
 * progressively-refined spatial frequencies that a one-pass sampling
 * of the source texture cannot produce.
 *
 *   pass 0               — seed: to-highlights gated by the reveal
 *                          mask AND a 4·p·(1-p) envelope.
 *   pass 1..passCount-2  — iterative radial blur. Pass i samples 6
 *                          points along uv→source at step = 1/(5 · 2^(i-1)),
 *                          reading from uPrevious so the shafts
 *                          accumulate across passes.
 *   final pass           — composite = mix(from, to, mask) +
 *                          rays * intensity.
 *
 * Endpoints: seed envelope is 0 at progress 0 and 1, so the blur
 * chain carries zeros and the composite resolves to pure from/to.
 */
export const godRaysReveal = defineTransition({
  name: "god-rays-reveal",
  passes: 7,
  defaults: {
    scale: 5,
    softness: 0.08,
    threshold: 0.45,
    intensity: 1.6,
    decay: 0.92,
    source: [0.5, 0.3],
  },
  glsl: `
uniform float uScale;
uniform float uSoftness;
uniform float uThreshold;
uniform float uIntensity;
uniform float uDecay;
uniform vec2 uSource;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  return valNoise(p) * 0.55 +
         valNoise(p * 2.1) * 0.28 +
         valNoise(p * 4.3) * 0.17;
}

float revealMask(vec2 uv) {
  float safeLow = uSoftness + 0.005;
  float safeHigh = 1.0 - uSoftness - 0.005;
  float n = mix(safeLow, safeHigh, clamp(fbm(uv * uScale), 0.0, 1.0));
  return smoothstep(n - uSoftness, n + uSoftness, uProgress);
}

vec4 transition(vec2 uv) {
  // Final pass: composite rays on top of the from→to reveal.
  if (uPass == uPassCount - 1) {
    vec3 rays = getPrevious(uv).rgb;
    float mask = revealMask(uv);
    vec3 base = mix(getFromColor(uv).rgb, getToColor(uv).rgb, mask);
    return vec4(base + rays * uIntensity, 1.0);
  }

  // Seed pass: bright highlights of to, gated by reveal mask and
  // a 4·p·(1-p) envelope so endpoints contribute zero.
  if (uPass == 0) {
    vec3 toC = getToColor(uv).rgb;
    float lum = dot(toC, vec3(0.299, 0.587, 0.114));
    float bright = smoothstep(uThreshold - 0.1, uThreshold + 0.1, lum);
    float mask = revealMask(uv);
    float envelope = 4.0 * uProgress * (1.0 - uProgress);
    return vec4(toC * bright * mask * envelope, 1.0);
  }

  // Iterative radial blur: each pass samples 6 points along uv→source
  // with step shrinking by 2× each pass. Over 5 passes, shafts span
  // the full ray with well-refined density.
  vec2 toSource = uSource - uv;
  float passStep = 1.0 / (5.0 * pow(2.0, float(uPass - 1)));

  vec3 accum = vec3(0.0);
  float weightSum = 0.0;
  for (int i = 0; i < 6; i++) {
    float t = passStep * float(i);
    float w = pow(uDecay, float(i));
    accum += getPrevious(uv + toSource * t).rgb * w;
    weightSum += w;
  }
  return vec4(accum / weightSum, 1.0);
}
`,
});
