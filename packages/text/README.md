# @vysmo/text

Multi-property choreographed text animation with a 300+ preset catalog. Grapheme-safe splitting via `Intl.Segmenter`; per-slice stagger / jitter / range; serializable preset format (string easings, normalized origins) so the same data drives DOM today and canvas tomorrow.

[Live preset browser + Studio](https://vysmo.com/text) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/text
```

## Quick start

### Use a preset

```ts
import { animateText } from "@vysmo/text";

const el = document.querySelector(".headline")!;
const handle = animateText(el, { preset: "enter/fade-up" });
await handle.finished;
```

### Use a preset by import (better tree-shaking)

```ts
import { animateText, fadeUp } from "@vysmo/text";

animateText(el, { preset: fadeUp });
```

### Choreograph from scratch

```ts
import { animateText } from "@vysmo/text";

animateText(el, {
  split: "character",
  stagger: 30,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "power2.out" },
    { prop: "translateY", from: 20, to: 0, duration: 500, ease: "power2.out" },
  ],
});
```

`animateText` returns a handle: `.play() / .pause() / .stop() / .seek(0..1)` plus `.finished` (Promise).

## What's in the catalog

- **15 hand-curated** entries: `enter/fade-up`, `enter/elastic-rise`, `enter/blur-in`, `enter/scale-in`, `enter/flip-x`, `enter/depth-zoom`, `exit/fade-down`, `exit/blur-out`, `exit/scale-out`, `exit/flip-away`, `emphasis/pulse`, `emphasis/shake`, `emphasis/wobble`, `emphasis/coin-flip`, `emphasis/spin`.
- **295+ generated** entries from the Studio random-roll workflow: enter / exit / emphasis variants exercising the full `@vysmo/easings` catalog (springs, wiggle, anticipate, bounce, elastic, …) with per-spec ranges, jitter delays, perspective, and 3D origins.

`listPresets()` enumerates everything; `resolvePreset(name)` looks one up by name.

## Preset shape

```ts
type Preset = {
  name: string;                // "enter/fade-up"
  split?: "character" | "word" | "line";
  stagger: number;             // ms between slices
  staggerOrder?: "start" | "end" | "center" | "edges" | "random";
  perspective?: number;        // px, applied to the container for 3D
  transformOrigin?: { x: number; y: number; z?: number };  // normalized
  animations: TextAnimationSpec[];
  repeat?: number | "infinite";
  repeatDelay?: number;
};

type TextAnimationSpec = {
  prop: TextProperty;          // opacity, translateX/Y/Z, rotateX/Y/Z, scale, scaleX/Y, skewX/Y, blur, brightness, …
  from: number | { min: number; max: number };
  to: number | { min: number; max: number };
  duration?: number;
  delay?: number;
  ease?: string | EasingFn;    // GSAP-style "power2.out", or any (t: number) => number
  stagger?: number;
  staggerOrder?: StaggerOrder;
  jitterDelay?: number;        // per-slice random delay in [0, jitterDelay]
  transformOrigin?: { x: number; y: number; z?: number };
  perspective?: number;
};
```

Every field is JSON-serializable (no function references, no CSS strings) — presets travel cleanly through localStorage, network, and AI agent output.

## Splitting

```ts
import { splitText } from "@vysmo/text";

const splits = splitText(el, { mode: "character" }); // or "word" | "line"
splits.slices;      // HTMLElement[] in document order
splits.restore();   // put the original textContent back
```

Splitting is grapheme-safe via `Intl.Segmenter` — emoji ZWJ sequences, accented characters, and most scripts behave correctly. Note: connected / contextually-shaped scripts (Arabic, Devanagari, Lao, Khmer, …) break in `character` mode because each grapheme lands in its own inline-block box; use `word` or `line` for those scripts.

## Range values

```ts
animateText(el, {
  animations: [
    { prop: "translateY", from: { min: -30, max: 30 }, to: 0, duration: 600 },
  ],
});
```

`{ min, max }` resolves **per slice** at animate-start: every slice samples its own value. That's how presets like "letters scatter from random offsets" become a one-line spec change.

## Stagger

```ts
animateText(el, {
  stagger: 30,                 // ms between slices
  staggerOrder: "edges",       // start | end | center | edges | random
});
```

Per-spec overrides: `{ stagger, staggerOrder }` on any animation entry overrides the root values for that spec only. Pair with `jitterDelay` to break the metronome feel.

## Repeat & emphasis

```ts
animateText(el, { preset: "emphasis/pulse" });        // repeats per the preset
animateText(el, { ...spec, repeat: 3, repeatDelay: 200 });  // override
animateText(el, { ...spec, repeat: "infinite" });
```

## Reduced motion

```ts
animateText(el, { ...spec, respectReducedMotion: true }); // default true — no-op when prefers-reduced-motion is set
```

## Deterministic playback

```ts
import { animateText, createTestScheduler } from "@vysmo/text";
import { createTestScheduler as makeSched } from "@vysmo/animations";

const sched = makeSched();
const handle = animateText(el, { ...spec, scheduler: sched });
sched.tick(0);
sched.tick(500); // … etc
```

Per-slice ranges use a deterministic RNG — pass `{ rng: () => 0.5 }` to fix sample values for snapshots.

## Defining your own preset

Any object matching the `Preset` shape works as `{ preset: yourPreset }`. There's no registration step — presets are pure data.

For bulk authoring, the [Studio](https://vysmo.com/text/studio) generates random combos against the full easings pool; export to `_staging.ts`, run `pnpm --filter @vysmo/text ingest`.

## Characteristics

- **DOM-only.** Renders into the DOM via the standard split + animate flow; the preset shape is plain JSON, so any consumer that interprets `TextAnimationSpec` can drive it.
- **SSR-safe at module load.** `splitText` throws a readable error if called without a DOM; the module imports cleanly in Node (preset data is reachable; `evaluateSpecs` runs pure-math without DOM).
- **Zero runtime dependencies** except `@vysmo/animations` and `@vysmo/easings` (both transitive).
- **Bundle size:** ~26 KB gzipped — dominated by the preset catalog. The runtime is ~3 KB; the rest is data. Tree-shaking the catalog is currently blocked because `animateText` imports `resolvePreset` unconditionally so callers can pass `preset: "name"`.

## License

MIT.
