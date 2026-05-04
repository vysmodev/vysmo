/**
 * Subdivided-plane geometry for mesh-based transitions.
 *
 * Output is unindexed (6 vertices per quad, 3 per triangle). Attributes
 * are organised so the two triangles that form a quad share per-face
 * data — a quad is the natural "face" unit for flip/scatter/fly effects
 * because a square quad is self-symmetric under 180° rotation, whereas
 * a right-isoceles triangle is not.
 *
 * Layout per vertex:
 *   aPosition  — per-vertex, clip space [-1, 1]
 *   aUv        — per-vertex, texture space [0, 1]
 *   aBary      — per-vertex, barycentric within its triangle
 *   aCentroid  — per-QUAD centre, shared by all 6 verts of a quad
 *   aOffset    — per-QUAD deterministic shuffle in [0, 1]
 *   aRandom    — per-QUAD independent hash in [0, 1]
 */
export interface MeshBuffers {
  vertexCount: number;
  position: Float32Array;
  uv: Float32Array;
  offset: Float32Array;
  centroid: Float32Array;
  bary: Float32Array;
  random: Float32Array;
}

const BARY_A: readonly [number, number, number] = [1, 0, 0];
const BARY_B: readonly [number, number, number] = [0, 1, 0];
const BARY_C: readonly [number, number, number] = [0, 0, 1];

function seededShuffledOffsets(n: number): Float32Array {
  const out = new Float32Array(n);
  if (n === 0) return out;
  if (n === 1) {
    out[0] = 0;
    return out;
  }
  for (let i = 0; i < n; i++) out[i] = i / (n - 1);
  // Park-Miller LCG, seeded deterministically.
  let seed = 1337;
  for (let i = n - 1; i > 0; i--) {
    seed = (seed * 48271) % 0x7fffffff;
    const j = seed % (i + 1);
    const tmp = out[i] as number;
    out[i] = out[j] as number;
    out[j] = tmp;
  }
  return out;
}

function hash01(k: number): number {
  // Shadertoy-style hash, deterministic per integer input.
  const x = Math.sin(k * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function buildSubdividedPlane(nx: number, ny: number): MeshBuffers {
  const gridX = Math.max(1, Math.floor(nx));
  const gridY = Math.max(1, Math.floor(ny));
  const quadCount = gridX * gridY;
  const faceCount = quadCount * 2;
  const vertexCount = faceCount * 3;

  const position = new Float32Array(vertexCount * 2);
  const uv = new Float32Array(vertexCount * 2);
  const offset = new Float32Array(vertexCount);
  const centroid = new Float32Array(vertexCount * 2);
  const bary = new Float32Array(vertexCount * 3);
  const random = new Float32Array(vertexCount);

  const quadOffsets = seededShuffledOffsets(quadCount);

  const dx = 2 / gridX;
  const dy = 2 / gridY;

  let v = 0;

  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      const quadIdx = iy * gridX + ix;
      const x0 = -1 + ix * dx;
      const x1 = x0 + dx;
      const y0 = -1 + iy * dy;
      const y1 = y0 + dy;

      const cx = (x0 + x1) * 0.5;
      const cy = (y0 + y1) * 0.5;
      const quadOffset = quadOffsets[quadIdx] as number;
      const quadRandom = hash01(quadIdx + 1);

      // Two triangles per quad: (x0,y0)-(x1,y0)-(x0,y1) and (x1,y0)-(x1,y1)-(x0,y1).
      const tris: Array<[[number, number], [number, number], [number, number]]> = [
        [
          [x0, y0],
          [x1, y0],
          [x0, y1],
        ],
        [
          [x1, y0],
          [x1, y1],
          [x0, y1],
        ],
      ];

      for (const tri of tris) {
        const verts = [tri[0], tri[1], tri[2]];
        const barys = [BARY_A, BARY_B, BARY_C];

        for (let k = 0; k < 3; k++) {
          const vert = verts[k] as [number, number];
          const b = barys[k] as readonly [number, number, number];
          const p0 = vert[0];
          const p1 = vert[1];

          position[v * 2] = p0;
          position[v * 2 + 1] = p1;
          uv[v * 2] = p0 * 0.5 + 0.5;
          uv[v * 2 + 1] = p1 * 0.5 + 0.5;
          offset[v] = quadOffset;
          centroid[v * 2] = cx;
          centroid[v * 2 + 1] = cy;
          bary[v * 3] = b[0];
          bary[v * 3 + 1] = b[1];
          bary[v * 3 + 2] = b[2];
          random[v] = quadRandom;

          v++;
        }
      }
    }
  }

  return { vertexCount, position, uv, offset, centroid, bary, random };
}
