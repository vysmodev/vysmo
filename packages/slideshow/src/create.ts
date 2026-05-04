import { animate } from "@vysmo/animations";
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
  let pendingTween: { stop: () => void } | null = null;
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

  const runner = new Runner({ canvas });

  // --- Slide loading ----------------------------------------------------

  const ready = resolveAll(options.slides).then((resolved) => {
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
    const slide = resolvedSlides[current];
    if (!slide || destroyed) return;
    runner.render(dissolve, {
      from: slide,
      to: slide,
      progress: 0,
    });
  }

  async function playTransition(from: number, to: number): Promise<void> {
    if (isTransitioning) return;
    const fromSlide = resolvedSlides[from];
    const toSlide = resolvedSlides[to];
    if (!fromSlide || !toSlide) return;

    isTransitioning = true;
    const transition = selectTransition(from, to);
    emit("transitionstart", from, to);
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
    pendingTween = { stop: () => tween.stop() };

    try {
      await tween.finished;
    } catch {
      isTransitioning = false;
      pendingTween = null;
      return;
    }

    pendingTween = null;
    const previous = current;
    current = to;
    isTransitioning = false;
    status.textContent = `Slide ${current + 1} of ${resolvedSlides.length}`;
    dotsMount?.update(current);
    counterMount?.update(current, resolvedSlides.length);
    captionsMount?.update(current);
    emit("change", current, previous);
    emit("transitionend", from, to);
    if (isPlaying) scheduleAutoplay();
  }

  async function go(index: number, opts: GoOptions = {}): Promise<void> {
    if (destroyed) return;
    const target = clampIndex(
      index,
      resolvedSlides.length || options.slides.length,
    );
    if (target === current && !isTransitioning) return;
    if (opts.instant) {
      const previous = current;
      current = target;
      renderIdle();
      status.textContent = `Slide ${current + 1} of ${resolvedSlides.length}`;
      dotsMount?.update(current);
      counterMount?.update(current, resolvedSlides.length);
      captionsMount?.update(current);
      emit("change", current, previous);
      return;
    }
    await playTransition(current, target);
  }

  function next(): Promise<void> {
    const length = resolvedSlides.length || options.slides.length;
    const target = current + 1;
    if (target >= length) {
      if (!loop) return Promise.resolve();
      return go(0);
    }
    return go(target);
  }

  function prev(): Promise<void> {
    const length = resolvedSlides.length || options.slides.length;
    const target = current - 1;
    if (target < 0) {
      if (!loop) return Promise.resolve();
      return go(length - 1);
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
        void go(resolvedSlides.length - 1);
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
      status.textContent = `Slide ${current + 1} of ${resolvedSlides.length}`;
      dotsMount?.update(current);
      counterMount?.update(current, resolvedSlides.length);
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
