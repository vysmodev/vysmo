import { defineEasing } from "../define.js";
import type { EasingFn } from "../types.js";

export type CustomPoint = readonly [x: number, y: number];

/**
 * Build an easing from a sequence of (x, y) control points, interpolated
 * linearly between them. Use for hand-drawn curves, exported visualiser
 * data, or any non-analytic easing shape.
 *
 * Points must be in ascending x order with x in [0, 1]. Endpoints are
 * clamped to (0, 0) and (1, 1) by the framework — provide those points
 * explicitly if you want to see the un-clamped curve.
 */
export function custom(points: ReadonlyArray<CustomPoint>): EasingFn {
  if (points.length < 2) {
    throw new RangeError(`custom: at least 2 points required; got ${points.length}`);
  }
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    if (curr[0] < prev[0]) {
      throw new RangeError(
        `custom: points must be sorted by ascending x; got ${prev[0]} then ${curr[0]} at index ${i}`,
      );
    }
  }
  const name = `custom(${points.length} points)`;
  return defineEasing(name, (t) => {
    if (t <= points[0]![0]) return points[0]![1];
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i]!;
      if (t <= x1) {
        const [x0, y0] = points[i - 1]!;
        const span = x1 - x0;
        if (span === 0) return y1;
        const u = (t - x0) / span;
        return y0 + (y1 - y0) * u;
      }
    }
    return points[points.length - 1]![1];
  });
}
