import type { StaggerOrder } from "./types.js";

/**
 * Given N slices, a per-step gap, and an order strategy, return the
 * start-delay (in ms) to apply to each slice — index-aligned.
 *
 * - "start":  0, 1g, 2g, 3g, …
 * - "end":    reversed
 * - "center": grows outward from the center index
 * - "edges":  grows inward from the edges toward the center
 * - "random": a uniform random permutation of the above ranks
 */
export function computeStaggerDelays(
  count: number,
  stagger: number,
  order: StaggerOrder,
  rng: () => number = Math.random,
): number[] {
  if (count <= 0) return [];
  if (stagger <= 0) return new Array<number>(count).fill(0);

  const ranks = new Array<number>(count);

  switch (order) {
    case "start":
      for (let i = 0; i < count; i++) ranks[i] = i;
      break;
    case "end":
      for (let i = 0; i < count; i++) ranks[i] = count - 1 - i;
      break;
    case "center": {
      const mid = (count - 1) / 2;
      for (let i = 0; i < count; i++) ranks[i] = Math.round(Math.abs(i - mid));
      break;
    }
    case "edges": {
      const mid = (count - 1) / 2;
      for (let i = 0; i < count; i++) ranks[i] = Math.round(mid - Math.abs(i - mid));
      break;
    }
    case "random": {
      const perm = Array.from({ length: count }, (_, i) => i);
      for (let i = perm.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = perm[i]!;
        perm[i] = perm[j]!;
        perm[j] = tmp;
      }
      for (let rank = 0; rank < count; rank++) ranks[perm[rank]!] = rank;
      break;
    }
  }

  return ranks.map((r) => r * stagger);
}
