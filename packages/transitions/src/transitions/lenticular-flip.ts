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
  // stripCount<3 collapses to a single full-canvas flip (1) or a half-and-half
  // (2) — neither reads as "lenticular". Clamp here so the transition is
  // reliable regardless of caller input.
  float stripCount = max(uStripCount, 3.0);

  float stripF = uv.x * stripCount;
  float stripIdx = floor(stripF);
  float localU = fract(stripF);

  // Staggered flip timing: each strip flips over a window of 0.5 in
  // progress. The window's start scales from 0 (leftmost strip) to
  // 0.5 (rightmost strip), so the wave finishes exactly at progress 1.
  float stripStart = stripIdx / stripCount;
  float windowStart = stripStart * 0.5;
  float flipT = smoothstep(windowStart, windowStart + 0.5, uProgress);

  // Strip rotation: 0 at flipT=0, PI at flipT=1.
  float rotAngle = flipT * 3.14159265;
  float cosRot = cos(rotAngle);
  float visibleHalfWidth = abs(cosRot) * 0.5;

  // Local coord centred in the strip, range [-0.5, 0.5].
  float centered = localU - 0.5;

  // Decompress: map visible [-vhw, vhw] back to [0, 1] strip-local,
  // clamped so out-of-window pixels sample the strip's edge cleanly
  // (instead of out-of-strip or out-of-canvas).
  float decompressed = clamp((centered / max(visibleHalfWidth, 0.0001) + 1.0) * 0.5, 0.0, 1.0);
  vec2 sampleUv = vec2((stripIdx + decompressed) / stripCount, uv.y);
  vec4 stripColor = cosRot >= 0.0 ? getFromColor(sampleUv) : getToColor(sampleUv);

  // Crease fallback: outside the visible window, crossfade from→to so
  // we never emit a black pixel. Feather across a small band at the
  // boundary so the spatial edge between "compressed strip sample" and
  // "crossfade crease" doesn't read as a 1-pixel flickering line —
  // those two values are computed from completely different source
  // positions and the hard step between them was the visible artifact.
  vec4 creaseColor = mix(getFromColor(uv), getToColor(uv), flipT);
  float feather = 1.0 / stripCount * 0.04;
  float t = smoothstep(visibleHalfWidth - feather, visibleHalfWidth + feather, abs(centered));
  return mix(stripColor, creaseColor, t);
}
`,
});
