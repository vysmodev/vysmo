"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import {
  Runner,
  type Transition as TransitionType,
  type UniformParams,
  type TextureSource,
} from "@vysmo/transitions";
import { resolveSource, type Source } from "./resolve-source.js";

export interface TransitionProps {
  /** Any transition exported by `@vysmo/transitions`. */
  transition: TransitionType<UniformParams>;
  /** First image. URL string, `HTMLImageElement`, canvas, video, or `ImageBitmap`. */
  from: Source;
  /** Second image. Same accepted shapes as `from`. */
  to: Source;
  /**
   * Controlled progress in `[0, 1]`. When set, the component renders at
   * exactly this progress and the autoplay loop is bypassed — drive it
   * yourself (scroll progress, scrubber, animation library, etc.).
   */
  progress?: number;
  /** Autoplay duration in ms. Used only when `progress` is omitted. Default `1000`. */
  duration?: number;
  /** Whether internal autoplay is running. Used only when `progress` is omitted. Default `true`. */
  playing?: boolean;
  /** Loop autoplay. Default `false`. */
  loop?: boolean;
  /** Easing function applied during autoplay. Default linear. */
  ease?: (t: number) => number;
  /** Override shader uniform defaults. */
  params?: UniformParams;
  /** Fires when a non-loop autoplay reaches `progress=1`. */
  onComplete?: () => void;
  /** Forwarded to the canvas element. */
  className?: string;
  /** Forwarded to the canvas element. */
  style?: CSSProperties;
}

/**
 * React wrapper around `@vysmo/transitions`'s `Runner`. Renders a
 * `<canvas>` and drives a transition between two images — either
 * controlled by a `progress` prop or self-driving via `duration` /
 * `playing` / `loop` / `ease` for the common "play once on mount"
 * case.
 *
 * The component creates one runner on mount and disposes it on
 * unmount; sources are resolved (URL strings → decoded `Image`s) on
 * `from` / `to` change. Canvas size syncs to its CSS box via
 * `ResizeObserver`, with DPR applied so output stays sharp on retina.
 */
export function Transition({
  transition,
  from,
  to,
  progress,
  duration = 1000,
  playing = true,
  loop = false,
  ease,
  params,
  onComplete,
  className,
  style,
}: TransitionProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runnerRef = useRef<Runner | null>(null);
  const [sources, setSources] = useState<{ from: TextureSource; to: TextureSource } | null>(null);

  // Stash callable / object props in refs so the autoplay effect's
  // dependency list can stay narrow — callers passing inline literals
  // for `params` / `onComplete` / `ease` should not restart autoplay.
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const easeRef = useRef(ease);
  easeRef.current = ease;

  // Mount: create runner + resize observer; dispose on unmount.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
    };
    syncSize();

    const runner = new Runner({ canvas });
    runnerRef.current = runner;

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncSize) : null;
    ro?.observe(canvas);

    return () => {
      ro?.disconnect();
      runner.dispose();
      runnerRef.current = null;
    };
  }, []);

  // Resolve sources whenever `from` / `to` change.
  useEffect(() => {
    let cancelled = false;
    Promise.all([resolveSource(from), resolveSource(to)]).then(([f, t]) => {
      if (!cancelled) setSources({ from: f, to: t });
    });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  // Render: controlled (one render per progress change) or autoplay (rAF loop).
  useEffect(() => {
    const runner = runnerRef.current;
    if (!runner || !sources) return;

    const renderArgs = paramsRef.current
      ? { from: sources.from, to: sources.to, params: paramsRef.current }
      : { from: sources.from, to: sources.to };

    if (progress !== undefined) {
      runner.render(transition, { ...renderArgs, progress });
      return;
    }

    if (!playing) return;

    let cancelled = false;
    let raf = 0;
    let start = 0;

    const tick = (now: number) => {
      if (cancelled) return;
      if (start === 0) start = now;
      const t = Math.min(1, (now - start) / duration);
      const easedT = easeRef.current ? easeRef.current(t) : t;
      runner.render(transition, { ...renderArgs, progress: easedT });
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (loop) {
        start = 0;
        raf = requestAnimationFrame(tick);
      } else {
        onCompleteRef.current?.();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sources, transition, progress, playing, loop, duration]);

  return <canvas ref={canvasRef} className={className} style={style} />;
}
