/**
 * Chrome rendering — overlay DOM children mounted by the slideshow on
 * top of its canvas. Each piece is opt-in via the corresponding option
 * on `createSlideshow`. Pure DOM, no framework, no external CSS.
 *
 * Theming hooks (CSS custom properties on the wrapper):
 *   --vysmo-chrome-color           default text/icon colour
 *   --vysmo-chrome-bg              translucent background for buttons / pills
 *   --vysmo-chrome-bg-strong       solid background (counter pill, progress)
 *   --vysmo-chrome-active          active dot / progress fill
 *   --vysmo-chrome-inactive        inactive dot
 *   --vysmo-chrome-shadow          drop-shadow for legibility on photos
 */

import type {
  ArrowsOptions,
  ArrowsPosition,
  ArrowsStyle,
  CaptionAlignment,
  CaptionPosition,
  CaptionsOptions,
  CounterOptions,
  CounterPosition,
  DotsOptions,
  DotsPosition,
  DotsStyle,
  ProgressOptions,
  ProgressPosition,
} from "./types.js";

// =====================================================================
// Shared helpers
// =====================================================================

const SHADOW = "var(--vysmo-chrome-shadow, drop-shadow(0 1px 2px rgba(0,0,0,0.45)))";
const BG = "var(--vysmo-chrome-bg, rgba(0, 0, 0, 0.42))";
const BG_STRONG = "var(--vysmo-chrome-bg-strong, rgba(0, 0, 0, 0.62))";
const COLOR = "var(--vysmo-chrome-color, white)";
const ACTIVE = "var(--vysmo-chrome-active, white)";
const INACTIVE = "var(--vysmo-chrome-inactive, rgba(255, 255, 255, 0.5))";

function applyStyles(el: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(el.style, styles);
}

const CHEVRON_LEFT_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18 L9 12 L15 6"/></svg>`;
const CHEVRON_RIGHT_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18 L15 12 L9 6"/></svg>`;

// =====================================================================
// Arrows
// =====================================================================

export interface ArrowsMount {
  element: HTMLElement;
  destroy: () => void;
}

export function createArrows(
  options: ArrowsOptions,
  onPrev: () => void,
  onNext: () => void,
): ArrowsMount {
  const position: ArrowsPosition = options.position ?? "inside-edges";
  const style: ArrowsStyle = options.style ?? "circle";

  const container = document.createElement("div");
  container.setAttribute("data-slideshow-arrows", "");
  applyStyles(container, {
    position: "absolute",
    pointerEvents: "none",
    inset: "0",
    zIndex: "2",
  });

  const prevBtn = makeArrowButton("Previous slide", CHEVRON_LEFT_SVG, style);
  const nextBtn = makeArrowButton("Next slide", CHEVRON_RIGHT_SVG, style);

  switch (position) {
    case "inside-edges":
      applyStyles(prevBtn, {
        position: "absolute",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
      });
      applyStyles(nextBtn, {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
      });
      break;
    case "outside-edges":
      applyStyles(prevBtn, {
        position: "absolute",
        left: "-52px",
        top: "50%",
        transform: "translateY(-50%)",
      });
      applyStyles(nextBtn, {
        position: "absolute",
        right: "-52px",
        top: "50%",
        transform: "translateY(-50%)",
      });
      // Caller (the wrapper) needs overflow: visible for outside-edges to
      // be visible; the slideshow wrapper sets overflow: hidden by default
      // because clipping the transition canvas is what users expect. So
      // we lift the buttons outside the wrapper visually by transforming
      // — but keep them inside the .container div which is overflow: hidden.
      // Workaround: use a single inline group at the bottom-center instead.
      // For now, we draw them clipped — users picking "outside-edges" need
      // to set overflow: visible on the host container. This is documented.
      break;
    case "bottom-center": {
      const group = document.createElement("div");
      applyStyles(group, {
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "inline-flex",
        gap: "8px",
        pointerEvents: "auto",
      });
      group.appendChild(prevBtn);
      group.appendChild(nextBtn);
      container.appendChild(group);
      break;
    }
    case "bottom-right": {
      const group = document.createElement("div");
      applyStyles(group, {
        position: "absolute",
        bottom: "16px",
        right: "16px",
        display: "inline-flex",
        gap: "8px",
        pointerEvents: "auto",
      });
      group.appendChild(prevBtn);
      group.appendChild(nextBtn);
      container.appendChild(group);
      break;
    }
  }

  if (position === "inside-edges" || position === "outside-edges") {
    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
  }

  const onPrevClick = (e: MouseEvent) => {
    e.stopPropagation();
    onPrev();
  };
  const onNextClick = (e: MouseEvent) => {
    e.stopPropagation();
    onNext();
  };
  prevBtn.addEventListener("click", onPrevClick);
  nextBtn.addEventListener("click", onNextClick);

  return {
    element: container,
    destroy: () => {
      prevBtn.removeEventListener("click", onPrevClick);
      nextBtn.removeEventListener("click", onNextClick);
      container.remove();
    },
  };
}

function makeArrowButton(
  label: string,
  svg: string,
  style: ArrowsStyle,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", label);
  btn.innerHTML = svg;
  applyStyles(btn, {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    padding: "0",
    border: "0",
    color: COLOR,
    cursor: "pointer",
    pointerEvents: "auto",
    transition: "background 140ms, transform 140ms, opacity 140ms",
    filter: SHADOW,
  });
  if (style === "minimal") {
    applyStyles(btn, { background: "transparent" });
  } else if (style === "circle") {
    applyStyles(btn, { background: BG, borderRadius: "999px" });
  } else {
    applyStyles(btn, { background: BG, borderRadius: "8px" });
  }
  btn.addEventListener("pointerenter", () => {
    btn.style.transform = (btn.style.transform || "") + " scale(1.08)";
  });
  btn.addEventListener("pointerleave", () => {
    btn.style.transform = btn.style.transform.replace(" scale(1.08)", "");
  });
  return btn;
}

// =====================================================================
// Dots
// =====================================================================

export interface DotsMount {
  element: HTMLElement;
  update: (current: number) => void;
  destroy: () => void;
}

export function createDots(
  options: DotsOptions,
  length: number,
  onGo: (index: number) => void,
): DotsMount {
  const position: DotsPosition = options.position ?? "bottom-center";
  const style: DotsStyle = options.style ?? "dots";

  const container = document.createElement("div");
  container.setAttribute("data-slideshow-dots", "");
  applyStyles(container, {
    position: "absolute",
    display: "inline-flex",
    gap: style === "lines" ? "4px" : "8px",
    pointerEvents: "auto",
    zIndex: "2",
    filter: SHADOW,
  });

  const isVertical = position === "left-center" || position === "right-center";
  if (isVertical) container.style.flexDirection = "column";

  switch (position) {
    case "bottom-center":
      applyStyles(container, {
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
      });
      break;
    case "top-center":
      applyStyles(container, {
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
      });
      break;
    case "left-center":
      applyStyles(container, {
        left: "16px",
        top: "50%",
        transform: "translateY(-50%)",
      });
      break;
    case "right-center":
      applyStyles(container, {
        right: "16px",
        top: "50%",
        transform: "translateY(-50%)",
      });
      break;
  }

  // For "lines" style with a horizontal bar position, stretch the
  // container to a useful width so segments are visible.
  if (style === "lines" && !isVertical) {
    applyStyles(container, {
      left: "16px",
      right: "16px",
      width: "auto",
      transform: "none",
    });
    if (position === "bottom-center" || position === "top-center") {
      // already positioned with left/right inset; clear the centering transform
    } else {
      // for left/right vertical, lines doesn't make sense — fall back to dashes spacing
      applyStyles(container, { left: "", right: "", width: "auto" });
    }
  }

  const buttons: HTMLButtonElement[] = [];
  for (let i = 0; i < length; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
    applyStyles(btn, {
      padding: "0",
      border: "0",
      cursor: "pointer",
      transition: "background 160ms, transform 160ms, opacity 160ms, width 160ms",
    });
    if (style === "dots") {
      applyStyles(btn, {
        width: "8px",
        height: "8px",
        borderRadius: "999px",
      });
    } else if (style === "dashes") {
      applyStyles(btn, {
        width: isVertical ? "3px" : "18px",
        height: isVertical ? "18px" : "3px",
        borderRadius: "2px",
      });
    } else if (style === "numbers") {
      btn.textContent = String(i + 1);
      applyStyles(btn, {
        minWidth: "26px",
        height: "26px",
        padding: "0 6px",
        borderRadius: "999px",
        background: BG,
        color: COLOR,
        font: "500 12px / 1 var(--font-sans, system-ui, sans-serif)",
      });
    } else if (style === "lines") {
      applyStyles(btn, {
        flex: "1 1 0",
        height: "3px",
        borderRadius: "2px",
        background: INACTIVE,
      });
    }
    const onClick = (e: MouseEvent) => {
      e.stopPropagation();
      onGo(i);
    };
    btn.addEventListener("click", onClick);
    (btn as HTMLButtonElement & { _cleanup?: () => void })._cleanup = () => {
      btn.removeEventListener("click", onClick);
    };
    buttons.push(btn);
    container.appendChild(btn);
  }

  function applyState(current: number): void {
    buttons.forEach((btn, i) => {
      const active = i === current;
      if (style === "dots" || style === "dashes") {
        btn.style.background = active ? ACTIVE : INACTIVE;
        btn.style.transform = active && style === "dots" ? "scale(1.25)" : "scale(1)";
      } else if (style === "numbers") {
        btn.style.background = active ? ACTIVE : BG;
        btn.style.color = active ? "rgba(0, 0, 0, 0.85)" : COLOR;
      } else if (style === "lines") {
        btn.style.background = active ? ACTIVE : INACTIVE;
      }
    });
  }

  applyState(0);

  return {
    element: container,
    update: (current) => applyState(current),
    destroy: () => {
      for (const btn of buttons) {
        const cleanup = (btn as HTMLButtonElement & { _cleanup?: () => void })._cleanup;
        cleanup?.();
      }
      container.remove();
    },
  };
}

// =====================================================================
// Counter
// =====================================================================

export interface CounterMount {
  element: HTMLElement;
  update: (current: number, length: number) => void;
  destroy: () => void;
}

export function createCounter(options: CounterOptions, length: number): CounterMount {
  const position: CounterPosition = options.position ?? "top-right";
  const format = options.format ?? ((current: number, total: number) => `${current + 1} / ${total}`);

  const el = document.createElement("div");
  el.setAttribute("data-slideshow-counter", "");
  applyStyles(el, {
    position: "absolute",
    padding: "5px 10px",
    background: BG_STRONG,
    color: COLOR,
    borderRadius: "999px",
    font: "500 11.5px / 1 var(--font-mono, ui-monospace, monospace)",
    letterSpacing: "0.02em",
    pointerEvents: "none",
    zIndex: "2",
    filter: SHADOW,
  });

  switch (position) {
    case "top-right":
      applyStyles(el, { top: "14px", right: "14px" });
      break;
    case "top-left":
      applyStyles(el, { top: "14px", left: "14px" });
      break;
    case "bottom-right":
      applyStyles(el, { bottom: "14px", right: "14px" });
      break;
    case "bottom-left":
      applyStyles(el, { bottom: "14px", left: "14px" });
      break;
  }

  el.textContent = format(0, length);

  return {
    element: el,
    update: (current, total) => {
      el.textContent = format(current, total);
    },
    destroy: () => el.remove(),
  };
}

// =====================================================================
// Progress (autoplay countdown bar)
// =====================================================================

export interface ProgressMount {
  element: HTMLElement;
  setProgress: (p: number) => void;
  destroy: () => void;
}

export function createProgress(options: ProgressOptions): ProgressMount {
  const position: ProgressPosition = options.position ?? "bottom";

  // Track is always visible while mounted — that's the whole point of
  // opting in. When autoplay isn't running, the fill stays at 0% so the
  // user sees a thin empty bar at the chosen edge, which is clear
  // feedback that the option is enabled. The fill animates only while
  // the autoplay timer ticks.
  const track = document.createElement("div");
  track.setAttribute("data-slideshow-progress", "");
  applyStyles(track, {
    position: "absolute",
    left: "0",
    right: "0",
    height: "3px",
    background: "rgba(255, 255, 255, 0.22)",
    pointerEvents: "none",
    zIndex: "2",
  });
  if (position === "top") track.style.top = "0";
  else track.style.bottom = "0";

  const fill = document.createElement("div");
  applyStyles(fill, {
    position: "absolute",
    inset: "0 auto 0 0",
    width: "0%",
    background: ACTIVE,
    transition: "width 60ms linear",
  });
  track.appendChild(fill);

  return {
    element: track,
    setProgress: (p) => {
      const pct = Math.max(0, Math.min(1, p)) * 100;
      fill.style.width = `${pct}%`;
    },
    destroy: () => track.remove(),
  };
}

// =====================================================================
// Captions
// =====================================================================

export interface CaptionsMount {
  element: HTMLElement;
  update: (current: number) => void;
  destroy: () => void;
}

export function createCaptions(options: CaptionsOptions): CaptionsMount {
  const position: CaptionPosition = options.position ?? "bottom";
  const alignment: CaptionAlignment = options.alignment ?? "left";
  const texts = options.texts;

  const wrap = document.createElement("div");
  wrap.setAttribute("data-slideshow-captions", "");
  applyStyles(wrap, {
    position: "absolute",
    left: "0",
    right: "0",
    padding: "16px 24px",
    pointerEvents: "none",
    zIndex: "2",
    color: COLOR,
    font: "500 14.5px / 1.45 var(--font-sans, system-ui, sans-serif)",
    letterSpacing: "-0.005em",
    textAlign: alignment,
    textShadow: "0 1px 4px rgba(0, 0, 0, 0.6)",
  });
  if (position === "top") {
    applyStyles(wrap, {
      top: "0",
      background:
        "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0))",
      paddingBottom: "32px",
    });
  } else if (position === "center") {
    applyStyles(wrap, {
      top: "50%",
      transform: "translateY(-50%)",
    });
  } else {
    applyStyles(wrap, {
      bottom: "0",
      background:
        "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0))",
      paddingTop: "32px",
    });
  }

  function getCaption(i: number): string {
    if (typeof texts === "function") return texts(i);
    return texts[i] ?? "";
  }

  wrap.textContent = getCaption(0);

  return {
    element: wrap,
    update: (current) => {
      wrap.textContent = getCaption(current);
    },
    destroy: () => wrap.remove(),
  };
}
