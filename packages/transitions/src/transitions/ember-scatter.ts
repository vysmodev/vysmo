import { defineTransition } from "./define.js";

/**
 * Multi-point film-burn: a jittered grid of ignition points each expand
 * outward with their own warm flame glow, merging as they meet to cover
 * the frame. Per-ember staggered start times so different burns are at
 * different phases.
 *
 * Locality invariant (to avoid cell-boundary rectangles): effective max
 * reach of any ember = maxRadius + edgeWidth + noiseStrength, and this
 * MUST stay under the distance to the nearest cell outside the search
 * window (= (window_half-1) / uCount uv-units). With a 7x7 window that
 * nearest-outside distance is 3/uCount, so `maxRadius = 1.6/uCount` plus
 * edgeWidth=0.04 plus noiseStrength=0.06 gives reach = 1.6/uCount + 0.1,
 * which stays below 3/uCount for uCount ≤ 12 (slider's max).
 */
export const emberScatter = defineTransition({
  name: "ember-scatter",
  defaults: {
    count: 5,
    scale: 8,
    edgeWidth: 0.04,
    stagger: 0.35,
    flameColor: [1.6, 0.7, 0.15],
  },
  glsl: `
uniform float uCount;
uniform float uScale;
uniform float uEdgeWidth;
uniform float uStagger;
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
  float noiseStrength = 0.06;
  float n = valueNoise(uv * uScale);
  float noiseOffset = (n - 0.5) * noiseStrength;
  float totalEdge = uEdgeWidth + noiseStrength * 0.5;
  float maxRadius = 1.6 / max(uCount, 1.0);

  vec2 gridPos = uv * uCount;
  vec2 gridCell = floor(gridPos);

  float bestSignedDist = 100.0;
  for (int dy = -3; dy <= 3; dy++) {
    for (int dx = -3; dx <= 3; dx++) {
      vec2 neighborCell = gridCell + vec2(float(dx), float(dy));
      vec2 jitter = vec2(
        hash21(neighborCell + vec2(3.14, 0.0)),
        hash21(neighborCell + vec2(0.0, 2.71))
      );
      vec2 emberUv = (neighborCell + jitter) / max(uCount, 1.0);

      float emberStart = hash21(neighborCell + vec2(5.55, 5.55)) * uStagger;
      float localP = clamp(
        (uProgress - emberStart) / max(1.0 - uStagger, 0.0001),
        0.0, 1.0
      );

      float d = distance(uv, emberUv);
      float perturbed = d - noiseOffset;
      float burnRadius = localP * (maxRadius + 2.0 * totalEdge) - totalEdge;
      float signedDist = perturbed - burnRadius;

      bestSignedDist = min(bestSignedDist, signedDist);
    }
  }

  float w = smoothstep(-uEdgeWidth, uEdgeWidth, -bestSignedDist);
  vec4 base = mix(getFromColor(uv), getToColor(uv), w);

  float bandX = bestSignedDist / max(uEdgeWidth * 1.5, 0.0001);
  float flameBand = exp(-bandX * bandX * 3.0);
  float env = 4.0 * uProgress * (1.0 - uProgress);
  vec3 flame = uFlameColor * flameBand * env;

  return vec4(base.rgb + flame, base.a);
}
`,
});
