import { defineTransition } from "./define.js";

/**
 * Cinematic film-burn reveal: an irregular hot-edged hole expands from a
 * center point, eating through `from` to reveal `to` beneath. The burn
 * front glows with a warm flame color that fades at the endpoints.
 *
 * Optional `chroma` param adds a radial RGB split concentrated at the
 * advancing edge — set `flameColor` to a cool triplet (e.g. [1.2, 1.6, 2.5]
 * "Electric") and `chroma > 0` for an electric / plasma-style vibe.
 */
export const filmBurn = defineTransition({
  name: "film-burn",
  defaults: {
    center: [0.5, 0.5],
    scale: 6,
    edgeWidth: 0.05,
    chroma: 0,
    flameColor: [1.6, 0.7, 0.15],
  },
  glsl: `
uniform vec2 uCenter;
uniform float uScale;
uniform float uEdgeWidth;
uniform float uChroma;
uniform vec3 uFlameColor;

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
  // Aspect-correct radial distance from center, normalized to [0,1] by the
  // farthest canvas corner (matches the shape-reveal pattern).
  vec2 pixel = uv * uResolution;
  vec2 centerPx = uCenter * uResolution;
  float dist = distance(pixel, centerPx);
  float maxDist = max(
    max(length(centerPx), length(centerPx - vec2(uResolution.x, 0.0))),
    max(length(centerPx - vec2(0.0, uResolution.y)), length(centerPx - uResolution))
  );
  float normalizedDist = dist / max(maxDist, 0.0001);

  // Noise pushes the burn edge organically off a perfect circle.
  float noiseStrength = 0.15;
  float n = valueNoise(uv * uScale);
  float perturbed = normalizedDist - (n - 0.5) * noiseStrength;

  // Extend the threshold sweep so the full edgeWidth + noise half-range is
  // beyond the valid [0,1] normalized-distance band at each endpoint.
  float totalEdge = uEdgeWidth + noiseStrength * 0.5;
  float burnRadius = uProgress * (1.0 + 2.0 * totalEdge) - totalEdge;
  float signedDist = perturbed - burnRadius;

  // Inside the burn: show to. Outside: show from.
  float w = smoothstep(-uEdgeWidth, uEdgeWidth, -signedDist);
  float env = 4.0 * uProgress * (1.0 - uProgress);

  // Optional radial chromatic aberration concentrated at the burn edge.
  // chroma=0 → no split; sample once and mix normally. chroma>0 → split
  // R/B along the radial direction with edge-proximity Gaussian falloff.
  vec3 baseRGB;
  if (uChroma > 0.0001) {
    float edgeX = signedDist / max(uEdgeWidth * 2.0, 0.0001);
    float edgeProximity = exp(-edgeX * edgeX * 2.0);
    float chromaStrength = env * edgeProximity * uChroma;

    vec2 toCenter = uv - uCenter;
    float r = length(toCenter);
    vec2 dir = r > 0.0001 ? toCenter / r : vec2(1.0, 0.0);
    vec2 offR = clamp(uv - dir * chromaStrength, 0.0, 1.0);
    vec2 offB = clamp(uv + dir * chromaStrength, 0.0, 1.0);

    vec3 fromRGB = vec3(getFromColor(offR).r, getFromColor(uv).g, getFromColor(offB).b);
    vec3 toRGB = vec3(getToColor(offR).r, getToColor(uv).g, getToColor(offB).b);
    baseRGB = mix(fromRGB, toRGB, w);
  } else {
    baseRGB = mix(getFromColor(uv).rgb, getToColor(uv).rgb, w);
  }

  // Flame glow: tight Gaussian band at the burn edge, env-gated to zero
  // at both endpoints.
  float bandX = signedDist / max(uEdgeWidth * 1.5, 0.0001);
  float flameBand = exp(-bandX * bandX * 3.0);
  vec3 flame = uFlameColor * flameBand * env;

  return vec4(baseRGB + flame, 1.0);
}
`,
});
