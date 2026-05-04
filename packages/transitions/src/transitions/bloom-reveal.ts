import { defineTransition } from "./define.js";

/**
 * Multi-pass transition. As a noise-masked reveal of to emerges, its
 * bright highlights bloom outward with big cinematic halos impossible
 * in a single pass — the blur radius grows to ~32 pixels via five
 * doubling-step iterations (1, 2, 4, 8, 16 px), which would need
 * ~65² samples single-pass.
 *
 *   pass 0               — extract to-highlights gated by the reveal
 *                          mask AND a 4·p·(1-p) envelope that zeroes
 *                          at both endpoints.
 *   pass 1..passCount-2  — expanding-step 9-tap box blur, doubling
 *                          radius each iteration.
 *   final pass           — composite: base = mix(from, to, mask), then
 *                          add the blurred bloom scaled by intensity.
 *
 * Endpoints: the bloom envelope is zero at progress 0 and 1, so all
 * intermediate passes carry zeros and the composite is pure from/to.
 * Noise is remapped to [softness+safety, 1-softness-safety] so the
 * reveal-mask smoothstep saturates cleanly at progress 0 and 1.
 */
export const bloomReveal = defineTransition({
  name: "bloom-reveal",
  passes: 7,
  defaults: {
    scale: 5,
    softness: 0.08,
    threshold: 0.55,
    intensity: 3.0,
  },
  glsl: `
uniform float uScale;
uniform float uSoftness;
uniform float uThreshold;
uniform float uIntensity;

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
  // Safe noise bounds guarantee the mask smoothstep saturates to 0 at
  // progress=0 and 1 at progress=1 regardless of where the noise lands.
  float safeLow = uSoftness + 0.005;
  float safeHigh = 1.0 - uSoftness - 0.005;
  float n = mix(safeLow, safeHigh, clamp(fbm(uv * uScale), 0.0, 1.0));
  return smoothstep(n - uSoftness, n + uSoftness, uProgress);
}

vec4 transition(vec2 uv) {
  // Final pass: composite bloom on top of the from→to reveal.
  if (uPass == uPassCount - 1) {
    vec3 bloom = getPrevious(uv).rgb;
    float mask = revealMask(uv);
    vec3 base = mix(getFromColor(uv).rgb, getToColor(uv).rgb, mask);
    return vec4(base + bloom * uIntensity, 1.0);
  }

  // Seed: bloom contribution = to_color * (brightness_mask) * reveal
  // * envelope. Envelope vanishes at progress 0/1 → clean endpoints.
  if (uPass == 0) {
    float mask = revealMask(uv);
    vec3 toColor = getToColor(uv).rgb;
    float lum = dot(toColor, vec3(0.299, 0.587, 0.114));
    float brightness = smoothstep(uThreshold - 0.1, uThreshold + 0.1, lum);
    float envelope = 4.0 * uProgress * (1.0 - uProgress);
    vec3 bloom = toColor * brightness * mask * envelope;
    return vec4(bloom, 1.0);
  }

  // Blur: 9-tap box blur with an expanding step so the effective
  // radius doubles each pass. After 5 blur passes, reach is ~32 px.
  float step = pow(2.0, float(uPass - 1));
  vec2 px = vec2(step) / uResolution;
  vec3 sum = vec3(0.0);
  sum += getPrevious(uv + vec2(-px.x, -px.y)).rgb;
  sum += getPrevious(uv + vec2(0.0, -px.y)).rgb;
  sum += getPrevious(uv + vec2(px.x, -px.y)).rgb;
  sum += getPrevious(uv + vec2(-px.x, 0.0)).rgb;
  sum += getPrevious(uv).rgb;
  sum += getPrevious(uv + vec2(px.x, 0.0)).rgb;
  sum += getPrevious(uv + vec2(-px.x, px.y)).rgb;
  sum += getPrevious(uv + vec2(0.0, px.y)).rgb;
  sum += getPrevious(uv + vec2(px.x, px.y)).rgb;
  return vec4(sum / 9.0, 1.0);
}
`,
});
