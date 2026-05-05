import { defineTransition } from "./define.js";

/**
 * Port of gl-transitions' DreamyZoom (Zeh Fernando, MIT). Phase 1 (p<0.5):
 * from-image zooms in + rotates, fading toward white. Phase 2 (p>0.5):
 * white fades back to to-image starting pre-rotated and unwinding to
 * identity while zooming out. The white flash at p=0.5 masks the from→to
 * image swap.
 *
 * Note: the original gl-transitions source has a bug (`* vec4(0)`) that
 * disables the flash — fixed here to use white, matching the actual
 * preview on gl-transitions.com.
 *
 * Single `intensity` param drives both rotation and scale internally.
 * Rotation alone would push corners outside the canvas (visible edge-clamp
 * streaks); scale must compensate. Splitting them as separate params lets
 * the caller pick mismatched values that produce streaks. We map intensity
 * to (rotation, scale) along a curve where scale always covers rotation,
 * so any value in [0, 1] is visually safe.
 *
 * Default `intensity: 0.5` reproduces gl-transitions' defaults exactly
 * (rotation ≈ 0.105 rad / 6°, scale ≈ 1.2).
 */
export const dreamyZoom = defineTransition({
  name: "dreamy-zoom",
  defaults: {
    intensity: 0.5,
  },
  glsl: `
uniform float uIntensity;

vec4 transition(vec2 uv) {
  float ratio = uResolution.x / max(uResolution.y, 1.0);

  // Single knob, mapped to rotation + scale together. Coefficients chosen
  // so intensity=0.5 reproduces gl-transitions' (0.105 rad, 1.2) defaults.
  float intensity = clamp(uIntensity, 0.0, 1.0);
  float rotation = intensity * 0.21;
  float scale = 1.0 + intensity * 0.4;

  float phase = uProgress < 0.5 ? uProgress * 2.0 : (uProgress - 0.5) * 2.0;
  float angleOffset = uProgress < 0.5
    ? mix(0.0, rotation, phase)
    : mix(-rotation, 0.0, phase);
  float newScale = uProgress < 0.5
    ? mix(1.0, scale, phase)
    : mix(scale, 1.0, phase);

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
