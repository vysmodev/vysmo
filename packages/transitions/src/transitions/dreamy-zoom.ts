import { defineTransition } from "./define.js";

/**
 * Port of gl-transitions' DreamyZoom (Zeh Fernando, MIT). Phase 1 (p<0.5):
 * from-image zooms in + rotates by `rotation`, fading toward white. Phase 2
 * (p>0.5): white fades back to to-image starting pre-rotated by -`rotation`
 * and unwinding to identity while zooming out. The white flash at p=0.5
 * masks the from→to image swap.
 *
 * Note: the original gl-transitions source has a bug (`* vec4(0)`) that
 * disables the flash — fixed here to use white, matching the actual
 * preview on gl-transitions.com.
 *
 * `rotation` is in RADIANS; gl-transitions' 6° default ≈ 0.105 rad.
 */
export const dreamyZoom = defineTransition({
  name: "dreamy-zoom",
  defaults: {
    rotation: 0.105,
    scale: 1.2,
  },
  glsl: `
uniform float uRotation;
uniform float uScale;

vec4 transition(vec2 uv) {
  float ratio = uResolution.x / max(uResolution.y, 1.0);

  float phase = uProgress < 0.5 ? uProgress * 2.0 : (uProgress - 0.5) * 2.0;
  float angleOffset = uProgress < 0.5
    ? mix(0.0, uRotation, phase)
    : mix(-uRotation, 0.0, phase);
  float newScale = uProgress < 0.5
    ? mix(1.0, uScale, phase)
    : mix(uScale, 1.0, phase);

  vec2 p = (uv - vec2(0.5)) / newScale * vec2(ratio, 1.0);
  float angle = atan(p.y, p.x) + angleOffset;
  float dist = length(p);
  vec2 sampledP = vec2(
    cos(angle) * dist / ratio + 0.5,
    sin(angle) * dist + 0.5
  );

  vec4 c = uProgress < 0.5
    ? getFromColor(sampledP)
    : getToColor(sampledP);

  // White flash: zero at endpoints, peaks at midpoint to mask the swap.
  float flash = uProgress < 0.5 ? phase : 1.0 - phase;
  return vec4(c.rgb + flash, c.a);
}
`,
});
