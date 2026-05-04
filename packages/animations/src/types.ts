import type { EasingFn } from "@vysmo/easings";

/** A value that can be interpolated. Numbers, arrays of numbers, or plain objects of interpolable values. */
export type Interpolable =
  | number
  | ReadonlyArray<Interpolable>
  | { readonly [key: string]: Interpolable };

export type AnimationState =
  | "idle"
  | "running"
  | "paused"
  | "finished"
  | "stopped";

export type AnimationOptions<T extends Interpolable> = {
  /** Starting value. Required. */
  from: T;
  /** Target value. Required. Must match the shape of `from`. */
  to: T;
  /** Duration in milliseconds. Default 1000. */
  duration?: number;
  /** Easing function from @vysmo/easings or any (t: number) => number. Default linear. */
  ease?: EasingFn | ((t: number) => number);
  /** Delay before the animation starts, in milliseconds. Default 0. */
  delay?: number;
  /** Begin playing automatically after creation. Default true. */
  autoPlay?: boolean;
  /**
   * Loop mode. `false` (default) = play once. `true` = loop forever.
   * A number N = play N times. "yoyo" = alternate forward/reverse.
   */
  loop?: boolean | number | "yoyo";
  /** Called on every frame with the current interpolated value. */
  onUpdate?: (value: T, progress: number) => void;
  /** Called once when the animation first starts playing. */
  onStart?: () => void;
  /** Called each time the animation reaches its end (per loop iteration). */
  onComplete?: () => void;
  /** Override the time source — useful for tests or deterministic playback. */
  scheduler?: Scheduler;
};

export type AnimationHandle<T extends Interpolable> = {
  /** Start or resume playback. No-op if already running. */
  play(): AnimationHandle<T>;
  /** Pause playback, preserving progress. */
  pause(): AnimationHandle<T>;
  /** Stop playback and reset to the starting state. */
  stop(): AnimationHandle<T>;
  /**
   * Jump to a specific progress (0–1) and apply the eased value. Does not
   * change playback state (pauses if paused, keeps running if running).
   */
  seek(progress: number): AnimationHandle<T>;
  /** Resolves when the animation finishes naturally (not after stop/pause). */
  readonly finished: Promise<void>;
  /** Current state. */
  readonly state: AnimationState;
  /** Current progress in [0, 1]. */
  readonly progress: number;
  /** Current interpolated value. */
  readonly value: T;
};

export type Scheduler = {
  now(): number;
  schedule(callback: (now: number) => void): () => void;
};
