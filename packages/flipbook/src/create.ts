import { animate } from "@vysmo/animations";
import { cubicInOut, type EasingFn } from "@vysmo/easings";
import { Runner, pageCurl } from "@vysmo/transitions";
import { resolveAll, type ResolvedPage } from "./loader.js";
import type {
  FlipOptions,
  FlipbookAxis,
  FlipbookEvent,
  FlipbookHandle,
  FlipbookOptions,
} from "./types.js";

/** What can be passed to `runner.render()` after resolution. */
type RenderPage = string | HTMLImageElement | HTMLCanvasElement;

type EventMap = {
  change: (current: number, previous: number) => void;
  flipstart: (from: number, to: number) => void;
  flipend: (from: number, to: number) => void;
};

type Direction = "forward" | "backward";

const DEFAULT_DURATION_MS = 900;
const DEFAULT_TILT = 0.12;
const DEFAULT_BACK_COLOR: readonly [number, number, number] = [0.97, 0.96, 0.94];
const DRAG_THRESHOLD_PX = 5;
const DEFAULT_DRAG_COMMIT = 0.5;
const DEFAULT_AUTOPLAY_MS = 4000;

/**
 * Create a WebGL flipbook around the page-curl mesh transition.
 *
 * Pass a container element + an array of page sources (image URLs,
 * `HTMLImageElement`s, canvases, or videos) and you get a fully wired
 * flipbook: click halves to flip, arrow keys for keyboard nav, drag the
 * corner mid-flip to scrub the curl manually (release past 50% to commit,
 * less to revert), optional autoplay with pause-on-hover.
 *
 * The handle exposes `.next()`, `.prev()`, `.goTo(index)`, `.play()`,
 * `.pause()`, `.dispose()`, plus `.on(event, listener)` for lifecycle
 * (`change`, `flipstart`, `flipend`).
 *
 * @throws Error if `options.pages` is empty.
 */
export function createFlipbook(options: FlipbookOptions): FlipbookHandle {
  if (options.pages.length === 0) {
    throw new Error("createFlipbook requires at least one page.");
  }

  const axis: FlipbookAxis = options.axis ?? "horizontal";
  const userTilt = options.tilt ?? DEFAULT_TILT;
  const backColor = options.backColor ?? DEFAULT_BACK_COLOR;
  const flipDuration = options.flipDuration ?? DEFAULT_DURATION_MS;
  const ease: EasingFn = options.ease ?? cubicInOut;
  const loop = options.loop ?? false;
  const clickNav = options.clickNavigation ?? true;
  const dragNav = options.dragNavigation ?? true;
  const dragCommitThreshold = clamp01(options.dragCommitThreshold ?? DEFAULT_DRAG_COMMIT);
  const keyboardNav = options.keyboardNavigation ?? true;
  const ariaLabel = options.ariaLabel ?? "Flipbook";
  const lazy = options.lazy === true;
  const preloadWindow = Math.max(0, Math.floor(options.preloadWindow ?? 1));
  const pageCount = options.pages.length;

  // Autoplay config: false/undefined → off, true → default interval,
  // { intervalMs } → custom interval. Resolved into a normalized shape.
  const autoplayInterval =
    options.autoplay === true
      ? DEFAULT_AUTOPLAY_MS
      : typeof options.autoplay === "object" && options.autoplay
        ? Math.max(250, options.autoplay.intervalMs)
        : null;

  // Forward flip = next page. Curl peels from the +sweepDir side toward
  // the -sweepDir (pinned) side. Horizontal: pinned spine on the left,
  // right edge peels left. Vertical: pinned binding at the top, bottom
  // edge peels up (wall-calendar style).
  const baseTilt = axis === "horizontal" ? 0 : -Math.PI / 2;

  let current = clampIndex(options.initialPage ?? 0, options.pages.length);
  let isFlipping = false;
  let destroyed = false;
  let resolvedPages: ResolvedPage[] = [];
  let pendingTween: { stop: () => void } | null = null;

  const listeners: { [K in FlipbookEvent]: Set<EventMap[K]> } = {
    change: new Set(),
    flipstart: new Set(),
    flipend: new Set(),
  };

  // --- DOM setup --------------------------------------------------------

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-page-flip-wrapper", "");
  wrapper.setAttribute("role", "region");
  wrapper.setAttribute("aria-roledescription", "flipbook");
  wrapper.setAttribute("aria-label", ariaLabel);
  wrapper.tabIndex = 0;
  Object.assign(wrapper.style, {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    outline: "none",
    userSelect: "none",
    touchAction: axis === "horizontal" ? "pan-y" : "pan-x",
  } satisfies Partial<CSSStyleDeclaration>);
  options.container.appendChild(wrapper);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("data-page-flip-canvas", "");
  Object.assign(canvas.style, {
    display: "block",
    width: "100%",
    height: "100%",
  } satisfies Partial<CSSStyleDeclaration>);
  wrapper.appendChild(canvas);

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

  syncCanvasSize();

  // Lazy mode: bound the runner's URL-keyed texture cache to roughly
  // the size of our preload window. +2 cushion handles the "drag-scrubbing
  // across an edge of the window" moment where both the new neighbour
  // and the pre-existing edge are momentarily resident.
  const runner = new Runner({
    canvas,
    ...(lazy
      ? { textureCache: { maxUrlEntries: 2 * preloadWindow + 1 + 2 } }
      : {}),
  });

  // --- Page loading -----------------------------------------------------
  //
  // Eager (default): every page decoded up front; `resolvedPages[i]` is
  // populated for all i once `ready` resolves.
  //
  // Lazy: only current + N preload-window neighbours are loaded. URL
  // pages pass through to runner (fetch + decode + upload via texture
  // cache + LRU eviction). Non-URL DOM pages are always considered ready.

  /**
   * What `runner.render()` consumes for page index `i`. Eager → the
   * pre-decoded image/canvas. Lazy → the original source (URL string
   * or DOM element); URLs must have been preloaded via `loadWindowAround`.
   */
  function renderSource(i: number): RenderPage | undefined {
    if (!lazy) return resolvedPages[i];
    return options.pages[i];
  }

  function isLoaded(i: number): boolean {
    if (!lazy) return resolvedPages[i] !== undefined;
    const src = options.pages[i];
    if (typeof src !== "string") return true;
    return loadedLazy.has(i);
  }

  const loadedLazy = new Set<number>();
  const pendingLazyLoads = new Map<number, Promise<void>>();

  function loadIndexLazy(i: number): Promise<void> {
    if (!lazy || loadedLazy.has(i)) return Promise.resolve();
    const src = options.pages[i];
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

  async function loadWindowAround(i: number): Promise<void> {
    if (!lazy) return;
    await loadIndexLazy(i);
    for (let offset = 1; offset <= preloadWindow; offset++) {
      const ahead = wrapIndex(i + offset);
      const behind = wrapIndex(i - offset);
      if (ahead !== null) void loadIndexLazy(ahead);
      if (behind !== null) void loadIndexLazy(behind);
    }
  }

  function wrapIndex(i: number): number | null {
    if (pageCount === 0) return null;
    if (loop) {
      return ((i % pageCount) + pageCount) % pageCount;
    }
    if (i < 0 || i >= pageCount) return null;
    return i;
  }

  const ready = lazy
    ? loadWindowAround(current).then(() => {
        if (!destroyed) renderIdle();
      })
    : resolveAll(options.pages).then((resolved) => {
        resolvedPages = resolved;
        if (!destroyed) renderIdle();
      });

  // --- Rendering --------------------------------------------------------

  function renderIdle(): void {
    if (destroyed) return;
    const page = renderSource(current);
    if (!page || !isLoaded(current)) return;
    runner.render(pageCurl, {
      from: page,
      to: page,
      progress: 0,
      params: { tilt: baseTilt + userTilt, backColor },
    });
  }

  function renderFlip(
    direction: Direction,
    fromIdx: number,
    toIdx: number,
    internalProgress: number,
  ): void {
    // Internal progress: 0 = `current` visible, 1 = `target` visible.
    // The page-curl shader is one-directional (always peels from the
    // +sweepDir edge toward the -sweepDir edge). To play it as a true
    // time-reverse for backward flips, we keep the same shader-level
    // sweep direction and instead swap the texture pair + invert the
    // shader's progress. That way the curl appears from the same side
    // it disappeared into during the forward flip, unrolling backward.
    const earlier = direction === "forward" ? fromIdx : toIdx;
    const later = direction === "forward" ? toIdx : fromIdx;
    const earlierPage = renderSource(earlier);
    const laterPage = renderSource(later);
    if (!earlierPage || !laterPage || destroyed) return;
    if (!isLoaded(earlier) || !isLoaded(later)) return;
    const forwardProgress =
      direction === "forward" ? internalProgress : 1 - internalProgress;
    runner.render(pageCurl, {
      from: earlierPage,
      to: laterPage,
      progress: forwardProgress,
      params: { tilt: baseTilt + userTilt, backColor },
    });
  }

  // --- Navigation -------------------------------------------------------

  function targetFor(direction: Direction): number | null {
    if (direction === "forward") {
      if (current + 1 < pageCount) return current + 1;
      return loop ? 0 : null;
    }
    if (current - 1 >= 0) return current - 1;
    return loop ? pageCount - 1 : null;
  }

  async function playFlip(
    direction: Direction,
    fromIdx: number,
    toIdx: number,
    startProgress = 0,
  ): Promise<void> {
    if (destroyed) return;
    if (isFlipping) return;
    // Lazy mode: ensure target page is loaded before we start flipping
    // (renderFlip would otherwise silently no-op for an un-preloaded URL).
    // Pulls neighbours into the window for the next flip too.
    if (lazy) await loadWindowAround(toIdx);
    isFlipping = true;
    if (startProgress <= 0) emit("flipstart", fromIdx, toIdx);

    const remaining = Math.max(0, 1 - startProgress);
    const duration = Math.max(1, flipDuration * remaining);
    const tween = animate({
      from: startProgress,
      to: 1,
      duration,
      ease,
      onUpdate: (p) => renderFlip(direction, fromIdx, toIdx, p as number),
    });
    pendingTween = { stop: () => tween.stop() };

    try {
      await tween.finished;
    } catch {
      isFlipping = false;
      pendingTween = null;
      return;
    }

    pendingTween = null;
    const previous = current;
    current = toIdx;
    isFlipping = false;
    renderIdle();
    status.textContent = `Page ${current + 1} of ${pageCount}`;
    emit("change", current, previous);
    emit("flipend", fromIdx, toIdx);
  }

  async function revertFlip(
    direction: Direction,
    fromIdx: number,
    toIdx: number,
    startProgress: number,
  ): Promise<void> {
    if (destroyed) return;
    if (isFlipping) return;
    isFlipping = true;

    const duration = Math.max(1, flipDuration * Math.max(0, startProgress));
    const tween = animate({
      from: startProgress,
      to: 0,
      duration,
      ease,
      onUpdate: (p) => renderFlip(direction, fromIdx, toIdx, p as number),
    });
    pendingTween = { stop: () => tween.stop() };

    try {
      await tween.finished;
    } catch {
      isFlipping = false;
      pendingTween = null;
      return;
    }

    pendingTween = null;
    isFlipping = false;
    renderIdle();
  }

  function next(): Promise<void> {
    if (destroyed || isFlipping || dragState !== "idle") return Promise.resolve();
    const target = targetFor("forward");
    if (target === null) return Promise.resolve();
    return playFlip("forward", current, target);
  }

  function prev(): Promise<void> {
    if (destroyed || isFlipping || dragState !== "idle") return Promise.resolve();
    const target = targetFor("backward");
    if (target === null) return Promise.resolve();
    return playFlip("backward", current, target);
  }

  async function goTo(index: number, opts: FlipOptions = {}): Promise<void> {
    if (destroyed || dragState !== "idle") return;
    const target = clampIndex(index, pageCount);
    if (target === current && !isFlipping) return;
    if (opts.instant) {
      if (lazy) await loadWindowAround(target);
      const previous = current;
      current = target;
      renderIdle();
      status.textContent = `Page ${current + 1} of ${pageCount}`;
      emit("change", current, previous);
      return;
    }
    if (isFlipping) return;
    const direction: Direction = target > current ? "forward" : "backward";
    await playFlip(direction, current, target);
  }

  // --- Pointer drag scrubbing ------------------------------------------

  type DragState = "idle" | "potential" | "active";
  let dragState: DragState = "idle";
  let dragStartX = 0;
  let dragStartY = 0;
  let dragDirection: Direction | null = null;
  let dragTarget: number | null = null;
  let dragProgress = 0;
  let dragPointerId = -1;

  function primaryDelta(e: PointerEvent): number {
    return axis === "horizontal" ? e.clientX - dragStartX : e.clientY - dragStartY;
  }

  function wrapperExtent(): number {
    const rect = wrapper.getBoundingClientRect();
    return axis === "horizontal" ? rect.width : rect.height;
  }

  function onPointerDown(e: PointerEvent): void {
    if (!dragNav && !clickNav) return;
    if (isFlipping) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragState = "potential";
    dragDirection = null;
    dragTarget = null;
    dragProgress = 0;
    dragPointerId = e.pointerId;
    try {
      wrapper.setPointerCapture(e.pointerId);
    } catch {
      // setPointerCapture can throw if the pointer is already released
      // (e.g. fast-fired synthetic events). Drag still works inside the
      // wrapper without capture; we just lose tracking if the pointer
      // exits during the drag. Acceptable degradation.
    }
  }

  function onPointerMove(e: PointerEvent): void {
    if (dragState === "idle" || e.pointerId !== dragPointerId) return;
    const delta = primaryDelta(e);
    if (
      dragState === "potential" &&
      Math.abs(delta) < DRAG_THRESHOLD_PX
    ) {
      return;
    }
    if (!dragNav) {
      // Beyond click threshold but drag is disabled — abort to a click.
      return;
    }
    dragState = "active";

    // Forward = dragging in the page-leaving direction (left for
    // horizontal, up for vertical). Backward = the opposite.
    const direction: Direction = delta < 0 ? "forward" : "backward";
    if (direction !== dragDirection) {
      dragDirection = direction;
      dragTarget = targetFor(direction);
    }
    if (dragTarget === null) {
      // No valid target in this direction — render idle and pin progress.
      dragProgress = 0;
      renderIdle();
      return;
    }
    const extent = wrapperExtent();
    const progress = extent > 0 ? Math.min(1, Math.abs(delta) / extent) : 0;
    dragProgress = progress;
    renderFlip(direction, current, dragTarget, progress);
  }

  function onPointerUp(e: PointerEvent): void {
    if (e.pointerId !== dragPointerId) return;
    const wasState = dragState;
    dragState = "idle";
    try {
      if (wrapper.hasPointerCapture(e.pointerId)) {
        wrapper.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore — capture state mismatches (e.g. test envs) shouldn't
      // disrupt the click/commit decision below.
    }

    if (wasState === "potential") {
      if (clickNav) handleClick(e);
      return;
    }

    if (wasState === "active") {
      const direction = dragDirection;
      const target = dragTarget;
      const progress = dragProgress;
      dragDirection = null;
      dragTarget = null;
      dragProgress = 0;
      if (direction === null || target === null) {
        renderIdle();
        return;
      }
      if (progress >= dragCommitThreshold) {
        emit("flipstart", current, target);
        void playFlip(direction, current, target, progress);
      } else {
        void revertFlip(direction, current, target, progress);
      }
    }
  }

  function onPointerCancel(e: PointerEvent): void {
    if (e.pointerId !== dragPointerId) return;
    dragState = "idle";
    if (dragDirection !== null && dragTarget !== null && dragProgress > 0) {
      const direction = dragDirection;
      const target = dragTarget;
      const progress = dragProgress;
      dragDirection = null;
      dragTarget = null;
      dragProgress = 0;
      void revertFlip(direction, current, target, progress);
    } else {
      renderIdle();
    }
  }

  function handleClick(e: PointerEvent): void {
    const rect = wrapper.getBoundingClientRect();
    if (axis === "horizontal") {
      const x = e.clientX - rect.left;
      if (x < rect.width / 2) void prev();
      else void next();
    } else {
      const y = e.clientY - rect.top;
      if (y < rect.height / 2) void prev();
      else void next();
    }
  }

  function onKeyDown(e: KeyboardEvent): void {
    let handled = true;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        void next();
        break;
      case "ArrowLeft":
      case "ArrowUp":
        void prev();
        break;
      case "Home":
        void goTo(0);
        break;
      case "End":
        void goTo(pageCount - 1);
        break;
      default:
        handled = false;
    }
    if (handled) e.preventDefault();
  }

  if (clickNav || dragNav) {
    wrapper.addEventListener("pointerdown", onPointerDown);
    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerup", onPointerUp);
    wrapper.addEventListener("pointercancel", onPointerCancel);
  }
  if (keyboardNav) wrapper.addEventListener("keydown", onKeyDown);

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
          if (!isFlipping && dragState === "idle") renderIdle();
        })
      : null;
  resizeObserver?.observe(options.container);

  void ready.then(() => {
    if (!destroyed) {
      renderIdle();
      status.textContent = `Page ${current + 1} of ${pageCount}`;
    }
  });

  // --- Externally-driven progress (seek) -------------------------------

  // External seek state. While `isSeeking` is true, the runner renders
  // a forward-direction curl from `current` to the next page at the
  // last-given `seekProgress`. Calling next/prev/goTo resets to idle;
  // a new seek replaces any in-flight tween.
  let isSeeking = false;
  let seekTarget: number | null = null;

  function seek(progress: number): void {
    if (destroyed) return;
    if (dragState !== "idle") return; // drag has authority over the curl
    pendingTween?.stop();
    pendingTween = null;
    isFlipping = false;

    const p = clamp01(progress);
    const target = seekTarget ?? targetFor("forward");
    if (target === null) {
      // No next page (and not looping): nothing to scrub. Render idle so
      // any prior in-flight curl resolves.
      isSeeking = false;
      seekTarget = null;
      renderIdle();
      return;
    }

    if (p <= 0) {
      // Back to idle on the current page.
      isSeeking = false;
      seekTarget = null;
      renderIdle();
      return;
    }

    if (p >= 1) {
      // Commit: target becomes current. Emits change like a regular flip.
      const previous = current;
      current = target;
      isSeeking = false;
      seekTarget = null;
      renderIdle();
      status.textContent = `Page ${current + 1} of ${pageCount}`;
      emit("change", current, previous);
      return;
    }

    // Mid-curl: keep target locked for the duration of the scrub so
    // crossing 0/1 thresholds doesn't bounce between targets.
    isSeeking = true;
    seekTarget = target;
    renderFlip("forward", current, target, p);
  }

  // --- Autoplay ---------------------------------------------------------

  let autoplayTimer: ReturnType<typeof setInterval> | null = null;

  function play(): void {
    if (destroyed || autoplayTimer !== null || autoplayInterval === null) return;
    autoplayTimer = setInterval(() => {
      // next() no-ops while flipping or dragging — that's the desired
      // pause-during-interaction behavior.
      void next();
    }, autoplayInterval);
  }

  function pause(): void {
    if (autoplayTimer === null) return;
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  if (autoplayInterval !== null) {
    // Auto-start if autoplay was configured at construction time.
    void ready.then(() => {
      if (!destroyed) play();
    });
  }

  // --- Events -----------------------------------------------------------

  function emit<E extends FlipbookEvent>(
    event: E,
    ...args: Parameters<EventMap[E]>
  ): void {
    for (const cb of listeners[event]) {
      (cb as (...args: Parameters<EventMap[E]>) => void)(...args);
    }
  }

  function on<E extends FlipbookEvent>(
    event: E,
    cb: EventMap[E],
  ): () => void {
    listeners[event].add(cb);
    return () => {
      listeners[event].delete(cb);
    };
  }

  return {
    get current(): number {
      return current;
    },
    get length(): number {
      return options.pages.length;
    },
    get isFlipping(): boolean {
      return isFlipping;
    },
    get isPlaying(): boolean {
      return autoplayTimer !== null;
    },
    ready,
    next,
    prev,
    goTo,
    seek,
    play,
    pause,
    on: on as FlipbookHandle["on"],
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      pause();
      pendingTween?.stop();
      pendingTween = null;
      resizeObserver?.disconnect();
      if (clickNav || dragNav) {
        wrapper.removeEventListener("pointerdown", onPointerDown);
        wrapper.removeEventListener("pointermove", onPointerMove);
        wrapper.removeEventListener("pointerup", onPointerUp);
        wrapper.removeEventListener("pointercancel", onPointerCancel);
      }
      if (keyboardNav) wrapper.removeEventListener("keydown", onKeyDown);
      runner.dispose();
      wrapper.remove();
      for (const key of Object.keys(listeners) as FlipbookEvent[]) {
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

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
