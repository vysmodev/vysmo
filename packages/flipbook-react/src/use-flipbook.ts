"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  createFlipbook,
  type FlipbookHandle,
  type FlipbookOptions,
} from "@vysmo/flipbook";

/**
 * Mount a flipbook into a container ref you own and get the handle for
 * imperative control (`next` / `prev` / `goTo` / `seek` / `play` /
 * `pause`).
 *
 * Re-creates the flipbook when *any* member of the `options` object
 * changes — memoize the options and the `pages` array if you want
 * stability across renders. Returns `null` until the container is in
 * the DOM and the flipbook is mounted.
 */
export function useFlipbook(
  containerRef: RefObject<HTMLElement | null>,
  options: Omit<FlipbookOptions, "container">,
): FlipbookHandle | null {
  const [handle, setHandle] = useState<FlipbookHandle | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const h = createFlipbook({ ...optionsRef.current, container });
    setHandle(h);
    return () => {
      h.destroy();
      setHandle(null);
    };
    // We deliberately depend on the whole options object — callers
    // memoize when they want stability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, options]);

  return handle;
}
