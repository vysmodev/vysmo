import { defineTransition } from "./define.js";

/**
 * Compound-eye lens effect: the frame fragments into tiles that grow from
 * pixel-sized (endpoints) to large (midpoint) where each tile shows a
 * centered sample. Per-tile staggered transitions avoid the freeze that a
 * symmetric tile envelope + centered crossfade would otherwise produce —
 * at any progress the image has tiles at every transition stage. A soft
 * per-tile vignette gives it a lens feel without ever going fully dark.
 */
export const flyEye = defineTransition({
  name: "fly-eye",
  defaults: {
    size: 22,
    vignette: 0.35,
    stagger: 0.5,
  },
  glsl: `
uniform float uSize;
uniform float uVignette;
uniform float uStagger;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 transition(vec2 uv) {
  float env = 4.0 * uProgress * (1.0 - uProgress);

  // Cell count slides between per-pixel (no quantization at endpoints) and
  // uSize tiles (large lenses at midpoint).
  float maxRes = max(uResolution.x, uResolution.y);
  float cellCount = mix(maxRes, max(uSize, 2.0), env);

  vec2 pixel = uv * uResolution;
  vec2 tileSize = uResolution / cellCount;
  vec2 tileIdx = floor(pixel / tileSize);
  vec2 tileCenter = (tileIdx + 0.5) * tileSize / uResolution;
  vec2 sampleUv = mix(uv, tileCenter, env);

  // Per-tile transition start times — breaks the freeze that a symmetric
  // tile envelope + centered crossfade would create. At any given moment
  // some tiles are mid-fade, some are fully from, some fully to.
  float priority = hash21(tileIdx);
  float start = priority * uStagger;
  float localP = clamp((uProgress - start) / max(1.0 - uStagger, 0.0001), 0.0, 1.0);

  // Per-tile vignette bounded away from zero so corners never go black.
  vec2 withinTile = fract(pixel / tileSize) - 0.5;
  float tileDist = length(withinTile);
  float vignette = mix(1.0 - uVignette, 1.0, 1.0 - smoothstep(0.25, 0.5, tileDist));
  float vEff = mix(1.0, vignette, env);

  vec4 color = mix(getFromColor(sampleUv), getToColor(sampleUv), localP);
  return vec4(color.rgb * vEff, color.a);
}
`,
});
