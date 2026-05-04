import type { EaseFn } from "./types.js";

/**
 * Smoothstep — `t² · (3 − 2t)`. C1-continuous S-curve that matches
 * linear at 0, 0.5, and 1 but eases in and out near the boundaries.
 * Used as the default ramp shape for every zone helper so transitions
 * and effects decelerate smoothly into their plateaus instead of
 * snapping on the derivative discontinuity of a pure linear ramp.
 *
 * Exported so callers can reach for it explicitly, or compose it.
 */
export const smoothstep: EaseFn = (t) => t * t * (3 - 2 * t);

/**
 * Clamp progress to a sub-range. Outside the range, the output stays flat
 * (0 before `start`, 1 after `end`). Inside, progress is remapped from
 * `[start, end]` to `[0, 1]` through the supplied ease (default:
 * {@link smoothstep}).
 *
 *   scrollRange(0.1, 0.5) — transition plays between 10% and 50% of the
 *   full viewport sweep; does nothing before, stays at its final state
 *   after. Pass `ease: (t) => t` for a linear clamp.
 *
 * Designed for `createScrollTransition` so the transition completes at a
 * point the author chooses — typically well before the section exits the
 * viewport — and then holds its final state while the user keeps scrolling.
 */
export function scrollRange(
  start: number,
  end: number,
  ease: EaseFn = smoothstep,
): EaseFn {
  if (end <= start) return (p) => (p < start ? 0 : 1);
  const span = end - start;
  return (p) => {
    if (p <= start) return 0;
    if (p >= end) return 1;
    return ease((p - start) / span);
  };
}

/**
 * Three-zone bathtub envelope for effects.
 *
 *   scrollZones(0.25, 0.85) — effect ramps from max at `p = 0` down to
 *   zero at `p = 0.25` (smoothly by default), stays at zero through the
 *   clear zone (`0.25 ≤ p ≤ 0.85`), then ramps back up to max by
 *   `p = 1`.
 *
 * Designed for `createScrollEffect` where "identity" is zero intensity —
 * so the image reads cleanly while the section is visible and the effect
 * only appears as it enters and exits the viewport. Pass `ease: (t) => t`
 * for a linear ramp; default is {@link smoothstep}.
 */
export function scrollZones(
  clearStart: number,
  clearEnd: number,
  ease: EaseFn = smoothstep,
): EaseFn {
  return (p) => {
    if (p < clearStart) {
      if (clearStart <= 0) return 0;
      return 1 - ease(p / clearStart);
    }
    if (p > clearEnd) {
      if (clearEnd >= 1) return 0;
      return ease((p - clearEnd) / (1 - clearEnd));
    }
    return 0;
  };
}

/**
 * Three-zone plateau envelope — the inverse of {@link scrollZones}.
 *
 *   scrollPlateau(0.3, 0.7) — rises from 0 at `p = 0` up to 1 at
 *   `p = 0.3` (smoothly by default), holds at 1 across the clear zone
 *   (`0.3 ≤ p ≤ 0.7`), then falls back to 0 by `p = 1`.
 *
 * Designed for `createScrollTransition` where "identity" is the fully
 * transitioned state (progress 1). The transition plays in as the
 * section enters, holds its final frame across the clear zone, then
 * plays back out (reverse) as the section exits. Smoothstep default
 * prevents the harsh snap that a linear ramp produces at the plateau
 * boundaries.
 */
export function scrollPlateau(
  clearStart: number,
  clearEnd: number,
  ease: EaseFn = smoothstep,
): EaseFn {
  return (p) => {
    if (p < clearStart) {
      if (clearStart <= 0) return 1;
      return ease(p / clearStart);
    }
    if (p > clearEnd) {
      if (clearEnd >= 1) return 1;
      return 1 - ease((p - clearEnd) / (1 - clearEnd));
    }
    return 1;
  };
}
