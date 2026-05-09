"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  createSlideshow,
  type SlideshowHandle,
  type SlideshowOptions,
} from "@vysmo/slideshow";

/**
 * Mount a slideshow into a container ref you own and get the handle for
 * imperative control (`next` / `prev` / `go` / `play` / `pause`).
 *
 * Re-creates the slideshow when *any* member of the `options` object
 * changes — memoize the options and the `slides` array if you want
 * stability. Returns `null` until the container is in the DOM and the
 * slideshow is mounted.
 */
export function useSlideshow(
  containerRef: RefObject<HTMLElement | null>,
  options: Omit<SlideshowOptions, "container">,
): SlideshowHandle | null {
  const [handle, setHandle] = useState<SlideshowHandle | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const h = createSlideshow({ ...optionsRef.current, container });
    setHandle(h);
    return () => {
      h.destroy();
      setHandle(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, options]);

  return handle;
}
