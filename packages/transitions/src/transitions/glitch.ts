import { defineTransition } from "./define.js";

export const glitch = defineTransition({
  name: "glitch",
  defaults: {
    intensity: 0.6,
    chroma: 0.02,
    blocks: 30,
  },
  glsl: `
uniform float uIntensity;
uniform float uChroma;
uniform float uBlocks;

float hash11(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
float hash21(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec4 transition(vec2 uv) {
  // Envelope: ramps up to max at midpoint, zero at endpoints.
  float envelope = 4.0 * uProgress * (1.0 - uProgress);
  float glitchAmt = uIntensity * envelope;

  // Per-stripe horizontal displacement; stripe layout evolves over time.
  float stripeId = floor(uv.y * uBlocks);
  float timeStep = floor(uProgress * 24.0);
  float stripeSeed = hash21(vec2(stripeId, timeStep));
  float displaceActive = step(0.6, stripeSeed);
  float displaceAmount = (hash11(stripeSeed + 1.0) - 0.5) * 0.12 * glitchAmt * displaceActive;

  vec2 displacedUv = vec2(uv.x + displaceAmount, uv.y);
  vec2 clamped = clamp(displacedUv, 0.0, 1.0);

  // RGB channel split scales with glitch amount.
  float chromaOffset = glitchAmt * uChroma;
  vec2 offR = clamp(displacedUv + vec2(chromaOffset, 0.0), 0.0, 1.0);
  vec2 offB = clamp(displacedUv - vec2(chromaOffset, 0.0), 0.0, 1.0);

  vec3 fromRgb = vec3(
    getFromColor(offR).r,
    getFromColor(clamped).g,
    getFromColor(offB).b
  );
  vec3 toRgb = vec3(
    getToColor(offR).r,
    getToColor(clamped).g,
    getToColor(offB).b
  );

  // Hard-ish crossover concentrated in the middle 20% for a "cut" feel.
  float mixW = smoothstep(0.45, 0.55, uProgress);
  vec3 rgb = mix(fromRgb, toRgb, mixW);

  return vec4(rgb, 1.0);
}
`,
});
