import { defineEffect } from "../define.js";

/**
 * Simplified Kuwahara filter — for each pixel, compute the mean colour
 * and luma variance over four overlapping quadrants of a `radius × radius`
 * neighbourhood, then output the mean of the lowest-variance quadrant.
 * Produces a painterly, edge-preserving smoothing that resembles oil
 * brushstrokes.
 *
 * `radius` is capped at 6 px to keep the inner double-loop tractable in
 * a fragment shader. At `radius = 0` the shader returns the source
 * verbatim — identity by construction.
 */
export const oilPaint = defineEffect({
  name: "oil-paint",
  defaults: {
    radius: 3,
  },
  glsl: `
uniform float uRadius;

void kuwaharaQuadrant(
  vec2 uv, vec2 texel, float R, vec2 sgn,
  out vec3 mean, out float variance
) {
  vec3 sum = vec3(0.0);
  float sumL = 0.0;
  float sumLL = 0.0;
  float n = 0.0;
  for (int j = 0; j <= 6; j++) {
    if (float(j) > R) break;
    for (int i = 0; i <= 6; i++) {
      if (float(i) > R) break;
      vec2 off = vec2(float(i) * sgn.x, float(j) * sgn.y) * texel;
      vec3 c = getSource(clamp(uv + off, 0.0, 1.0)).rgb;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      sum += c;
      sumL += l;
      sumLL += l * l;
      n += 1.0;
    }
  }
  mean = sum / max(n, 1.0);
  float mL = sumL / max(n, 1.0);
  variance = max(sumLL / max(n, 1.0) - mL * mL, 0.0);
}

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uRadius <= 0.0) return src;

  float R = min(uRadius, 6.0);
  vec2 texel = 1.0 / uResolution;

  vec3 m0; float v0; kuwaharaQuadrant(uv, texel, R, vec2(-1.0, -1.0), m0, v0);
  vec3 m1; float v1; kuwaharaQuadrant(uv, texel, R, vec2( 1.0, -1.0), m1, v1);
  vec3 m2; float v2; kuwaharaQuadrant(uv, texel, R, vec2(-1.0,  1.0), m2, v2);
  vec3 m3; float v3; kuwaharaQuadrant(uv, texel, R, vec2( 1.0,  1.0), m3, v3);

  vec3 best = m0; float bv = v0;
  if (v1 < bv) { best = m1; bv = v1; }
  if (v2 < bv) { best = m2; bv = v2; }
  if (v3 < bv) { best = m3; bv = v3; }
  return vec4(best, src.a);
}
`,
});
