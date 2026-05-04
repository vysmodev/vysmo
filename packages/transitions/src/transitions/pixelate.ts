import { defineTransition } from "./define.js";

export const pixelate = defineTransition({
  name: "pixelate",
  defaults: {
    maxBlockSize: 40,
  },
  glsl: `
uniform float uMaxBlockSize;

vec4 transition(vec2 uv) {
  // Block size peaks at midpoint, 1px at endpoints.
  float env = 4.0 * uProgress * (1.0 - uProgress);
  float blockSize = max(1.0, uMaxBlockSize * env);

  // Quantize to a grid of blockSize-pixel cells, sample from cell centers.
  vec2 pixel = uv * uResolution;
  vec2 quantized = floor(pixel / blockSize) * blockSize + blockSize * 0.5;
  vec2 quantUv = quantized / uResolution;

  // Crossfade concentrated in the middle 40% when pixelation is heaviest.
  float mixW = smoothstep(0.3, 0.7, uProgress);
  return mix(getFromColor(quantUv), getToColor(quantUv), mixW);
}
`,
});
