# @vysmo/transitions-react

React bindings for [`@vysmo/transitions`](https://www.npmjs.com/package/@vysmo/transitions). One `<Transition>` component, one hook (`useTransitionRunner`), zero opinion on how you drive progress — controlled or self-driving, your call.

[Live demos + parameter playground](https://vysmo.com/transitions) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/transitions @vysmo/transitions-react
```

`react` ≥ 18 is a peer dependency.

## Quick start

```tsx
import { Transition } from "@vysmo/transitions-react";
import { paintBleed } from "@vysmo/transitions";

export function Hero() {
  return (
    <Transition
      transition={paintBleed}
      from="/images/a.jpg"
      to="/images/b.jpg"
      duration={1200}
      style={{ width: "100%", aspectRatio: "16 / 9" }}
    />
  );
}
```

That's the whole minimum. The component mounts a `<canvas>`, creates a `Runner`, resolves the URLs into decoded `Image`s, and runs an autoplay from `progress=0` to `progress=1` over `duration` ms. On unmount the runner is disposed.

## Controlled progress

Pass a `progress` prop — autoplay is bypassed and the component renders exactly at the value you supply. Drive it from anything: scroll progress, a scrubber, a tween library, your own state.

```tsx
// @no-check
import { Transition } from "@vysmo/transitions-react";
import { paintBleed } from "@vysmo/transitions";
import { useScrollProgress } from "./somewhere";

export function ScrollHero() {
  const progress = useScrollProgress();   // 0 → 1 as the section passes
  return (
    <Transition
      transition={paintBleed}
      from="/a.jpg"
      to="/b.jpg"
      progress={progress}
    />
  );
}
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `transition` | `Transition` | — | Any transition exported by `@vysmo/transitions`. |
| `from` | `Source` | — | URL string, `HTMLImageElement`, canvas, video, or `ImageBitmap`. |
| `to` | `Source` | — | Same shape as `from`. |
| `progress` | `number` | — | Controlled `[0,1]`. When set, autoplay is bypassed. |
| `duration` | `number` | `1000` | Autoplay duration ms. Used only when `progress` is omitted. |
| `playing` | `boolean` | `true` | Whether autoplay is running. Used only when `progress` is omitted. |
| `loop` | `boolean` | `false` | Loop autoplay. |
| `ease` | `(t: number) => number` | linear | Easing applied to autoplay. Pair with [`@vysmo/easings`](https://www.npmjs.com/package/@vysmo/easings) for named curves. |
| `params` | `UniformParams` | — | Override shader uniform defaults (e.g. `{ blur: 0.05 }`). |
| `onComplete` | `() => void` | — | Fires when a non-loop autoplay reaches `progress=1`. |
| `className` | `string` | — | Forwarded to the `<canvas>`. |
| `style` | `CSSProperties` | — | Forwarded to the `<canvas>`. |

## Sizing

The component renders a `<canvas>` and syncs its internal pixel dimensions to its CSS box via `ResizeObserver`, with `devicePixelRatio` applied. Style the canvas via `className` / `style` and the runner adapts.

## Hook (advanced)

If you need direct `Runner` access — e.g. to compose multiple renders per frame, or to drive a transition off a non-React render loop — use `useTransitionRunner`:

```tsx
import { useRef } from "react";
import { useTransitionRunner } from "@vysmo/transitions-react";
import { paintBleed } from "@vysmo/transitions";

function CustomDriver({ from, to, progress }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runner = useTransitionRunner(canvasRef);

  if (runner) {
    runner.render(paintBleed, { from, to, progress });
  }

  return <canvas ref={canvasRef} />;
}
```

The component is the right call for ~95% of cases; reach for the hook when the props don't expose what you need.

## SSR

The wrapper is SSR-safe: `useEffect` bodies don't run on the server, and the module body itself doesn't touch `window` / `document`. Server renders an empty `<canvas>`; client mounts the runner.

## License

MIT.
