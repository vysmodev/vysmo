import { defineEffect } from "../define.js";

/**
 * VHS — combo of per-row horizontal jitter (with rare strong glitch
 * lines), chromatic offset, scanline darkening, and a subtle 4-tap blur.
 * One "intensity" knob drives all four. `seed` is animatable for a
 * flickering tape over time.
 *
 * At `intensity = 0` the shader returns the source verbatim — identity
 * by construction.
 */
export const vhs = defineEffect({
  name: "vhs",
  defaults: {
    intensity: 0.6,
    seed: 0,
  },
  glsl: `
uniform float uIntensity;
uniform float uSeed;

float hash11(float p) {
  return fract(sin(p * 12.9898 + uSeed) * 43758.5453);
}

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uIntensity <= 0.0) return src;

  // 1. Per-row horizontal jitter, with rare strong glitches.
  float lineCount = 80.0;
  float row = floor(uv.y * lineCount);
  float jitter = (hash11(row) * 2.0 - 1.0) * 0.02;
  float glitch = step(0.97, hash11(row + 100.0));
  jitter += glitch * (hash11(row + 200.0) * 2.0 - 1.0) * 0.06;
  vec2 sampleUv = clamp(vec2(uv.x + jitter, uv.y), 0.0, 1.0);

  // 2. Chromatic offset.
  float caOff = 4.0 / uResolution.x;
  float r = getSource(clamp(sampleUv + vec2(caOff, 0.0), 0.0, 1.0)).r;
  float g = getSource(sampleUv).g;
  float b = getSource(clamp(sampleUv - vec2(caOff, 0.0), 0.0, 1.0)).b;
  vec3 col = vec3(r, g, b);

  // 3. Scanline darkening.
  float scan = 0.5 + 0.5 * sin(uv.y * uResolution.y * 1.5707963);
  col *= 1.0 - 0.3 * (1.0 - scan);

  // 4. Subtle 4-tap blur.
  vec2 t = 1.0 / uResolution;
  vec3 blurred = (
    getSource(clamp(sampleUv + vec2( t.x, 0.0), 0.0, 1.0)).rgb +
    getSource(clamp(sampleUv + vec2(-t.x, 0.0), 0.0, 1.0)).rgb +
    getSource(clamp(sampleUv + vec2(0.0,  t.y), 0.0, 1.0)).rgb +
    getSource(clamp(sampleUv + vec2(0.0, -t.y), 0.0, 1.0)).rgb
  ) * 0.25;
  col = mix(col, blurred, 0.3);

  return vec4(mix(src.rgb, col, uIntensity), src.a);
}
`,
});
