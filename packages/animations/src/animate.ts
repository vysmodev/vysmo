import { interpolate } from "./interpolate.js";
import { defaultScheduler } from "./scheduler.js";
import type {
  AnimationHandle,
  AnimationOptions,
  AnimationState,
  Interpolable,
} from "./types.js";

const linearEase = (t: number) => t;

/**
 * Tween an `Interpolable` value (number, array of numbers, or plain
 * object of interpolable values) from `from` to `to` over `duration`
 * milliseconds, applying `ease` and emitting per-frame `onUpdate(value,
 * progress)` callbacks.
 *
 * Returns a `handle` that exposes `.play()`, `.pause()`, `.stop()`,
 * `.seek(0..1)`, and a `.finished` Promise that resolves when the
 * animation completes naturally (or rejects if `.stop()` is called).
 *
 * The animation owns no DOM — the caller decides what to do with each
 * frame's value. Drive a CSS transform, a WebGL uniform, a canvas
 * draw, anything that takes a number.
 *
 * @throws RangeError if `duration <= 0`.
 */
export function animate<T extends Interpolable>(options: AnimationOptions<T>): AnimationHandle<T> {
  const {
    from,
    to,
    duration = 1000,
    ease = linearEase,
    delay = 0,
    autoPlay = true,
    loop = false,
    onUpdate,
    onStart,
    onComplete,
    scheduler = defaultScheduler,
  } = options;

  if (duration <= 0) {
    throw new RangeError(`animate: duration must be > 0; got ${duration}`);
  }

  const loopCount = loop === true ? Infinity : loop === false ? 1 : loop === "yoyo" ? Infinity : loop;
  const yoyoMode = loop === "yoyo";

  let state: AnimationState = "idle";
  let progress = 0;
  let currentValue: T = from;
  let startedAt = 0;
  let pausedAt = 0;
  let iteration = 0;
  let started = false;
  let cancelSchedule: (() => void) | null = null;

  let resolveFinished!: () => void;
  let rejectFinished!: (reason?: unknown) => void;
  let finished: Promise<void>;
  function resetFinishedPromise() {
    finished = new Promise<void>((res, rej) => {
      resolveFinished = res;
      rejectFinished = rej;
    });
    // Don't throw uncaught promise errors if nobody awaits.
    finished.catch(() => {});
  }
  resetFinishedPromise();

  function applyValue(p: number) {
    progress = p;
    const eased = ease(p);
    currentValue = interpolate(from, to, eased);
    onUpdate?.(currentValue, p);
  }

  function stopScheduling() {
    if (cancelSchedule) {
      cancelSchedule();
      cancelSchedule = null;
    }
  }

  function tick(now: number) {
    if (state !== "running") return;
    const elapsed = now - startedAt - delay;
    if (elapsed < 0) {
      cancelSchedule = scheduler.schedule(tick);
      return;
    }
    if (!started) {
      started = true;
      onStart?.();
    }
    const rawProgress = elapsed / duration;
    const cappedProgress = Math.min(rawProgress, 1);
    const iterationProgress = yoyoMode && iteration % 2 === 1 ? 1 - cappedProgress : cappedProgress;
    applyValue(iterationProgress);
    if (cappedProgress >= 1) {
      onComplete?.();
      iteration += 1;
      if (iteration < loopCount) {
        startedAt = now - delay;
        cancelSchedule = scheduler.schedule(tick);
      } else {
        state = "finished";
        stopScheduling();
        resolveFinished();
      }
      return;
    }
    cancelSchedule = scheduler.schedule(tick);
  }

  const handle: AnimationHandle<T> = {
    play() {
      if (state === "running" || state === "finished") return handle;
      const now = scheduler.now();
      if (state === "paused") {
        startedAt += now - pausedAt;
      } else {
        startedAt = now;
        iteration = 0;
        started = false;
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
      state = "stopped";
      stopScheduling();
      iteration = 0;
      started = false;
      applyValue(0);
      rejectFinished(new Error("animation stopped"));
      resetFinishedPromise();
      state = "idle";
      return handle;
    },
    seek(p) {
      const clamped = Math.max(0, Math.min(1, p));
      applyValue(clamped);
      if (state === "running") {
        const now = scheduler.now();
        startedAt = now - clamped * duration - delay;
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
    get value() {
      return currentValue;
    },
  };

  applyValue(0);
  if (autoPlay) handle.play();
  return handle;
}
