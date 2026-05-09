# @vysmo/slideshow-react

React bindings for [`@vysmo/slideshow`](https://www.npmjs.com/package/@vysmo/slideshow). Drop-in image slideshow driven by any of the 60 [`@vysmo/transitions`](https://www.npmjs.com/package/@vysmo/transitions) shaders, with opt-in arrows / dots / counter / progress / captions — wrapped in one component plus a hook for imperative control.

[Live demos](https://vysmo.com/slideshow) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/slideshow @vysmo/slideshow-react
```

`react` ≥ 18 is a peer dependency. `@vysmo/transitions` is required if you want to pass a specific transition (`dissolve` is the default).

## Quick start

```tsx
import { Slideshow } from "@vysmo/slideshow-react";
import { paintBleed } from "@vysmo/transitions";

export function Hero() {
  return (
    <Slideshow
      slides={["/01.jpg", "/02.jpg", "/03.jpg"]}
      transition={paintBleed}
      autoplayDelay={4000}
      arrows
      dots
      style={{ width: "100%", aspectRatio: "16 / 9" }}
    />
  );
}
```

The component renders a `<div>`, mounts the slideshow into it, and tears down on unmount. Click halves, keyboard nav, and autoplay are wired by default; arrows / dots / counter / progress / captions are opt-in.

## Per-slide transition

Pass a function `(from, to) => Transition` to vary the transition per slide change:

```tsx
import { paintBleed, glitch, ripple, crossZoom } from "@vysmo/transitions";

const transitions = [paintBleed, glitch, ripple, crossZoom];

<Slideshow
  slides={[...]}
  transition={(from, to) => transitions[to % transitions.length]!}
/>
```

## Imperative control

For custom Next/Prev buttons, scroll-bound `go()`, autoplay toggles, etc., use the hook and call methods on the returned handle:

```tsx
import { useRef } from "react";
import { useSlideshow } from "@vysmo/slideshow-react";

function ControlledSlideshow({ slides }) {
  const ref = useRef<HTMLDivElement>(null);
  const slideshow = useSlideshow(ref, { slides, autoplayDelay: 4000 });

  return (
    <>
      <div ref={ref} style={{ width: "100%", aspectRatio: "16 / 9" }} />
      <button onClick={() => slideshow?.prev()}>‹</button>
      <button onClick={() => slideshow?.next()}>›</button>
      <button onClick={() => slideshow?.isPlaying ? slideshow.pause() : slideshow?.play()}>
        Play / Pause
      </button>
    </>
  );
}
```

The handle is `null` until the slideshow is mounted; use optional chaining or a guard.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `slides` | `readonly SlideSource[]` | — | URLs (decoded), `HTMLImageElement`s, or canvases. |
| `initial` | `number` | `0` | Starting index. |
| `transition` | `Transition \| (from, to) => Transition` | `dissolve` | Single transition or per-slide selector. |
| `transitionDuration` | `number` | `800` | Transition ms. |
| `ease` | `EasingFn` | linear | Easing for the transition. |
| `autoplayDelay` | `number` | — | Dwell time in ms; omit / `0` to disable. |
| `autoplay` | `boolean` | `true` if `autoplayDelay > 0` | Start autoplay on mount. |
| `loop` | `boolean` | `true` | Wrap last → first. |
| `clickNavigation` | `boolean` | `true` | Click halves to advance. |
| `keyboardNavigation` | `boolean` | `true` | Arrow keys, Home/End, Space. |
| `pauseOnHidden` | `boolean` | `true` | Pause autoplay while the tab is hidden. |
| `pauseOnHover` | `boolean` | `false` | Pause autoplay on hover. |
| `swipeNavigation` | `boolean \| SwipeOptions` | `false` | Touch / pointer swipe. |
| `arrows` | `boolean \| ArrowsOptions` | `false` | Visible nav arrows. |
| `dots` | `boolean \| DotsOptions` | `false` | Page-indicator dots. |
| `counter` | `boolean \| CounterOptions` | `false` | Slide-counter overlay. |
| `progress` | `boolean \| ProgressOptions` | `false` | Autoplay countdown bar. |
| `captions` | `false \| CaptionsOptions` | `false` | Per-slide caption overlay. |
| `ariaLabel` | `string` | `"Slideshow"` | Accessible label. |
| `onChange` | `(current, previous) => void` | — | Slide change callback. |
| `onTransitionStart` | `(from, to) => void` | — | Transition begins. |
| `onTransitionEnd` | `(from, to) => void` | — | Transition ends. |
| `className` | `string` | — | Forwarded to the host `<div>`. |
| `style` | `CSSProperties` | — | Forwarded to the host `<div>`. Size the slideshow here. |

## SSR

The wrapper is SSR-safe: `useEffect` bodies don't run on the server, and the module body itself doesn't touch `window` / `document`. Server renders an empty `<div>`; client mounts the slideshow.

## License

MIT.
