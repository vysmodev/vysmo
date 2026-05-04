import { defineTransition } from "./define.js";

export const ripple = defineTransition({
  name: "ripple",
  defaults: {
    center: [0.5, 0.5],
    amplitude: 0.03,
    frequency: 6,
    speed: 8,
  },
  glsl: `
uniform vec2 uCenter;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;

const float TWO_PI = 6.2831853;

vec4 transition(vec2 uv) {
  vec2 delta = uv - uCenter;
  float dist = length(delta);
  vec2 dir = dist > 0.0001 ? delta / dist : vec2(1.0, 0.0);

  // Velocity-scaled envelope: zero at endpoints, peak at midpoint.
  float env = 4.0 * uProgress * (1.0 - uProgress);

  // Radial sinusoid traveling outward as progress grows.
  float phase = dist * uFrequency * TWO_PI - uProgress * uSpeed;
  float wave = sin(phase);

  // From pushes outward with the wave; to pulls inward (opposite sign).
  vec2 displacement = dir * wave * uAmplitude * env;

  vec4 fromColor = getFromColor(clamp(uv + displacement, 0.0, 1.0));
  vec4 toColor = getToColor(clamp(uv - displacement, 0.0, 1.0));

  // Crossfade concentrated in the middle 40%, so both images are ripple-warped
  // throughout the overlap region.
  float mixW = smoothstep(0.3, 0.7, uProgress);
  return mix(fromColor, toColor, mixW);
}
`,
});
