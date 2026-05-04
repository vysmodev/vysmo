import { defineTransition } from "./define.js";

/**
 * Polar-coordinate portal. A circular reveal front sweeps from the centre
 * outward, and around the front a narrow radial band swirls + magnifies
 * the sampled content to evoke a tunnel mouth. Swirl and magnification
 * fall off both radially (gaussian band around the reveal front) and
 * temporally (zero at progress 0 and 1), which keeps every sample in
 * bounds — no clamp streaks, no empty frame regions.
 *
 * Endpoints: at progress 0/1 the envelope is zero so the sample UV is
 * identity, and the reveal edge sits well outside the frame on both
 * sides, so output is pixel-pure from/to.
 */
export const portalDive = defineTransition({
  name: "portal-dive",
  defaults: {
    twist: 3.14159,
    depth: 1.0,
    reflection: 0.0,
  },
  glsl: `
uniform float uTwist;
uniform float uDepth;
uniform float uReflection;

vec4 transition(vec2 uv) {
  float aspect = uResolution.x / uResolution.y;
  vec2 c = vec2(0.5);
  vec2 aDelta = vec2((uv.x - c.x) * aspect, uv.y - c.y);
  float r = length(aDelta);
  float theta = atan(aDelta.y, aDelta.x);
  float maxR = sqrt(aspect * aspect * 0.25 + 0.25);

  // Portal front position: negative at progress=0, past the farthest
  // corner at progress=1, for any aspect ratio.
  float portalR = mix(-0.15, maxR + 0.15, uProgress);

  // Strength of distortion: gaussian band around the portal front,
  // zero at progress 0/1. Both falloffs together guarantee sample UVs
  // stay in-bounds everywhere (keeps clamp streaks out).
  float bandWidth = 0.25;
  float band = exp(-pow((r - portalR) / bandWidth, 2.0));
  float envelope = 4.0 * uProgress * (1.0 - uProgress);
  float strength = band * envelope;

  // Swirl: rotate sample direction around centre.
  float swirlAngle = strength * uTwist;
  float newTheta = theta + swirlAngle;

  // Inward pull: sample from a slightly smaller radius so content appears
  // to be drawn toward the portal mouth (magnification = depth feel).
  // Radius only ever DECREASES, so a pixel in bounds stays in bounds.
  float pulledR = r * (1.0 - strength * uDepth * 0.3);

  vec2 newAD = vec2(cos(newTheta), sin(newTheta)) * pulledR;
  vec2 sampleUv = c + vec2(newAD.x / aspect, newAD.y);
  // Defensive clamp — should be a no-op given the analysis above.
  sampleUv = clamp(sampleUv, 0.0, 1.0);

  vec4 fromColor = getFromColor(sampleUv);
  vec4 toColor = getToColor(sampleUv);

  // Soft radial reveal: centre crosses to to first, expanding outward.
  float fade = smoothstep(portalR - 0.08, portalR + 0.08, r);
  vec4 result = mix(toColor, fromColor, fade);

  // Env glint at the tunnel mouth: use the radial direction as a
  // surface-normal-like lookup into the env map, so the rim reads as a
  // curved glass lip catching reflections. Gated by strength (= band *
  // envelope), which is already zero at endpoints and away from the
  // tunnel mouth — clean endpoints, no global tint bleed.
  if (uReflection > 0.0) {
    vec2 nDir = r > 1e-4 ? aDelta / r : vec2(0.0);
    vec2 envUv = vec2(0.5 + 0.5 * nDir.x, 0.5 - 0.5 * nDir.y);
    vec3 envColor = getEnvironment(envUv).rgb;
    result.rgb = mix(result.rgb, envColor, strength * uReflection);
  }

  return result;
}
`,
});
