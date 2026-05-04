import { defineTransition } from "./define.js";

/**
 * Inspired by akella demo3 (made procedural — original used a baked
 * displacement-map texture that we don't yet support). Circular reveal
 * with a noise-perturbed edge AND bidirectional zoom: from-image shrinks
 * to center while to-image grows from center. Sibling to film-burn but
 * without the flame glow and with the akella zoom-shift on top.
 */
export const irisZoom = defineTransition({
  name: "iris-zoom",
  defaults: {
    center: [0.5, 0.5],
    width: 0.08,
    scale: 8,
  },
  glsl: `
uniform vec2 uCenter;
uniform float uWidth;
uniform float uScale;

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
  // Aspect-correct distance from the iris center, normalized to [0,1] by
  // the farthest canvas corner.
  vec2 pixel = uv * uResolution;
  vec2 centerPx = uCenter * uResolution;
  float dist = distance(pixel, centerPx);
  float maxDist = max(
    max(length(centerPx), length(centerPx - vec2(uResolution.x, 0.0))),
    max(length(centerPx - vec2(0.0, uResolution.y)), length(centerPx - uResolution))
  );
  float normalizedDist = dist / max(maxDist, 0.0001);

  float noiseStrength = 0.12;
  float n = valueNoise(uv * uScale);
  float perturbed = normalizedDist - (n - 0.5) * noiseStrength;

  float totalEdge = uWidth + noiseStrength * 0.5;
  float radius = uProgress * (1.0 + 2.0 * totalEdge) - totalEdge;
  float signedDist = perturbed - radius;

  // intpl: 0 = unburned (from), 1 = revealed (to).
  float intpl = 1.0 - smoothstep(-uWidth, uWidth, signedDist);

  // Bidirectional zoom: from shrinks to center, to grows from center.
  vec2 fromUv = clamp((uv - 0.5) * (1.0 - intpl) + 0.5, 0.0, 1.0);
  vec2 toUv = clamp((uv - 0.5) * intpl + 0.5, 0.0, 1.0);

  return mix(getFromColor(fromUv), getToColor(toUv), intpl);
}
`,
});
