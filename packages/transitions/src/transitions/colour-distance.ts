import { defineTransition } from "./define.js";

/**
 * Port of gl-transitions' ColourDistance. Each pixel transitions based on
 * how different the from/to colors are at that spot — by default, high-
 * contrast regions change first, stable regions change last, so the reveal
 * reads as content-aware. `power` reshapes the distribution; `stagger`
 * controls how spread-out the per-pixel transitions are.
 */
export const colourDistance = defineTransition({
  name: "colour-distance",
  defaults: {
    power: 5,
    stagger: 0.55,
  },
  glsl: `
uniform float uPower;
uniform float uStagger;

vec4 transition(vec2 uv) {
  vec4 fTex = getFromColor(uv);
  vec4 tTex = getToColor(uv);

  // RGB distance normalized to [0,1] (sqrt(3) is the max channel distance).
  float d = distance(fTex.rgb, tTex.rgb) / 1.7320508;
  float priority = 1.0 - pow(clamp(d, 0.0, 1.0), uPower);

  // Per-pixel transition window: starts at priority*stagger, spans 1-stagger.
  float start = priority * uStagger;
  float localP = clamp((uProgress - start) / max(1.0 - uStagger, 0.0001), 0.0, 1.0);

  return mix(fTex, tTex, localP);
}
`,
});
