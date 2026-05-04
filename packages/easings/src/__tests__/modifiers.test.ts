import { describe, expect, it } from "vitest";
import {
  blend,
  chain,
  compose,
  linear,
  mirror,
  power2In,
  power2Out,
  power3In,
  reverse,
  sineOut,
  yoyo,
} from "../index.js";

describe("reverse", () => {
  it("reverse(power2In) matches power2Out", () => {
    const rev = reverse(power2In);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(rev(t)).toBeCloseTo(power2Out(t), 10);
    }
  });
  it("reverse(reverse(f)) === f (up to FP)", () => {
    const double = reverse(reverse(power2In));
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(double(t)).toBeCloseTo(power2In(t), 10);
    }
  });
  it("propagates name", () => {
    expect(reverse(power2In).easingName).toBe("reverse(power2.in)");
  });
});

describe("mirror", () => {
  it("mirror(linear) is still linear", () => {
    const m = mirror(linear);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(m(t)).toBeCloseTo(t, 10);
    }
  });
  it("mirror of an in-ease crosses 0.5 at t=0.5", () => {
    const m = mirror(power2In);
    expect(m(0.5)).toBeCloseTo(0.5, 10);
  });
  it("mirror hits endpoints", () => {
    const m = mirror(power3In);
    expect(m(0)).toBe(0);
    expect(m(1)).toBe(1);
  });
});

describe("yoyo", () => {
  it("returns to 0 at t=1", () => {
    const y = yoyo(power2In);
    expect(y(1)).toBeCloseTo(0, 10);
  });
  it("peaks at t=0.5", () => {
    const y = yoyo(power2In);
    expect(y(0.5)).toBeCloseTo(1, 10);
  });
  it("is symmetric around t=0.5", () => {
    const y = yoyo(power2In);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(y(t)).toBeCloseTo(y(1 - t), 10);
    }
  });
});

describe("chain", () => {
  it("two equal-duration linear segments reproduce linear", () => {
    const c = chain([
      { ease: linear, duration: 1, from: 0, to: 0.5 },
      { ease: linear, duration: 1, from: 0.5, to: 1 },
    ]);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(c(t)).toBeCloseTo(t, 10);
    }
  });
  it("segments respect duration ratios", () => {
    const c = chain([
      { ease: linear, duration: 3, from: 0, to: 0.9 },
      { ease: linear, duration: 1, from: 0.9, to: 1 },
    ]);
    expect(c(0.75)).toBeCloseTo(0.9, 10);
  });
  it("auto-fills endpoints when omitted", () => {
    const c = chain([{ ease: sineOut, duration: 1 }]);
    expect(c(0)).toBeCloseTo(0, 10);
    expect(c(1)).toBeCloseTo(1, 10);
  });
  it("rejects empty segments", () => {
    expect(() => chain([])).toThrow(RangeError);
  });
});

describe("blend", () => {
  it("weight 0 returns pure a", () => {
    const b = blend(power2In, power2Out, 0);
    expect(b).toBe(power2In);
  });
  it("weight 1 returns pure b", () => {
    const b = blend(power2In, power2Out, 1);
    expect(b).toBe(power2Out);
  });
  it("weight 0.5 is the midpoint average", () => {
    const b = blend(power2In, power2Out, 0.5);
    for (let i = 1; i < 10; i++) {
      const t = i / 10;
      expect(b(t)).toBeCloseTo((power2In(t) + power2Out(t)) / 2, 10);
    }
  });
});

describe("compose", () => {
  it("compose(a, linear) === a", () => {
    const c = compose(power2In, linear);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(c(t)).toBeCloseTo(power2In(t), 10);
    }
  });
  it("compose(power2In, power2In) applies it twice", () => {
    const c = compose(power2In, power2In);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      expect(c(t)).toBeCloseTo(power2In(power2In(t)), 10);
    }
  });
});
