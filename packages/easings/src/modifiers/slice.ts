import { defineEasing } from "../define.js";
import type { EasingFn } from "../types.js";

/**
 * Extract a sub-section of an easing curve, stretched to fill [0, 1].
 * Use when you want to play only part of a curve (e.g., just the overshoot
 * portion of `back.out`, or the settle portion of `elastic.out`).
 *
 * The sliced portion is normalised: y(0) = ease(start), y(1) = ease(end),
 * then remapped so the output hits 0 and 1 at the new endpoints.
 */
export function slice(ease: EasingFn, start: number, end: number): EasingFn {
  if (!(start >= 0 && start < end && end <= 1)) {
    throw new RangeError(
      `slice: require 0 <= start < end <= 1; got start=${start}, end=${end}`,
    );
  }
  if (start === 0 && end === 1) return ease;
  const span = end - start;
  const baseStart = ease(start);
  const baseEnd = ease(end);
  const ySpan = baseEnd - baseStart;
  return defineEasing(`slice(${ease.easingName}, ${start}, ${end})`, (t) => {
    const u = start + span * t;
    const v = ease(u);
    if (ySpan === 0) return 0;
    return (v - baseStart) / ySpan;
  });
}
