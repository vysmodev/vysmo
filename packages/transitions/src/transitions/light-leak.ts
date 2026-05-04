import { defineTransition } from "./define.js";

export const lightLeak = defineTransition({
  name: "light-leak",
  defaults: {
    direction: [1, 0],
    color: [1.0, 0.85, 0.55],
    bandWidth: 0.2,
    intensity: 1.0,
  },
  glsl: `
uniform vec2 uDirection;
uniform vec3 uColor;
uniform float uBandWidth;
uniform float uIntensity;

vec4 transition(vec2 uv) {
  vec2 d = normalize(uDirection);
  // Scale by maxProj so diagonal directions clear corners at endpoints
  // (see paint-bleed.ts).
  float maxProj = max((abs(d.x) + abs(d.y)) * 0.5, 0.0001);
  float projected = dot(uv - 0.5, -d);

  // Boundary sweeps from just beyond the trailing edge to just beyond the
  // leading edge (offset by bandWidth so the bloom zone clears both edges
  // cleanly at the endpoints).
  float boundary = (maxProj + uBandWidth) * (1.0 - 2.0 * uProgress);

  // Which side of the boundary? 0 = still from, 1 = already to.
  float sweep = smoothstep(-uBandWidth * 0.5, uBandWidth * 0.5, projected - boundary);
  vec4 baseColor = mix(getFromColor(uv), getToColor(uv), sweep);

  // Gaussian-ish bloom centered on the boundary, scaled to zero at endpoints.
  float env = 4.0 * uProgress * (1.0 - uProgress);
  float distToBand = abs(projected - boundary);
  float bandX = distToBand / max(uBandWidth, 0.0001);
  float bandIntensity = exp(-bandX * bandX * 4.0) * env * uIntensity;

  vec3 bloomed = baseColor.rgb + uColor * bandIntensity;
  return vec4(bloomed, baseColor.a);
}
`,
});
