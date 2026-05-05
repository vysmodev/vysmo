import type { EasingFn } from "@vysmo/easings";
import type { Scheduler } from "@vysmo/animations";

export type SplitMode = "character" | "word" | "line";

export type SplitOptions = {
  /** Granularity of the split. Default "character". */
  mode?: SplitMode;
  /** BCP-47 locale for Intl.Segmenter. Falls back to the environment default. */
  locale?: string;
};

export type Splits = {
  /** Slice elements in document order (characters, words, or lines). */
  readonly slices: HTMLElement[];
  /** The split granularity. */
  readonly mode: SplitMode;
  /** The original text captured before the split. */
  readonly original: string;
  /** Restore the element's original text. Idempotent. */
  restore(): void;
};

/**
 * The animatable axes understood by animateText. Numeric-only by design — the
 * runtime composes these into `transform` / `filter` / `opacity` strings per
 * frame, so shape mismatches are impossible and per-slice blending stays cheap.
 */
export type TextProperty =
  | "opacity"
  | "translateX"
  | "translateY"
  | "translateZ"
  | "scale"
  | "scaleX"
  | "scaleY"
  | "rotate"
  | "rotateX"
  | "rotateY"
  | "rotateZ"
  | "skewX"
  | "skewY"
  | "blur"
  | "brightness"
  | "contrast"
  | "saturate"
  | "hueRotate";

/**
 * A scalar or a uniform range. Range values resolve **per slice** at
 * animate-start: every slice samples its own value, so animations like
 * "letters scatter from random offsets and converge on 0" become a
 * one-line spec change. `{ min: x, max: x }` resolves to the constant
 * `x` without consuming an rng draw.
 */
export type TextValue = number | { min: number; max: number };

/**
 * Transform-origin in normalized form. `x`/`y` are fractions (0..1, where
 * 0 is left/top and 1 is right/bottom — `{ x: 0.5, y: 1 }` = bottom
 * center). Optional `z` is in pixels and lets 3D transforms pivot in
 * front of / behind the slice. Stored as data instead of a CSS string so
 * the same preset can drive a future canvas/Skia runtime without parsing.
 */
export type TransformOrigin = {
  x: number;
  y: number;
  z?: number;
};

export type TextAnimationSpec = {
  prop: TextProperty;
  from: TextValue;
  to: TextValue;
  /** Duration in milliseconds. Default 600. */
  duration?: number;
  /**
   * Delay (ms) from the slice's stagger offset before this spec begins.
   * Sequential specs targeting the same prop chain via their delays.
   */
  delay?: number;
  /**
   * Easing for this spec. Default linear.
   *
   * Two forms accepted:
   * - **String** (preferred for catalog presets) — a GSAP-style spec like
   *   `"power2.out"`, `"back.out(2)"`, `"elastic.out(1.2, 0.4)"`,
   *   `"cubic-bezier(0.42, 0, 0.58, 1)"`. Resolved at animate-start via
   *   `parseEasing()` from `@vysmo/easings`. Strings are JSON-serializable
   *   so the same preset data can drive a future canvas/Skia runtime
   *   without losing fidelity.
   * - **Function** — any `EasingFn`/`(t: number) => number`. Use this when
   *   you bring a custom curve that isn't in the catalog.
   */
  ease?: string | EasingFn | ((t: number) => number);
  /**
   * Override the root stagger for this spec only. Enables a per-prop cadence
   * — e.g. translateY staggered at 30ms while opacity staggers at 10ms —
   * which is the main knob the authoring studio uses to explore variety.
   */
  stagger?: number;
  /** Override the root staggerOrder for this spec only. */
  staggerOrder?: StaggerOrder;
  /**
   * Per-slice random delay in ms added on top of the slice's stagger
   * offset. Each slice gets its own value uniformly sampled from
   * `[0, jitterDelay]` at animate-start. Default 0. Useful for breaking
   * the "metronome" feel of pure stagger by spraying start times.
   */
  jitterDelay?: number;
  /**
   * Override the preset / option-level `transformOrigin` for the
   * duration of this spec. Written to each slice's inline style at the
   * moment the spec's window opens for that slice; persists until the
   * next override on the same slice (or `stop()`). When two specs with
   * different origins overlap on a slice, the most recently-opened
   * spec wins (last-write-wins).
   */
  transformOrigin?: TransformOrigin;
  /**
   * Override the container `perspective` (in px) for the duration of
   * this spec. Written to the container element when the spec's window
   * first opens for any slice; persists until the next override (or
   * `stop()`). Container-scoped, so it affects every slice — same
   * scope as the option / preset-level `perspective`.
   */
  perspective?: number;
};

export type StaggerOrder = "start" | "end" | "center" | "edges" | "random";

export type AnimateTextOptions = {
  /** Split granularity. Overridden by the preset's split when unset. Default "character". */
  split?: SplitMode;
  /** BCP-47 locale for Intl.Segmenter. */
  locale?: string;
  /** Milliseconds between consecutive slices starting to animate. Default 30. */
  stagger?: number;
  /** Order in which slices receive their stagger offset. Default "start". */
  staggerOrder?: StaggerOrder;
  /** One or more animated properties running in parallel per slice. */
  animations?: TextAnimationSpec[];
  /**
   * Preset to apply. Accepts either the catalog name (convenience, pulls
   * the whole registry) or a `Preset` object reference (tree-shakable —
   * the unused 14/15/… presets stay out of the bundle).
   */
  preset?: PresetName | Preset;
  /**
   * CSS perspective (px) applied to the container so children's rotateX /
   * rotateY / translateZ render with depth. Required for 3D transforms to
   * look 3D — without it, rotateY(90deg) is just a 1px-wide line.
   */
  perspective?: number;
  /** CSS perspective-origin string applied to the container (e.g., "50% 30%"). */
  perspectiveOrigin?: string;
  /** Transform-origin applied to every slice. `{ x: 0.5, y: 0 }` = top center. */
  transformOrigin?: TransformOrigin;
  /** Begin playing automatically. Default true. */
  autoPlay?: boolean;
  /** When true, skip animation under prefers-reduced-motion. Default true. */
  respectReducedMotion?: boolean;
  /**
   * Delay in ms before the first play begins. Useful for sequencing an
   * entry after some other animation completes.
   */
  delay?: number;
  /**
   * How many times the whole choreography plays. `1` (default) = play
   * once. A number > 1 = that many cycles. `"infinite"` = loop forever
   * (or until `.stop()`). Emphasis presets like pulse typically want
   * `repeat: 3, repeatDelay: 400` for a "triple-tap" feel.
   */
  repeat?: number | "infinite";
  /** Delay between successive cycles when `repeat > 1`. Default 0. */
  repeatDelay?: number;
  /** Override the time source for deterministic playback in tests. */
  scheduler?: Scheduler;
  /** Deterministic RNG for "random" stagger order. Defaults to Math.random. */
  rng?: () => number;
};

export type AnimateTextHandle = {
  /** Start or resume playback. */
  play(): AnimateTextHandle;
  /** Pause playback, preserving progress. */
  pause(): AnimateTextHandle;
  /** Stop playback and reset slices to their un-animated style. */
  stop(): AnimateTextHandle;
  /** Jump every slice to the given progress in [0, 1]. */
  seek(progress: number): AnimateTextHandle;
  /** Resolves when every slice has finished naturally. */
  readonly finished: Promise<void>;
  /** The split result backing this animation. */
  readonly splits: Splits;
};

export type Preset = {
  name: PresetName;
  /** Split granularity this preset was tuned against. */
  split?: SplitMode;
  /** Default stagger; callers can override. */
  stagger: number;
  /** Stagger order this preset was tuned against. */
  staggerOrder?: StaggerOrder;
  animations: TextAnimationSpec[];
  /** Container perspective (px) required for this preset's 3D transforms. */
  perspective?: number;
  /** Slice-level transform-origin this preset was tuned against. */
  transformOrigin?: TransformOrigin;
  /** Default play count for this preset (e.g. emphasis/pulse repeating 3×). */
  repeat?: number | "infinite";
  /** Default gap between cycles in ms. */
  repeatDelay?: number;
};

/**
 * Hand-curated preset names — the seed catalog. These autocomplete in
 * IDEs and stay typed in tests / consumer code.
 */
export type HandcuratedPresetName =
  | "enter/fade-up"
  | "enter/elastic-rise"
  | "enter/blur-in"
  | "enter/scale-in"
  | "enter/flip-x"
  | "enter/depth-zoom"
  | "exit/fade-down"
  | "exit/scale-out"
  | "exit/flip-away"
  | "emphasis/pulse"
  | "emphasis/shake"
  | "emphasis/wobble"
  | "emphasis/coin-flip"
  | "emphasis/spin";

/**
 * Any registered preset name — handcurated entries autocomplete via the
 * literal union; the `string & {}` branch keeps the type open for the
 * generated catalog (300+ entries authored via the Studio's random
 * generator). Lookup at runtime is a string key against `PRESETS`, so
 * unknown names throw at `resolvePreset` rather than at the type
 * boundary.
 */
export type PresetName = HandcuratedPresetName | (string & {});
