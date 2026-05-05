import { defineEffect } from "../define.js";
import { GAUSSIAN_BLUR_AXIS_GLSL } from "./shared/gaussian-blur.js";

/**
 * Separable Gaussian blur. Two passes: horizontal sweep of the source
 * texture, then vertical sweep of pass 0's output. 49-tap kernel per
 * pass (see `shared/gaussian-blur.ts`) with sigma = radius/3.
 *
 * At `radius <= 0` the shader short-circuits to the source, giving a
 * pixel-pure identity — verified by the effects library's identity test.
 *
 * For very large radii (>60 px) a downsample pyramid would be cheaper
 * and higher quality; deferred until the runner supports per-pass FBO
 * sizing.
 */
export const blur = defineEffect({
  name: "blur",
  passes: 2,
  defaults: {
    radius: 16,
  },
  glsl: `
uniform float uRadius;

#define _blurSample(uv) (uPass == 0 ? getSource(uv) : getPrevious(uv))
${GAUSSIAN_BLUR_AXIS_GLSL}

vec4 effect(vec2 uv) {
  if (uRadius <= 0.001) return getSource(uv);
  vec2 axis = (uPass == 0) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  return _gaussianBlurAxis(uv, axis, uRadius);
}
`,
});
