import { defineTransition } from "./define.js";

/**
 * Faithful port of akella demo6 (the "planetary" transition). Reads a
 * displacement-map texture supplied via `RenderArgs.displacement` to drive
 * a per-pixel UV offset vector. From-image is displaced in the direction
 * `rotate(angle1) * dispVec * progress`; to-image is displaced in the
 * direction `rotate(angle2) * dispVec * (1-progress)`. The two opposing
 * angles produce the signature dual-flow akella aesthetic.
 *
 * The displacement is interpreted as centered: mid-gray (0.5) maps to
 * zero offset; channel-r drives the x-component, channel-g the y. This
 * differs from akella's raw [0,1] convention so the runner's default
 * mid-gray fallback degrades to a clean crossfade when no displacement
 * is supplied.
 */
export const flowWarp = defineTransition({
  name: "flow-warp",
  defaults: {
    intensity: 0.4,
    angle1: 0.7853982,
    angle2: -2.3561945,
  },
  glsl: `
uniform float uIntensity;
uniform float uAngle1;
uniform float uAngle2;

mat2 rotate2d(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

// Mirror-reflect UVs that have been pushed outside [0,1]. Each out-of-range
// pixel ends up sampling from a different in-bounds position, so heavy
// displacement reads as mirrored continuation of the image rather than the
// streaked edge-color rows you get from clamping. This makes the transition
// reliable at any intensity instead of needing an artificial cap.
vec2 mirrorUv(vec2 uv) {
  return abs(mod(uv + 1.0, 2.0) - 1.0);
}

vec4 transition(vec2 uv) {
  vec4 disp = getDisplacement(uv);
  // Centered convention: mid-gray = no displacement, range [-1, 1].
  vec2 dispVec = (disp.rg - 0.5) * 2.0;

  vec2 distorted1 = uv + rotate2d(uAngle1) * dispVec * uIntensity * uProgress;
  vec2 distorted2 = uv + rotate2d(uAngle2) * dispVec * uIntensity * (1.0 - uProgress);

  vec4 t1 = getFromColor(mirrorUv(distorted1));
  vec4 t2 = getToColor(mirrorUv(distorted2));

  return mix(t1, t2, uProgress);
}
`,
});
