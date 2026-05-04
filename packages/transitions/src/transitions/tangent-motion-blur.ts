import { defineTransition } from "./define.js";

/**
 * Directional motion blur concentrated on the wipe front. As the wipe
 * sweeps across the frame, pixels near the boundary get heavy along-axis
 * blur, simulating a camera pan through the cut. Away from the boundary,
 * pixels stay crisp — distinct from linear-blur which blurs everything
 * uniformly at midpoint.
 */
export const tangentMotionBlur = defineTransition({
  name: "tangent-motion-blur",
  defaults: {
    direction: [1, 0],
    intensity: 0.08,
    softness: 0.2,
  },
  glsl: `
uniform vec2 uDirection;
uniform float uIntensity;
uniform float uSoftness;

const int SAMPLES = 24;

vec4 transition(vec2 uv) {
  vec2 d = normalize(uDirection);
  // Scale by maxProj so diagonal directions clear corners at endpoints
  // (see paint-bleed.ts).
  float maxProj = max((abs(d.x) + abs(d.y)) * 0.5, 0.0001);
  float projected = dot(uv - 0.5, -d);
  // Boundary sweeps from +(maxProj+softness) to -(maxProj+softness) so the
  // softness band is off-screen at both endpoints, for any direction.
  float boundary = (maxProj + uSoftness) * (1.0 - 2.0 * uProgress);
  float signedDist = projected - boundary;

  float wipeMask = smoothstep(-uSoftness, uSoftness, signedDist);

  // Blur amount peaks on the wipe front; envelope-gated so it zeros at
  // both endpoints regardless of the Gaussian falloff shape.
  float env = 4.0 * uProgress * (1.0 - uProgress);
  float falloffX = signedDist / max(uSoftness, 0.0001);
  float falloff = exp(-falloffX * falloffX * 2.0);
  float blur = uIntensity * env * falloff;

  vec4 cFrom = vec4(0.0);
  vec4 cTo = vec4(0.0);
  for (int i = 0; i < SAMPLES; i++) {
    float t = (float(i) - float(SAMPLES - 1) * 0.5) / float(SAMPLES - 1);
    vec2 sampleUv = clamp(uv + d * blur * t, 0.0, 1.0);
    cFrom += getFromColor(sampleUv);
    cTo += getToColor(sampleUv);
  }
  cFrom /= float(SAMPLES);
  cTo /= float(SAMPLES);

  return mix(cFrom, cTo, wipeMask);
}
`,
});
