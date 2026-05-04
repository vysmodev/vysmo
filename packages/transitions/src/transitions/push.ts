import { defineTransition } from "./define.js";

export const push = defineTransition({
  name: "push",
  defaults: {
    direction: [1, 0],
  },
  glsl: `
uniform vec2 uDirection;

vec4 transition(vec2 uv) {
  vec2 d = normalize(uDirection);
  // Both images scroll together in direction -d over time.
  // At progress=0: from fills the frame; to is at +d offset (off-screen).
  // At progress=1: to fills the frame; from is at -d offset (off-screen).
  vec2 fromUv = uv + d * uProgress;
  vec2 toUv = uv - d * (1.0 - uProgress);

  bool fromVisible = fromUv.x >= 0.0 && fromUv.x <= 1.0
                  && fromUv.y >= 0.0 && fromUv.y <= 1.0;
  if (fromVisible) return getFromColor(fromUv);
  return getToColor(toUv);
}
`,
});
