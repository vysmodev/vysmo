import { defaultScheduler } from "./scheduler.js";
import type { AnimationHandle, AnimationState, Scheduler } from "./types.js";

export type SpringOptions = {
  /** Starting position. Required. */
  from: number;
  /** Target position the spring settles toward. Required. */
  to: number;
  /** Spring constant. Higher = snappier. Default 170. */
  stiffness?: number;
  /** Friction coefficient. Higher = less oscillation. Default 26. */
  damping?: number;
  /** Mass of the simulated object. Higher = more inertia. Default 1. */
  mass?: number;
  /** Initial velocity (units/sec). Default 0. */
  velocity?: number;
  /**
   * Called every frame with the current value and progress in `[0, 1]`,
   * where 1 = "at rest at target." Progress can briefly exceed 1 if the
   * spring overshoots and oscillates back; treat as approximate.
   */
  onUpdate?: (value: number, progress: number) => void;
  /** Called once when the spring starts moving. */
  onStart?: () => void;
  /** Called once when the spring settles (resolves `finished`). */
  onComplete?: () => void;
  /** Begin simulating automatically after creation. Default true. */
  autoPlay?: boolean;
  /** Delay before the simulation starts, in milliseconds. Default 0. */
  delay?: number;
  /** Override the time source — useful for tests or deterministic playback. */
  scheduler?: Scheduler;
  /** Position must be within this distance of target to count as settled. Default 0.01. */
  restThreshold?: number;
  /** Absolute velocity must be below this to count as settled. Default 0.01. */
  restVelocity?: number;
  /** Clamp simulated time step to protect against tab-pause spikes. Default 64ms. */
  maxStepMs?: number;
};

export type SpringHandle = AnimationHandle<number>;

const MIN_STEP = 1;

/**
 * Stateful spring physics simulation. Unlike a spring *easing* (closed-
 * form curve sampled over a fixed duration), this integrates a damped
 * harmonic oscillator each frame and resolves `finished` only when the
 * mass settles within `restThreshold` / `restVelocity` of the target.
 *
 * Use this when you want spring *behaviour* (overshoot, oscillation,
 * settle time driven by physics, not a clock) and don't care about a
 * fixed end time. Use `animate({ ease: spring(...) })` from
 * `@vysmo/easings` when you want spring *shape* over a known duration.
 *
 * Integrates with semi-implicit Euler at fixed 1ms sub-steps for
 * stability across frame-rate variance; tab-pause spikes are clamped
 * via `maxStepMs`.
 *
 * @throws RangeError if `stiffness <= 0`, `damping < 0`, or `mass <= 0`.
 */
export function spring(options: SpringOptions): SpringHandle {
  const {
    from,
    to,
    stiffness = 170,
    damping = 26,
    mass = 1,
    velocity: initialVelocity = 0,
    onUpdate,
    onStart,
    onComplete,
    autoPlay = true,
    delay = 0,
    scheduler = defaultScheduler,
    restThreshold = 0.01,
    restVelocity = 0.01,
    maxStepMs = 64,
  } = options;

  if (stiffness <= 0) throw new RangeError(`spring: stiffness must be > 0; got ${stiffness}`);
  if (damping < 0) throw new RangeError(`spring: damping must be >= 0; got ${damping}`);
  if (mass <= 0) throw new RangeError(`spring: mass must be > 0; got ${mass}`);

  let state: AnimationState = "idle";
  let position = from;
  let velocity = initialVelocity;
  let progress = 0;
  let lastTick = 0;
  let startedAt = 0;
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
    finished.catch(() => {});
  }
  resetFinishedPromise();

  const span = to - from;

  function updateProgress() {
    if (span === 0) {
      progress = 1;
    } else {
      progress = (position - from) / span;
    }
  }

  function step(dtMs: number) {
    const stepMs = Math.min(dtMs, maxStepMs);
    const subSteps = Math.max(1, Math.floor(stepMs / MIN_STEP));
    const h = stepMs / subSteps / 1000;
    for (let i = 0; i < subSteps; i++) {
      const force = -stiffness * (position - to) - damping * velocity;
      velocity += (force / mass) * h;
      position += velocity * h;
    }
  }

  function stopScheduling() {
    if (cancelSchedule) {
      cancelSchedule();
      cancelSchedule = null;
    }
  }

  function tick(now: number) {
    if (state !== "running") return;
    if (now - startedAt < delay) {
      cancelSchedule = scheduler.schedule(tick);
      return;
    }
    if (!started) {
      started = true;
      lastTick = now;
      onStart?.();
    }
    const dt = now - lastTick;
    lastTick = now;
    if (dt > 0) step(dt);
    updateProgress();
    onUpdate?.(position, progress);
    const settled =
      Math.abs(position - to) < restThreshold && Math.abs(velocity) < restVelocity;
    if (settled) {
      position = to;
      velocity = 0;
      progress = 1;
      onUpdate?.(position, progress);
      state = "finished";
      stopScheduling();
      onComplete?.();
      resolveFinished();
      return;
    }
    cancelSchedule = scheduler.schedule(tick);
  }

  const handle: SpringHandle = {
    play() {
      if (state === "running" || state === "finished") return handle;
      const now = scheduler.now();
      if (state !== "paused") {
        position = from;
        velocity = initialVelocity;
        started = false;
        startedAt = now;
        updateProgress();
        onUpdate?.(position, progress);
      }
      lastTick = now;
      state = "running";
      cancelSchedule = scheduler.schedule(tick);
      return handle;
    },
    pause() {
      if (state !== "running") return handle;
      state = "paused";
      stopScheduling();
      return handle;
    },
    stop() {
      stopScheduling();
      state = "idle";
      position = from;
      velocity = initialVelocity;
      progress = 0;
      started = false;
      onUpdate?.(position, progress);
      rejectFinished(new Error("spring stopped"));
      resetFinishedPromise();
      return handle;
    },
    seek(p) {
      const clamped = Math.max(0, Math.min(1, p));
      position = from + span * clamped;
      velocity = 0;
      updateProgress();
      onUpdate?.(position, progress);
      if (state === "running") {
        lastTick = scheduler.now();
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
      return position;
    },
  };

  updateProgress();
  onUpdate?.(position, progress);
  if (autoPlay) handle.play();
  return handle;
}
