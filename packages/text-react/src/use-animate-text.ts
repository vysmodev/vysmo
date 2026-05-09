"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  animateText,
  type AnimateTextHandle,
  type AnimateTextOptions,
} from "@vysmo/text";

/**
 * Run `animateText` against an element you mount yourself. Handy when
 * you can't use the `<AnimateText>` wrapper because the element is
 * structurally part of something else (a Markdown-rendered heading, a
 * MDX block, a third-party component) — `useAnimateText(ref, options)`
 * lets you animate it without owning the JSX.
 *
 * The handle is created on mount, re-created when any option changes,
 * and `.stop()`-ed on unmount.
 */
export function useAnimateText(
  ref: RefObject<HTMLElement | null>,
  options: AnimateTextOptions,
): void {
  const handleRef = useRef<AnimateTextHandle | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = animateText(el, options);
    handleRef.current = handle;
    return () => {
      handle.stop();
      handleRef.current = null;
    };
    // We deliberately depend on the whole options object — callers
    // memoize when they want stability. Same contract as the rest of
    // React's "options object" hooks (e.g. `useQuery`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, options]);
}
