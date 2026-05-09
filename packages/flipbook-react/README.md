# @vysmo/flipbook-react

React bindings for [`@vysmo/flipbook`](https://www.npmjs.com/package/@vysmo/flipbook). Real WebGL flipbook with drag-corner scrub, click halves, keyboard nav, and autoplay — wrapped in one component plus a hook for imperative control.

[Live demos](https://vysmo.com/flipbook) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/flipbook @vysmo/flipbook-react
```

`react` ≥ 18 is a peer dependency.

## Quick start

```tsx
import { Flipbook } from "@vysmo/flipbook-react";

export function PortfolioBook() {
  return (
    <Flipbook
      pages={[
        "/spreads/01.jpg",
        "/spreads/02.jpg",
        "/spreads/03.jpg",
        "/spreads/04.jpg",
      ]}
      style={{ width: 600, height: 800 }}
    />
  );
}
```

The component renders a `<div>`, mounts the flipbook into it, and tears down on unmount. Click halves, arrow keys, and corner drags all work out of the box.

## Imperative control

For custom Next/Prev buttons, scroll-bound seek, autoplay toggles, etc., use the hook and call methods on the returned handle:

```tsx
import { useRef } from "react";
import { useFlipbook } from "@vysmo/flipbook-react";

function ControlledFlipbook({ pages }) {
  const ref = useRef<HTMLDivElement>(null);
  const flipbook = useFlipbook(ref, { pages, autoplay: { intervalMs: 4000 } });

  return (
    <>
      <div ref={ref} style={{ width: 600, height: 800 }} />
      <button onClick={() => flipbook?.prev()}>‹</button>
      <button onClick={() => flipbook?.next()}>›</button>
      <button onClick={() => flipbook?.isPlaying ? flipbook.pause() : flipbook?.play()}>
        Play / Pause
      </button>
    </>
  );
}
```

The handle is `null` until the flipbook is mounted; use optional chaining or a guard.

## Scroll-driven flipping

Pipe scroll progress into `seek()` for a flipbook that turns pages as the user scrolls:

```tsx
import { useEffect, useRef } from "react";
import { useFlipbook } from "@vysmo/flipbook-react";
import { createScrollProgress } from "@vysmo/scroll";

function ScrollFlipbook({ pages, section }) {
  const ref = useRef<HTMLDivElement>(null);
  const flipbook = useFlipbook(ref, { pages });

  useEffect(() => {
    if (!flipbook) return;
    const sub = createScrollProgress({
      target: section,
      onProgress: (p) => flipbook.seek(p),
    });
    return () => sub.destroy();
  }, [flipbook, section]);

  return <div ref={ref} style={{ width: 600, height: 800 }} />;
}
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `pages` | `readonly PageSource[]` | — | URLs (decoded), `HTMLImageElement`s, or canvases. |
| `initialPage` | `number` | `0` | Starting index. |
| `axis` | `"horizontal" \| "vertical"` | `"horizontal"` | Curl direction. |
| `tilt` | `number` | `0.12` | Hinge tilt in radians on top of the axis baseline. |
| `backColor` | `[number, number, number]` | — | Page-back colour. |
| `flipDuration` | `number` | `900` | Flip animation ms. |
| `ease` | `(t: number) => number` | `cubicInOut` | Easing for the flip. |
| `loop` | `boolean` | `false` | Wrap last → first. |
| `clickNavigation` | `boolean` | `true` | Click halves to flip. |
| `dragNavigation` | `boolean` | `true` | Drag a corner to peel mid-curl. |
| `dragCommitThreshold` | `number` | `0.5` | Released drag past this commits. |
| `keyboardNavigation` | `boolean` | `true` | Arrow keys / Home / End. |
| `autoplay` | `boolean \| { intervalMs }` | `false` | Auto-advance on a timer. |
| `ariaLabel` | `string` | `"Flipbook"` | Accessible label. |
| `onChange` | `(current, previous) => void` | — | Page change callback. |
| `onFlipStart` | `(from, to) => void` | — | Flip begins. |
| `onFlipEnd` | `(from, to) => void` | — | Flip ends. |
| `className` | `string` | — | Forwarded to the host `<div>`. |
| `style` | `CSSProperties` | — | Forwarded to the host `<div>`. Size the flipbook here. |

## SSR

The wrapper is SSR-safe: `useEffect` bodies don't run on the server, and the module body itself doesn't touch `window` / `document`. Server renders an empty `<div>`; client mounts the flipbook.

## License

MIT.
