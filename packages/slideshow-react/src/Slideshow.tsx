"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactElement } from "react";
import {
  createSlideshow,
  type SlideshowHandle,
  type SlideshowOptions,
  type SlideSource,
  type ArrowsOptions,
  type DotsOptions,
  type CounterOptions,
  type ProgressOptions,
  type CaptionsOptions,
  type SwipeOptions,
} from "@vysmo/slideshow";

export interface SlideshowProps {
  /** Slide sources. URL strings (decoded), `HTMLImageElement`s, or canvases. */
  slides: readonly SlideSource[];
  /** Starting slide index. Default `0`. */
  initial?: number;
  /** Transition (or `(from, to) => Transition` selector for variety). Default `dissolve`. */
  transition?: SlideshowOptions["transition"];
  /** Transition duration ms. Default `800`. */
  transitionDuration?: number;
  /** Easing for transition progress. Default linear. */
  ease?: SlideshowOptions["ease"];
  /** Autoplay dwell time ms. `0` / omit to disable. */
  autoplayDelay?: number;
  /** Start autoplay on mount. Defaults to `true` when `autoplayDelay > 0`. */
  autoplay?: boolean;
  /** Wrap last → first. Default `true`. */
  loop?: boolean;
  /** Click halves to navigate. Default `true`. */
  clickNavigation?: boolean;
  /** Arrow keys / Home / End / Space. Default `true`. */
  keyboardNavigation?: boolean;
  /** Pause autoplay while the tab is hidden. Default `true`. */
  pauseOnHidden?: boolean;
  /** Pause autoplay while the pointer is over the slideshow. Default `false`. */
  pauseOnHover?: boolean;
  /** Touch / pointer swipe. */
  swipeNavigation?: boolean | SwipeOptions;
  /** Visible nav arrows. */
  arrows?: boolean | ArrowsOptions;
  /** Page-indicator dots. */
  dots?: boolean | DotsOptions;
  /** Slide-counter text overlay. */
  counter?: boolean | CounterOptions;
  /** Autoplay countdown bar. */
  progress?: boolean | ProgressOptions;
  /** Per-slide caption overlay. */
  captions?: false | CaptionsOptions;
  /** Accessible label. Default `"Slideshow"`. */
  ariaLabel?: string;
  /** Fires when the active slide changes. */
  onChange?: (current: number, previous: number) => void;
  /** Fires when a transition begins. */
  onTransitionStart?: (from: number, to: number) => void;
  /** Fires when a transition finishes. */
  onTransitionEnd?: (from: number, to: number) => void;
  /** Forwarded to the host `<div>`. */
  className?: string;
  /** Forwarded to the host `<div>`. Size the slideshow here (width / height). */
  style?: CSSProperties;
}

/**
 * React wrapper around `@vysmo/slideshow`. Renders a `<div>` host,
 * mounts the slideshow into it, and tears down on unmount.
 *
 * For imperative control (custom Next/Prev buttons, scroll-driven
 * `go()`), reach for `useSlideshow(containerRef, options)` instead — it
 * returns the handle.
 */
export function Slideshow({
  slides,
  initial,
  transition,
  transitionDuration,
  ease,
  autoplayDelay,
  autoplay,
  loop,
  clickNavigation,
  keyboardNavigation,
  pauseOnHidden,
  pauseOnHover,
  swipeNavigation,
  arrows,
  dots,
  counter,
  progress,
  captions,
  ariaLabel,
  onChange,
  onTransitionStart,
  onTransitionEnd,
  className,
  style,
}: SlideshowProps): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<SlideshowHandle | null>(null);

  // Stash callbacks so reference changes don't recreate the slideshow.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onTransitionStartRef = useRef(onTransitionStart);
  onTransitionStartRef.current = onTransitionStart;
  const onTransitionEndRef = useRef(onTransitionEnd);
  onTransitionEndRef.current = onTransitionEnd;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const opts: SlideshowOptions = { container, slides };
    if (initial !== undefined) opts.initial = initial;
    if (transition !== undefined) opts.transition = transition;
    if (transitionDuration !== undefined) opts.transitionDuration = transitionDuration;
    if (ease !== undefined) opts.ease = ease;
    if (autoplayDelay !== undefined) opts.autoplayDelay = autoplayDelay;
    if (autoplay !== undefined) opts.autoplay = autoplay;
    if (loop !== undefined) opts.loop = loop;
    if (clickNavigation !== undefined) opts.clickNavigation = clickNavigation;
    if (keyboardNavigation !== undefined) opts.keyboardNavigation = keyboardNavigation;
    if (pauseOnHidden !== undefined) opts.pauseOnHidden = pauseOnHidden;
    if (pauseOnHover !== undefined) opts.pauseOnHover = pauseOnHover;
    if (swipeNavigation !== undefined) opts.swipeNavigation = swipeNavigation;
    if (arrows !== undefined) opts.arrows = arrows;
    if (dots !== undefined) opts.dots = dots;
    if (counter !== undefined) opts.counter = counter;
    if (progress !== undefined) opts.progress = progress;
    if (captions !== undefined) opts.captions = captions;
    if (ariaLabel !== undefined) opts.ariaLabel = ariaLabel;

    const handle = createSlideshow(opts);
    handleRef.current = handle;

    const offChange = handle.on("change", (cur, prev) => onChangeRef.current?.(cur, prev));
    const offStart = handle.on("transitionstart", (from, to) =>
      onTransitionStartRef.current?.(from, to),
    );
    const offEnd = handle.on("transitionend", (from, to) =>
      onTransitionEndRef.current?.(from, to),
    );

    return () => {
      offChange();
      offStart();
      offEnd();
      handle.destroy();
      handleRef.current = null;
    };
  }, [
    slides,
    initial,
    transition,
    transitionDuration,
    ease,
    autoplayDelay,
    autoplay,
    loop,
    clickNavigation,
    keyboardNavigation,
    pauseOnHidden,
    pauseOnHover,
    swipeNavigation,
    arrows,
    dots,
    counter,
    progress,
    captions,
    ariaLabel,
  ]);

  return <div ref={containerRef} className={className} style={style} />;
}
