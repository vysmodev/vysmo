import { animate, type AnimationHandle } from "@vysmo/animations";
import { Runner, dissolve, type Transition, type UniformParams } from "@vysmo/transitions";
import {
  createArrows,
  createCaptions,
  createCounter,
  createDots,
  createProgress,
  type ArrowsMount,
  type CaptionsMount,
  type CounterMount,
  type DotsMount,
  type ProgressMount,
} from "./chrome.js";
import { resolveAll, type ResolvedSlide } from "./loader.js";
import type {
  ArrowsOptions,
  CaptionsOptions,
  CounterOptions,
  DotsOptions,
  GoOptions,
  ProgressOptions,
  SlideshowEvent,
  SlideshowHandle,
  SlideshowOptions,
  SwipeOptions,
  TransitionSelector,
} from "./types.js";

/** What can be passed to `runner.render()` after resolution. */
type RenderSlide = string | HTMLImageElement | HTMLCanvasElement;

type EventMap = {
  change: (current: number, previous: number) => void;
  transitionstart: (from: number, to: number) => void;
  transitionend: (from: number, to: number) => void;
};

const DEFAULT_DURATION_MS = 800;

function asObject<T>(opt: boolean | T | undefined, on: T): T | null {
  if (opt === undefined || opt === false) return null;
  if (opt === true) return on;
  return opt as T;
}

/**
 * Create an image slideshow driven by any `@vysmo/transitions`
 * transition. Pass a container element + an array of slide sources +
 * a transition (or `(from, to) => Transition` selector for variety
 * across slides).
 *
 * Optional chrome is fully opt-in: arrows, dots, counter, progress bar,
 * captions — each themeable via CSS custom properties, each turned off
 * by setting its option to `false`. Set every chrome option to `false`
 * for pure-headless mode (you draw your own UI on top of the canvas).
 *
 * Built-in interactions: click halves to navigate, arrow keys for
 * keyboard nav, optional swipe gestures, optional autoplay with
 * pause-on-hover. Lifecycle events (`change`, `transitionstart`,
 * `transitionend`, `play`, `pause`) via `.on(event, listener)`.
 *
 * @throws Error if `options.slides` is empty.
 */
export function createSlideshow(options: SlideshowOptions): SlideshowHandle {
  if (options.slides.length === 0) {
    throw new Error("createSlideshow requires at least one slide.");
  }

  const transitionSelector: TransitionSelector = options.transition ?? dissolve;
  const transitionDuration = options.transitionDuration ?? DEFAULT_DURATION_MS;
  const autoplayDelay = options.autoplayDelay ?? 0;
  const loop = options.loop ?? true;
  const clickNav = options.clickNavigation ?? true;
  const keyboardNav = options.keyboardNavigation ?? true;
  const pauseOnHidden = options.pauseOnHidden ?? true;
  const pauseOnHover = options.pauseOnHover ?? false;
  const ariaLabel = options.ariaLabel ?? "Slideshow";
  const lazy = options.lazy === true;
  const preloadWindow = Math.max(0, Math.floor(options.preloadWindow ?? 1));

  const arrowsOpts = asObject<ArrowsOptions>(options.arrows, {});
  const dotsOpts = asObject<DotsOptions>(options.dots, {});
  const counterOpts = asObject<CounterOptions>(options.counter, {});
  const progressOpts = asObject<ProgressOptions>(options.progress, {});
  const captionsOpts: CaptionsOptions | null = options.captions
    ? options.captions
    : null;
  const swipeOpts = asObject<SwipeOptions>(options.swipeNavigation, {});
  const swipeThreshold = swipeOpts?.threshold ?? 50;

  let current = clampIndex(options.initial ?? 0, options.slides.length);
  let isPlaying = options.autoplay ?? autoplayDelay > 0;
  let isTransitioning = false;
  let destroyed = false;
  let autoplayTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingTween: AnimationHandle<number> | null = null;
  // Target slide of the in-flight transition. Read by next()/prev() so
  // rapid clicks during a transition advance from the in-flight target,
  // not from the stale `current`.
  let pendingTo: number | null = null;
  // Snapshot of what the in-flight transition is rendering, so an
  // interrupting call can drive the same transition to completion at
  // its original visual progress before kicking off the next one.
  let pendingTransitionState: {
    transition: Transition<UniformParams>;
    fromSlide: RenderSlide;
    toIndex: number;
  } | null = null;
  let resolvedSlides: ResolvedSlide[] = [];

  // Progress-bar animation state.
  let progressStart = 0;
  let progressRaf: number | null = null;

  const listeners: { [K in SlideshowEvent]: Set<EventMap[K]> } = {
    change: new Set(),
    transitionstart: new Set(),
    transitionend: new Set(),
  };

  // --- DOM setup --------------------------------------------------------

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-slideshow-wrapper", "");
  wrapper.setAttribute("role", "region");
  wrapper.setAttribute("aria-roledescription", "carousel");
  wrapper.setAttribute("aria-label", ariaLabel);
  wrapper.tabIndex = 0;
  Object.assign(wrapper.style, {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    outline: "none",
    userSelect: "none",
    touchAction: swipeOpts ? "pan-y pinch-zoom" : "pan-y",
  } satisfies Partial<CSSStyleDeclaration>);
  options.container.appendChild(wrapper);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("data-slideshow-canvas", "");
  Object.assign(canvas.style, {
    display: "block",
    width: "100%",
    height: "100%",
  } satisfies Partial<CSSStyleDeclaration>);
  wrapper.appendChild(canvas);

  // Screen-reader status — announces slide changes politely.
  const status = document.createElement("div");
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-atomic", "true");
  Object.assign(status.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  } satisfies Partial<CSSStyleDeclaration>);
  wrapper.appendChild(status);

  // --- Chrome -----------------------------------------------------------

  let arrowsMount: ArrowsMount | null = null;
  let dotsMount: DotsMount | null = null;
  let counterMount: CounterMount | null = null;
  let progressMount: ProgressMount | null = null;
  let captionsMount: CaptionsMount | null = null;

  if (arrowsOpts) {
    arrowsMount = createArrows(arrowsOpts, () => void prev(), () => void next());
    wrapper.appendChild(arrowsMount.element);
  }
  if (dotsMount === null && dotsOpts) {
    dotsMount = createDots(dotsOpts, options.slides.length, (i) => void go(i));
    wrapper.appendChild(dotsMount.element);
  }
  if (counterOpts) {
    counterMount = createCounter(counterOpts, options.slides.length);
    wrapper.appendChild(counterMount.element);
  }
  if (progressOpts) {
    progressMount = createProgress(progressOpts);
    wrapper.appendChild(progressMount.element);
  }
  if (captionsOpts) {
    captionsMount = createCaptions(captionsOpts);
    wrapper.appendChild(captionsMount.element);
  }

  syncCanvasSize();

  // In lazy mode, bound the runner's URL-keyed texture cache to roughly
  // the size of our preload window so old slides are GC'd from the GPU
  // as we navigate. +2 cushion: covers the "transitioning to a fresh
  // edge of the window" moment where both the new neighbour AND the
  // pre-existing edge are temporarily resident.
  const runner = new Runner({
    canvas,
    ...(lazy
      ? { textureCache: { maxUrlEntries: 2 * preloadWindow + 1 + 2 } }
      : {}),
  });

  // --- Slide loading ----------------------------------------------------
  //
  // Eager mode (default): decode every slide into a DOM image up front;
  // `resolvedSlides[i]` is set for every i once `ready` resolves.
  //
  // Lazy mode: only the current slide + N preload-window neighbours are
  // loaded at any time. URL slides pass straight through to the runner
  // (which handles fetch + decode + upload via its texture cache + LRU
  // eviction). Non-URL DOM-source slides are always considered loaded
  // (they're already in memory by definition).

  const slideCount = options.slides.length;

  /**
   * What `runner.render()` consumes for slide index `i`. In eager mode,
   * the pre-decoded image / canvas from `resolveAll`. In lazy mode, the
   * original source (URL string or DOM element) — URLs require having
   * been preloaded into the runner first; `loadWindowAround()` handles that.
   */
  function renderSource(i: number): RenderSlide | undefined {
    if (!lazy) return resolvedSlides[i];
    const src = options.slides[i];
    return src;
  }

  /**
   * Whether slide `i` is ready to render. DOM-source slides are always
   * ready. URL slides are ready iff `runner.preload([url])` has resolved
   * (we track this via `loadedLazy`).
   */
  function isLoaded(i: number): boolean {
    if (!lazy) return resolvedSlides[i] !== undefined;
    const src = options.slides[i];
    if (typeof src !== "string") return true;
    return loadedLazy.has(i);
  }

  // Indices whose URL has been preloaded (lazy mode only). Strings still
  // hold strong refs in `options.slides`, but we don't claim a slide is
  // ready until the underlying GPU texture exists.
  const loadedLazy = new Set<number>();

  // Indices for which preload() is currently in flight, so concurrent
  // `loadWindowAround()` calls don't fire duplicate awaits.
  const pendingLazyLoads = new Map<number, Promise<void>>();

  function loadIndexLazy(i: number): Promise<void> {
    if (!lazy || loadedLazy.has(i)) return Promise.resolve();
    const src = options.slides[i];
    if (typeof src !== "string") {
      loadedLazy.add(i);
      return Promise.resolve();
    }
    const pending = pendingLazyLoads.get(i);
    if (pending) return pending;
    const p = runner
      .preload([src])
      .then(() => {
        loadedLazy.add(i);
        pendingLazyLoads.delete(i);
      })
      .catch((err) => {
        pendingLazyLoads.delete(i);
        throw err;
      });
    pendingLazyLoads.set(i, p);
    return p;
  }

  /**
   * Ensure slide `i` is loaded, then kick off background loads for the
   * preload-window neighbours (no await). Returns when slide `i` is
   * GPU-ready and safe to render.
   */
  async function loadWindowAround(i: number): Promise<void> {
    if (!lazy) return;
    await loadIndexLazy(i);
    // Fire-and-forget the neighbours so subsequent navigation is fast.
    for (let offset = 1; offset <= preloadWindow; offset++) {
      const ahead = wrapIndex(i + offset);
      const behind = wrapIndex(i - offset);
      if (ahead !== null) void loadIndexLazy(ahead);
      if (behind !== null) void loadIndexLazy(behind);
    }
  }

  function wrapIndex(i: number): number | null {
    if (slideCount === 0) return null;
    if (loop) {
      const wrapped = ((i % slideCount) + slideCount) % slideCount;
      return wrapped;
    }
    if (i < 0 || i >= slideCount) return null;
    return i;
  }

  const ready = lazy
    ? loadWindowAround(current).then(() => {
        if (!destroyed) renderIdle();
      })
    : resolveAll(options.slides).then((resolved) => {
        resolvedSlides = resolved;
        if (!destroyed) renderIdle();
      });

  // --- Rendering --------------------------------------------------------

  function selectTransition(from: number, to: number): Transition<UniformParams> {
    return typeof transitionSelector === "function"
      ? transitionSelector(from, to)
      : transitionSelector;
  }

  function renderIdle(): void {
    if (destroyed) return;
    const slide = renderSource(current);
    if (!slide) return;
    if (!isLoaded(current)) return;
    runner.render(dissolve, {
      from: slide,
      to: slide,
      progress: 0,
    });
  }

  // When a navigation arrives mid-transition, sprint the in-flight
  // transition to completion over this many ms before starting the new
  // one. Short enough to feel responsive, long enough that every "from"
  // frame for the next transition is a real, fully-rendered slide
  // (instead of a frozen mid-state, which can look broken).
  const INTERRUPT_SPRINT_MS = 80;

  async function playTransition(from: number, to: number): Promise<void> {
    // Interrupt path: drive the in-flight transition to its target over
    // ~80ms, commit it, then proceed to the new target. The user sees
    // a brief "snap to the slide we were heading to, then transition
    // to the new one" — no half-rendered handoff frame.
    if (isTransitioning && pendingTween && pendingTransitionState) {
      const startProgress = pendingTween.value as number;
      const {
        transition: inflightTransition,
        fromSlide: inflightFromSlide,
        toIndex: inflightTo,
      } = pendingTransitionState;
      const inflightToSlide = renderSource(inflightTo);

      // stop() rejects the old finished promise (so the previous
      // playTransition awaiter unwinds cleanly) and synchronously
      // re-renders progress 0 — i.e. the from slide. We immediately
      // overdraw with the captured visual progress to hide that flash.
      pendingTween.stop();
      pendingTween = null;
      if (inflightToSlide) {
        runner.render(inflightTransition, {
          from: inflightFromSlide,
          to: inflightToSlide,
          progress: startProgress,
        });

        const sprint = animate({
          from: startProgress,
          to: 1,
          duration: INTERRUPT_SPRINT_MS,
          onUpdate: (progress) => {
            runner.render(inflightTransition, {
              from: inflightFromSlide,
              to: inflightToSlide,
              progress: progress as number,
            });
          },
        });
        pendingTween = sprint;
        try {
          await sprint.finished;
        } catch {
          // Re-interrupted during the sprint — the new caller now
          // owns isTransitioning / pendingTo / pendingTransitionState.
          return;
        }
        pendingTween = null;
      }

      // Commit the in-flight transition as completed.
      const previous = current;
      current = inflightTo;
      isTransitioning = false;
      pendingTo = null;
      pendingTransitionState = null;
      status.textContent = `Slide ${current + 1} of ${slideCount}`;
      dotsMount?.update(current);
      counterMount?.update(current, slideCount);
      captionsMount?.update(current);
      emit("change", current, previous);
      emit("transitionend", from, inflightTo);
    }

    // After a possible interrupt `current` may have moved — if it now
    // matches the requested target there's nothing left to do.
    if (to === current) {
      if (isPlaying) scheduleAutoplay();
      return;
    }

    const fromIdx = current;
    // In lazy mode the target might not be loaded yet — await before
    // we kick off the transition so render() never sees an un-preloaded
    // URL. Also pulls neighbours into the window for the *next* nav.
    if (lazy) await loadWindowAround(to);
    const fromSlide = renderSource(fromIdx);
    const toSlide = renderSource(to);
    if (!fromSlide || !toSlide) return;

    isTransitioning = true;
    pendingTo = to;
    const transition = selectTransition(fromIdx, to);
    pendingTransitionState = { transition, fromSlide, toIndex: to };
    emit("transitionstart", fromIdx, to);
    clearAutoplayTimer();
    stopProgressAnimation();

    const tween = animate({
      from: 0,
      to: 1,
      duration: transitionDuration,
      ...(options.ease ? { ease: options.ease } : {}),
      onUpdate: (progress) => {
        runner.render(transition, {
          from: fromSlide,
          to: toSlide,
          progress: progress as number,
        });
      },
    });
    pendingTween = tween;

    try {
      await tween.finished;
    } catch {
      // Either we were interrupted (the interrupt path took over and
      // will handle commit/cleanup) or stopped during destroy. Either
      // way, do not commit here.
      return;
    }

    pendingTween = null;
    pendingTo = null;
    pendingTransitionState = null;
    const previous = current;
    current = to;
    isTransitioning = false;
    status.textContent = `Slide ${current + 1} of ${slideCount}`;
    dotsMount?.update(current);
    counterMount?.update(current, slideCount);
    captionsMount?.update(current);
    emit("change", current, previous);
    emit("transitionend", fromIdx, to);
    if (isPlaying) scheduleAutoplay();
  }

  async function go(index: number, opts: GoOptions = {}): Promise<void> {
    if (destroyed) return;
    const target = clampIndex(index, slideCount);
    if (target === current && !isTransitioning) return;
    if (opts.instant) {
      if (lazy) await loadWindowAround(target);
      const previous = current;
      current = target;
      renderIdle();
      status.textContent = `Slide ${current + 1} of ${slideCount}`;
      dotsMount?.update(current);
      counterMount?.update(current, slideCount);
      captionsMount?.update(current);
      emit("change", current, previous);
      return;
    }
    await playTransition(current, target);
  }

  // During a transition, `current` is still the previous slide — base
  // navigation on `pendingTo` so rapid Next/Prev clicks advance from
  // the slide we're heading to, not the one we're leaving.
  function navBase(): number {
    return pendingTo ?? current;
  }

  function next(): Promise<void> {
    const target = navBase() + 1;
    if (target >= slideCount) {
      if (!loop) return Promise.resolve();
      return go(0);
    }
    return go(target);
  }

  function prev(): Promise<void> {
    const target = navBase() - 1;
    if (target < 0) {
      if (!loop) return Promise.resolve();
      return go(slideCount - 1);
    }
    return go(target);
  }

  // --- Autoplay ---------------------------------------------------------

  function scheduleAutoplay(): void {
    if (destroyed || !isPlaying || autoplayDelay <= 0) return;
    clearAutoplayTimer();
    progressStart = performance.now();
    if (progressMount) runProgressAnimation();
    autoplayTimer = setTimeout(() => {
      autoplayTimer = null;
      void next();
    }, autoplayDelay);
  }

  function clearAutoplayTimer(): void {
    if (autoplayTimer !== null) {
      clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function runProgressAnimation(): void {
    if (!progressMount || autoplayDelay <= 0) return;
    const tick = () => {
      if (!progressMount || !isPlaying || isTransitioning || destroyed) {
        progressRaf = null;
        return;
      }
      const elapsed = performance.now() - progressStart;
      const p = Math.min(elapsed / autoplayDelay, 1);
      progressMount.setProgress(p);
      if (p < 1) {
        progressRaf = requestAnimationFrame(tick);
      } else {
        progressRaf = null;
      }
    };
    if (progressRaf !== null) cancelAnimationFrame(progressRaf);
    progressRaf = requestAnimationFrame(tick);
  }

  function stopProgressAnimation(): void {
    if (progressRaf !== null) {
      cancelAnimationFrame(progressRaf);
      progressRaf = null;
    }
    progressMount?.setProgress(0);
  }

  function play(): void {
    if (destroyed || autoplayDelay <= 0) return;
    if (isPlaying) return;
    isPlaying = true;
    if (!isTransitioning) scheduleAutoplay();
  }

  function pause(): void {
    isPlaying = false;
    clearAutoplayTimer();
    stopProgressAnimation();
  }

  // --- Input ------------------------------------------------------------

  function onClick(event: MouseEvent): void {
    // Ignore clicks bubbled up from chrome elements (arrows, dots, etc).
    // Those use stopPropagation, but defensive here too.
    if (event.target !== wrapper && event.target !== canvas) return;
    const rect = wrapper.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x < rect.width / 2) void prev();
    else void next();
  }

  function onKeyDown(event: KeyboardEvent): void {
    let handled = true;
    switch (event.key) {
      case "ArrowLeft":
        void prev();
        break;
      case "ArrowRight":
        void next();
        break;
      case "Home":
        void go(0);
        break;
      case "End":
        void go(slideCount - 1);
        break;
      case " ":
      case "Spacebar":
        if (isPlaying) pause();
        else play();
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  }

  function onVisibilityChange(): void {
    if (document.hidden) {
      clearAutoplayTimer();
      stopProgressAnimation();
    } else if (isPlaying && !isTransitioning) {
      scheduleAutoplay();
    }
  }

  let pauseOnHoverWasPlaying = false;
  function onPointerEnter(): void {
    if (!pauseOnHover) return;
    if (isPlaying) {
      pauseOnHoverWasPlaying = true;
      pause();
    }
  }
  function onPointerLeave(): void {
    if (!pauseOnHover) return;
    if (pauseOnHoverWasPlaying) {
      pauseOnHoverWasPlaying = false;
      play();
    }
  }

  // Swipe — track horizontal travel from pointerdown to pointerup; if
  // past the threshold and not interrupted by a vertical scroll, fire
  // prev / next on release.
  let swipeStartX: number | null = null;
  let swipeStartY: number | null = null;
  let swipePointerId: number | null = null;
  function onPointerDown(event: PointerEvent): void {
    if (!swipeOpts) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
    swipePointerId = event.pointerId;
  }
  function onPointerUp(event: PointerEvent): void {
    if (!swipeOpts) return;
    if (swipeStartX === null || event.pointerId !== swipePointerId) return;
    const dx = event.clientX - swipeStartX;
    const dy = event.clientY - (swipeStartY ?? event.clientY);
    swipeStartX = null;
    swipeStartY = null;
    swipePointerId = null;
    // Vertical scroll wins — only treat as swipe if x-travel dominates.
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (Math.abs(dx) < swipeThreshold) return;
    // Stop the synthetic click that Chrome fires on pointerup so the
    // wrapper's click-half handler doesn't double-fire on the same gesture.
    event.preventDefault();
    if (dx < 0) void next();
    else void prev();
  }
  function onPointerCancel(): void {
    swipeStartX = null;
    swipeStartY = null;
    swipePointerId = null;
  }

  if (clickNav) wrapper.addEventListener("click", onClick);
  if (keyboardNav) wrapper.addEventListener("keydown", onKeyDown);
  if (pauseOnHidden && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  if (pauseOnHover) {
    wrapper.addEventListener("pointerenter", onPointerEnter);
    wrapper.addEventListener("pointerleave", onPointerLeave);
  }
  if (swipeOpts) {
    wrapper.addEventListener("pointerdown", onPointerDown);
    wrapper.addEventListener("pointerup", onPointerUp);
    wrapper.addEventListener("pointercancel", onPointerCancel);
  }

  // --- Canvas sizing ----------------------------------------------------

  function syncCanvasSize(): void {
    const rect = options.container.getBoundingClientRect();
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
  }

  const resizeObserver =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          syncCanvasSize();
          if (!isTransitioning) renderIdle();
        })
      : null;
  resizeObserver?.observe(options.container);

  // --- First render -----------------------------------------------------

  void ready.then(() => {
    if (!destroyed) {
      renderIdle();
      status.textContent = `Slide ${current + 1} of ${slideCount}`;
      dotsMount?.update(current);
      counterMount?.update(current, slideCount);
      captionsMount?.update(current);
      if (isPlaying) scheduleAutoplay();
    }
  });

  // --- Events -----------------------------------------------------------

  function emit<E extends SlideshowEvent>(
    event: E,
    ...args: Parameters<EventMap[E]>
  ): void {
    for (const cb of listeners[event]) {
      (cb as (...args: Parameters<EventMap[E]>) => void)(...args);
    }
  }

  function on<E extends SlideshowEvent>(
    event: E,
    cb: EventMap[E],
  ): () => void {
    listeners[event].add(cb);
    return () => {
      listeners[event].delete(cb);
    };
  }

  // --- Public handle ----------------------------------------------------

  return {
    get current(): number {
      return current;
    },
    get length(): number {
      return options.slides.length;
    },
    get isPlaying(): boolean {
      return isPlaying;
    },
    get isTransitioning(): boolean {
      return isTransitioning;
    },
    ready,
    next,
    prev,
    go,
    play,
    pause,
    on: on as SlideshowHandle["on"],
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      clearAutoplayTimer();
      stopProgressAnimation();
      pendingTween?.stop();
      pendingTween = null;
      resizeObserver?.disconnect();
      if (clickNav) wrapper.removeEventListener("click", onClick);
      if (keyboardNav) wrapper.removeEventListener("keydown", onKeyDown);
      if (pauseOnHidden && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      if (pauseOnHover) {
        wrapper.removeEventListener("pointerenter", onPointerEnter);
        wrapper.removeEventListener("pointerleave", onPointerLeave);
      }
      if (swipeOpts) {
        wrapper.removeEventListener("pointerdown", onPointerDown);
        wrapper.removeEventListener("pointerup", onPointerUp);
        wrapper.removeEventListener("pointercancel", onPointerCancel);
      }
      arrowsMount?.destroy();
      dotsMount?.destroy();
      counterMount?.destroy();
      progressMount?.destroy();
      captionsMount?.destroy();
      runner.dispose();
      wrapper.remove();
      for (const key of Object.keys(listeners) as SlideshowEvent[]) {
        listeners[key].clear();
      }
    },
  };
}

function clampIndex(index: number, length: number): number {
  if (!Number.isFinite(index)) return 0;
  if (index < 0) return 0;
  if (index >= length) return Math.max(0, length - 1);
  return Math.floor(index);
}
