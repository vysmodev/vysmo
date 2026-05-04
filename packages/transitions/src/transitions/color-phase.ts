import { defineTransition } from "./define.js";

/**
 * Port of gl-transitions' ColorPhase. Each color channel transitions on its
 * own sub-range of progress via smoothstep, giving a phased spectrum-shift
 * reveal (red fades early, green middle, blue late, for the defaults).
 */
export const colorPhase = defineTransition({
  name: "color-phase",
  defaults: {
    fromStep: [0.0, 0.2, 0.4, 0.0],
    toStep: [0.6, 0.8, 1.0, 1.0],
  },
  glsl: `
uniform vec4 uFromStep;
uniform vec4 uToStep;

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  return mix(a, b, smoothstep(uFromStep, uToStep, vec4(uProgress)));
}
`,
});
