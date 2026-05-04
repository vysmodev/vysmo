import type {
  Effect,
  Runner,
  TextureSource,
  UniformParams,
} from "@vysmo/effects";
import { sharedScrollObserver } from "./observer.js";
import type { EaseFn, Handle } from "./types.js";

export interface ScrollEffectOptions<P extends UniformParams> {
  /**
   * Section whose scroll-past drives the effect. Progress spans the
   * full viewport sweep, same as `createScrollProgress`.
   */
  section: HTMLElement;
  /** Effects runner; caller owns the canvas + WebGL context. */
  runner: Runner;
  /** Effect to render on every scroll frame. */
  effect: Effect<P>;
  /** Source texture to filter — image, video, canvas. */
  source: TextureSource;
  /**
   * Maps the scroll progress [0, 1] to the effect's uniform params.
   * Keeps the scroll package free of effect-specific knowledge — the
   * caller decides which param to animate and how.
   *
   *   paramsAt: (p) => ({ radius: p * 20 })
   */
  paramsAt: (progress: number) => Partial<P>;
  /** Remap the raw [0, 1] progress before it reaches `paramsAt`. */
  ease?: EaseFn;
}

/**
 * Bind the scroll position through `section` to a continuous render of
 * `effect` on `runner`, where the effect's params are a function of
 * progress. Typical use: blur / chromatic-aberration / colour-grade
 * intensity ramps up as the user scrolls into a section and back down
 * as they scroll out.
 *
 * Same ownership model as `createScrollTransition`: you pass a Runner,
 * scroll drives its `render()`. No re-render when progress is unchanged.
 */
export function createScrollEffect<P extends UniformParams>(
  options: ScrollEffectOptions<P>,
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
      const params = options.paramsAt(mapped);
      options.runner.render(options.effect, {
        source: options.source,
        params,
      });
    },
  });

  return {
    destroy(): void {
      unsubscribe();
    },
  };
}
