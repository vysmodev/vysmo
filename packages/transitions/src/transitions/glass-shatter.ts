import { defineTransition } from "./define.js";

/**
 * Voronoi tessellation where each cell flips from from to to at its own
 * randomised moment, with a soft temporal window so the flip isn't an
 * instant step. Every pixel samples both source images at its own uv —
 * no per-shard displacement — so adjacent cells never diverge into
 * different sample positions and the Voronoi edges resolve cleanly
 * without halos or ghost outlines.
 *
 * Optional env-map glint (reflection > 0): each shard gets a random
 * "facet direction" which picks a different patch of the env map, and
 * that reflection blends in strongest at the shard's own mid-flip
 * moment — reads as broken mirror catching the light as each piece
 * rotates through, not a coloured tile. Defaults to 0 (no reflection)
 * so the transition is unchanged without an env map.
 *
 * Endpoints: each cell's flip moment is constrained to [flipWindow/2,
 * 1 - flipWindow/2] with a small safety margin, so at progress 0/1 the
 * smoothstep is saturated off/on for every cell AND the mid-flip
 * glint envelope is zero for every cell.
 */
export const glassShatter = defineTransition({
  name: "glass-shatter",
  defaults: {
    cells: 14,
    flipWindow: 0.12,
    reflection: 0.0,
  },
  glsl: `
uniform float uCells;
uniform float uFlipWindow;
uniform float uReflection;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
vec2 hash22(vec2 p) {
  return vec2(hash21(p), hash21(p + vec2(17.5, 31.3)));
}

vec4 transition(vec2 uv) {
  float aspect = uResolution.x / uResolution.y;
  vec2 freq = vec2(uCells * aspect, uCells);
  vec2 p = uv * freq;
  vec2 cellBase = floor(p);
  vec2 local = fract(p);

  // 3x3 neighbourhood search for the closest cell (Voronoi).
  float dist1 = 999.0;
  vec2 id1 = cellBase;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 nId = cellBase + vec2(float(i), float(j));
      vec2 jitter = hash22(nId);
      vec2 nPos = vec2(float(i), float(j)) + jitter;
      float d = length(nPos - local);
      if (d < dist1) {
        dist1 = d;
        id1 = nId;
      }
    }
  }

  // Keep cell flip moments away from 0 and 1 with enough headroom for
  // the window, plus a tiny safety margin so endpoints saturate cleanly.
  float halfWin = uFlipWindow * 0.5;
  float cellFlip = mix(halfWin + 0.02, 1.0 - halfWin - 0.02, hash21(id1 + vec2(0.31)));

  float reveal = smoothstep(cellFlip - halfWin, cellFlip + halfWin, uProgress);
  vec4 baseColor = mix(getFromColor(uv), getToColor(uv), reveal);

  // Per-shard mirror glint: each shard has its own facet direction, and
  // its reflection of the env map peaks at reveal=0.5 (the moment the
  // shard flips). Reveal=0 or 1 → glintEnv=0, so endpoints stay clean.
  if (uReflection > 0.0) {
    vec2 facetDir = normalize(hash22(id1 + vec2(0.83)) * 2.0 - 1.0);
    vec2 envUv = vec2(0.5 + 0.5 * facetDir.x, 0.5 - 0.5 * facetDir.y);
    vec3 envColor = getEnvironment(envUv).rgb;
    float glintEnv = 4.0 * reveal * (1.0 - reveal);
    baseColor.rgb = mix(baseColor.rgb, envColor, glintEnv * uReflection);
  }

  return baseColor;
}
`,
});
