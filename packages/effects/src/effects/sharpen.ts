import { defineEffect } from "../define.js";

/**
 * Unsharp mask — convolution that emphasises high-frequency detail by
 * subtracting a blurred version of the image from itself, then adding
 * the difference back at `amount` strength.
 *
 * Implementation: 5-tap cross kernel (centre + 4 neighbours), Laplacian
 * approximation of the local high-pass. `radius` scales the neighbour
 * sample distance in pixels.
 *
 * At `amount = 0` the shader short-circuits to the source — pixel-pure
 * identity.
 */
export const sharpen = defineEffect({
  name: "sharpen",
  defaults: {
    amount: 0.6,
    radius: 1,
  },
  glsl: `
uniform float uAmount;
uniform float uRadius;

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uAmount <= 0.0) return src;

  vec2 texel = uRadius / uResolution;
  vec3 sum =
    getSource(uv + vec2( texel.x,        0.0)).rgb +
    getSource(uv + vec2(-texel.x,        0.0)).rgb +
    getSource(uv + vec2(       0.0,  texel.y)).rgb +
    getSource(uv + vec2(       0.0, -texel.y)).rgb;
  vec3 highPass = src.rgb - sum * 0.25;
  return vec4(src.rgb + highPass * uAmount, src.a);
}
`,
});
