import { linear } from "./easings/linear.js";
import type { EasingFn } from "./types.js";

/**
 * Check if the user has requested reduced motion via OS-level setting.
 * Returns false when no DOM is available (SSR / Node).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Wrap an easing to respect the user's `prefers-reduced-motion` setting.
 * When reduced motion is requested, returns `fallback` (default: linear);
 * otherwise returns the original ease.
 *
 * Evaluated at call time — not reactive to preference changes during the
 * lifetime of a single animation. For long-running apps, re-evaluate when
 * starting new animations.
 */
export function respectReducedMotion(ease: EasingFn, fallback: EasingFn = linear): EasingFn {
  return prefersReducedMotion() ? fallback : ease;
}
