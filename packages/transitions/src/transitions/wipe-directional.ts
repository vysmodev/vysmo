import { defineTransition } from "./define.js";

export const wipeDirectional = defineTransition({
  name: "wipe-directional",
  defaults: {
    angle: 0,
    softness: 0.05,
  },
  glsl: `
uniform float uAngle;
uniform float uSoftness;

vec4 transition(vec2 uv) {
  vec2 dir = vec2(cos(uAngle), sin(uAngle));
  // Normalize the projection by max |dot(uv-0.5, dir)| = (|dx|+|dy|)/2 so
  // gradient ∈ [0, 1] for any angle (axis-aligned or diagonal). Without
  // this, diagonal angles leave corner slivers of the previous image at
  // progress=1.
  float maxProj = max((abs(dir.x) + abs(dir.y)) * 0.5, 0.0001);
  float p = 0.5 + dot(uv - 0.5, dir) / (2.0 * maxProj);
  float reveal = uProgress * (1.0 + uSoftness);
  float m = smoothstep(reveal - uSoftness, reveal, p);
  return mix(getToColor(uv), getFromColor(uv), m);
}
`,
});
