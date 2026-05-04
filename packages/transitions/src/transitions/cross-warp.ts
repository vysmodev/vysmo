import { defineTransition } from "./define.js";

/**
 * Ported from gl-transitions' crosswarp. The "from" image shrinks toward
 * center while "to" grows out from center, driven by a sweeping wavefront
 * along a user-chosen direction.
 */
export const crossWarp = defineTransition({
  name: "cross-warp",
  defaults: {
    direction: [1, 0],
    smoothness: 0.5,
  },
  glsl: `
uniform vec2 uDirection;
uniform float uSmoothness;

vec4 transition(vec2 uv) {
  vec2 d = normalize(uDirection);
  // Scale by maxProj so the boundary sweeps cleanly off-screen at the
  // endpoints for diagonal directions. See paint-bleed.ts for the
  // canonical write-up of this fix.
  float maxProj = max((abs(d.x) + abs(d.y)) * 0.5, 0.0001);
  float projected = dot(uv - 0.5, -d);
  float boundary = (maxProj + uSmoothness) * (1.0 - 2.0 * uProgress);
  float w = smoothstep(boundary - uSmoothness, boundary + uSmoothness, projected);

  // Elastic scaling: from shrinks to center as w→1, to grows from center as w→1.
  vec2 fromUv = (uv - 0.5) * (1.0 - w) + 0.5;
  vec2 toUv = (uv - 0.5) * w + 0.5;

  return mix(getFromColor(clamp(fromUv, 0.0, 1.0)),
             getToColor(clamp(toUv, 0.0, 1.0)),
             w);
}
`,
});
