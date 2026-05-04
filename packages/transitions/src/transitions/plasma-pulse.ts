import { defineTransition } from "./define.js";

/**
 * Electric sibling to film-burn: expanding ring with a bright white-blue
 * plasma core + radial chromatic aberration concentrated at the advancing
 * edge. Lightning-like turbulence (layered noise) for the electric feel.
 */
export const plasmaPulse = defineTransition({
  name: "plasma-pulse",
  defaults: {
    center: [0.5, 0.5],
    scale: 8,
    edgeWidth: 0.04,
    chroma: 0.012,
    plasmaColor: [1.2, 1.6, 2.5],
  },
  glsl: `
uniform vec2 uCenter;
uniform float uScale;
uniform float uEdgeWidth;
uniform float uChroma;
uniform vec3 uPlasmaColor;

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

  // Layered noise: fast turbulence + slow drift → electric flicker feel.
  float noiseStrength = 0.06;
  float n = valueNoise(uv * uScale) * 0.6 + valueNoise(uv * uScale * 2.3) * 0.4;
  float perturbed = normalizedDist - (n - 0.5) * noiseStrength;

  float totalEdge = uEdgeWidth + noiseStrength * 0.5;
  float plasmaRadius = uProgress * (1.0 + 2.0 * totalEdge) - totalEdge;
  float signedDist = perturbed - plasmaRadius;

  float w = smoothstep(-uEdgeWidth, uEdgeWidth, -signedDist);

  // Radial chromatic aberration concentrated at the edge, env-gated.
  float env = 4.0 * uProgress * (1.0 - uProgress);
  float edgeX = signedDist / max(uEdgeWidth * 2.0, 0.0001);
  float edgeProximity = exp(-edgeX * edgeX * 2.0);
  float chromaStrength = env * edgeProximity * uChroma;

  vec2 toCenter = uv - uCenter;
  float r = length(toCenter);
  vec2 dir = r > 0.0001 ? toCenter / r : vec2(1.0, 0.0);
  vec2 offR = clamp(uv - dir * chromaStrength, 0.0, 1.0);
  vec2 offB = clamp(uv + dir * chromaStrength, 0.0, 1.0);

  vec3 fromRGB = vec3(
    getFromColor(offR).r,
    getFromColor(uv).g,
    getFromColor(offB).b
  );
  vec3 toRGB = vec3(
    getToColor(offR).r,
    getToColor(uv).g,
    getToColor(offB).b
  );
  vec3 base = mix(fromRGB, toRGB, w);

  // Plasma core: tight bright band at the ring, env-gated.
  float plasmaX = signedDist / max(uEdgeWidth * 1.2, 0.0001);
  float plasmaBand = exp(-plasmaX * plasmaX * 4.0);
  vec3 plasma = uPlasmaColor * plasmaBand * env;

  return vec4(base + plasma, 1.0);
}
`,
});
