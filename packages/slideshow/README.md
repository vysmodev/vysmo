# @vysmo/slideshow

Drop-in image slideshow driven by any of the 60 [`@vysmo/transitions`](https://www.npmjs.com/package/@vysmo/transitions). Opt-in chrome (arrows, dots, counter, progress bar, captions) themeable via CSS custom properties. Click halves, keyboard nav, swipe gestures, autoplay with pause-on-hover. Set every chrome option to `false` for pure-headless mode.

[Live demo + chrome playground](https://vysmo.com/slideshow) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/slideshow @vysmo/transitions @vysmo/animations @vysmo/easings
```

(Peers ship separately on npm so you can pin them per-project.)

## Quick start

```ts
import { createSlideshow } from "@vysmo/slideshow";
import { paintBleed } from "@vysmo/transitions";

const show = createSlideshow({
  container: document.querySelector("#stage")!,
  slides: ["/01.jpg", "/02.jpg", "/03.jpg"],
  transition: paintBleed,
  transitionDuration: 900,
  autoplayDelay: 4000,
});

show.on("change", (current) => {
  console.log("now showing slide", current);
});
```

## Lazy mode for big galleries

`createSlideshow` eagerly decodes every slide by default, which is fine
for a handful of images but blocks the homepage on the full image list
for galleries with dozens-to-hundreds of slides. Set `lazy: true` and
the slideshow only loads the current slide + `preloadWindow` neighbours
on each side; the underlying runner LRU-evicts URL textures outside the
window so GPU memory stays bounded regardless of slide count.

```ts
import { createSlideshow } from "@vysmo/slideshow";
import { paintBleed } from "@vysmo/transitions";

// Any length — only ~3 textures held on the GPU at a time.
const slides = Array.from({ length: 100 }, (_, i) => `/photos/${i}.jpg`);

createSlideshow({
  container: document.querySelector("#stage")!,
  slides,
  transition: paintBleed,
  lazy: true,
  preloadWindow: 1,         // current + N each side; default 1
});
```

DOM-source slides (`HTMLImageElement`, `HTMLCanvasElement`) mixed in a
lazy `slides` array are treated as always-loaded — they're already in
memory by definition. Only URL strings go through the lazy load path.

For Next.js — pass `next/image` optimizer URLs straight into `slides`.
See the [Vysmo + Next.js guide](https://vysmo.com/guides/nextjs).

## Mixing transitions per slide

```ts
import { dissolve, pageCurl, crossZoom, slide } from "@vysmo/transitions";

createSlideshow({
  // ...
  transition: (from, to) => {
    // pick a different transition per pair, randomly, by direction, etc.
    return [dissolve, pageCurl, crossZoom, slide][to % 4];
  },
});
```

The `transition` option accepts either a single `Transition` or a `(from, to) => Transition` selector.

## Chrome

Every chrome element is opt-in and individually configurable:

```ts
createSlideshow({
  // ...
  arrows: { position: "outside-edges", style: "minimal" }, // or `true` for defaults, `false` to disable
  dots: { position: "bottom-center", style: "lines" },
  counter: { position: "top-right" },
  progress: { position: "top" },
  captions: {
    texts: ["First slide", "Second slide", "Third slide"],
    position: "bottom",
    alignment: "center",
  },
});
```

Set everything to `false` for headless mode — you draw your own UI on top.

All chrome elements are themeable via CSS custom properties:

```css
.my-slideshow {
  --slideshow-arrow-color: white;
  --slideshow-arrow-size: 32px;
  --slideshow-dot-active-color: #4F7AFC;
  --slideshow-progress-color: white;
  /* ... */
}
```

## Interactions

- **Click halves** — left half = previous, right half = next.
- **Keyboard** — Arrow Left/Right, Home, End.
- **Swipe** — Touch + mouse drag, optional momentum.
- **Autoplay** — `autoplayDelay: 4000` (ms) starts the cycle; pauses while the tab is hidden by default; `pause()` / `play()` to control programmatically.

All four can be turned off independently.

## Events

```ts
show.on("change", (current, previous) => /* ... */);
show.on("transitionstart", (from, to) => /* ... */);
show.on("transitionend", (from, to) => /* ... */);
show.on("play", () => /* ... */);
show.on("pause", () => /* ... */);
```

## API

```ts
show.next();
show.prev();
show.go(2);                          // jump to index
show.go(2, { transition: pageCurl }); // jump with a one-shot transition override
show.play();
show.pause();
show.dispose();
```

## Slide sources

```ts
slides: [
  { src: "/a.jpg" },                                      // URL — auto-loaded
  { src: existingImageElement, caption: "Already loaded" },
  { src: video },                                          // animated source
  { src: canvas },                                         // dynamic source
]
```

Same `TextureSource` flexibility as `@vysmo/transitions` — anything that goes into the page-curl shader works here.

## Characteristics

- **DOM-only.** Requires a container element + `HTMLCanvasElement`.
- **WebGL2 only** (transitive — driven by `@vysmo/transitions`).
- **SSR-safe at module load.** Module imports cleanly in Node; constructing requires DOM.
- **Bundle:** ~6 KB gzipped (peers external).
- **Tree-shakable.** Only the chrome you enable ships.

## License

MIT.
