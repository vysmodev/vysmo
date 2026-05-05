import { defineTransition } from "./define.js";

export const push = defineTransition({
  name: "push",
  defaults: {
    direction: [1, 0],
  },
  glsl: `
uniform vec2 uDirection;

// Snap a direction vector to the nearest axis-aligned unit (Right/Left/Down/Up).
// Translation transitions only look right axis-aligned; diagonal inputs leave
// triangular gaps at corners. Snapping in-shader keeps the visual reliable
// regardless of caller input, so the UI's axis-only picker matches.
vec2 snapAxis(vec2 v) {
  vec2 d = normalize(v);
  return abs(d.x) > abs(d.y) ? vec2(sign(d.x), 0.0) : vec2(0.0, sign(d.y));
}

vec4 transition(vec2 uv) {
  vec2 d = snapAxis(uDirection);
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
