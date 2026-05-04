import { defineTransition } from "./define.js";

/**
 * Multi-pass pixel advection. The from-image is progressively carried
 * along a swirly vector field, then blended toward to. Each pass
 * samples uPrevious at a displaced position — pixels genuinely move
 * (follow flow lines across iterations) rather than fading in place,
 * so the character is closer to ink-stirring-into-water than any
 * crossfade. Impossible single-pass: resolving a multi-step flow
 * trajectory requires reading previous pass output.
 *
 *   pass 0              — seed: sample from.
 *   pass 1..passCount-2 — advection: sample uPrevious at uv - flow·step,
 *                         and blend toward to by a per-pass amount
 *                         chosen so the compounded blend reaches
 *                         progress after all advection passes.
 *   final pass          — pass-through (output previous).
 *
 * Endpoints: at progress 0, step = 0 and per-pass blend = 0, so the
 * chain preserves from. At progress 1, the per-pass blend = 1 so the
 * first advection pass already writes to, and every subsequent pass
 * preserves it (advecting a uniform field is a fixed point).
 */
export const fluidFlow = defineTransition({
  name: "fluid-flow",
  passes: 6,
  defaults: {
    strength: 0.12,
    scale: 3,
  },
  glsl: `
uniform float uStrength;
uniform float uScale;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float valNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  return valNoise(p) * 0.55 +
         valNoise(p * 2.1) * 0.28 +
         valNoise(p * 4.3) * 0.17;
}

// Swirly 2D vector field in [-1,1]² per axis. Two offset fbm fields
// give a non-divergence-free flow that still reads as fluid swirl.
vec2 flowField(vec2 p) {
  return vec2(
    fbm(p) * 2.0 - 1.0,
    fbm(p + vec2(17.3, 23.7)) * 2.0 - 1.0
  );
}

vec4 transition(vec2 uv) {
  // Final pass: pass through the accumulated result.
  if (uPass == uPassCount - 1) {
    return getPrevious(uv);
  }

  // Seed pass: carry the from image in untouched.
  if (uPass == 0) {
    return vec4(getFromColor(uv).rgb, 1.0);
  }

  float nAdvect = float(uPassCount - 2);
  vec2 flow = flowField(uv * uScale);
  float stepAmount = uStrength * uProgress / nAdvect;

  // Sample previous at the advected position — pixels flow along the
  // field. Clamp keeps samples in-bounds when the flow pushes near
  // the frame edge.
  vec2 advectedUv = clamp(uv - flow * stepAmount, 0.0, 1.0);
  vec3 advected = getPrevious(advectedUv).rgb;

  // Per-pass blend chosen so (1 - blend)^N = 1 - progress, i.e. after
  // nAdvect passes the compounded blend exactly equals progress.
  float perPassBlend = 1.0 - pow(1.0 - uProgress, 1.0 / nAdvect);

  vec3 blended = mix(advected, getToColor(uv).rgb, perPassBlend);
  return vec4(blended, 1.0);
}
`,
});
