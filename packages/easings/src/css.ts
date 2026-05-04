import type { EasingFn } from "./types.js";

/**
 * Convert any easing to a CSS `linear()` timing-function value by sampling
 * the curve at evenly-spaced points.
 *
 * ```css
 * animation-timing-function: linear(0, 0.3, 0.7, 1);
 * ```
 *
 * CSS interpolates linearly between the sampled points, so higher sample
 * counts produce smoother-looking motion. 40 samples is a good default
 * balance between fidelity and string length. Requires browsers that
 * support CSS Easing Functions Level 2 (~all majors since 2024).
 *
 * @param ease  An EasingFn or plain (t: number) => number
 * @param samples  Number of samples + 1 across [0, 1]. Default 40.
 */
export function toCSSLinear(ease: EasingFn | ((t: number) => number), samples = 40): string {
  if (samples < 1 || !Number.isInteger(samples)) {
    throw new RangeError(`toCSSLinear: samples must be a positive integer; got ${samples}`);
  }
  const values: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    values.push(formatNumber(ease(t)));
  }
  return `linear(${values.join(", ")})`;
}

/**
 * Emit a CSS cubic-bezier() timing function. Exact representation; no
 * sampling. Use this when you'd otherwise build an easing via `bezier()`
 * from this package.
 *
 * ```css
 * animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
 * ```
 */
export function toCSSBezier(p1x: number, p1y: number, p2x: number, p2y: number): string {
  return `cubic-bezier(${formatNumber(p1x)}, ${formatNumber(p1y)}, ${formatNumber(p2x)}, ${formatNumber(p2y)})`;
}

/**
 * Emit a `@keyframes` block driving a numeric CSS property (e.g. translate,
 * opacity) through an ease. The animation should be declared with
 * `animation-timing-function: linear` because the easing is pre-baked into
 * the keyframes.
 *
 * ```css
 * ${toCSSKeyframes("slideIn", "transform", (v) => `translateX(${v * 100}%)`, ease)}
 * ```
 */
export function toCSSKeyframes(
  name: string,
  property: string,
  valueForProgress: (easedValue: number) => string,
  ease: EasingFn | ((t: number) => number),
  samples = 20,
): string {
  if (samples < 2) {
    throw new RangeError(`toCSSKeyframes: samples must be >= 2; got ${samples}`);
  }
  const lines: string[] = [`@keyframes ${name} {`];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const pct = (t * 100).toFixed(2).replace(/\.?0+$/, "");
    const value = valueForProgress(ease(t));
    lines.push(`  ${pct}% { ${property}: ${value}; }`);
  }
  lines.push("}");
  return lines.join("\n");
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (Number.isInteger(n)) return n.toString();
  return Number(n.toFixed(5)).toString();
}
