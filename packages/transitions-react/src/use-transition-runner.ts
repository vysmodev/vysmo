"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { Runner } from "@vysmo/transitions";

/**
 * Low-level escape hatch for callers who want the `<Transition>`
 * component's lifecycle but their own render loop. Pass a ref to a
 * canvas you mount yourself; the hook constructs a `Runner` once the
 * canvas is in the DOM and disposes it on unmount, returning the
 * runner instance (or `null` while it's still mounting).
 *
 * The component built on this is `<Transition>` — reach for the hook
 * only when you're integrating with a non-React render loop or need
 * direct `runner.render()` access for multi-pass / displacement cases
 * the props don't expose yet.
 */
export function useTransitionRunner(
  canvasRef: RefObject<HTMLCanvasElement | null>,
): Runner | null {
  const [runner, setRunner] = useState<Runner | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = new Runner({ canvas });
    setRunner(r);
    return () => {
      r.dispose();
      setRunner(null);
    };
  }, [canvasRef]);

  return runner;
}
