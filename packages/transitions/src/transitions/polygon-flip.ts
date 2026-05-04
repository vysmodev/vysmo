import { defineTransition } from "./define.js";

/**
 * Subdivided plane of square tiles. Each tile flips 180° around a
 * horizontal axis through its centre, staggered by a diagonal wavefront
 * so the flip sweeps top-left → bottom-right with per-tile jitter.
 *
 * Because a tile (quad) is self-symmetric under 180° horizontal flip,
 * its canvas footprint is invariant across the rotation — no "screwed
 * rect" overlap with neighbours. The two triangles that compose each
 * tile share the same per-quad centroid, so they flip together.
 *
 * Front face (angle 0 → π/2) samples `from` at the tile's own uv —
 * source content rides on the flipping card. Back face (angle π/2 → π)
 * samples `to` at gl_FragCoord-based screen uv — destination stays
 * pinned to the canvas, so at progress=1 every pixel is exactly to.
 *
 * Instance 0 is a back plane at z=0.9 cross-fading from → to; it fills
 * the thin moments when a tile is edge-on so the full-frame rule holds.
 *
 * Endpoints: progress 0 → all tiles flat, front-facing, sampling from
 * at aUv = pixel-pure from. Progress 1 → all tiles flat-mirrored (tile
 * is self-symmetric), back-facing, sampling to at screen uv = pixel-
 * pure to.
 */
export const polygonFlip = defineTransition({
  name: "polygon-flip",
  mesh: { subdivisions: [24, 14], instances: 2 },
  defaults: {
    rim: 0.25,
  },
  vertex: `
out float vFlip;
flat out int vInstance;

#define PI 3.14159265359

void main() {
  vInstance = gl_InstanceID;
  vUv = aUv;

  if (gl_InstanceID == 0) {
    gl_Position = vec4(aPosition, 0.9, 1.0);
    vFlip = 0.0;
    return;
  }

  // Diagonal wavefront top-left → bottom-right, plus a strong per-tile
  // jitter so neighbours don't all finish together. aCentroid is per-
  // quad (same for all 6 vertices of a tile) so the whole tile flips
  // as one unit.
  float waveX = (aCentroid.x + 1.0) * 0.5;
  float waveY = 1.0 - (aCentroid.y + 1.0) * 0.5;  // top → bottom
  float wave = waveX * 0.55 + waveY * 0.35 + (aOffset - 0.5) * 0.35;
  wave = clamp(wave, 0.0, 1.0);

  float window = 0.22;
  float start = wave * (1.0 - window);
  float t = smoothstep(start, start + window, uProgress);
  vFlip = t;

  float angle = t * PI;
  float c = cos(angle);
  float s = sin(angle);

  vec2 p = aPosition - aCentroid;
  vec3 q = vec3(p.x, p.y * c, p.y * s);
  q.xy += aCentroid;

  // Slight z-bias forward of the back plane; in-plane rotation produces
  // a small depth spread that helps adjacent tiles resolve cleanly.
  gl_Position = vec4(q.x, q.y, q.z * 0.4 + 0.05, 1.0);
}
`,
  glsl: `
in float vFlip;
flat in int vInstance;
uniform float uRim;

vec4 transition(vec2 uv) {
  if (vInstance == 0) {
    return mix(getFromColor(uv), getToColor(uv), smoothstep(0.0, 1.0, uProgress));
  }

  vec2 screenUv = gl_FragCoord.xy / uResolution;
  vec4 col = gl_FrontFacing ? getFromColor(uv) : getToColor(screenUv);

  // Subtle rim darkening across the flip window — tiles read as
  // tilted cards catching light, without the hard wireframe look
  // that fwidth(bary) edge highlights produce.
  float amt = 4.0 * vFlip * (1.0 - vFlip);
  col.rgb *= 1.0 - amt * uRim;

  return col;
}
`,
});
