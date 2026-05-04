import { defineTransition } from "./define.js";

/**
 * Ported from gl-transitions' Dreamy. A gentle vertical wobble displaces
 * both images with opposing phases; combined with the linear crossfade this
 * gives a soft, hypnotic "dream" feel. Procedural, no displacement texture
 * required.
 */
export const dreamy = defineTransition({
  name: "dreamy",
  defaults: {},
  glsl: `
vec2 dreamyOffset(float progress, float x, float theta) {
  float shifty = 0.03 * progress * cos(10.0 * (progress + x) + theta);
  return vec2(0.0, shifty);
}

vec4 transition(vec2 uv) {
  return mix(
    getFromColor(uv + dreamyOffset(uProgress, uv.x, 0.0)),
    getToColor(uv + dreamyOffset(1.0 - uProgress, uv.x, 3.14159)),
    uProgress
  );
}
`,
});
