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
  // Distance from the split axis (perpendicular to the doors' motion).
  float splitCoord = mix(uv.x, uv.y, uAxis);
  float absDist = abs(splitCoord - 0.5);

  // Boundary is "how far from the split center the doors extend right now".
  // OPEN: grows from -softness to 0.5+softness (from doors retreat outward).
  // CLOSE: shrinks from 0.5+softness to -softness (to doors close inward).
  // Both inner and outer sample at uv directly. Each door is a position-based
  // reveal, not a texture that slides with the door — so the softness band
  // blends two views of the same scene location instead of two different
  // places of from/to (which produced the "wrong content at the seam"
  // artifact in the previous slide-with-content implementation).
  float boundary;
  vec4 innerColor;
  vec4 outerColor;
  if (uMode < 0.5) {
    boundary = -uSoftness + uProgress * (0.5 + 2.0 * uSoftness);
    innerColor = getToColor(uv);
    outerColor = getFromColor(uv);
  } else {
    boundary = (0.5 + uSoftness) - uProgress * (0.5 + 2.0 * uSoftness);
    innerColor = getFromColor(uv);
    outerColor = getToColor(uv);
  }

  float w = smoothstep(boundary - uSoftness, boundary + uSoftness, absDist);
  return mix(innerColor, outerColor, w);
}
`,
});
