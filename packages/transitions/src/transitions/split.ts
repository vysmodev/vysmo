import { defineTransition } from "./define.js";

/**
 * Unified split transition: open (doors part) or close (doors meet) along
 * either axis. Replaces four gl-transitions (HorizontalOpen, HorizontalClose,
 * VerticalOpen, VerticalClose) with one parametric transition.
 *
 * axis: 0 = horizontal split (parts along Y), 1 = vertical split (parts along X)
 * mode: 0 = open (from parts, revealing to), 1 = close (to meets over from)
 */
export const split = defineTransition({
  name: "split",
  defaults: {
    axis: 0,
    mode: 0,
    softness: 0.01,
  },
  glsl: `
uniform float uAxis;
uniform float uMode;
uniform float uSoftness;

vec4 transition(vec2 uv) {
  float splitCoord = mix(uv.x, uv.y, uAxis);
  float perpCoord = mix(uv.y, uv.x, uAxis);
  float distFromCenter = splitCoord - 0.5;
  float absDist = abs(distFromCenter);
  float signDist = sign(distFromCenter);

  float boundary;
  vec4 innerColor;
  vec4 outerColor;

  if (uMode < 0.5) {
    // OPEN: "from" doors slide outward, revealing stationary "to" in the middle.
    boundary = -uSoftness + uProgress * (0.5 + 2.0 * uSoftness);
    float slide = uProgress * 0.5;
    float sampleSplit = splitCoord - signDist * slide;
    vec2 fromSampleUv = mix(
      vec2(sampleSplit, perpCoord),
      vec2(perpCoord, sampleSplit),
      uAxis
    );
    innerColor = getToColor(uv);
    outerColor = getFromColor(clamp(fromSampleUv, 0.0, 1.0));
  } else {
    // CLOSE: "to" doors slide inward from edges, covering stationary "from".
    boundary = (0.5 + uSoftness) - uProgress * (0.5 + 2.0 * uSoftness);
    float slide = (1.0 - uProgress) * 0.5;
    float sampleSplit = splitCoord - signDist * slide;
    vec2 toSampleUv = mix(
      vec2(sampleSplit, perpCoord),
      vec2(perpCoord, sampleSplit),
      uAxis
    );
    innerColor = getFromColor(uv);
    outerColor = getToColor(clamp(toSampleUv, 0.0, 1.0));
  }

  float w = smoothstep(boundary - uSoftness, boundary + uSoftness, absDist);
  return mix(innerColor, outerColor, w);
}
`,
});
