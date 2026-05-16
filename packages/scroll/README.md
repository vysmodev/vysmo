# @vysmo/scroll

Three primitives that bind scroll progress to the rest of the ecosystem: `createScrollProgress` (raw 0–1 emitter), `createScrollTransition` (drives any `@vysmo/transitions` render), `createScrollEffect` (drives any `@vysmo/effects` params). One shared rAF-throttled observer underneath. Headless — you own the canvas.

[Live demos](https://vysmo.com/scroll) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/scroll
```

For `createScrollTransition` / `createScrollEffect` you also need the corresponding consumer package:

```bash
pnpm add @vysmo/transitions   # for createScrollTransition
pnpm add @vysmo/effects       # for createScrollEffect
```

## Quick start

### Raw scroll progress

```ts
import { createScrollProgress } from "@vysmo/scroll";

const handle = createScrollProgress({
  element: document.querySelector(".hero")!,
  onProgress: (p) => console.log(p), // 0..1 as the element sweeps the viewport
});

// later
handle.destroy();
```

`progress` runs from `0` (element's top edge at the viewport's bottom) to `1` (element's bottom edge at the viewport's top). Pass `ease: (t) => …` to remap — anything from `@vysmo/easings` works.

### Drive a transition with scroll

```ts
import { Runner, crossZoom } from "@vysmo/transitions";
import { createScrollTransition } from "@vysmo/scroll";

const canvas = document.querySelector("canvas")!;
const runner = new Runner({ canvas });

createScrollTransition({
  section: document.querySelector(".scroll-section")!,
  runner,
  transition: crossZoom,
  from: imageA,
  to: imageB,
});
// renders crossZoom on every scroll tick, automatically passing progress
```

### Drive an effect with scroll

```ts
import { Runner, blur } from "@vysmo/effects";
import { createScrollEffect } from "@vysmo/scroll";

const runner = new Runner({ canvas });

createScrollEffect({
  section: document.querySelector(".hero")!,
  runner,
  effect: blur,
  source: image,
  params: (progress) => ({ radius: progress * 20 }), // unblur as user scrolls down
});
```

## Zone helpers

Most scroll-driven UIs don't want a single linear 0..1 — they want phases (intro → hold → outro). The `zones.ts` helpers compose:

```ts
import { scrollPlateau, scrollRange, scrollZones, smoothstep } from "@vysmo/scroll";

scrollRange(0.2, 0.8);          // remap [0.2, 0.8] → [0, 1]; clamp outside
scrollPlateau(0.4, 0.6);        // 0..1 with a flat 1.0 plateau between [0.4, 0.6]
scrollZones([0, 0.3, 0.6, 1]);  // multi-segment phases
smoothstep;                     // t² (3 - 2t) — common easing for scroll
```

All return plain `(progress: number) => number` functions — pipe through `createScrollProgress`'s `ease` option, or use directly.

## Shared observer

Every primitive registers with one rAF-throttled `IntersectionObserver` + `scroll` listener — N elements cost one rAF tick per frame, not N. Access directly if you need it:

```ts
import { sharedScrollObserver } from "@vysmo/scroll";

const obs = sharedScrollObserver();
obs.subscribe(element, { onScroll: (rect, vp) => /* ... */ });
```

## Characteristics

- **DOM-only.** Browser scrolling is the substrate; no Node fallback (the SSR test asserts the module loads, not that it functions without DOM).
- **Tiny.** ~2 KB gzipped for the full bundle; ~1 KB for `createScrollProgress` alone.
- **Tree-shakable.** `createScrollTransition` and `createScrollEffect` only pull in their respective peer libraries' types.
- **One rAF.** Observer is shared across all primitives.
- **SSR-safe at module load.** Guarded `typeof window` checks; observer is lazy-instantiated.

## License

MIT.
