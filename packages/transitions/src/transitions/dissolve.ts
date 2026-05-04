import { defineTransition } from "./define.js";

export const dissolve = defineTransition({
  name: "dissolve",
  defaults: {},
  glsl: `
vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  vec3 aLin = pow(a.rgb, vec3(2.2));
  vec3 bLin = pow(b.rgb, vec3(2.2));
  vec3 mixed = mix(aLin, bLin, uProgress);
  return vec4(pow(mixed, vec3(1.0 / 2.2)), mix(a.a, b.a, uProgress));
}
`,
});
