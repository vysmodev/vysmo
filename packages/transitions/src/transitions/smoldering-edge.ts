import { defineTransition } from "./define.js";

/**
 * Linear burn with a smoldering trail: heavy low-frequency noise produces
 * finger-like tendrils of fire reaching ahead of the main front, while
 * an amber trail behind the front decays over `trailLength`. Evokes
 * paper burning or a slow wildfire advancing, vs. directional-burn's
 * sharper fuse-line aesthetic.
 */
export const smolderingEdge = defineTransition({
  name: "smoldering-edge",
  defaults: {
    direction: [1, 1],
    scale: 3,
    edgeWidth: 0.04,
    trailLength: 0.18,
    emberColor: [1.4, 0.5, 0.1],
  },
  glsl: `
uniform vec2 uDirection;
uniform float uScale;
uniform float uEdgeWidth;
uniform float uTrailLength;
uniform vec3 uEmberColor;

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
  float projected = dot(uv - 0.5, -d);
  float maxProj = 0.5 * (abs(d.x) + abs(d.y));

  // Heavy low-frequency noise for tendril-like edge deformation.
  float noiseStrength = 0.25;
  float n = valueNoise(uv * uScale);
  float perturbed = projected - (n - 0.5) * noiseStrength;

  float totalEdge = uEdgeWidth + noiseStrength * 0.5;
  float boundary = (maxProj + totalEdge) * (1.0 - 2.0 * uProgress);
  float signedDist = perturbed - boundary;

  float w = smoothstep(-uEdgeWidth, uEdgeWidth, signedDist);
  vec4 base = mix(getFromColor(uv), getToColor(uv), w);

  // Front band: tight Gaussian on the advancing line.
  float bandX = signedDist / max(uEdgeWidth * 1.5, 0.0001);
  float frontBand = exp(-bandX * bandX * 3.0);
  // Trail: only behind the front (signedDist > 0 = already burned side),
  // exponential decay with distance from the front.
  float trail = max(signedDist, 0.0);
  float trailGlow = exp(-trail / max(uTrailLength, 0.0001));
  float trailMask = step(0.0, signedDist);

  float glow = max(frontBand, trailGlow * trailMask * 0.55);
  float env = 4.0 * uProgress * (1.0 - uProgress);
  vec3 ember = uEmberColor * glow * env;

  return vec4(base.rgb + ember, base.a);
}
`,
});
