import { defineEffect } from "../define.js";

/**
 * ASCII art — quantises the source into a character grid where each
 * cell's luminance picks a glyph from a sparse-to-dense ramp ranging
 * `space → . : - = + * # @ █`. Single-pass, glyph shapes are SDFs in
 * GLSL so there's no font texture to ship.
 *
 * `size` is the character cell size in pixels — smaller = denser ASCII,
 * more characters per frame. `intensity` blends between source and the
 * full ASCII render: `0` is pixel-pure source (identity), `1` is the
 * canonical ASCII look.
 *
 * Output is white glyphs on a heavily-darkened source background —
 * classic terminal vibe. The dark source still reads through so the
 * image identity is preserved, but the glyphs themselves are crisp
 * white for readability instead of washing out in bright cells.
 */
export const ascii = defineEffect({
  name: "ascii",
  defaults: {
    size: 12,
    intensity: 1,
  },
  glsl: `
uniform float uSize;
uniform float uIntensity;

// SDF-style glyph rendering. p is in [0, 1] within the character cell;
// returns 1 where the glyph paints, 0 where it doesn't, with a tiny
// smoothstep edge for anti-aliasing.
float glyphAt(int idx, vec2 p) {
  if (idx == 0) {
    // space
    return 0.0;
  } else if (idx == 1) {
    // .
    return 1.0 - smoothstep(0.05, 0.09, distance(p, vec2(0.5, 0.3)));
  } else if (idx == 2) {
    // :
    float a = 1.0 - smoothstep(0.04, 0.07, distance(p, vec2(0.5, 0.3)));
    float b = 1.0 - smoothstep(0.04, 0.07, distance(p, vec2(0.5, 0.7)));
    return max(a, b);
  } else if (idx == 3) {
    // -
    float horizontal = 1.0 - smoothstep(0.05, 0.08, abs(p.y - 0.5));
    float xMask = step(0.15, p.x) * step(p.x, 0.85);
    return horizontal * xMask;
  } else if (idx == 4) {
    // =
    float top = (1.0 - smoothstep(0.04, 0.07, abs(p.y - 0.4))) *
                 step(0.15, p.x) * step(p.x, 0.85);
    float bot = (1.0 - smoothstep(0.04, 0.07, abs(p.y - 0.6))) *
                 step(0.15, p.x) * step(p.x, 0.85);
    return max(top, bot);
  } else if (idx == 5) {
    // +
    float h = (1.0 - smoothstep(0.05, 0.08, abs(p.y - 0.5))) *
              step(0.2, p.x) * step(p.x, 0.8);
    float v = (1.0 - smoothstep(0.05, 0.08, abs(p.x - 0.5))) *
              step(0.2, p.y) * step(p.y, 0.8);
    return max(h, v);
  } else if (idx == 6) {
    // * — three lines through centre at 0°, 60°, 120° (six arms total).
    vec2 c = p - 0.5;
    float v = 0.0;
    for (int k = 0; k < 3; k++) {
      float a = float(k) * 1.0471975;  // π/3
      vec2 perp = vec2(-sin(a), cos(a));
      vec2 along = vec2(cos(a), sin(a));
      float distPerp = abs(dot(c, perp));
      float distAlong = abs(dot(c, along));
      float thick = 1.0 - smoothstep(0.04, 0.07, distPerp);
      float length = step(distAlong, 0.32);
      v = max(v, thick * length);
    }
    return v;
  } else if (idx == 7) {
    // #
    float v1 = (1.0 - smoothstep(0.04, 0.07, abs(p.x - 0.35))) *
                step(0.15, p.y) * step(p.y, 0.85);
    float v2 = (1.0 - smoothstep(0.04, 0.07, abs(p.x - 0.65))) *
                step(0.15, p.y) * step(p.y, 0.85);
    float h1 = (1.0 - smoothstep(0.04, 0.07, abs(p.y - 0.35))) *
                step(0.15, p.x) * step(p.x, 0.85);
    float h2 = (1.0 - smoothstep(0.04, 0.07, abs(p.y - 0.65))) *
                step(0.15, p.x) * step(p.x, 0.85);
    return max(max(v1, v2), max(h1, h2));
  } else if (idx == 8) {
    // @ — filled disk
    float d = distance(p, vec2(0.5));
    return 1.0 - smoothstep(0.32, 0.36, d);
  }
  // 9: solid block
  return 1.0;
}

vec4 effect(vec2 uv) {
  if (uIntensity <= 0.001) return getSource(uv);

  vec2 pixel = uv * uResolution;
  float cellSize = max(uSize, 1.0);

  // Sample at the cell centre — every pixel inside the cell shares the
  // same luminance and picks the same glyph.
  vec2 cell = floor(pixel / cellSize);
  vec2 cellUV = (cell + 0.5) * cellSize / uResolution;
  vec4 src = getSource(cellUV);
  float lum = dot(src.rgb, vec3(0.299, 0.587, 0.114));

  // 10 density buckets — index 0 (space) through 9 (full block).
  int charIdx = int(floor(clamp(lum, 0.0, 0.999) * 10.0));

  // Position within the cell, in [0, 1].
  vec2 cellPos = fract(pixel / cellSize);

  float glyph = glyphAt(charIdx, cellPos);

  // White glyphs over a darkened source — terminal vibe with the photo
  // still readable underneath. Multiplying source by 0.15 keeps colour
  // identity (sky stays blue-ish, rocks stay warm) without competing
  // with the glyph foreground.
  vec3 bg = src.rgb * 0.15;
  vec3 asciiRgb = mix(bg, vec3(1.0), glyph);
  vec3 outRgb = mix(getSource(uv).rgb, asciiRgb, uIntensity);
  return vec4(outRgb, src.a);
}
`,
});
