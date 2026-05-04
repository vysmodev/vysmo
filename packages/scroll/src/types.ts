/** Signature compatible with `@vysmo/easings.EasingFn`, kept local so this package has zero runtime coupling to the easings lib. */
export type EaseFn = (t: number) => number;

export interface Handle {
  destroy(): void;
}

export interface ScrollProgressOptions {
  /**
   * Element whose bounding box is tracked. Progress is 0 when its top is
   * at the viewport bottom and 1 when its bottom is at the viewport top
   * — i.e. a full sweep across the viewport.
   */
  element: HTMLElement;
  /** Remap the raw [0, 1] progress. Default: linear. */
  ease?: EaseFn;
  /** Invoked on every frame the element's position changes. */
  onProgress: (progress: number) => void;
}
