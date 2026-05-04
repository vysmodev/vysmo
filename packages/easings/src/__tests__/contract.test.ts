import { describe, expect, it } from "vitest";
import {
  backOut,
  bounceOut,
  elasticOut,
  linear,
  power2Out,
  spring,
  steps,
} from "../index.js";

const ALL_EASES = [linear, power2Out, backOut, elasticOut, bounceOut, spring, steps];
// Steps opts out of exactEndpoints (stepped "start"/"both" positions need non-zero output at t=0).
const CLAMPING_EASES = [linear, power2Out, backOut, elasticOut, bounceOut, spring];

describe("contract: input validation", () => {
  it.each(ALL_EASES.map((fn) => [fn.easingName, fn] as const))(
    "%s returns 0 on NaN input",
    (_, fn) => {
      expect(fn(Number.NaN)).toBe(0);
    },
  );
  it.each(ALL_EASES.map((fn) => [fn.easingName, fn] as const))(
    "%s returns 0 on +Infinity input",
    (_, fn) => {
      expect(fn(Number.POSITIVE_INFINITY)).toBe(0);
    },
  );
  it.each(ALL_EASES.map((fn) => [fn.easingName, fn] as const))(
    "%s returns 0 on -Infinity input",
    (_, fn) => {
      expect(fn(Number.NEGATIVE_INFINITY)).toBe(0);
    },
  );
  it.each(CLAMPING_EASES.map((fn) => [fn.easingName, fn] as const))(
    "%s clamps t<0 to 0 for exactEndpoint eases",
    (_, fn) => {
      expect(fn(-0.5)).toBe(0);
    },
  );
  it.each(CLAMPING_EASES.map((fn) => [fn.easingName, fn] as const))(
    "%s clamps t>1 to 1 for exactEndpoint eases",
    (_, fn) => {
      expect(fn(1.5)).toBe(1);
    },
  );
});
