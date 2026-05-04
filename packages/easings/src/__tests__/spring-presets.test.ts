import { describe, expect, it } from "vitest";
import {
  SPRING_PRESETS,
  gentleSpring,
  molassesSpring,
  slowSpring,
  stiffSpring,
  wobblySpring,
} from "../index.js";

describe("spring presets", () => {
  it("all presets hit endpoints", () => {
    for (const preset of [gentleSpring, wobblySpring, stiffSpring, slowSpring, molassesSpring]) {
      expect(preset(0)).toBe(0);
      expect(preset(1)).toBe(1);
    }
  });

  it("wobbly has more oscillation than stiff", () => {
    let wobblyCrossings = 0;
    let stiffCrossings = 0;
    let prevW = wobblySpring(0);
    let prevS = stiffSpring(0);
    for (let i = 1; i <= 200; i++) {
      const w = wobblySpring(i / 200);
      const s = stiffSpring(i / 200);
      if ((prevW < 1 && w >= 1) || (prevW > 1 && w <= 1)) wobblyCrossings++;
      if ((prevS < 1 && s >= 1) || (prevS > 1 && s <= 1)) stiffCrossings++;
      prevW = w;
      prevS = s;
    }
    expect(wobblyCrossings).toBeGreaterThanOrEqual(stiffCrossings);
  });

  it("molasses is heavily damped (no overshoot)", () => {
    let max = 0;
    for (let i = 0; i <= 200; i++) max = Math.max(max, molassesSpring(i / 200));
    expect(max).toBeLessThanOrEqual(1 + 1e-6);
  });

  it("SPRING_PRESETS values are sensible", () => {
    for (const [, cfg] of Object.entries(SPRING_PRESETS)) {
      expect(cfg.stiffness).toBeGreaterThan(0);
      expect(cfg.damping).toBeGreaterThan(0);
      expect(cfg.mass).toBeGreaterThan(0);
    }
  });
});
