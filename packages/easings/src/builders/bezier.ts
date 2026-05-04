import { defineEasing } from "../define.js";
import type { EasingFn } from "../types.js";

const NEWTON_ITERATIONS = 8;
const NEWTON_MIN_SLOPE = 1e-6;
const SUBDIVISION_PRECISION = 1e-7;
const SUBDIVISION_MAX_ITERATIONS = 32;

function a(c1: number, c2: number): number {
  return 1 - 3 * c2 + 3 * c1;
}
function b(c1: number, c2: number): number {
  return 3 * c2 - 6 * c1;
}
function c(c1: number): number {
  return 3 * c1;
}

function sampleCurve(t: number, A: number, B: number, C: number): number {
  return ((A * t + B) * t + C) * t;
}

function sampleDerivative(t: number, A: number, B: number, C: number): number {
  return (3 * A * t + 2 * B) * t + C;
}

function solveCurveX(x: number, ax: number, bx: number, cx: number): number {
  let t = x;
  for (let i = 0; i < NEWTON_ITERATIONS; i++) {
    const slope = sampleDerivative(t, ax, bx, cx);
    if (Math.abs(slope) < NEWTON_MIN_SLOPE) break;
    const currentX = sampleCurve(t, ax, bx, cx) - x;
    t -= currentX / slope;
  }
  let lo = 0;
  let hi = 1;
  t = x;
  if (t < lo) return lo;
  if (t > hi) return hi;
  for (let i = 0; i < SUBDIVISION_MAX_ITERATIONS; i++) {
    const currentX = sampleCurve(t, ax, bx, cx);
    if (Math.abs(currentX - x) < SUBDIVISION_PRECISION) return t;
    if (currentX < x) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  return t;
}

export function bezier(p1x: number, p1y: number, p2x: number, p2y: number): EasingFn {
  if (p1x < 0 || p1x > 1 || p2x < 0 || p2x > 1) {
    throw new RangeError(
      `bezier: control point x coordinates must be in [0, 1]; got p1x=${p1x}, p2x=${p2x}`,
    );
  }
  const ax = a(p1x, p2x);
  const bx = b(p1x, p2x);
  const cx = c(p1x);
  const ay = a(p1y, p2y);
  const by = b(p1y, p2y);
  const cy = c(p1y);
  const linear = p1x === p1y && p2x === p2y;
  const name = `bezier(${p1x}, ${p1y}, ${p2x}, ${p2y})`;
  if (linear) return defineEasing(name, (t) => t);
  return defineEasing(name, (t) => sampleCurve(solveCurveX(t, ax, bx, cx), ay, by, cy));
}

export const bezierEase = bezier(0.25, 0.1, 0.25, 1);
export const bezierEaseIn = bezier(0.42, 0, 1, 1);
export const bezierEaseOut = bezier(0, 0, 0.58, 1);
export const bezierEaseInOut = bezier(0.42, 0, 0.58, 1);
