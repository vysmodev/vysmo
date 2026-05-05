import { defineTransition } from "./define.js";

/**
 * Linear film-burn sibling: a warm-glowing fire line advances across the
 * frame from one edge, like a sparkler running along a fuse. Distinct
 * from light-leak (smooth colored band passing through) — this is a
 * state-change front: unburned ahead, reveal behind, hot glow ON the
 * line.
 */
export const directionalBurn = defineTransition({
  name: "directional-burn",
  defaults: {
    direction: [1, 0],
    scale: 10,
    edgeWidth: 0.035,
    flameColor: [1.6, 0.7, 0.15],
  },
  glsl: `
uniform vec2 uDirection;
uniform float uScale;
uniform float uEdgeWidth;
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
  vec2 d = normalize(uDirection);
  float projected = dot(uv - 0.5, -d);
  // Max projection magnitude for any uv in [0,1]^2 given this direction;
  // L1 formula that works for axis-aligned and diagonal directions alike.
  float maxProj = 0.5 * (abs(d.x) + abs(d.y));

  float noiseStrength = 0.06;
  float n = valueNoise(uv * uScale);
  float perturbed = projected - (n - 0.5) * noiseStrength;

  float totalEdge = uEdgeWidth + noiseStrength * 0.5;
  float boundary = (maxProj + totalEdge) * (1.0 - 2.0 * uProgress);
  float signedDist = perturbed - boundary;

  // Behind the front: reveal "to". Ahead: still "from".
  float w = smoothstep(-uEdgeWidth, uEdgeWidth, signedDist);
  vec4 base = mix(getFromColor(uv), getToColor(uv), w);

  // Tight flame band centered on the front, env-gated to zero at endpoints.
  float bandX = signedDist / max(uEdgeWidth * 1.3, 0.0001);
  float flameBand = exp(-bandX * bandX * 3.5);
  float env = 4.0 * uProgress * (1.0 - uProgress);
  vec3 flame = uFlameColor * flameBand * env;

  return vec4(base.rgb + flame, base.a);
}
`,
});
