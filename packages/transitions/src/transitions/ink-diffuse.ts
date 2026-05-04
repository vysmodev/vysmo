import { defineTransition } from "./define.js";

/**
 * Multi-pass transition. A noise-seeded mask grows outward via iterated
 * dilation with an expanding kernel, producing an ink-in-water spread
 * that can't be computed in a single pass (each pixel has to read its
 * neighbours' mask values from the previous iteration).
 *
 *   pass 0               — seed the mask by thresholding a noise field
 *                          against progress. At progress 0 all zero;
 *                          at progress 1 all one; in between, a noisy
 *                          boundary seeded where noise ≈ progress.
 *   pass 1..passCount-2  — dilate the mask with an expanding kernel
 *                          (step doubles each pass: 1, 2, 4, 8, 16 px),
 *                          biased with a light smoothing so edges
 *                          stay organic.
 *   final pass           — use the diffused mask to mix from → to.
 *
 * Endpoints: seed saturates to 0 at progress 0 and 1 at progress 1
 * regardless of the noise field. Dilation is monotone on constants,
 * so the mask stays saturated through every pass, and the final
 * composition resolves to pure from / to.
 */
export const inkDiffuse = defineTransition({
  name: "ink-diffuse",
  passes: 7,
  defaults: {
    scale: 7,
    softness: 0.08,
  },
  glsl: `
uniform float uScale;
uniform float uSoftness;

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

vec4 transition(vec2 uv) {
  // Final pass: use the diffused mask to composite from/to.
  if (uPass == uPassCount - 1) {
    float mask = getPrevious(uv).r;
    return mix(getFromColor(uv), getToColor(uv), mask);
  }

  // Seed pass: threshold noise by progress. Clamped noise range
  // [0.05, 0.95] plus a soft edge guarantees the mask saturates to 0
  // at progress=0 and 1 at progress=1, for every pixel.
  if (uPass == 0) {
    float n = clamp(fbm(uv * uScale) * 0.9 + 0.05, 0.05, 0.95);
    float mask = smoothstep(n - uSoftness, n + uSoftness, uProgress);
    return vec4(mask, 0.0, 0.0, 1.0);
  }

  // Diffusion pass: expanding-kernel dilation blended with light
  // neighbour-averaging. Step doubles each pass for an effective
  // reach of ~2^(passCount-2) pixels by the last iteration.
  float step = pow(2.0, float(uPass - 1));
  vec2 px = vec2(step) / uResolution;
  float c = getPrevious(uv).r;
  float e = getPrevious(uv + vec2(px.x, 0.0)).r;
  float w = getPrevious(uv - vec2(px.x, 0.0)).r;
  float n = getPrevious(uv + vec2(0.0, px.y)).r;
  float s = getPrevious(uv - vec2(0.0, px.y)).r;

  float dilated = max(c, max(max(e, w), max(n, s)));
  float avg = (c + e + w + n + s) * 0.2;
  float nextMask = mix(dilated, avg, 0.3);

  return vec4(nextMask, 0.0, 0.0, 1.0);
}
`,
});
