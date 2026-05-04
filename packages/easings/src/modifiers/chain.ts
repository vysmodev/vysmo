import { defineEasing } from "../define.js";
import type { EasingFn } from "../types.js";

export type ChainSegment = {
  /** Ease for this segment. Input t is [0, 1] within the segment. */
  ease: EasingFn;
  /** Fraction of total duration this segment occupies. Must be > 0. */
  duration: number;
  /** Starting output value for the segment. Defaults to previous segment's end or 0. */
  from?: number;
  /** Ending output value. Defaults to the next segment's `from` or 1. */
  to?: number;
};

/**
 * Chain multiple eases sequentially across [0, 1]. Each segment has its
 * own duration and output range. Useful for multi-phase animations
 * (e.g., "power2.in for 30%, then spring for 70%").
 */
export function chain(segments: ReadonlyArray<ChainSegment>): EasingFn {
  if (segments.length === 0) {
    throw new RangeError("chain: at least one segment required");
  }
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
  if (totalDuration <= 0) {
    throw new RangeError("chain: total duration must be > 0");
  }
  type ResolvedSegment = {
    ease: EasingFn;
    start: number;
    end: number;
    from: number;
    to: number;
  };
  const resolved: ResolvedSegment[] = [];
  let cursor = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const start = cursor;
    const end = cursor + seg.duration / totalDuration;
    const prevEnd = i > 0 ? resolved[i - 1]!.to : 0;
    const nextFrom = segments[i + 1]?.from;
    const from = seg.from ?? prevEnd;
    const to = seg.to ?? nextFrom ?? (i === segments.length - 1 ? 1 : from);
    resolved.push({ ease: seg.ease, start, end, from, to });
    cursor = end;
  }
  const name = `chain(${segments.map((s) => s.ease.easingName).join(", ")})`;
  return defineEasing(
    name,
    (t) => {
      for (const seg of resolved) {
        if (t <= seg.end) {
          const span = seg.end - seg.start;
          const localT = span === 0 ? 0 : (t - seg.start) / span;
          return seg.from + (seg.to - seg.from) * seg.ease(localT);
        }
      }
      return resolved[resolved.length - 1]!.to;
    },
    { exactEndpoints: false },
  );
}
