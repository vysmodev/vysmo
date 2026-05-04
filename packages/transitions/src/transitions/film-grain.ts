import { defineTransition } from "./define.js";

/**
 * Filmic dissolve. Everything that modulates the image is gated by a
 * 4·p·(1-p) peak envelope so endpoints are pixel-pure from/to.
 *
 * At peak, the image picks up:
 *   - multi-scale animated grain (fine + medium + coarse), reseeded
 *     in discrete progress frames so scrubbing flickers like a
 *     projector
 *   - partial desaturation (content drifts toward luminance)
 *   - subtle warm tint (R up, B down)
 *   - a soft corner vignette
 *   - occasional dark vertical scratches on ~2% of columns, reseeded
 *     every couple of frames
 *
 * Base crossfade is a soft smoothstep(0.25, 0.75) so from and to
 * overlap through the grainy middle — the grain is what carries the
 * hand-off, rather than a geometric wipe with film on top.
 *
 * One param: grain (master intensity of the whole film character).
 */
export const filmGrain = defineTransition({
  name: "film-grain",
  defaults: {
    grain: 1.0,
  },
  glsl: `
uniform float uGrain;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 transition(vec2 uv) {
  vec3 fromC = getFromColor(uv).rgb;
  vec3 toC = getToColor(uv).rgb;
  vec3 base = mix(fromC, toC, smoothstep(0.25, 0.75, uProgress));

  // Peak envelope — zero at both endpoints, 1 at mid.
  float peak = 4.0 * uProgress * (1.0 - uProgress) * uGrain;

  // Partial desaturation toward luminance (old film is less vivid).
  float lum = dot(base, vec3(0.299, 0.587, 0.114));
  base = mix(base, vec3(lum), peak * 0.25);

  // Warm tint: subtle R boost + B drop at peak. Still multiplicative
  // on content (no synthetic colour introduced from nothing).
  base *= mix(vec3(1.0), vec3(1.08, 1.00, 0.88), peak * 0.6);

  // Stepped seed → scrubbing reads as projector flicker between
  // a handful of discrete grain "frames" across the transition.
  float frame = floor(uProgress * 22.0);

  // Multi-scale grain. Fine texture + medium clumps + occasional
  // coarse blotches — reads as film-stock rather than digital noise.
  float g = 0.0;
  g += (hash21(uv * 520.0 + vec2(frame, 0.0)) - 0.5) * 0.6;
  g += (hash21(uv * 130.0 + vec2(0.0, frame)) - 0.5) * 0.3;
  g += (hash21(uv * 32.0 + vec2(frame, frame)) - 0.5) * 0.18;
  base += vec3(g) * peak * 0.55;

  // Vertical scratches on ~2% of columns, reseeded every two frames.
  float scratchCol = floor(uv.x * 220.0);
  float scratchSeed = floor(frame * 0.5);
  float scratchHash = hash21(vec2(scratchCol, scratchSeed));
  float isScratch = step(0.98, scratchHash);
  base *= mix(1.0, 0.32, isScratch * peak);

  // Soft corner vignette at peak only — old projector look.
  float d = distance(uv, vec2(0.5));
  float vignette = 1.0 - smoothstep(0.35, 0.9, d);
  base *= mix(1.0, 0.65 + 0.35 * vignette, peak * 0.8);

  return vec4(base, 1.0);
}
`,
});
