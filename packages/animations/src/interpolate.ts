import type { Interpolable } from "./types.js";

function isPlainObject(value: unknown): value is Record<string, Interpolable> {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Linearly interpolate between `from` and `to` at fraction `t` (`0` →
 * `from`, `1` → `to`). Recurses into arrays and plain objects, matching
 * structure key-by-key. Mismatched shapes throw `TypeError`.
 *
 * Used internally by `animate()` and `timeline()` but exported for
 * callers who want the value-blending math without the scheduling.
 *
 * @throws TypeError if `from` and `to` are not the same Interpolable shape.
 */
export function interpolate<T extends Interpolable>(from: T, to: T, t: number): T {
  if (typeof from === "number" && typeof to === "number") {
    return (from + (to - from) * t) as T;
  }
  if (Array.isArray(from) && Array.isArray(to)) {
    const len = Math.min(from.length, to.length);
    const result = new Array(len);
    for (let i = 0; i < len; i++) {
      result[i] = interpolate(from[i] as Interpolable, to[i] as Interpolable, t);
    }
    return result as unknown as T;
  }
  if (isPlainObject(from) && isPlainObject(to)) {
    const result: Record<string, Interpolable> = {};
    for (const key of Object.keys(from)) {
      if (key in to) {
        result[key] = interpolate(from[key]!, to[key]!, t);
      } else {
        result[key] = from[key]!;
      }
    }
    return result as T;
  }
  throw new TypeError(
    `interpolate: mismatched shape between from and to (${typeof from} vs ${typeof to})`,
  );
}
