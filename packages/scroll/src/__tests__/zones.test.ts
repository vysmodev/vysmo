import { describe, expect, it } from "vitest";
import {
  scrollPlateau,
  scrollRange,
  scrollZones,
  smoothstep,
} from "../zones.js";

const linear = (t: number) => t;

describe("smoothstep", () => {
  it("matches linear at 0, 0.5, 1 (useful for tests that assert endpoints)", () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(0.5)).toBeCloseTo(0.5, 5);
    expect(smoothstep(1)).toBe(1);
  });

  it("eases in and out — below linear near 0, above near 1", () => {
    expect(smoothstep(0.25)).toBeCloseTo(0.15625, 5); // 0.25² · (3 − 0.5)
    expect(smoothstep(0.75)).toBeCloseTo(0.84375, 5); // symmetric complement
  });
});

describe("scrollRange", () => {
  it("returns 0 before start, 1 after end, smoothstep in between", () => {
    const r = scrollRange(0.1, 0.5);
    expect(r(0)).toBe(0);
    expect(r(0.1)).toBe(0);
    expect(r(0.3)).toBeCloseTo(0.5, 5); // smoothstep(0.5) = 0.5
    expect(r(0.5)).toBe(1);
    expect(r(0.9)).toBe(1);
  });

  it("start == end collapses to a step", () => {
    const r = scrollRange(0.5, 0.5);
    expect(r(0.49)).toBe(0);
    expect(r(0.5)).toBe(1);
    expect(r(0.6)).toBe(1);
  });

  it("end < start is treated as a step", () => {
    const r = scrollRange(0.8, 0.2);
    expect(r(0.5)).toBe(0);
    expect(r(0.9)).toBe(1);
  });

  it("linear ease yields the identity over [0, 1]", () => {
    const r = scrollRange(0, 1, linear);
    expect(r(0)).toBe(0);
    expect(r(0.25)).toBeCloseTo(0.25, 5);
    expect(r(0.5)).toBeCloseTo(0.5, 5);
    expect(r(1)).toBe(1);
  });

  it("accepts a custom ease to shape the ramp", () => {
    const r = scrollRange(0, 1, (t) => t * t);
    expect(r(0.5)).toBeCloseTo(0.25, 5);
  });
});

describe("scrollZones", () => {
  it("returns 0 inside the clear zone", () => {
    const z = scrollZones(0.25, 0.85);
    expect(z(0.25)).toBe(0);
    expect(z(0.5)).toBe(0);
    expect(z(0.85)).toBe(0);
  });

  it("ramps from 1 to 0 through the entry zone", () => {
    const z = scrollZones(0.2, 0.8);
    expect(z(0)).toBe(1);
    expect(z(0.1)).toBeCloseTo(0.5, 5);
    expect(z(0.2)).toBe(0);
  });

  it("ramps from 0 to 1 through the exit zone", () => {
    const z = scrollZones(0.2, 0.8);
    expect(z(0.8)).toBe(0);
    expect(z(0.9)).toBeCloseTo(0.5, 5);
    expect(z(1)).toBe(1);
  });

  it("is symmetric around the midpoint when the clear zone is centered", () => {
    const z = scrollZones(0.3, 0.7);
    for (const p of [0, 0.1, 0.15, 0.3, 0.7, 0.85, 0.9, 1]) {
      expect(z(p)).toBeCloseTo(z(1 - p), 5);
    }
  });

  it("clear zone spanning the whole range yields zero everywhere", () => {
    const z = scrollZones(0, 1);
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      expect(z(p)).toBe(0);
    }
  });

  it("clearStart at 0 collapses the entry ramp to a step at the zone edge", () => {
    const z = scrollZones(0, 0.5);
    expect(z(0)).toBe(0);
    expect(z(0.3)).toBe(0);
  });

  it("clearEnd at 1 collapses the exit ramp to a step at the zone edge", () => {
    const z = scrollZones(0.5, 1);
    expect(z(0.75)).toBe(0);
    expect(z(1)).toBe(0);
  });

  it("default ramp uses smoothstep — softer than linear near boundaries", () => {
    const z = scrollZones(0.2, 0.8);
    // At local_t = 0.25 of the entry ramp (p = 0.05), smoothstep yields
    // 0.15625, so the output (1 − smoothstep) ≈ 0.844, vs linear's 0.75.
    expect(z(0.05)).toBeCloseTo(0.84375, 5);
  });

  it("accepts a custom ease to override the default smoothstep", () => {
    const z = scrollZones(0.2, 0.8, linear);
    expect(z(0.1)).toBeCloseTo(0.5, 5); // linear midpoint of ramp
    expect(z(0.05)).toBeCloseTo(0.75, 5); // linear at local_t = 0.25
  });
});

describe("scrollPlateau", () => {
  it("returns 1 inside the clear zone", () => {
    const z = scrollPlateau(0.3, 0.7);
    expect(z(0.3)).toBe(1);
    expect(z(0.5)).toBe(1);
    expect(z(0.7)).toBe(1);
  });

  it("ramps from 0 to 1 through the entry zone", () => {
    const z = scrollPlateau(0.2, 0.8);
    expect(z(0)).toBe(0);
    expect(z(0.1)).toBeCloseTo(0.5, 5);
    expect(z(0.2)).toBe(1);
  });

  it("ramps from 1 to 0 through the exit zone", () => {
    const z = scrollPlateau(0.2, 0.8);
    expect(z(0.8)).toBe(1);
    expect(z(0.9)).toBeCloseTo(0.5, 5);
    expect(z(1)).toBe(0);
  });

  it("is symmetric around the midpoint when the clear zone is centered", () => {
    const z = scrollPlateau(0.3, 0.7);
    for (const p of [0, 0.1, 0.15, 0.3, 0.7, 0.85, 0.9, 1]) {
      expect(z(p)).toBeCloseTo(z(1 - p), 5);
    }
  });

  it("is 1 − scrollZones at every sample point (by construction)", () => {
    const a = scrollPlateau(0.3, 0.7);
    const b = scrollZones(0.3, 0.7);
    for (let i = 0; i <= 10; i++) {
      const p = i / 10;
      expect(a(p) + b(p)).toBeCloseTo(1, 5);
    }
  });

  it("default smoothstep produces a C1 approach to the plateau — no harsh snap", () => {
    const z = scrollPlateau(0.2, 0.8);
    // Just before the plateau starts: the output should have eased close
    // to 1 rather than still climbing linearly. At p = 0.18, local_t = 0.9.
    // smoothstep(0.9) = 0.972; linear would give 0.9.
    expect(z(0.18)).toBeCloseTo(0.972, 3);
    expect(z(0.82)).toBeCloseTo(0.972, 3); // symmetric on the exit side
  });

  it("accepts a custom ease to override the default smoothstep", () => {
    const z = scrollPlateau(0.2, 0.8, linear);
    expect(z(0.1)).toBeCloseTo(0.5, 5);
    expect(z(0.18)).toBeCloseTo(0.9, 5);
  });
});
