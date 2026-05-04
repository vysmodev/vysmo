import { interpolate } from "./interpolate.js";
import { defaultScheduler } from "./scheduler.js";
import type {
  AnimationHandle,
  AnimationOptions,
  AnimationState,
  Interpolable,
  Scheduler,
} from "./types.js";

export type TimelineOptions = {
  scheduler?: Scheduler;
  autoPlay?: boolean;
  onComplete?: () => void;
};

/**
 * Position modifier when adding entries to a timeline:
 * - `number` — absolute time in ms from the timeline start
 * - `">"` — start right after the previous entry ends (default)
 * - `"<"` — start at the same time the previous entry started (parallel)
 * - `">+N"` / `">-N"` — previous end plus/minus N ms (overlap or gap)
 * - `"<+N"` / `"<-N"` — previous start plus/minus N ms
 */
export type TimelinePosition = number | `<${string}` | `>${string}`;

type ResolvedEntry = {
  start: number;
  duration: number;
  delay: number;
  spec: AnimationOptions<Interpolable>;
  startedInThisRun: boolean;
  completedInThisRun: boolean;
};

export type TimelineHandle = {
  add<T extends Interpolable>(spec: AnimationOptions<T>, position?: TimelinePosition): TimelineHandle;
  play(): TimelineHandle;
  pause(): TimelineHandle;
  stop(): TimelineHandle;
  seek(progress: number): TimelineHandle;
  readonly finished: Promise<void>;
  readonly state: AnimationState;
  readonly progress: number;
  readonly duration: number;
};

const linearEase = (t: number) => t;

/**
 * Compose multiple animations into a single sequenced runner. Each
 * `add(spec, position?)` schedules one animation segment; the position
 * string controls where it starts relative to the previous entry —
 * after it (`">"`, default), in parallel (`"<"`), or with a numeric
 * offset (`">+200"`, `"<-100"`, etc.) — see `TimelinePosition`.
 *
 * One scheduler tick drives every active entry per frame, so a
 * 50-element timeline costs the same as a single `animate()`.
 *
 * The returned handle exposes `.play()`, `.pause()`, `.stop()`,
 * `.seek(0..1)`, plus `.finished` (resolves when the timeline ends
 * naturally; rejects on `.stop()`). `autoPlay` defaults to `false` so
 * you can `add()` entries before the first tick.
 */
export function timeline(options: TimelineOptions = {}): TimelineHandle {
  const { scheduler = defaultScheduler, autoPlay = false, onComplete } = options;

  const entries: ResolvedEntry[] = [];
  let totalDuration = 0;
  let prevStart = 0;
  let prevEnd = 0;

  let state: AnimationState = "idle";
  let progress = 0;
  let startedAt = 0;
  let pausedAt = 0;
  let cancelSchedule: (() => void) | null = null;

  let resolveFinished!: () => void;
  let rejectFinished!: (reason?: unknown) => void;
  let finished: Promise<void>;
  function resetFinishedPromise() {
    finished = new Promise<void>((res, rej) => {
      resolveFinished = res;
      rejectFinished = rej;
    });
    finished.catch(() => {});
  }
  resetFinishedPromise();

  function resolvePosition(pos: TimelinePosition | undefined): number {
    if (typeof pos === "number") return pos;
    if (pos === undefined) return prevEnd;
    const anchor = pos[0];
    const base = anchor === "<" ? prevStart : prevEnd;
    const offsetStr = pos.slice(1);
    if (offsetStr === "") return base;
    const offset = Number(offsetStr);
    if (!Number.isFinite(offset)) {
      throw new RangeError(`timeline: invalid position string '${pos}'`);
    }
    return base + offset;
  }

  function stopScheduling() {
    if (cancelSchedule) {
      cancelSchedule();
      cancelSchedule = null;
    }
  }

  function applyEntries(elapsed: number) {
    for (const entry of entries) {
      const localElapsed = elapsed - entry.start - entry.delay;
      if (localElapsed < 0) {
        continue;
      }
      if (!entry.startedInThisRun) {
        entry.startedInThisRun = true;
        entry.spec.onStart?.();
      }
      const localProgress = Math.max(0, Math.min(1, localElapsed / entry.duration));
      const ease = entry.spec.ease ?? linearEase;
      const eased = ease(localProgress);
      const value = interpolate(entry.spec.from, entry.spec.to, eased);
      entry.spec.onUpdate?.(value, localProgress);
      if (localProgress >= 1 && !entry.completedInThisRun) {
        entry.completedInThisRun = true;
        entry.spec.onComplete?.();
      }
    }
  }

  function resetEntryRunState() {
    for (const entry of entries) {
      entry.startedInThisRun = false;
      entry.completedInThisRun = false;
    }
  }

  function tick(now: number) {
    if (state !== "running") return;
    const elapsed = now - startedAt;
    const cappedElapsed = Math.min(elapsed, totalDuration);
    progress = totalDuration === 0 ? 1 : cappedElapsed / totalDuration;
    applyEntries(cappedElapsed);
    if (elapsed >= totalDuration) {
      state = "finished";
      stopScheduling();
      onComplete?.();
      resolveFinished();
      return;
    }
    cancelSchedule = scheduler.schedule(tick);
  }

  const handle: TimelineHandle = {
    add(spec, position) {
      const start = resolvePosition(position);
      const delay = spec.delay ?? 0;
      const duration = spec.duration ?? 1000;
      if (duration <= 0) {
        throw new RangeError(`timeline: entry duration must be > 0; got ${duration}`);
      }
      entries.push({
        start,
        duration,
        delay,
        spec: spec as unknown as AnimationOptions<Interpolable>,
        startedInThisRun: false,
        completedInThisRun: false,
      });
      prevStart = start;
      prevEnd = start + delay + duration;
      if (prevEnd > totalDuration) totalDuration = prevEnd;
      return handle;
    },
    play() {
      if (state === "running" || state === "finished") return handle;
      const now = scheduler.now();
      if (state === "paused") {
        startedAt += now - pausedAt;
      } else {
        startedAt = now;
        resetEntryRunState();
      }
      state = "running";
      cancelSchedule = scheduler.schedule(tick);
      return handle;
    },
    pause() {
      if (state !== "running") return handle;
      state = "paused";
      pausedAt = scheduler.now();
      stopScheduling();
      return handle;
    },
    stop() {
      stopScheduling();
      state = "idle";
      progress = 0;
      resetEntryRunState();
      rejectFinished(new Error("timeline stopped"));
      resetFinishedPromise();
      return handle;
    },
    seek(p) {
      const clamped = Math.max(0, Math.min(1, p));
      progress = clamped;
      const targetElapsed = clamped * totalDuration;
      resetEntryRunState();
      applyEntries(targetElapsed);
      if (state === "running") {
        startedAt = scheduler.now() - targetElapsed;
      }
      return handle;
    },
    get finished() {
      return finished;
    },
    get state() {
      return state;
    },
    get progress() {
      return progress;
    },
    get duration() {
      return totalDuration;
    },
  };

  if (autoPlay) {
    queueMicrotask(() => handle.play());
  }
  return handle;
}
