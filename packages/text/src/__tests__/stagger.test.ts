import { describe, expect, it } from "vitest";
import { computeStaggerDelays } from "../stagger.js";

describe("computeStaggerDelays", () => {
  it("start order returns 0, g, 2g, ...", () => {
    expect(computeStaggerDelays(4, 10, "start")).toEqual([0, 10, 20, 30]);
  });

  it("end order reverses start", () => {
    expect(computeStaggerDelays(4, 10, "end")).toEqual([30, 20, 10, 0]);
  });

  it("center order grows outward from the center", () => {
    const d = computeStaggerDelays(5, 10, "center");
    // mid = 2 → ranks: |0-2|, |1-2|, |2-2|, |3-2|, |4-2| = 2,1,0,1,2
    expect(d).toEqual([20, 10, 0, 10, 20]);
  });

  it("edges order is the inverse of center — fires outer first", () => {
    const d = computeStaggerDelays(5, 10, "edges");
    // ranks: mid - |i-mid| = 0,1,2,1,0
    expect(d).toEqual([0, 10, 20, 10, 0]);
  });

  it("random order produces a permutation of [0..N-1] × stagger", () => {
    const rng = makeRng(42);
    const d = computeStaggerDelays(6, 10, "random", rng);
    const sorted = [...d].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 10, 20, 30, 40, 50]);
  });

  it("returns all zeros when stagger is 0", () => {
    expect(computeStaggerDelays(4, 0, "start")).toEqual([0, 0, 0, 0]);
  });

  it("returns [] for count 0", () => {
    expect(computeStaggerDelays(0, 10, "start")).toEqual([]);
  });
});

function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
