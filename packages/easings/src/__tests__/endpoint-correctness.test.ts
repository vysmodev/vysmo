import { describe, expect, it } from "vitest";
import {
  circIn,
  circInOut,
  circOut,
  cubicIn,
  cubicInOut,
  cubicOut,
  expoIn,
  expoInOut,
  expoOut,
  linear,
  none,
  power1In,
  power1InOut,
  power1Out,
  power2In,
  power2InOut,
  power2Out,
  power3In,
  power3InOut,
  power3Out,
  power4In,
  power4InOut,
  power4Out,
  quadIn,
  quadInOut,
  quadOut,
  quartIn,
  quartInOut,
  quartOut,
  quintIn,
  quintInOut,
  quintOut,
  sineIn,
  sineInOut,
  sineOut,
  type EasingFn,
} from "../index.js";

const ALL: ReadonlyArray<[string, EasingFn]> = [
  ["linear", linear],
  ["none", none],
  ["power1.in", power1In],
  ["power1.out", power1Out],
  ["power1.inOut", power1InOut],
  ["power2.in", power2In],
  ["power2.out", power2Out],
  ["power2.inOut", power2InOut],
  ["power3.in", power3In],
  ["power3.out", power3Out],
  ["power3.inOut", power3InOut],
  ["power4.in", power4In],
  ["power4.out", power4Out],
  ["power4.inOut", power4InOut],
  ["sine.in", sineIn],
  ["sine.out", sineOut],
  ["sine.inOut", sineInOut],
  ["circ.in", circIn],
  ["circ.out", circOut],
  ["circ.inOut", circInOut],
  ["expo.in", expoIn],
  ["expo.out", expoOut],
  ["expo.inOut", expoInOut],
];

describe("endpoint correctness", () => {
  it.each(ALL)("%s returns exactly 0 at t=0", (_, fn) => {
    expect(fn(0)).toBe(0);
  });

  it.each(ALL)("%s returns exactly 1 at t=1", (_, fn) => {
    expect(fn(1)).toBe(1);
  });
});

describe("monotonicity (non-overshooting easings)", () => {
  it.each(ALL)("%s is monotonically non-decreasing across [0, 1]", (_, fn) => {
    let prev = fn(0);
    for (let i = 1; i <= 100; i++) {
      const curr = fn(i / 100);
      expect(curr).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = curr;
    }
  });
});

describe("aliases are identical to their power counterparts", () => {
  it("quad == power1", () => {
    expect(quadIn).toBe(power1In);
    expect(quadOut).toBe(power1Out);
    expect(quadInOut).toBe(power1InOut);
  });
  it("cubic == power2", () => {
    expect(cubicIn).toBe(power2In);
    expect(cubicOut).toBe(power2Out);
    expect(cubicInOut).toBe(power2InOut);
  });
  it("quart == power3", () => {
    expect(quartIn).toBe(power3In);
    expect(quartOut).toBe(power3Out);
    expect(quartInOut).toBe(power3InOut);
  });
  it("quint == power4", () => {
    expect(quintIn).toBe(power4In);
    expect(quintOut).toBe(power4Out);
    expect(quintInOut).toBe(power4InOut);
  });
  it("none == linear", () => {
    expect(none).toBe(linear);
  });
});

describe("midpoint sanity", () => {
  it("linear(0.5) === 0.5", () => {
    expect(linear(0.5)).toBe(0.5);
  });
  it("inOut variants cross 0.5 at t=0.5", () => {
    const inOutEasings: EasingFn[] = [
      power1InOut,
      power2InOut,
      power3InOut,
      power4InOut,
      sineInOut,
      circInOut,
      expoInOut,
    ];
    for (const fn of inOutEasings) {
      expect(fn(0.5)).toBeCloseTo(0.5, 6);
    }
  });
  it("in variants stay below 0.5 at t=0.5 (except linear)", () => {
    const inEasings: EasingFn[] = [power1In, power2In, power3In, power4In, sineIn, circIn, expoIn];
    for (const fn of inEasings) {
      expect(fn(0.5)).toBeLessThan(0.5);
    }
  });
  it("out variants exceed 0.5 at t=0.5 (except linear)", () => {
    const outEasings: EasingFn[] = [
      power1Out,
      power2Out,
      power3Out,
      power4Out,
      sineOut,
      circOut,
      expoOut,
    ];
    for (const fn of outEasings) {
      expect(fn(0.5)).toBeGreaterThan(0.5);
    }
  });
});

describe("easing names are set", () => {
  it.each(ALL)("%s has correct easingName property", (name, fn) => {
    if (name === "none") {
      expect(fn.easingName).toBe("linear");
    } else {
      expect(fn.easingName).toBe(name);
    }
  });
});
