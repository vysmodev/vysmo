import { defineTransition } from "./define.js";

/**
 * The plane is subdivided into tiles; each tile flies off into 3D
 * space (outward xy drift from the source point, push back in z, and
 * a random-axis rotation around its own centroid), staggered by per-
 * tile offset. A fake-perspective divide lets z-motion visibly shrink
 * the tile on screen so the fly-back feels spatial rather than flat.
 *
 * Tiles fade out over the last 30% of their flight. Behind them, a
 * back plane at z=0.99 shows `to`. At progress=0 every tile is at
 * rest covering the plane (pure from); at progress=1 every tile has
 * completed its flight with alpha=0 and the back plane is unobscured
 * (pure to).
 *
 * This proves per-primitive 3D motion — the three.js flying-tiles
 * reference the user pointed at. Per-quad attributes (aCentroid,
 * aOffset, aRandom shared across a tile's 6 verts) let each tile
 * translate and rotate coherently.
 */
export const tileScatter = defineTransition({
  name: "tile-scatter",
  mesh: { subdivisions: [20, 12], instances: 2 },
  defaults: {
    scatter: 1.0,
    source: [0.5, 0.5] as const,
  },
  vertex: `
uniform float uScatter;
uniform vec2 uSource;

out float vAlpha;
flat out int vInstance;

#define PI 3.14159265359
#define WINDOW 0.35

float hash(float n) {
  return fract(sin(n * 12.9898 + 4.1371) * 43758.5453);
}

mat3 rotationMatrix(vec3 axis, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  float t = 1.0 - c;
  vec3 a = axis;
  return mat3(
    c + a.x * a.x * t,      a.y * a.x * t + a.z * s, a.z * a.x * t - a.y * s,
    a.x * a.y * t - a.z * s, c + a.y * a.y * t,     a.z * a.y * t + a.x * s,
    a.x * a.z * t + a.y * s, a.y * a.z * t - a.x * s, c + a.z * a.z * t
  );
}

void main() {
  vUv = aUv;
  vInstance = gl_InstanceID;

  if (gl_InstanceID == 0) {
    // Back plane: destination, far z.
    gl_Position = vec4(aPosition, 0.99, 1.0);
    vAlpha = 1.0;
    return;
  }

  float start = aOffset * (1.0 - WINDOW);
  float localT = smoothstep(start, start + WINDOW, uProgress);

  // Random rotation: axis per tile, angle rate per tile.
  vec3 axis = normalize(vec3(
    hash(aRandom) * 2.0 - 1.0,
    hash(aRandom + 0.13) * 2.0 - 1.0,
    hash(aRandom + 0.27) * 2.0 - 1.0
  ));
  float angle = localT * PI * 1.6 * (0.6 + hash(aRandom + 0.41) * 0.8);
  mat3 rot = rotationMatrix(axis, angle);

  // Rotate the vertex around the tile centroid.
  vec3 local = vec3(aPosition - aCentroid, 0.0);
  vec3 rotated = rot * local;

  // Translation: outward from the source point + push back in z.
  vec2 sourceClip = uSource * 2.0 - 1.0;
  vec2 away = aCentroid - sourceClip;
  vec2 awayDir = length(away) > 1e-5 ? normalize(away) : vec2(0.0);

  vec3 translation = vec3(
    awayDir * uScatter * 0.75 * localT,
    uScatter * 2.4 * localT
  );

  // Per-tile jitter so tiles don't all move in perfect radial symmetry.
  vec3 jitter = vec3(
    hash(aRandom + 0.55) * 2.0 - 1.0,
    hash(aRandom + 0.71) * 2.0 - 1.0,
    hash(aRandom + 0.89)
  ) * uScatter * 0.35 * localT;

  vec3 worldPos = vec3(aCentroid, 0.0) + rotated + translation + jitter;

  // Fake perspective: z-motion visibly shrinks tiles on screen.
  float persp = max(1.0 + worldPos.z * 0.45, 0.1);
  vec2 screenXY = worldPos.xy / persp;
  float clipZ = clamp(worldPos.z * 0.15, -0.9, 0.95);

  gl_Position = vec4(screenXY, clipZ, 1.0);

  // Alpha fade over last third of flight.
  vAlpha = 1.0 - smoothstep(0.7, 1.0, localT);
}
`,
  glsl: `
in float vAlpha;
flat in int vInstance;

vec4 transition(vec2 uv) {
  if (vInstance == 0) {
    return getToColor(uv);
  }
  if (vAlpha < 0.01) discard;
  vec4 col = getFromColor(uv);
  return vec4(col.rgb, col.a * vAlpha);
}
`,
});
