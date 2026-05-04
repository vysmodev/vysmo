/**
 * Shared GLSL snippet for a separable Gaussian blur along an axis.
 *
 * The snippet defines `_gaussianBlurAxis(uv, axis, radius)` which returns
 * a weighted average of 49 samples spaced at `radius / 24` texels along
 * the supplied axis. Sigma is `radius/3` (3-sigma coverage).
 *
 * Callers MUST `#define _blurSample(uv)` before `${GAUSSIAN_BLUR_AXIS_GLSL}`
 * is emitted. That macro decides which texture to sample:
 *
 *   // Blur reads source on the H pass and previous on the V pass:
 *   #define _blurSample(uv) (uPass == 0 ? getSource(uv) : getPrevious(uv))
 *
 *   // Bloom / glow always read the previous pass during blur passes:
 *   #define _blurSample(uv) getPrevious(uv)
 *
 * The 49-tap kernel width is the quality ceiling for this primitive. At
 * `radius > 48` the step between taps exceeds 2 texels and minor banding
 * reappears; a downsample pyramid (not yet implemented) would fix it.
 */
export const GAUSSIAN_BLUR_AXIS_GLSL = `
vec4 _gaussianBlurAxis(vec2 uv, vec2 axis, float radius) {
  vec2 texel = 1.0 / uResolution;
  float sigma = max(radius / 3.0, 0.5);
  float twoSigmaSq = 2.0 * sigma * sigma;
  const int HALF = 24;
  vec4 sum = vec4(0.0);
  float totalWeight = 0.0;
  for (int i = -HALF; i <= HALF; i++) {
    float offset = float(i);
    float w = exp(-(offset * offset) / twoSigmaSq);
    vec2 sampleUv = uv + axis * texel * offset * (radius / float(HALF));
    sum += _blurSample(sampleUv) * w;
    totalWeight += w;
  }
  return sum / totalWeight;
}
`;
