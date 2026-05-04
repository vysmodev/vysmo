import { defineTransition } from "./define.js";

export const radialReveal = defineTransition({
  name: "radial-reveal",
  defaults: {
    center: [0.5, 0.5],
    softness: 0.05,
  },
  glsl: `
uniform vec2 uCenter;
uniform float uSoftness;

vec4 transition(vec2 uv) {
  // Measure distance in screen (pixel) space so the reveal stays a true circle
  // on non-square canvases.
  vec2 pixel = uv * uResolution;
  vec2 pixelCenter = uCenter * uResolution;

  float maxDist = max(
    max(length(pixelCenter), length(pixelCenter - vec2(uResolution.x, 0.0))),
    max(length(pixelCenter - vec2(0.0, uResolution.y)), length(pixelCenter - uResolution))
  );
  float dist = length(pixel - pixelCenter) / maxDist;

  float radius = uProgress * (1.0 + 2.0 * uSoftness) - uSoftness;
  float w = smoothstep(radius - uSoftness, radius + uSoftness, dist);

  return mix(getToColor(uv), getFromColor(uv), w);
}
`,
});
