# @vysmo/text

Multi-property choreographed text animation. Grapheme-safe splitting via `Intl.Segmenter`; per-slice stagger / jitter / range; JSON-serializable preset format (string easings, normalized origins).

[Live preset browser + Studio](https://vysmo.com/text) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/text
```

## Quick start

### Use a preset

```ts
import { animateText } from "@vysmo/text";

const el = document.querySelector<HTMLElement>(".headline")!;
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

## Catalog

<!-- catalog:start -->

Every preset with its split mode, stagger, and the props it animates. Mirror of the catalog at [vysmo.com/text/docs#catalog](https://vysmo.com/text/docs#catalog) — generated from `listPresets()` so the README, the docs page, and the Studio share one source of truth.

### Enter · 120

| Name | Split | Stagger | Animates |
|---|---|---|---|
| `enter/bloom-scatter` | character | 25ms | `opacity` · `translateZ` · `scale` · `blur` · `translateX` |
| `enter/blur-in` | word | 60ms | `opacity` · `blur` |
| `enter/blur-rise-snap` | character | 25ms | `opacity` · `blur` |
| `enter/compress-y-scatter` | character | 60ms | `opacity` · `scaleY` |
| `enter/depth-zoom` | character | 35ms | `opacity` · `translateZ` |
| `enter/drop-scatter-bounce-word` | word | 45ms | `opacity` · `skewX` · `blur` · `scaleY` · `translateY` |
| `enter/elastic-rise` | character | 40ms | `opacity` · `translateY` |
| `enter/expand-scatter` | character | 20ms | `opacity` · `translateX` · `scale` · `blur` |
| `enter/expand-scatter-loose` | character | 30ms | `opacity` · `translateX` · `scale` · `translateZ` · `translateY` |
| `enter/expand-scatter-trail` | character | 40ms | `opacity` · `translateY` · `scale` |
| `enter/expand-snap` | character | 35ms | `opacity` · `translateX` · `scale` |
| `enter/extend-x-curl` | character | 55ms | `opacity` · `scaleX` · `translateY` · `scaleY` · `skewX` |
| `enter/extend-x-snap` | word | 45ms | `opacity` · `scaleX` · `translateX` · `blur` |
| `enter/extend-x-snap-word` | word | 50ms | `opacity` · `scaleX` · `translateY` · `translateZ` |
| `enter/extend-y-curl` | character | 60ms | `opacity` · `scale` · `translateZ` · `scaleY` |
| `enter/extend-y-scatter` | character | 35ms | `opacity` · `translateX` · `scaleY` · `translateY` |
| `enter/extend-y-scatter-curl` | character | 45ms | `opacity` · `blur` · `translateY` · `scaleY` · `scale` |
| `enter/extend-y-scatter-word` | word | 40ms | `opacity` · `skewX` · `translateY` · `scaleY` |
| `enter/fade-up` | character | 30ms | `opacity` · `translateY` |
| `enter/flip-up-scatter-bounce` | character | 55ms | `opacity` · `rotateY` · `rotateX` |
| `enter/flip-up-scatter-curl` | character | 40ms | `opacity` · `scaleY` · `scale` · `translateX` · `rotateX` · `skewX` |
| `enter/flip-up-scatter-word` | word | 45ms | `opacity` · `rotateX` · `rotateY` · `skewX` · `blur` |
| `enter/flip-up-spring` | character | 50ms | `opacity` · `rotateY` · `rotateX` |
| `enter/flip-x` | character | 40ms | `opacity` · `rotateX` |
| `enter/fold-in-curl` | character | 60ms | `opacity` · `rotateX` · `skewX` · `blur` · `scaleY` · `scale` · `rotate` |
| `enter/fold-in-scatter-bounce` | character | 30ms | `opacity` · `scaleY` · `translateY` · `scale` · `skewX` · `rotateY` · `rotateX` |
| `enter/fold-in-scatter-curl` | character | 20ms | `opacity` · `translateZ` · `scaleY` · `rotateX` · `translateY` · `translateX` |
| `enter/fold-in-scatter-snap` | character | 55ms | `opacity` · `rotateX` · `scale` · `translateX` · `scaleY` · `rotate` |
| `enter/glide-outward` | character | 55ms | `opacity` · `translateX` · `skewX` |
| `enter/glide-scatter` | word | 35ms | `opacity` · `translateX` |
| `enter/grow-scatter` | character | 50ms | `opacity` · `blur` · `scale` · `skewX` · `translateX` |
| `enter/grow-spring` | character | 25ms | `opacity` · `scale` |
| `enter/haze-outward` | character | 50ms | `opacity` · `blur` |
| `enter/haze-scatter` | character | 20ms | `opacity` · `rotateY` · `blur` · `scaleY` |
| `enter/haze-scatter-2` | character | 55ms | `opacity` · `blur` · `translateX` · `scaleX` · `scaleY` |
| `enter/haze-scatter-3` | character | 60ms | `opacity` · `blur` · `scale` · `scaleY` |
| `enter/haze-scatter-spring` | character | 20ms | `opacity` · `translateY` · `blur` |
| `enter/haze-snap` | character | 60ms | `opacity` · `blur` · `translateZ` |
| `enter/lean-in-scatter-curl` | character | 20ms | `opacity` · `translateZ` · `rotate` |
| `enter/lean-in-scatter-spring` | character | 40ms | `opacity` · `scaleX` · `skewX` · `translateZ` · `rotate` · `translateY` |
| `enter/lean-in-spring` | character | 40ms | `opacity` · `translateZ` · `rotate` · `scaleX` |
| `enter/lean-scatter` | character | 45ms | `opacity` · `skewX` · `blur` |
| `enter/lift-spring` | character | 55ms | `opacity` · `translateY` |
| `enter/loom` | character | 50ms | `opacity` · `translateY` · `translateZ` |
| `enter/pinwheel-scatter` | character | 20ms | `opacity` · `blur` · `scaleY` · `skewX` · `translateX` · `rotate` |
| `enter/pivot-curl` | character | 55ms | `opacity` · `scaleY` · `rotateY` · `blur` · `translateY` |
| `enter/pivot-scatter` | character | 55ms | `opacity` · `rotateY` · `scale` · `translateZ` · `translateY` |
| `enter/pivot-scatter-2` | character | 40ms | `opacity` · `translateZ` · `rotate` · `scaleX` · `blur` · `translateY` |
| `enter/rise-y-scatter` | word | 40ms | `opacity` · `blur` · `skewX` · `scaleY` |
| `enter/rise-y-scatter-curl` | character | 25ms | `opacity` · `scale` · `scaleY` · `skewX` · `translateX` · `blur` |
| `enter/rise-y-scatter-loose` | character | 15ms | `opacity` · `scaleY` · `blur` · `skewX` · `scale` |
| `enter/rotate-y-in-deep` | character | 30ms | `opacity` · `rotate` · `rotateY` |
| `enter/rotate-y-in-inward` | character | 30ms | `opacity` · `blur` · `rotateY` |
| `enter/rotate-y-in-scatter-curl` | character | 60ms | `opacity` · `translateZ` · `rotateY` · `scale` · `scaleY` · `translateX` · `rotate` |
| `enter/rotate-y-in-scatter-spring` | character | 40ms | `opacity` · `rotate` · `rotateY` · `blur` · `translateZ` · `scaleX` |
| `enter/scale-in` | character | 35ms | `opacity` · `scale` |
| `enter/settle-scatter` | character | 35ms | `opacity` · `blur` · `translateY` · `scale` |
| `enter/slant-scatter` | character | 20ms | `opacity` · `blur` · `rotate` · `skewX` |
| `enter/slant-scatter-bounce` | character | 15ms | `opacity` · `translateX` · `blur` · `skewX` · `scaleY` · `rotateX` · `scaleX` |
| `enter/slant-scatter-spring` | character | 15ms | `opacity` · `translateY` · `rotate` · `translateX` · `blur` |
| `enter/slant-scatter-spring-word` | word | 15ms | `opacity` · `scaleX` · `translateZ` · `blur` · `skewX` |
| `enter/slant-scatter-word` | word | 20ms | `opacity` · `scale` · `translateX` · `skewX` · `blur` |
| `enter/slide-bounce` | character | 40ms | `opacity` · `translateX` |
| `enter/slide-scatter` | character | 50ms | `opacity` · `translateX` · `skewX` |
| `enter/soar-bounce` | word | 45ms | `opacity` · `translateY` |
| `enter/soar-swarm` | character | 55ms | `opacity` · `translateY` · `blur` |
| `enter/spin-scatter` | character | 40ms | `opacity` · `scaleY` · `rotateY` · `translateY` |
| `enter/spread-x-scatter-curl` | character | 50ms | `opacity` · `scaleY` · `scaleX` · `skewX` · `blur` |
| `enter/stretch-x-bounce` | character | 25ms | `opacity` · `scaleX` · `blur` · `translateX` |
| `enter/stretch-x-kick` | character | 50ms | `opacity` · `scaleX` · `translateY` |
| `enter/stretch-x-scatter` | character | 20ms | `opacity` · `scaleX` · `translateY` |
| `enter/stretch-y-scatter` | character | 60ms | `opacity` · `blur` · `translateX` · `scaleY` · `skewX` |
| `enter/swipe-scatter` | character | 20ms | `opacity` · `translateX` · `blur` |
| `enter/swipe-spring` | character | 55ms | `opacity` · `translateX` |
| `enter/swirl-loose` | word | 50ms | `opacity` · `rotate` · `translateX` |
| `enter/swirl-scatter` | character | 35ms | `opacity` · `scale` · `rotate` · `scaleY` |
| `enter/swivel-scatter-deep` | character | 55ms | `opacity` · `translateZ` · `scale` · `rotateY` · `scaleY` · `rotate` |
| `enter/swivel-scatter-inward` | character | 30ms | `opacity` · `translateY` · `rotateY` · `blur` · `translateZ` |
| `enter/swivel-scatter-loose` | character | 30ms | `opacity` · `rotate` · `rotateY` · `skewX` |
| `enter/tilt-in-bounce` | character | 60ms | `opacity` · `scaleY` · `rotate` |
| `enter/tilt-in-inward` | word | 55ms | `opacity` · `blur` · `rotate` |
| `enter/tilt-in-scatter` | character | 20ms | `opacity` · `rotate` · `blur` · `scale` |
| `enter/tilt-in-scatter-curl` | character | 60ms | `opacity` · `blur` · `translateX` · `scaleY` · `scale` · `scaleX` · `rotate` |
| `enter/tilt-in-scatter-word` | word | 40ms | `opacity` · `rotate` · `translateX` |
| `enter/tilt-in-spring` | word | 30ms | `opacity` · `rotate` |
| `enter/tip-in-scatter` | character | 45ms | `opacity` · `rotate` · `skewX` · `blur` |
| `enter/tip-in-scatter-curl` | character | 50ms | `opacity` · `blur` · `rotate` · `scaleY` · `scale` · `skewX` |
| `enter/tip-in-scatter-snap` | character | 20ms | `opacity` · `rotate` · `translateY` · `translateZ` · `skewX` |
| `enter/topple` | character | 50ms | `opacity` · `rotateX` |
| `enter/topple-scatter-kick` | character | 35ms | `opacity` · `translateY` · `rotateX` · `scaleY` · `rotate` · `scale` |
| `enter/topple-scatter-trail` | character | 20ms | `opacity` · `scale` · `rotate` · `rotateX` · `translateX` |
| `enter/topple-snap-loose-word` | word | 45ms | `opacity` · `scale` · `skewX` · `rotateX` · `blur` · `translateZ` |
| `enter/tumble-scatter` | character | 50ms | `opacity` · `scaleY` · `scale` · `translateY` · `rotateX` · `blur` |
| `enter/tumble-scatter-2` | character | 50ms | `opacity` · `blur` · `scale` · `translateZ` · `rotateX` |
| `enter/tumble-scatter-tunnel-word` | word | 50ms | `opacity` · `rotateX` · `skewX` · `blur` |
| `enter/tumble-x-loose` | word | 40ms | `opacity` · `blur` · `rotateX` · `translateY` · `translateZ` · `scaleX` |
| `enter/tumble-x-scatter-word` | word | 20ms | `opacity` · `translateY` · `translateX` · `rotateX` |
| `enter/tunnel` | word | 25ms | `opacity` · `translateZ` · `translateY` |
| `enter/turn-scatter-curl` | character | 55ms | `opacity` · `skewX` · `rotateY` · `translateY` · `rotate` · `blur` |
| `enter/turn-spring` | word | 25ms | `opacity` · `rotateY` · `translateY` |
| `enter/twirl-scatter` | character | 45ms | `opacity` · `scaleX` · `rotate` · `scale` |
| `enter/twirl-scatter-2` | character | 20ms | `opacity` · `scale` · `scaleY` · `rotate` · `rotateX` |
| `enter/twirl-scatter-3` | character | 60ms | `opacity` · `rotateY` · `rotate` · `scale` · `blur` · `skewX` |
| `enter/twirl-scatter-4` | character | 55ms | `opacity` · `rotate` · `translateY` · `blur` |
| `enter/twirl-scatter-curl` | character | 20ms | `opacity` · `blur` · `skewX` · `scaleX` · `scaleY` · `rotate` |
| `enter/unfurl-x-kick` | character | 20ms | `opacity` · `translateX` · `scaleX` |
| `enter/unfurl-x-scatter` | character | 25ms | `opacity` · `scale` · `translateX` · `scaleX` |
| `enter/unfurl-y-curl` | character | 40ms | `opacity` · `scaleY` · `scale` · `blur` |
| `enter/unfurl-y-scatter` | character | 35ms | `opacity` · `translateY` · `scaleY` |
| `enter/whirl-scatter` | character | 45ms | `opacity` · `translateX` · `blur` · `translateZ` · `scaleX` · `rotate` |
| `enter/whirl-scatter-2` | character | 15ms | `opacity` · `translateZ` · `rotate` |
| `enter/whirl-scatter-3` | character | 60ms | `opacity` · `rotateY` · `blur` · `rotate` |
| `enter/whirl-scatter-4` | character | 35ms | `opacity` · `rotateY` · `rotate` · `blur` |
| `enter/whirl-scatter-5` | character | 35ms | `opacity` · `rotateY` · `scaleY` · `blur` · `rotate` |
| `enter/whirl-scatter-6` | character | 15ms | `opacity` · `scale` · `rotate` · `rotateY` · `scaleX` |
| `enter/whirl-scatter-curl` | character | 35ms | `opacity` · `skewX` · `rotate` · `scale` · `translateY` |
| `enter/whirl-scatter-loose` | character | 55ms | `opacity` · `blur` · `translateZ` · `rotate` · `scaleX` · `scaleY` |
| `enter/whirl-scatter-snap` | character | 55ms | `opacity` · `scaleY` · `scaleX` · `translateX` · `rotate` |
| `enter/whirl-scatter-snap-tunnel` | character | 35ms | `opacity` · `translateY` · `scaleX` · `translateZ` · `translateX` · `rotate` |
| `enter/whirl-scatter-word` | word | 40ms | `opacity` · `blur` · `skewX` · `rotate` · `scaleY` |

### Exit · 92

| Name | Split | Stagger | Animates |
|---|---|---|---|
| `exit/collapse-burst` | word | 30ms | `opacity` · `translateX` · `scale` · `translateY` |
| `exit/collapse-snap` | word | 55ms | `opacity` · `translateX` · `translateY` · `scale` |
| `exit/compress-x-burst` | character | 25ms | `opacity` · `scaleX` · `blur` · `scaleY` · `translateY` |
| `exit/compress-x-burst-curl` | character | 35ms | `opacity` · `scaleX` · `blur` · `translateZ` · `scaleY` |
| `exit/compress-x-burst-kick` | character | 50ms | `opacity` · `translateZ` · `translateY` · `blur` · `scaleX` |
| `exit/compress-x-burst-loose` | character | 35ms | `opacity` · `scaleY` · `translateZ` · `scale` · `scaleX` |
| `exit/compress-x-kick` | character | 30ms | `opacity` · `translateX` · `scaleY` · `scaleX` |
| `exit/compress-y-burst-curl` | character | 45ms | `opacity` · `skewX` · `translateX` · `scaleY` · `translateZ` |
| `exit/dissolve-kick` | character | 55ms | `opacity` · `blur` |
| `exit/exit-x-burst` | character | 45ms | `opacity` · `translateX` · `skewX` |
| `exit/fade-down` | character | 30ms | `opacity` · `translateY` |
| `exit/flatten-x-burst-deep` | character | 50ms | `opacity` · `blur` · `translateZ` · `scaleX` |
| `exit/flatten-x-burst-loose` | character | 15ms | `opacity` · `skewX` · `blur` · `scaleX` |
| `exit/flatten-x-curl` | character | 55ms | `opacity` · `skewX` · `translateZ` · `scaleX` · `translateX` |
| `exit/flatten-x-loose` | character | 25ms | `opacity` · `scaleX` · `translateY` |
| `exit/flatten-y` | word | 55ms | `opacity` · `scaleY` · `translateY` |
| `exit/flatten-y-burst` | character | 55ms | `opacity` · `translateZ` · `scaleY` · `skewX` · `translateX` |
| `exit/flatten-y-curl` | character | 55ms | `opacity` · `scaleY` · `translateX` |
| `exit/flip-away` | character | 35ms | `opacity` · `rotateY` |
| `exit/flip-out-burst` | character | 20ms | `opacity` · `scaleY` · `rotateX` · `rotate` · `scaleX` |
| `exit/flip-out-curl` | character | 40ms | `opacity` · `scaleY` · `rotateX` · `translateY` |
| `exit/flip-out-loose` | character | 55ms | `opacity` · `translateX` · `translateZ` · `rotateX` |
| `exit/fog-scatter` | character | 45ms | `opacity` · `blur` · `scaleX` · `rotate` · `translateX` |
| `exit/fog-scatter-2` | character | 20ms | `opacity` · `translateY` · `scaleY` · `blur` |
| `exit/fold-out-burst` | character | 45ms | `opacity` · `rotateX` · `rotateY` · `blur` · `skewX` |
| `exit/fold-out-burst-2` | character | 55ms | `opacity` · `translateY` · `translateX` · `rotateX` |
| `exit/fold-out-burst-curl` | character | 50ms | `opacity` · `rotateX` · `scale` · `translateX` · `scaleY` |
| `exit/fold-out-burst-loose` | character | 25ms | `opacity` · `translateX` · `rotate` · `scaleX` · `scale` · `rotateX` |
| `exit/implode-burst` | word | 55ms | `opacity` · `skewX` · `translateX` · `scale` · `translateZ` |
| `exit/lean-out-burst` | character | 55ms | `opacity` · `scale` · `translateZ` · `skewX` · `rotate` · `scaleY` · `scaleX` · `blur` |
| `exit/lean-out-burst-curl` | character | 20ms | `opacity` · `blur` · `rotate` · `scale` · `scaleY` · `translateZ` |
| `exit/lean-out-burst-swarm` | character | 20ms | `opacity` · `rotate` · `blur` |
| `exit/lean-out-burst-word` | word | 35ms | `opacity` · `scale` · `rotate` · `translateX` · `translateZ` · `translateY` |
| `exit/lean-out-snap` | character | 60ms | `opacity` · `rotate` |
| `exit/lift-out-burst` | character | 15ms | `opacity` · `blur` · `translateY` · `translateX` |
| `exit/mist-out` | character | 30ms | `opacity` · `blur` |
| `exit/pinwheel-out` | character | 35ms | `opacity` · `scaleX` · `rotate` · `blur` |
| `exit/pivot-out-burst` | character | 45ms | `opacity` · `translateX` · `rotateY` · `blur` · `rotate` |
| `exit/pivot-out-burst-loose` | character | 45ms | `opacity` · `rotateY` · `translateZ` |
| `exit/pivot-scatter-tunnel` | word | 45ms | `opacity` · `rotate` · `scaleX` · `translateZ` |
| `exit/rise-out-burst` | character | 60ms | `opacity` · `translateY` |
| `exit/rise-out-kick` | character | 50ms | `opacity` · `translateY` |
| `exit/rise-scatter` | word | 15ms | `opacity` · `translateY` · `rotateY` · `scale` |
| `exit/rise-scatter-2` | character | 50ms | `opacity` · `translateY` · `blur` · `scaleX` · `scaleY` · `rotateX` · `translateX` |
| `exit/scale-out` | character | 30ms | `opacity` · `scale` |
| `exit/shear-out-burst` | character | 35ms | `opacity` · `skewX` |
| `exit/slide-loose` | character | 55ms | `opacity` · `translateY` · `translateX` · `scale` · `scaleX` |
| `exit/slide-scatter` | character | 45ms | `opacity` · `rotate` · `skewX` · `scaleX` · `scaleY` · `blur` · `translateX` |
| `exit/slide-scatter-2` | character | 45ms | `opacity` · `translateY` · `scale` · `skewX` · `translateZ` · `translateX` |
| `exit/squash-x-burst` | character | 30ms | `opacity` · `skewX` · `scale` · `blur` · `scaleX` |
| `exit/squash-x-burst-curl` | character | 45ms | `opacity` · `skewX` · `scaleY` · `scaleX` |
| `exit/swipe-out-snap` | character | 45ms | `opacity` · `translateX` |
| `exit/swirl-out-burst` | character | 50ms | `opacity` · `scaleY` · `blur` · `skewX` · `translateY` · `scale` · `rotate` |
| `exit/swirl-out-curl` | character | 60ms | `opacity` · `rotate` · `scale` · `translateZ` |
| `exit/swivel-out` | word | 25ms | `opacity` · `rotateY` · `translateY` · `scaleX` |
| `exit/swivel-out-burst` | character | 45ms | `opacity` · `blur` · `translateX` · `rotate` · `rotateY` |
| `exit/swivel-out-burst-curl` | character | 60ms | `opacity` · `rotate` · `translateZ` · `scale` · `rotateY` |
| `exit/swivel-out-burst-loose` | character | 35ms | `opacity` · `scaleY` · `translateZ` · `translateX` · `rotateY` |
| `exit/swivel-out-burst-snap` | character | 40ms | `opacity` · `scaleY` · `translateZ` · `skewX` · `scale` · `translateX` · `rotate` · `rotateY` |
| `exit/swivel-out-curl` | character | 45ms | `opacity` · `rotateY` · `blur` |
| `exit/swivel-out-kick` | character | 40ms | `opacity` · `scale` · `rotateY` |
| `exit/swivel-out-loose` | character | 35ms | `opacity` · `scale` · `rotateY` · `translateZ` |
| `exit/tilt-out-burst` | word | 45ms | `opacity` · `rotate` · `scaleX` · `skewX` · `scale` · `translateX` · `translateZ` |
| `exit/tilt-out-burst-deep` | character | 45ms | `opacity` · `rotate` · `skewX` · `scaleY` · `translateZ` · `blur` |
| `exit/tilt-out-burst-kick` | character | 60ms | `opacity` · `blur` · `scale` · `rotate` · `scaleY` |
| `exit/tilt-out-burst-loose` | character | 30ms | `opacity` · `scale` · `scaleX` · `rotate` |
| `exit/tilt-out-burst-word` | word | 25ms | `opacity` · `rotate` · `skewX` · `blur` |
| `exit/tip-out-burst` | character | 35ms | `opacity` · `scale` · `rotate` · `scaleX` · `skewX` · `blur` · `scaleY` |
| `exit/tip-out-burst-curl` | character | 30ms | `opacity` · `rotate` · `translateZ` · `scaleX` |
| `exit/tip-out-burst-inward` | character | 60ms | `opacity` · `translateY` · `blur` · `rotate` · `scale` · `translateZ` |
| `exit/tip-out-burst-loose` | character | 50ms | `opacity` · `rotate` · `skewX` |
| `exit/topple` | character | 40ms | `opacity` · `scale` · `rotateX` |
| `exit/topple-out-burst` | character | 40ms | `opacity` · `rotateY` · `rotate` · `scale` · `rotateX` · `translateZ` |
| `exit/topple-out-burst-2` | character | 55ms | `opacity` · `scaleY` · `rotateX` · `translateY` · `translateZ` · `rotateY` |
| `exit/topple-out-burst-curl` | character | 35ms | `opacity` · `rotateX` · `scaleX` · `scale` · `translateX` |
| `exit/topple-out-burst-kick` | character | 30ms | `opacity` · `skewX` · `scale` · `rotateX` · `rotate` · `rotateY` · `translateZ` |
| `exit/topple-out-burst-snap` | character | 50ms | `opacity` · `blur` · `translateZ` · `rotate` · `translateY` · `rotateX` |
| `exit/turn-out-burst` | character | 30ms | `opacity` · `translateY` · `translateZ` · `rotateY` · `blur` |
| `exit/turn-out-burst-2` | character | 35ms | `opacity` · `rotate` · `rotateY` · `scaleX` · `translateZ` · `scaleY` |
| `exit/turn-out-burst-deep` | character | 35ms | `opacity` · `rotate` · `scaleX` · `translateZ` · `rotateY` · `skewX` |
| `exit/turn-out-burst-snap` | character | 60ms | `opacity` · `translateZ` · `rotateY` · `scaleY` · `rotate` |
| `exit/turn-out-burst-swarm` | character | 40ms | `opacity` · `scale` · `rotateY` · `translateZ` · `translateY` |
| `exit/turn-out-burst-trail` | character | 60ms | `opacity` · `rotateY` · `scale` · `scaleY` · `translateZ` · `translateY` · `translateX` |
| `exit/twirl` | character | 45ms | `opacity` · `rotate` · `scale` |
| `exit/twirl-2` | character | 40ms | `opacity` · `scaleY` · `scaleX` · `rotate` |
| `exit/twirl-loose` | character | 45ms | `opacity` · `rotate` · `scale` · `rotateY` |
| `exit/twirl-out-burst` | character | 20ms | `opacity` · `skewX` · `scaleY` · `rotate` |
| `exit/twirl-out-burst-loose` | character | 55ms | `opacity` · `scaleY` · `rotate` · `translateZ` · `skewX` · `translateX` |
| `exit/twirl-scatter-tunnel` | character | 45ms | `opacity` · `rotate` · `translateZ` · `scale` |
| `exit/whirl-scatter` | character | 45ms | `opacity` · `scaleX` · `rotate` · `translateY` · `blur` |
| `exit/whirl-scatter-tunnel` | character | 50ms | `opacity` · `rotateY` · `translateZ` · `rotate` · `blur` · `skewX` |
| `exit/whirl-scatter-tunnel-2` | character | 35ms | `opacity` · `translateZ` · `rotate` · `scale` · `skewX` |

### Emphasis · 31

| Name | Split | Stagger | Animates |
|---|---|---|---|
| `emphasis/bob` | character | 50ms | `translateY` |
| `emphasis/carousel-inward` | character | 20ms | `rotate` |
| `emphasis/coin-flip` | character | 30ms | `rotateY` |
| `emphasis/fold-tap-curl` | word | 60ms | `rotateX` |
| `emphasis/jolt-y-trail` | character | 15ms | `translateY` |
| `emphasis/jolt-y-trail-2` | character | 55ms | `translateY` |
| `emphasis/lean-loose` | character | 55ms | `rotate` |
| `emphasis/pinwheel-curl` | word | 30ms | `rotate` |
| `emphasis/pivot` | character | 50ms | `rotate` |
| `emphasis/pivot-2` | word | 40ms | `rotate` |
| `emphasis/pivot-3` | character | 50ms | `rotate` |
| `emphasis/pivot-bounce` | character | 50ms | `rotate` |
| `emphasis/pivot-snap` | character | 30ms | `rotate` |
| `emphasis/pulse` | character | 20ms | `scale` |
| `emphasis/pump-trail` | character | 25ms | `scale` |
| `emphasis/rock-inward` | word | 25ms | `rotate` |
| `emphasis/shake` | character | 15ms | `translateX` |
| `emphasis/spin` | character | 20ms | `rotate` |
| `emphasis/sway-curl` | character | 50ms | `rotate` |
| `emphasis/swivel-curl` | character | 50ms | `rotateY` |
| `emphasis/swivel-snap-depth` | character | 20ms | `rotateY` |
| `emphasis/tap-x-loose` | character | 30ms | `translateX` |
| `emphasis/tip-curl` | character | 35ms | `rotateX` |
| `emphasis/tip-deep` | character | 40ms | `rotateX` |
| `emphasis/turn-deep` | character | 15ms | `rotateY` |
| `emphasis/twirl-curl` | character | 50ms | `rotate` |
| `emphasis/twirl-curl-inward` | character | 30ms | `rotate` |
| `emphasis/whirl-loose` | character | 20ms | `rotate` |
| `emphasis/whirl-loose-2` | character | 45ms | `rotate` |
| `emphasis/wiggle-outward` | character | 30ms | `translateX` |
| `emphasis/wobble` | character | 25ms | `rotate` |

<!-- catalog:end -->

`listPresets()` enumerates everything; `resolvePreset(name)` looks one up by name.

## Preset shape

```ts
// @no-check
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
import { animateText } from "@vysmo/text";
import { createTestScheduler } from "@vysmo/animations";

const sched = createTestScheduler();
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
