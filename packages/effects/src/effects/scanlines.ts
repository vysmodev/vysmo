import { defineEffect } from "../define.js";

/**
 * CRT-style scanlines — alternating dark horizontal bands. `density` is
 * the period in pixels (smaller = denser lines). `offset` shifts the
 * pattern vertically and is animatable for a slow scroll.
 *
 * At `intensity = 0` the shader returns the source verbatim — identity
 * by construction.
 */
export const scanlines = defineEffect({
  name: "scanlines",
  defaults: {
    intensity: 0.4,
    density: 2,
    offset: 0,
  },
  glsl: `
uniform float uIntensity;
uniform float uDensity;
uniform float uOffset;

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uIntensity <= 0.0) return src;

  float y = uv.y * uResolution.y;
  float period = max(uDensity, 1.0);
  float band = 0.5 + 0.5 * sin(y * 3.14159265 / period + uOffset);
  float darken = 1.0 - uIntensity * (1.0 - band);
  return vec4(src.rgb * darken, src.a);
}
`,
});
