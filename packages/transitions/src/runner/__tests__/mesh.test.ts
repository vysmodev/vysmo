import { describe, expect, it } from "vitest";
import { buildSubdividedPlane } from "../mesh.js";

describe("buildSubdividedPlane", () => {
  it("produces 2·nx·ny triangles and 3 vertices per face", () => {
    const mesh = buildSubdividedPlane(3, 4);
    expect(mesh.vertexCount).toBe(3 * 4 * 2 * 3);
    expect(mesh.position.length).toBe(mesh.vertexCount * 2);
    expect(mesh.uv.length).toBe(mesh.vertexCount * 2);
    expect(mesh.offset.length).toBe(mesh.vertexCount);
    expect(mesh.centroid.length).toBe(mesh.vertexCount * 2);
    expect(mesh.bary.length).toBe(mesh.vertexCount * 3);
    expect(mesh.random.length).toBe(mesh.vertexCount);
  });

  it("positions span [-1, 1] in clip space on both axes", () => {
    const mesh = buildSubdividedPlane(5, 5);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < mesh.position.length; i += 2) {
      const x = mesh.position[i] as number;
      const y = mesh.position[i + 1] as number;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    expect(minX).toBeCloseTo(-1, 5);
    expect(maxX).toBeCloseTo(1, 5);
    expect(minY).toBeCloseTo(-1, 5);
    expect(maxY).toBeCloseTo(1, 5);
  });

  it("uv matches aPosition · 0.5 + 0.5", () => {
    const mesh = buildSubdividedPlane(3, 3);
    for (let i = 0; i < mesh.vertexCount; i++) {
      const px = mesh.position[i * 2] as number;
      const py = mesh.position[i * 2 + 1] as number;
      const u = mesh.uv[i * 2] as number;
      const v = mesh.uv[i * 2 + 1] as number;
      expect(u).toBeCloseTo(px * 0.5 + 0.5, 5);
      expect(v).toBeCloseTo(py * 0.5 + 0.5, 5);
    }
  });

  it("bary sums to 1 on every vertex and covers all three corners per face", () => {
    const mesh = buildSubdividedPlane(2, 2);
    for (let f = 0; f < mesh.vertexCount / 3; f++) {
      const seen = new Set<string>();
      for (let k = 0; k < 3; k++) {
        const base = (f * 3 + k) * 3;
        const b0 = mesh.bary[base] as number;
        const b1 = mesh.bary[base + 1] as number;
        const b2 = mesh.bary[base + 2] as number;
        expect(b0 + b1 + b2).toBeCloseTo(1, 5);
        seen.add(`${b0},${b1},${b2}`);
      }
      expect(seen.size).toBe(3);
    }
  });

  it("offset is shared across all 6 vertices of a quad (per-quad)", () => {
    const mesh = buildSubdividedPlane(4, 3);
    const vertsPerQuad = 6;
    const quadCount = mesh.vertexCount / vertsPerQuad;
    for (let q = 0; q < quadCount; q++) {
      const v0 = mesh.offset[q * vertsPerQuad] as number;
      for (let k = 1; k < vertsPerQuad; k++) {
        expect(mesh.offset[q * vertsPerQuad + k]).toBe(v0);
      }
    }
  });

  it("offset is a deterministic permutation over quads covering [0, 1]", () => {
    const mesh = buildSubdividedPlane(3, 3);
    const vertsPerQuad = 6;
    const quadCount = mesh.vertexCount / vertsPerQuad;
    const quadOffsets: number[] = [];
    for (let q = 0; q < quadCount; q++) {
      quadOffsets.push(mesh.offset[q * vertsPerQuad] as number);
    }
    const sorted = [...quadOffsets].sort((a, b) => a - b);
    const n = sorted.length;
    expect(sorted[0]).toBe(0);
    expect(sorted[n - 1]).toBe(1);
    const unique = new Set(sorted);
    expect(unique.size).toBe(n);

    const again = buildSubdividedPlane(3, 3);
    for (let i = 0; i < mesh.offset.length; i++) {
      expect(again.offset[i]).toBe(mesh.offset[i]);
    }
  });

  it("centroid is shared across a quad and equals the quad centre", () => {
    const mesh = buildSubdividedPlane(2, 2);
    const vertsPerQuad = 6;
    const quadCount = mesh.vertexCount / vertsPerQuad;
    for (let q = 0; q < quadCount; q++) {
      const cx0 = mesh.centroid[q * vertsPerQuad * 2] as number;
      const cy0 = mesh.centroid[q * vertsPerQuad * 2 + 1] as number;
      // Every vertex of the quad has identical centroid.
      for (let k = 1; k < vertsPerQuad; k++) {
        expect(mesh.centroid[(q * vertsPerQuad + k) * 2]).toBeCloseTo(cx0, 5);
        expect(mesh.centroid[(q * vertsPerQuad + k) * 2 + 1]).toBeCloseTo(cy0, 5);
      }
      // And the centroid equals the mean of the quad's 4 distinct corner positions.
      const positions = new Set<string>();
      for (let k = 0; k < vertsPerQuad; k++) {
        const px = mesh.position[(q * vertsPerQuad + k) * 2] as number;
        const py = mesh.position[(q * vertsPerQuad + k) * 2 + 1] as number;
        positions.add(`${px},${py}`);
      }
      expect(positions.size).toBe(4);
      let sx = 0;
      let sy = 0;
      for (const key of positions) {
        const [xs, ys] = key.split(",");
        sx += parseFloat(xs as string);
        sy += parseFloat(ys as string);
      }
      expect(cx0).toBeCloseTo(sx / 4, 5);
      expect(cy0).toBeCloseTo(sy / 4, 5);
    }
  });
});
