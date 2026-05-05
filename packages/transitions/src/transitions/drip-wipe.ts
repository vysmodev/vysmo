import { defineTransition } from "./define.js";

/**
 * Faithful port of akella demo1. Horizontal sweep whose boundary is broken
 * up by high-frequency Perlin noise hard-thresholded against the sweep
 * position, producing isolated drip/splatter islands as the edge crosses.
 *
 * Deviations from the original:
 * - The original's `smoothstep(edge, edge, x)` (undefined behavior when
 *   edge0 == edge1) is avoided by clamping `w` to a tiny positive value,
 *   so the edge smoothstep is always well-formed.
 * - Endpoint position is `mix(-w, 1+w, progress)` (not akella's
 *   `mix(-w/2, 1-w/2, progress)`) so at progress=0/1 the mask saturates
 *   fully past the image bounds instead of relying on the UB fallback.
 * - The displacement sampler is dropped — akella's shader declares it
 *   but never references it.
 */
export const dripWipe = defineTransition({
  name: "drip-wipe",
  defaults: {
    direction: [-1, 0],
    width: 0.5,
    scaleX: 40,
    scaleY: 40,
  },
  glsl: `
uniform vec2 uDirection;
uniform float uWidth;
uniform float uScaleX;
uniform float uScaleY;

// Stefan Gustavson classic 2D Perlin noise. Output range ≈ [-1, 1].
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289((x * 34.0 + 1.0) * x); }
vec2 fade2(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float pnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * (1.0 / 41.0)) - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 *
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fxy = fade2(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fxy.x);
  return 2.3 * mix(n_x.x, n_x.y, fxy.y);
}

// Snap to nearest axis-aligned unit. The proj normalization below assumes
// axis-aligned d (so proj ∈ [0,1]); diagonals would push it outside [0,1]
// and the wipe edge would never reach part of the canvas. Enforced
// in-shader so the UI's axis-only picker matches.
vec2 snapAxis(vec2 v) {
  vec2 dn = normalize(v);
  return abs(dn.x) > abs(dn.y) ? vec2(sign(dn.x), 0.0) : vec2(0.0, sign(dn.y));
}

vec4 transition(vec2 uv) {
  vec2 d = snapAxis(uDirection);

  // Project uv onto -d, centered at 0.5, so axis-aligned d gives a sweep
  // coordinate in [0, 1]. Replaces the original's hardcoded uv.x.
  //   d=[-1, 0] (Left)  → proj = uv.x         (default; matches old shader)
  //   d=[ 1, 0] (Right) → proj = 1.0 - uv.x
  //   d=[ 0,-1] (Down)  → proj = uv.y
  //   d=[ 0, 1] (Up)    → proj = 1.0 - uv.y
  float proj = dot(uv - vec2(0.5), -d) + 0.5;

  // Width envelope: 0 at endpoints, 1 at mid-transition.
  float dt = 4.0 * uProgress * (1.0 - uProgress);
  // Keep w strictly positive so smoothstep(edge0, edge1, ...) never collapses.
  float w = max(uWidth * dt, 0.001);

  // Edge sweep: proj + shift spans well past [1 - w, 1] at both endpoints,
  // so maskvalue saturates to 0 at progress=0 and 1 at progress=1.
  float shift = mix(-w, 1.0 + w, uProgress);
  float maskvalue = smoothstep(1.0 - w, 1.0, proj + shift);

  // High-frequency Perlin, remapped to [0, 1] for akella's additive form.
  float realnoise = 0.5 * (pnoise(uv * vec2(uScaleX, uScaleY)) + 1.0);

  // Hard threshold with tiny softness (anti-alias only).
  float mask = maskvalue + maskvalue * realnoise;
  float final = smoothstep(0.99, 1.0, mask);

  return mix(getFromColor(uv), getToColor(uv), final);
}
`,
});
