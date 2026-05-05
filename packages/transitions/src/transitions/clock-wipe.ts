import { defineTransition } from "./define.js";

export const clockWipe = defineTransition({
  name: "clock-wipe",
  defaults: {
    startAngle: -1.5707963, // -π/2 (12 o'clock)
    direction: 1, // +1 clockwise, -1 counter-clockwise
    softness: 0.02,
  },
  glsl: `
uniform float uStartAngle;
uniform float uDirection;
uniform float uSoftness;

const float TWO_PI = 6.2831853;

vec4 transition(vec2 uv) {
  vec2 delta = uv - vec2(0.5);
  // Aspect-correct so the sweep stays angularly uniform on non-square canvases.
  vec2 aspectDelta = delta * vec2(uResolution.x / uResolution.y, 1.0);

  float angle = atan(aspectDelta.y, aspectDelta.x);
  float sweep = mod(uDirection * (angle - uStartAngle), TWO_PI);

  // Threshold extends beyond [0, 2π] by the softness on each side so the
  // feather zone is outside the visible sweep range at the endpoints.
  float threshold = uProgress * (TWO_PI + 2.0 * uSoftness) - uSoftness;
  float w = smoothstep(threshold - uSoftness, threshold + uSoftness, sweep);

  return mix(getToColor(uv), getFromColor(uv), w);
}
`,
});
