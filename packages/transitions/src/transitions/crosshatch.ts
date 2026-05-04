import { defineTransition } from "./define.js";

/**
 * Port of gl-transitions' CrossHatch. Pixels reveal based on an outer
 * radial wave from `center` combined with per-row and per-column random
 * thresholds, producing a sketchy hand-drawn crosshatch reveal. Outer
 * smoothstep envelopes guarantee pixel-pure endpoints.
 */
export const crosshatch = defineTransition({
  name: "crosshatch",
  defaults: {
    center: [0.5, 0.5],
    threshold: 3,
    fadeEdge: 0.1,
  },
  glsl: `
uniform vec2 uCenter;
uniform float uThreshold;
uniform float uFadeEdge;

float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 transition(vec2 uv) {
  float dist = distance(uCenter, uv) / max(uThreshold, 0.001);
  float r = uProgress - min(rand(vec2(uv.y, 0.0)), rand(vec2(0.0, uv.x)));

  float feather = 0.02;
  float inner = smoothstep(dist - feather, dist + feather, r);

  // Outer mix structure (from gl-transitions): no reveal until uFadeEdge,
  // forced full reveal in last uFadeEdge of progress — guarantees clean
  // endpoints regardless of the random threshold's noisiness.
  float w = mix(
    0.0,
    mix(inner, 1.0, smoothstep(1.0 - uFadeEdge, 1.0, uProgress)),
    smoothstep(0.0, uFadeEdge, uProgress)
  );

  return mix(getFromColor(uv), getToColor(uv), w);
}
`,
});
