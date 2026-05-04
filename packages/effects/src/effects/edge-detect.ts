import { defineEffect } from "../define.js";

/**
 * Sobel edge detection. Standard 3×3 horizontal + vertical kernels,
 * applied to the per-pixel luma; magnitude is sqrt(Gx² + Gy²). Strong
 * gradients become bright edges, flat regions become dark.
 *
 * `intensity` blends between the source and the edge-magnitude image so
 * the effect can dial in/out smoothly. At `intensity = 0` the shader
 * returns the source verbatim — identity by construction.
 *
 * `color` tints the detected edges (defaults to white).
 */
export const edgeDetect = defineEffect({
  name: "edge-detect",
  defaults: {
    intensity: 1,
    radius: 1,
    color: [1, 1, 1] as const,
  },
  glsl: `
uniform float uIntensity;
uniform float uRadius;
uniform vec3 uColor;

float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  if (uIntensity <= 0.0) return src;

  vec2 t = uRadius / uResolution;
  // 3×3 luma neighbourhood.
  float tl = luma(getSource(uv + vec2(-t.x,  t.y)).rgb);
  float tc = luma(getSource(uv + vec2(0.0,   t.y)).rgb);
  float tr = luma(getSource(uv + vec2( t.x,  t.y)).rgb);
  float ml = luma(getSource(uv + vec2(-t.x,  0.0)).rgb);
  float mr = luma(getSource(uv + vec2( t.x,  0.0)).rgb);
  float bl = luma(getSource(uv + vec2(-t.x, -t.y)).rgb);
  float bc = luma(getSource(uv + vec2(0.0,  -t.y)).rgb);
  float br = luma(getSource(uv + vec2( t.x, -t.y)).rgb);
  // Sobel.
  float gx = -tl + tr - 2.0 * ml + 2.0 * mr - bl + br;
  float gy = -tl - 2.0 * tc - tr + bl + 2.0 * bc + br;
  float mag = clamp(sqrt(gx * gx + gy * gy), 0.0, 1.0);
  vec3 edges = uColor * mag;
  return vec4(mix(src.rgb, edges, uIntensity), src.a);
}
`,
});
