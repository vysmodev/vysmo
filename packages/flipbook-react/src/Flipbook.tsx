"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactElement } from "react";
import {
  createFlipbook,
  type FlipbookAxis,
  type FlipbookHandle,
  type FlipbookOptions,
  type PageSource,
} from "@vysmo/flipbook";

export interface FlipbookProps {
  /** Page sources. URL strings are decoded; canvases / images pass through. */
  pages: readonly PageSource[];
  /** Starting page index. Default `0`. */
  initialPage?: number;
  /** Curl axis. Default `"horizontal"`. */
  axis?: FlipbookAxis;
  /** Hinge tilt in radians, on top of the axis baseline. Default `0.12`. */
  tilt?: number;
  /** Page-back colour, passed to the page-curl shader. */
  backColor?: readonly [number, number, number];
  /** Flip duration ms. Default `900`. */
  flipDuration?: number;
  /** Easing for flip progress. Use any export from `@vysmo/easings`. Default `cubicInOut`. */
  ease?: FlipbookOptions["ease"];
  /** Wrap last → first. Default `false`. */
  loop?: boolean;
  /** Click halves to navigate. Default `true`. */
  clickNavigation?: boolean;
  /** Drag-scrub a corner mid-curl. Default `true`. */
  dragNavigation?: boolean;
  /** Drag commit threshold in `[0, 1]`. Default `0.5`. */
  dragCommitThreshold?: number;
  /** Arrow keys / Home / End navigate. Default `true`. */
  keyboardNavigation?: boolean;
  /** Auto-advance with a timer. `true` = 4000ms; pass `{ intervalMs }` for custom. */
  autoplay?: boolean | { intervalMs: number };
  /** Accessible label. Default `"Flipbook"`. */
  ariaLabel?: string;
  /**
   * Lazy-load mode — only the current page + N preload-window neighbours
   * are loaded onto the GPU at a time. Default `false`. Turn on for long
   * flipbooks (>10–20 pages) where you don't want to decode every image
   * on page load.
   */
  lazy?: boolean;
  /** Per-side preload window for lazy mode. Default `1`. Ignored when `lazy` is false. */
  preloadWindow?: number;
  /** Fires when the active page changes. */
  onChange?: (current: number, previous: number) => void;
  /** Fires when a flip animation begins. */
  onFlipStart?: (from: number, to: number) => void;
  /** Fires when a flip animation finishes. */
  onFlipEnd?: (from: number, to: number) => void;
  /** Forwarded to the container `<div>`. */
  className?: string;
  /** Forwarded to the container `<div>`. Size the flipbook here (width / height). */
  style?: CSSProperties;
}

/**
 * React wrapper around `@vysmo/flipbook`. Renders a `<div>` host, mounts
 * the flipbook into it on mount, and tears down on unmount.
 *
 * For imperative control (custom Next/Prev buttons, scroll-driven
 * `seek`), reach for `useFlipbook(containerRef, options)` instead — it
 * returns the handle.
 */
export function Flipbook({
  pages,
  initialPage,
  axis,
  tilt,
  backColor,
  flipDuration,
  ease,
  loop,
  clickNavigation,
  dragNavigation,
  dragCommitThreshold,
  keyboardNavigation,
  autoplay,
  ariaLabel,
  lazy,
  preloadWindow,
  onChange,
  onFlipStart,
  onFlipEnd,
  className,
  style,
}: FlipbookProps): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<FlipbookHandle | null>(null);

  // Stash callbacks so changing them doesn't recreate the flipbook.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onFlipStartRef = useRef(onFlipStart);
  onFlipStartRef.current = onFlipStart;
  const onFlipEndRef = useRef(onFlipEnd);
  onFlipEndRef.current = onFlipEnd;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const opts: FlipbookOptions = { container, pages };
    if (initialPage !== undefined) opts.initialPage = initialPage;
    if (axis !== undefined) opts.axis = axis;
    if (tilt !== undefined) opts.tilt = tilt;
    if (backColor !== undefined) opts.backColor = backColor;
    if (flipDuration !== undefined) opts.flipDuration = flipDuration;
    if (ease !== undefined) opts.ease = ease;
    if (loop !== undefined) opts.loop = loop;
    if (clickNavigation !== undefined) opts.clickNavigation = clickNavigation;
    if (dragNavigation !== undefined) opts.dragNavigation = dragNavigation;
    if (dragCommitThreshold !== undefined) opts.dragCommitThreshold = dragCommitThreshold;
    if (keyboardNavigation !== undefined) opts.keyboardNavigation = keyboardNavigation;
    if (autoplay !== undefined) opts.autoplay = autoplay;
    if (ariaLabel !== undefined) opts.ariaLabel = ariaLabel;
    if (lazy !== undefined) opts.lazy = lazy;
    if (preloadWindow !== undefined) opts.preloadWindow = preloadWindow;

    const handle = createFlipbook(opts);
    handleRef.current = handle;

    const offChange = handle.on("change", (cur, prev) => onChangeRef.current?.(cur, prev));
    const offStart = handle.on("flipstart", (from, to) => onFlipStartRef.current?.(from, to));
    const offEnd = handle.on("flipend", (from, to) => onFlipEndRef.current?.(from, to));

    return () => {
      offChange();
      offStart();
      offEnd();
      handle.destroy();
      handleRef.current = null;
    };
  }, [
    pages,
    initialPage,
    axis,
    tilt,
    backColor,
    flipDuration,
    ease,
    loop,
    clickNavigation,
    dragNavigation,
    dragCommitThreshold,
    keyboardNavigation,
    autoplay,
    ariaLabel,
    lazy,
    preloadWindow,
  ]);

  return <div ref={containerRef} className={className} style={style} />;
}
