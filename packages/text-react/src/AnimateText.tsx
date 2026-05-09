"use client";

import { createElement, useEffect, useRef } from "react";
import type { CSSProperties, ElementType, ReactElement, ReactNode } from "react";
import {
  animateText,
  type AnimateTextHandle,
  type AnimateTextOptions,
  type Preset,
  type PresetName,
  type SplitMode,
  type StaggerOrder,
  type TextAnimationSpec,
  type TransformOrigin,
} from "@vysmo/text";

export interface AnimateTextProps {
  /** Element to render. Default `"span"`. Pass `"h1"` etc. for semantic headings. */
  as?: ElementType;
  /** The text content. Strings work best; complex children re-run the animation when reference changes. */
  children: ReactNode;
  /** Preset name (e.g. `"enter/fade-up"`) or imported preset object (tree-shakable). */
  preset?: PresetName | Preset;
  /** Split granularity. Defaults to the preset's split, or `"character"`. */
  split?: SplitMode;
  /** Milliseconds between consecutive slices starting. Default `30`. */
  stagger?: number;
  /** Order in which slices receive their stagger offset. */
  staggerOrder?: StaggerOrder;
  /** Custom animation specs (used when no `preset` is set, or to override). */
  animations?: TextAnimationSpec[];
  /** Container `perspective` in px. Required for visible 3D transforms. */
  perspective?: number;
  /** Container `perspective-origin`. */
  perspectiveOrigin?: string;
  /** Transform origin applied to every slice. */
  transformOrigin?: TransformOrigin;
  /** Begin playing automatically on mount. Default `true`. */
  autoPlay?: boolean;
  /** Delay before the first play begins, in ms. */
  delay?: number;
  /** How many cycles. `1` (default), `n > 1`, or `"infinite"`. */
  repeat?: number | "infinite";
  /** Delay between successive cycles when `repeat > 1`. */
  repeatDelay?: number;
  /** Fires when the choreography finishes naturally (won't fire while looping). */
  onComplete?: () => void;
  /** Forwarded to the wrapper element. */
  className?: string;
  /** Forwarded to the wrapper element. */
  style?: CSSProperties;
}

/**
 * React wrapper around `@vysmo/text`'s `animateText`. Renders a single
 * element (default `<span>`, override via `as`), and on mount calls
 * `animateText` against the element with the props you've passed.
 *
 * On unmount the handle is `.stop()`-ed, restoring un-animated styles
 * before React removes the DOM. Re-animation happens on prop changes
 * (preset / stagger / repeat / etc.); for explicit replay on the same
 * props, change a `key` prop to fully remount.
 */
export function AnimateText({
  as = "span",
  children,
  preset,
  split,
  stagger,
  staggerOrder,
  animations,
  perspective,
  perspectiveOrigin,
  transformOrigin,
  autoPlay,
  delay,
  repeat,
  repeatDelay,
  onComplete,
  className,
  style,
}: AnimateTextProps): ReactElement {
  const ref = useRef<HTMLElement | null>(null);
  const handleRef = useRef<AnimateTextHandle | null>(null);

  // Stash the callback so its identity changing doesn't re-run the animation.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const opts: AnimateTextOptions = {};
    if (preset !== undefined) opts.preset = preset;
    if (split !== undefined) opts.split = split;
    if (stagger !== undefined) opts.stagger = stagger;
    if (staggerOrder !== undefined) opts.staggerOrder = staggerOrder;
    if (animations !== undefined) opts.animations = animations;
    if (perspective !== undefined) opts.perspective = perspective;
    if (perspectiveOrigin !== undefined) opts.perspectiveOrigin = perspectiveOrigin;
    if (transformOrigin !== undefined) opts.transformOrigin = transformOrigin;
    if (autoPlay !== undefined) opts.autoPlay = autoPlay;
    if (delay !== undefined) opts.delay = delay;
    if (repeat !== undefined) opts.repeat = repeat;
    if (repeatDelay !== undefined) opts.repeatDelay = repeatDelay;

    const handle = animateText(el, opts);
    handleRef.current = handle;

    handle.finished
      .then(() => onCompleteRef.current?.())
      .catch(() => {
        /* stopped — expected */
      });

    return () => {
      handle.stop();
      handleRef.current = null;
    };
  }, [
    children,
    preset,
    split,
    stagger,
    staggerOrder,
    animations,
    perspective,
    perspectiveOrigin,
    transformOrigin,
    autoPlay,
    delay,
    repeat,
    repeatDelay,
  ]);

  return createElement(as, { ref, className, style }, children);
}
