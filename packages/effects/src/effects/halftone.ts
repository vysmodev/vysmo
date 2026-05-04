import { defineEffect } from "../define.js";

/**
 * Halftone — print-style dot pattern where each dot's radius scales
 * with the local pixel's luminance. Darker pixels → larger dots.
 *
 * `dotSize` is the on-screen cell size in pixels. `angle` rotates the
 * dot grid (in radians) — classic newspaper halftones overlap multiple
 * grids at different angles per channel; this is the single-channel
 * monochrome variant.
 *
 * At `intensity = 0` the shader returns the source verbatim — identity
 * by construction. At `intensity = 1` the result is fully replaced by
 * the dot pattern in `inkColor` over `paperColor`.
 */
export const halftone = defineEffect({
  name: "halftone",
  defaults: {
    intensity: 1,
    dotSize: 8,
    angle: 0.785, // π/4 — 45° default, classic look
    inkColor: [0, 0, 0] as const,
    paperColor: [1, 1, 1] as const,
  },
  glsl: `
uniform float uIntensity;
uniform float uDotSize;
uniform float uAngle;
uniform vec3 uInkColor;
uniform vec3 uPaperColor;

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uIntensity <= 0.0) return src;

  // Rotate UV-space pixel coords into dot-grid space.
  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 px = uv * uResolution;
  vec2 rotated = vec2(c * px.x - s * px.y, s * px.x + c * px.y);

  float cell = max(uDotSize, 1.0);
  vec2 inCell = mod(rotated, cell) - cell * 0.5;
  float distFromCentre = length(inCell);

  // Sample at the cell centre so dot size reflects average local
  // brightness, not a single pixel that could be noise.
  vec2 cellCentrePx = floor(rotated / cell) * cell + cell * 0.5;
  vec2 cellCentreRot = vec2(
     c * cellCentrePx.x + s * cellCentrePx.y,
    -s * cellCentrePx.x + c * cellCentrePx.y
  );
  vec2 sampleUv = cellCentreRot / uResolution;
  float luma = dot(getSource(clamp(sampleUv, 0.0, 1.0)).rgb,
                   vec3(0.299, 0.587, 0.114));

  // Dot radius shrinks as luma rises — bright cells get small dots.
  float maxR = cell * 0.5;
  float radius = (1.0 - luma) * maxR;
  // Soft edge to avoid aliasing at the dot boundary.
  float ink = 1.0 - smoothstep(radius - 1.0, radius + 1.0, distFromCentre);
  vec3 halftoned = mix(uPaperColor, uInkColor, ink);
  return vec4(mix(src.rgb, halftoned, uIntensity), src.a);
}
`,
});
