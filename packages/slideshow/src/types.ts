import type { EasingFn } from "@vysmo/easings";
import type { Transition, UniformParams } from "@vysmo/transitions";

/**
 * A single slide. URL strings are decoded into images; `HTMLImageElement`
 * / `HTMLCanvasElement` are used as-is (canvases skip the decode step).
 * Video support is deferred to v2 — for now, paint video frames into a
 * canvas externally and pass that.
 */
export type SlideSource = string | HTMLImageElement | HTMLCanvasElement;

export type TransitionSelector =
  | Transition<UniformParams>
  | ((fromIndex: number, toIndex: number) => Transition<UniformParams>);

// =====================================================================
// Chrome — visible UI overlays rendered by the slideshow itself. Each
// option accepts `false` (off — pure-headless), `true` (defaults), or
// an options object for fine-tuning. Theme via CSS custom properties on
// the wrapper: --vysmo-chrome-color, --vysmo-chrome-bg,
// --vysmo-chrome-active, --vysmo-chrome-inactive.
// =====================================================================

export type ArrowsPosition =
  | "inside-edges"
  | "outside-edges"
  | "bottom-center"
  | "bottom-right";
export type ArrowsStyle = "minimal" | "circle" | "square";
export interface ArrowsOptions {
  position?: ArrowsPosition;
  style?: ArrowsStyle;
}

export type DotsPosition =
  | "bottom-center"
  | "top-center"
  | "left-center"
  | "right-center";
export type DotsStyle = "dots" | "dashes" | "numbers" | "lines";
export interface DotsOptions {
  position?: DotsPosition;
  style?: DotsStyle;
}

export type CounterPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";
export interface CounterOptions {
  position?: CounterPosition;
  /** Custom format. Default: `${current + 1} / ${length}`. */
  format?: (current: number, length: number) => string;
}

export type ProgressPosition = "top" | "bottom";
export interface ProgressOptions {
  position?: ProgressPosition;
}

export type CaptionPosition = "top" | "bottom" | "center";
export type CaptionAlignment = "left" | "center" | "right";
export interface CaptionsOptions {
  /** Per-slide text. Array indexed by slide, or function-of-index. */
  texts: readonly string[] | ((index: number) => string);
  position?: CaptionPosition;
  alignment?: CaptionAlignment;
}

export interface SwipeOptions {
  /** Pixels of horizontal travel before commit. Default 50. */
  threshold?: number;
}

// =====================================================================

export interface SlideshowOptions {
  /**
   * Host element. The slideshow creates its WebGL canvas inside this
   * container. Size the container via CSS — the canvas fills 100% of it.
   */
  container: HTMLElement;
  /**
   * Slide sources. Order matters: index 0 is the starting slide unless
   * `initial` says otherwise.
   */
  slides: readonly SlideSource[];
  /** Starting slide index in [0, slides.length). Default 0. */
  initial?: number;
  /**
   * Transition used for slide changes. A function receives the `from` and
   * `to` indices so callers can vary transition per slide. Default
   * `dissolve` from `@vysmo/transitions`.
   */
  transition?: TransitionSelector;
  /** Transition duration in milliseconds. Default 800. */
  transitionDuration?: number;
  /** Easing for the transition progress. Default linear. */
  ease?: EasingFn;
  /**
   * Autoplay dwell time in milliseconds. If > 0, the slideshow advances
   * automatically after this many ms on each slide. Set to 0 or omit to
   * disable autoplay.
   */
  autoplayDelay?: number;
  /** Start autoplay on mount. Default: true when `autoplayDelay > 0`. */
  autoplay?: boolean;
  /** Wrap from last → first (and vice versa). Default true. */
  loop?: boolean;
  /**
   * Click-to-navigate: left half = prev, right half = next. Default true.
   * Disable if you ship custom controls that overlap the canvas.
   */
  clickNavigation?: boolean;
  /**
   * Keyboard navigation: `ArrowLeft`/`ArrowRight` → prev/next, `Home`/`End`
   * → first/last, `Space` → play/pause. Default true.
   */
  keyboardNavigation?: boolean;
  /**
   * Pause autoplay while the tab is hidden (via `visibilitychange`).
   * Resumes when the tab becomes visible again. Default true.
   */
  pauseOnHidden?: boolean;
  /** Pause autoplay while the pointer is over the slideshow. Default false. */
  pauseOnHover?: boolean;
  /** Touch / pointer swipe navigation. Default false. */
  swipeNavigation?: boolean | SwipeOptions;
  /** Visible nav arrows overlaid on the canvas. Default false. */
  arrows?: boolean | ArrowsOptions;
  /** Page-indicator dots overlaid on the canvas. Default false. */
  dots?: boolean | DotsOptions;
  /** Slide-counter text overlay (`1 / 5`). Default false. */
  counter?: boolean | CounterOptions;
  /**
   * Autoplay countdown bar. Only visible while autoplay is active.
   * Default false.
   */
  progress?: boolean | ProgressOptions;
  /** Per-slide caption text overlay. Default off. */
  captions?: false | CaptionsOptions;
  /** Accessible label exposed via `aria-label`. Default `"Slideshow"`. */
  ariaLabel?: string;
  /**
   * Lazy-load mode. When `true`, only the current slide and its
   * neighbours (see `preloadWindow`) are fetched + uploaded to the GPU;
   * out-of-window slides are evicted from the texture cache via the
   * runner's LRU policy. Default `false` — all slides are eagerly
   * resolved and held in memory (preserves the v0.1 behavior).
   *
   * Use this for galleries with more than a handful of slides, or when
   * driving the slideshow from a Next.js / Astro page where the
   * homepage shouldn't block on dozens of image decodes. Works with
   * URL string sources; `HTMLImageElement` / `HTMLCanvasElement`
   * sources passed in still load up front (they're already in memory
   * by definition).
   */
  lazy?: boolean;
  /**
   * In `lazy: true` mode, how many slides on each side of the current
   * index to keep resident on the GPU. Default 1 — the current slide
   * plus immediate prev/next are always loaded ahead of user navigation.
   * Higher values trade GPU memory for fewer load stalls on rapid
   * navigation.
   *
   * Ignored when `lazy` is false.
   */
  preloadWindow?: number;
}

export interface GoOptions {
  /**
   * Skip the transition animation and snap directly to the target index.
   * Still emits `change` but not `transitionstart` / `transitionend`.
   */
  instant?: boolean;
}

export type SlideshowEvent = "change" | "transitionstart" | "transitionend";

export interface SlideshowHandle {
  readonly current: number;
  readonly length: number;
  readonly isPlaying: boolean;
  readonly isTransitioning: boolean;
  /**
   * Resolves when every string / image source has finished decoding.
   * Canvas sources resolve instantly. Safe to `render()` before this
   * resolves — frames show black until the first image is ready.
   */
  readonly ready: Promise<void>;
  /** Advance to the next slide. No-op while transitioning. */
  next(): Promise<void>;
  /** Retreat to the previous slide. No-op while transitioning. */
  prev(): Promise<void>;
  /** Transition to a specific index. No-op if already there. */
  go(index: number, options?: GoOptions): Promise<void>;
  /** Start or resume autoplay (requires `autoplayDelay > 0`). */
  play(): void;
  /** Pause autoplay. Transitions already in flight complete first. */
  pause(): void;
  on(event: "change", cb: (current: number, previous: number) => void): () => void;
  on(
    event: "transitionstart",
    cb: (from: number, to: number) => void,
  ): () => void;
  on(
    event: "transitionend",
    cb: (from: number, to: number) => void,
  ): () => void;
  destroy(): void;
}
