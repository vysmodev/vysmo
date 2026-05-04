import { defineTransition } from "./define.js";

/**
 * Vertical slice curtain: the frame is partitioned into N vertical strips
 * which open one after another (left-to-right by default), each strip
 * itself revealing top-to-bottom. Distinct from kinetic-bands (which
 * uses staggered horizontal bands) and from a simple wipe.
 */
export const windowSlice = defineTransition({
  name: "window-slice",
  defaults: {
    count: 12,
    stagger: 0.6,
  },
  glsl: `
uniform float uCount;
uniform float uStagger;

vec4 transition(vec2 uv) {
  float sliceI = floor(uv.x * uCount);
  // Linear left-to-right sweep across slices.
  float sliceProg = sliceI / max(uCount - 1.0, 1.0);
  float start = sliceProg * uStagger;
  float window = max(1.0 - uStagger, 0.0001);
  float localP = clamp((uProgress - start) / window, 0.0, 1.0);

  // Each slice opens top-to-bottom: at localP=0 nothing revealed,
  // localP=1 fully revealed.
  float reveal = smoothstep(0.0, 1.0, localP * 2.0 - uv.y);

  return mix(getFromColor(uv), getToColor(uv), reveal);
}
`,
});
