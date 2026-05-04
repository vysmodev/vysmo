import { defineTransition } from "./define.js";

/**
 * Hologram-card flip. The frame is divided into vertical strips, each
 * modelled as a narrow rectangle that rotates around its vertical axis
 * from 0 (showing from face-on) through 90° (edge-on — content pinches
 * to zero width) to 180° (showing to face-on). Flip timing is
 * staggered across strips left → right, so a wavefront of flipping
 * strips sweeps across the image.
 *
 * Perspective is faked by compressing strip content to fit the
 * visible half-width |cos(rotation)| · stripWidth/2. When a strip is
 * edge-on, its visible half-width is zero and every pixel falls into
 * the "crease" region, which fills with a mix(from, to, flipT) so
 * the full-frame rule holds (no black cracks).
 *
 * Endpoints: at progress 0 every strip is at flipT=0 (cos=1, full
 * visibility, sampling from at the correct uv). At progress 1 every
 * strip is at flipT=1 (cos=-1, full visibility, sampling to).
 */
export const lenticularFlip = defineTransition({
  name: "lenticular-flip",
  defaults: {
    stripCount: 22,
  },
  glsl: `
uniform float uStripCount;

vec4 transition(vec2 uv) {
  float stripF = uv.x * uStripCount;
  float stripIdx = floor(stripF);
  float localU = fract(stripF);

  // Staggered flip timing: each strip flips over a window of 0.5 in
  // progress. The window's start scales from 0 (leftmost strip) to
  // 0.5 (rightmost strip), so the wave finishes exactly at progress 1.
  float stripStart = stripIdx / uStripCount;
  float windowStart = stripStart * 0.5;
  float flipT = smoothstep(windowStart, windowStart + 0.5, uProgress);

  // Strip rotation: 0 at flipT=0, PI at flipT=1.
  float rotAngle = flipT * 3.14159265;
  float cosRot = cos(rotAngle);
  float visibleHalfWidth = abs(cosRot) * 0.5;

  // Local coord centred in the strip, range [-0.5, 0.5].
  float centered = localU - 0.5;

  // Crease fallback: outside the visible compressed window (including
  // the entire strip when edge-on), crossfade from → to so we never
  // emit a black pixel.
  if (abs(centered) > visibleHalfWidth) {
    return mix(getFromColor(uv), getToColor(uv), flipT);
  }

  // Decompress: map visible [-vhw, vhw] back to [0, 1] strip-local,
  // then rebuild the global sample uv for this strip.
  float decompressed = (centered / visibleHalfWidth + 1.0) * 0.5;
  vec2 sampleUv = vec2((stripIdx + decompressed) / uStripCount, uv.y);

  return cosRot >= 0.0 ? getFromColor(sampleUv) : getToColor(sampleUv);
}
`,
});
