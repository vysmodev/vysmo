import { defineTransition } from "./define.js";

/**
 * Cold fluid sibling to film-burn: a radial bloom expands from a center
 * point with a dark deeply-tinted ring at the advancing boundary instead
 * of a bright flame. Feels like ink diffusing through water. The ink
 * color tint is multiplicative (darkens toward uInkColor) rather than
 * additive bright glow.
 */
export const inkBloom = defineTransition({
  name: "ink-bloom",
  defaults: {
    center: [0.5, 0.5],
    scale: 5,
    edgeWidth: 0.07,
    bloomWidth: 0.12,
    inkColor: [0.25, 0.08, 0.45],
  },
  glsl: `
uniform vec2 uCenter;
uniform float uScale;
uniform float uEdgeWidth;
uniform float uBloomWidth;
uniform vec3 uInkColor;

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
  vec2 pixel = uv * uResolution;
  vec2 centerPx = uCenter * uResolution;
  float dist = distance(pixel, centerPx);
  float maxDist = max(
    max(length(centerPx), length(centerPx - vec2(uResolution.x, 0.0))),
    max(length(centerPx - vec2(0.0, uResolution.y)), length(centerPx - uResolution))
  );
  float normalizedDist = dist / max(maxDist, 0.0001);

  // Soft/low-frequency noise for fluid-like edge deformation.
  float noiseStrength = 0.18;
  float n = valueNoise(uv * uScale);
  float perturbed = normalizedDist - (n - 0.5) * noiseStrength;

  float totalEdge = uEdgeWidth + noiseStrength * 0.5;
  float bloomRadius = uProgress * (1.0 + 2.0 * totalEdge) - totalEdge;
  float signedDist = perturbed - bloomRadius;

  float w = smoothstep(-uEdgeWidth, uEdgeWidth, -signedDist);
  vec4 base = mix(getFromColor(uv), getToColor(uv), w);

  // Wide dark bloom band — uBloomWidth controls how far the tint diffuses
  // off the hard edge. env-gated so endpoints remain untouched.
  float bandX = signedDist / max(uBloomWidth, 0.0001);
  float bloomBand = exp(-bandX * bandX * 1.5);
  float env = 4.0 * uProgress * (1.0 - uProgress);
  float tint = bloomBand * env * 0.85;

  vec3 darkened = base.rgb * uInkColor;
  vec3 result = mix(base.rgb, darkened, tint);

  return vec4(result, base.a);
}
`,
});
