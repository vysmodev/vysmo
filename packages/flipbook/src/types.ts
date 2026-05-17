import type { EasingFn } from "@vysmo/easings";

/**
 * A single page. URL strings are decoded into images; `HTMLImageElement`
 * / `HTMLCanvasElement` are used as-is. Rich-DOM pages are out of scope
 * for v1 — pre-render to a canvas if you need them.
 */
export type PageSource = string | HTMLImageElement | HTMLCanvasElement;

export type FlipbookAxis = "horizontal" | "vertical";

export interface FlipbookOptions {
  /**
   * Host element. The flipbook creates its WebGL canvas inside this
   * container. Size the container via CSS — the canvas fills 100% of it.
   */
  container: HTMLElement;
  /** Page sources. Order matters: index 0 is the cover unless `initialPage` says otherwise. */
  pages: readonly PageSource[];
  /** Starting page index in [0, pages.length). Default 0. */
  initialPage?: number;
  /**
   * Curl axis. `"horizontal"` peels the right edge leftward like an
   * English book (pinned spine on the left). `"vertical"` peels the
   * bottom edge upward like a wall calendar (pinned binding at the top).
   * Default `"horizontal"`.
   */
  axis?: FlipbookAxis;
  /**
   * Hinge tilt in radians, **added on top of the axis baseline** (0 for
   * horizontal, π/2 for vertical). Tilts the curl line away from a clean
   * vertical/horizontal sweep. Default 0.12.
   */
  tilt?: number;
  /** Page-back colour passed straight to the page-curl transition. */
  backColor?: readonly [number, number, number];
  /** Flip duration in milliseconds. Default 900. */
  flipDuration?: number;
  /** Easing for the flip progress. Default `cubicInOut` from `@vysmo/easings`. */
  ease?: EasingFn;
  /** Wrap from last → first (and vice versa). Default false — books have ends. */
  loop?: boolean;
  /**
   * Click anywhere to flip: left half = prev, right half = next (vertical
   * axis: top half = prev, bottom half = next). Default true.
   */
  clickNavigation?: boolean;
  /**
   * Pointer-drag scrubbing: drag in the flip direction to peel the page
   * mid-curl. Release past `dragCommitThreshold` commits; below reverts.
   * Default true.
   */
  dragNavigation?: boolean;
  /**
   * Drag commit threshold in [0, 1]. Released drag past this progress
   * commits the flip; below reverts. Default 0.5. Lower (0.3) makes
   * flips "sticky" — easier to commit. Higher (0.7) requires a more
   * deliberate drag.
   */
  dragCommitThreshold?: number;
  /**
   * Keyboard navigation: `ArrowRight`/`ArrowDown` → next, `ArrowLeft`/
   * `ArrowUp` → prev, `Home`/`End` → first/last. Default true.
   */
  keyboardNavigation?: boolean;
  /**
   * Auto-advance pages on a timer. `true` uses default 4000ms interval;
   * pass `{ intervalMs }` to set your own. Pauses while the user is
   * dragging or while the page lacks focus. Off by default. Use
   * `play()` / `pause()` on the handle to toggle at runtime.
   */
  autoplay?: boolean | { intervalMs: number };
  /** Accessible label exposed via `aria-label`. Default `"Flipbook"`. */
  ariaLabel?: string;
  /**
   * Lazy-load mode. When `true`, only the current page and its
   * neighbours (see `preloadWindow`) are fetched + uploaded to the GPU;
   * out-of-window pages are evicted from the texture cache via the
   * runner's LRU policy. Default `false` — all pages eagerly resolved
   * (preserves v0.1 behavior).
   *
   * Worth turning on for long flipbooks (>10–20 pages) or when driving
   * the flipbook from a Next.js page where the homepage shouldn't block
   * on dozens of image decodes. Works with URL string sources;
   * `HTMLImageElement` / `HTMLCanvasElement` sources passed in still
   * load up front (they're already in memory).
   */
  lazy?: boolean;
  /**
   * In `lazy: true` mode, how many pages on each side of the current
   * index to keep resident on the GPU. Default 1 — current page plus
   * immediate prev/next are always loaded ahead of user navigation.
   * Higher values trade GPU memory for fewer load stalls on rapid
   * flips. Ignored when `lazy` is false.
   */
  preloadWindow?: number;
}

export interface FlipOptions {
  /**
   * Skip the curl animation and snap directly to the target page. Still
   * emits `change` but not `flipstart` / `flipend`.
   */
  instant?: boolean;
}

export type FlipbookEvent = "change" | "flipstart" | "flipend";

export interface FlipbookHandle {
  readonly current: number;
  readonly length: number;
  readonly isFlipping: boolean;
  /**
   * Resolves when every string / image source has finished decoding.
   * Canvas sources resolve instantly. Safe to call `next()` etc. before
   * this resolves — they queue until the first frame is ready.
   */
  readonly ready: Promise<void>;
  /** Advance to the next page. No-op while a flip is already in flight. */
  next(): Promise<void>;
  /** Retreat to the previous page. No-op while a flip is already in flight. */
  prev(): Promise<void>;
  /** Flip directly to a specific index. No-op if already there. */
  goTo(index: number, options?: FlipOptions): Promise<void>;
  /**
   * Drive the current flip's progress externally. `progress` in [0, 1]
   * scrubs from the current page to the next. Useful for scroll-driven
   * flipbooks: pipe `@vysmo/scroll` progress straight in. Calling `seek`
   * cancels any in-flight tween.
   *
   * Reaching 1 commits the flip; reaching 0 reverts to the current page.
   * Other values hold the page mid-curl.
   */
  seek(progress: number): void;
  /** Start auto-advance. Idempotent — no-op if already playing. */
  play(): void;
  /** Stop auto-advance. Idempotent — no-op if already paused. */
  pause(): void;
  /** True when autoplay is active (started + not paused). */
  readonly isPlaying: boolean;
  on(event: "change", cb: (current: number, previous: number) => void): () => void;
  on(event: "flipstart", cb: (from: number, to: number) => void): () => void;
  on(event: "flipend", cb: (from: number, to: number) => void): () => void;
  destroy(): void;
}
