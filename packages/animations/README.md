# @vysmo/animations

Value-based tweening primitives — `animate()`, `spring()`, `timeline()`, `interpolate()`. DOM-agnostic core that drives anything a number can change: CSS transforms, WebGL uniforms, canvas draws, audio params.

[The Vysmo ecosystem](https://vysmo.com) · [Source](https://github.com/vysmodev)

> **Most users don't import this directly.** It's the runtime under
> [`@vysmo/text`](https://www.npmjs.com/package/@vysmo/text),
> [`@vysmo/flipbook`](https://www.npmjs.com/package/@vysmo/flipbook),
> [`@vysmo/slideshow`](https://www.npmjs.com/package/@vysmo/slideshow),
> and the example code that ships with [`@vysmo/transitions`](https://www.npmjs.com/package/@vysmo/transitions).
> If you're shopping for an animation library, those higher-level
> packages are usually what you want.
>
> If you do reach for it directly: it's a small, focused tweening
> engine — no DOM, no React, no opinions about *what* you're animating.

## Install

```bash
pnpm add @vysmo/animations @vysmo/easings
```

`@vysmo/easings` is the typical companion (any `EasingFn` from there plugs into `animate`).

## Usage

### `animate()` — tween a value over a duration

```ts
import { animate } from "@vysmo/animations";
import { power2Out } from "@vysmo/easings";

animate({
  from: 0,
  to: 100,
  duration: 600,
  ease: power2Out,
  onUpdate: (value) => element.style.opacity = String(value / 100),
});
```

`from` and `to` can be a number, an array of numbers, or a plain object of interpolable values. Shape must match.

### `spring()` — physics-based settle

```ts
import { spring } from "@vysmo/animations";

spring({
  from: 0,
  to: 100,
  stiffness: 170,
  damping: 26,
  onUpdate: (value) => /* … */,
});
```

Runs a damped harmonic oscillator each frame; `finished` resolves when the mass is at rest near the target. Use this when you want spring **behaviour** (overshoot, oscillation, settle time driven by physics). Use `animate({ ease: spring(...) })` from `@vysmo/easings` instead if you want spring **shape** over a fixed duration.

### `timeline()` — compose multiple tweens

```ts
import { timeline } from "@vysmo/animations";

const tl = timeline()
  .add({ from: 0, to: 100, duration: 400, onUpdate: tweenA })
  .add({ from: 0, to: 50,  duration: 600, onUpdate: tweenB }, "<")     // parallel
  .add({ from: 0, to: 1,   duration: 200, onUpdate: tweenC }, ">+100") // 100ms after prev ends
  .play();

await tl.finished;
```

Position strings: `">"` after previous (default), `"<"` parallel to previous, `">+N"` / `">-N"` / `"<+N"` / `"<-N"` for offsets, or a raw number for absolute time.

### `interpolate()` — value-blending without scheduling

```ts
import { interpolate } from "@vysmo/animations";

interpolate(0, 100, 0.5);                          // → 50
interpolate([0, 0], [10, 20], 0.5);                // → [5, 10]
interpolate({ x: 0, y: 0 }, { x: 10, y: 0 }, 0.25); // → { x: 2.5, y: 0 }
```

Plain math, no callbacks. Useful when you have your own driver (scroll position, video frame, gesture) and just want the eased value.

## Custom schedulers

By default everything runs on `requestAnimationFrame`. Pass a `scheduler` to drive from a different time source — e.g. `createTestScheduler()` for deterministic tests, or a frame-stepped scheduler for video render.

```ts
import { animate, createTestScheduler } from "@vysmo/animations";

const sched = createTestScheduler();
const h = animate({ from: 0, to: 100, duration: 100, scheduler: sched });
sched.tick(0);
sched.tick(50);
sched.tick(50);
h.value; // → 100
```

## Characteristics

- **DOM-agnostic.** SSR-safe at module load (no DOM access at import).
- **Zero runtime dependencies** except `@vysmo/easings` (peer).
- **Tree-shakable.** Importing only `animate` ships ~2 KB gzipped.
- **TypeScript-native.** `Interpolable` is recursive; the from/to types stay structural.
- **Deterministic-testable.** `createTestScheduler` advances time on demand.

## License

MIT.
