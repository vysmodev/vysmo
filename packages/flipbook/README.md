# @vysmo/flipbook

WebGL flipbook driven by the [`@vysmo/transitions`](https://www.npmjs.com/package/@vysmo/transitions) page-curl mesh shader. Click halves, keyboard nav, **drag corners to scrub mid-flip** — the page-curl shader's `progress` follows your pointer, release past 50% to commit the flip, less to revert. Drop-in component or headless API.

[Live demo + playground](https://vysmo.com/flipbook) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/flipbook @vysmo/transitions @vysmo/animations @vysmo/easings
```

(Peers ship separately so you can pin them per-project. They're transitive deps; `npm install @vysmo/flipbook` pulls them in automatically — just add to your own `package.json` if you want explicit version control.)

## Quick start

```ts
import { createFlipbook } from "@vysmo/flipbook";

const flip = createFlipbook({
  container: document.querySelector("#book")!,
  pages: [
    "/p1.jpg",
    "/p2.jpg",
    "/p3.jpg",
    "/p4.jpg",
  ],
  axis: "horizontal", // or "vertical"
  loop: true,
});

// Click halves / drag corners / arrow keys are all wired by default.
flip.next();
flip.prev();
flip.goTo(2);
```

## Pages

`pages` accepts:
- Image URLs (string)
- `HTMLImageElement` (already-loaded)
- `HTMLCanvasElement` / `OffscreenCanvas`
- `HTMLVideoElement`
- Any other `TextureSource` (per [`@vysmo/transitions`](https://www.npmjs.com/package/@vysmo/transitions))

The flipbook resolves URL strings into images for you and uploads each page to the GPU via `TextureCache`.

## Drag-scrub

The signature feature: when you drag a corner of the book mid-flip, the page-curl shader's `progress` follows your pointer in real time. Release past 50% to commit; less to revert with a spring tween back to the previous page. This is what differentiates the component from a CSS-only flipbook — there's no equivalent without the shader.

Disable with `enableDrag: false` if you only want click + keyboard navigation.

## Options

```ts
// @no-check
type FlipbookOptions = {
  container: HTMLElement;
  pages: PageSource[];
  axis?: "horizontal" | "vertical";   // default "horizontal"
  loop?: boolean;                     // wrap last → first
  duration?: number;                  // ms per flip (default 900)
  ease?: EasingFn;                    // default cubicInOut
  radius?: number;                    // page-curl radius (default 0.35)
  tilt?: number;                      // page-curl tilt (default 0.12)
  backColor?: [number, number, number]; // back-of-page tint (default warm white)
  enableDrag?: boolean;               // default true
  dragCommit?: number;                // 0..1 — release threshold (default 0.5)
  enableKeyboard?: boolean;           // default true
  autoplay?: boolean | number;        // true → 4s; number → custom ms
  // ... and a few more
};
```

## Events

```ts
flip.on("change", (current, previous) => /* … */);
flip.on("flipstart", (from, to) => /* … */);
flip.on("flipend", (from, to) => /* … */);
```

## Disposal

```ts
flip.dispose(); // releases GPU resources, removes listeners
```

## Characteristics

- **DOM-only.** Requires `HTMLCanvasElement` and pointer / keyboard events.
- **WebGL2 only** (transitive — driven by `@vysmo/transitions`).
- **SSR-safe at module load.** Module imports cleanly in Node; constructing requires a live DOM.
- **Bundle:** ~3 KB gzipped (peers external).

## License

MIT.
