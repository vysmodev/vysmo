import type {
  Runner,
  TextureSource,
  Transition,
  UniformParams,
} from "@vysmo/transitions";
import { sharedScrollObserver } from "./observer.js";
import type { EaseFn, Handle } from "./types.js";

export interface ScrollTransitionOptions<P extends UniformParams> {
  /**
   * Section whose scroll-past drives the transition. Progress is 0 when
   * the section's top enters the viewport bottom and 1 when its bottom
   * exits the viewport top — same curve as `createScrollProgress`.
   */
  section: HTMLElement;
  /**
   * Transitions runner. The caller owns the WebGL context and its
   * canvas — that keeps this primitive composable (multiple
   * scroll-transitions can share one runner) and decouples lifecycle.
   */
  runner: Runner;
  /** Transition to render across the scroll range. */
  transition: Transition<P>;
  /** Starting source — shown at progress 0. */
  from: TextureSource;
  /** Ending source — shown at progress 1. */
  to: TextureSource;
  /** Overrides for the transition's uniform params. */
  params?: Partial<P>;
  /** Remap the raw [0, 1] progress. Default: linear. */
  ease?: EaseFn;
}

/**
 * Bind the vertical scroll position through `section` to a full transition
 * run on `runner`. As the section sweeps past the viewport, `from` morphs
 * into `to` via the chosen transition. One rAF per scroll frame, no
 * re-render when the clamped progress hasn't changed.
 *
 * The scroll package does not import the transitions runtime — only its
 * types. You pass in your own `Runner`, so the transitions library only
 * lands in bundles that actually call this primitive.
 */
export function createScrollTransition<P extends UniformParams>(
  options: ScrollTransitionOptions<P>,
): Handle {
  const observer = sharedScrollObserver();
  let lastProgress = Number.NaN;

  const unsubscribe = observer.subscribe(options.section, {
    onScroll(rect, viewport) {
      const span = viewport.height + rect.height;
      if (span <= 0) return;
      const raw = (viewport.height - rect.top) / span;
      const clamped = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      const mapped = options.ease ? options.ease(clamped) : clamped;
      if (mapped === lastProgress) return;
      lastProgress = mapped;
      const args: {
        from: TextureSource;
        to: TextureSource;
        progress: number;
        params?: Partial<P>;
      } = {
        from: options.from,
        to: options.to,
        progress: mapped,
      };
      if (options.params !== undefined) args.params = options.params;
      options.runner.render(options.transition, args);
    },
  });

  return {
    destroy(): void {
      unsubscribe();
    },
  };
}
