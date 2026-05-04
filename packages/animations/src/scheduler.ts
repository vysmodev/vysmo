import type { Scheduler } from "./types.js";

const hasRaf = typeof requestAnimationFrame !== "undefined";
const hasPerfNow = typeof performance !== "undefined" && typeof performance.now === "function";

/**
 * The default time source — `performance.now()` for time, browser
 * `requestAnimationFrame` for callback scheduling. Falls back to
 * `Date.now()` + `setTimeout(_, 16)` in non-DOM environments (Node, web
 * workers without rAF) so module loading is SSR-safe.
 *
 * Pass a different `Scheduler` via `animate({ scheduler })` etc. to
 * drive animations from your own time source — e.g. `createTestScheduler()`
 * for deterministic playback in tests, or a frame-stepped scheduler for
 * video render pipelines.
 */
export const defaultScheduler: Scheduler = {
  now: () => (hasPerfNow ? performance.now() : Date.now()),
  schedule: hasRaf
    ? (callback) => {
        const id = requestAnimationFrame(callback);
        return () => cancelAnimationFrame(id);
      }
    : (callback) => {
        const id = setTimeout(() => callback(Date.now()), 16);
        return () => clearTimeout(id as unknown as number);
      },
};

/**
 * A deterministic scheduler for tests. Advance the clock manually with
 * `tick(ms)` — scheduled callbacks fire with the advanced time.
 */
export function createTestScheduler(startTime = 0): Scheduler & {
  tick(ms: number): void;
  flushAll(): void;
} {
  let time = startTime;
  const pending: Array<(now: number) => void> = [];

  return {
    now: () => time,
    schedule(callback) {
      pending.push(callback);
      return () => {
        const i = pending.indexOf(callback);
        if (i >= 0) pending.splice(i, 1);
      };
    },
    tick(ms) {
      time += ms;
      const snapshot = pending.splice(0);
      for (const cb of snapshot) cb(time);
    },
    flushAll() {
      while (pending.length > 0) {
        const snapshot = pending.splice(0);
        for (const cb of snapshot) cb(time);
      }
    },
  };
}
