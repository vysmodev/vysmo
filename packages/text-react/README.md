# @vysmo/text-react

React bindings for [`@vysmo/text`](https://www.npmjs.com/package/@vysmo/text). One `<AnimateText>` component, one hook (`useAnimateText`), 243 presets out of the box.

[Live preset browser + Studio](https://vysmo.com/text) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/text @vysmo/text-react
```

`react` ≥ 18 is a peer dependency.

## Quick start

```tsx
import { AnimateText } from "@vysmo/text-react";

export function Hero() {
  return (
    <AnimateText as="h1" preset="enter/fade-up">
      Hello world
    </AnimateText>
  );
}
```

The component renders a single element (`<span>` by default; override via `as`), and on mount runs `animateText` against it with the props you've passed. Cleanup happens automatically on unmount.

## Tree-shake the catalog

Pass a preset *object* instead of a name and only that preset ships in your bundle:

```tsx
import { AnimateText } from "@vysmo/text-react";
import { fadeUp } from "@vysmo/text";

<AnimateText as="h1" preset={fadeUp}>
  Hello world
</AnimateText>
```

The string-name path pulls in the whole 243-preset registry; the object path is byte-for-byte just the preset you imported.

## Custom choreography

Skip the preset and pass `animations` directly:

```tsx
<AnimateText
  as="h1"
  split="character"
  stagger={28}
  animations={[
    { prop: "opacity", from: 0, to: 1, duration: 600, ease: "expo.out" },
    { prop: "translateY", from: 24, to: 0, duration: 800, ease: "back.out" },
  ]}
>
  Hand-rolled
</AnimateText>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `as` | `ElementType` | `"span"` | Tag name for the wrapper element. Pass `"h1"`, `"p"`, etc. for semantic markup. |
| `children` | `ReactNode` | — | The text content. Strings are simplest; reference changes re-run the animation. |
| `preset` | `PresetName \| Preset` | — | Preset name (string) or imported preset object (tree-shakable). |
| `split` | `"character" \| "word" \| "line"` | preset's split, or `"character"` | Split granularity. |
| `stagger` | `number` | `30` | Milliseconds between consecutive slices starting. |
| `staggerOrder` | `StaggerOrder` | `"start"` | Order in which slices receive their offset. |
| `animations` | `TextAnimationSpec[]` | — | Custom specs (used when no `preset` or to override). |
| `perspective` | `number` | — | Container perspective in px. Required for visible 3D transforms. |
| `perspectiveOrigin` | `string` | — | Container perspective-origin. |
| `transformOrigin` | `TransformOrigin` | — | Origin applied to every slice. |
| `autoPlay` | `boolean` | `true` | Begin playing automatically on mount. |
| `delay` | `number` | — | Ms before the first play begins. |
| `repeat` | `number \| "infinite"` | `1` | How many cycles. |
| `repeatDelay` | `number` | `0` | Delay between cycles when `repeat > 1`. |
| `onComplete` | `() => void` | — | Fires when the choreography finishes naturally (won't fire while looping). |
| `className` | `string` | — | Forwarded to the wrapper element. |
| `style` | `CSSProperties` | — | Forwarded to the wrapper element. |

## Replay on the same props

Re-run an animation that's already played using a `key` prop:

```tsx
<AnimateText key={replayCount} preset="emphasis/pulse">
  Important
</AnimateText>
```

Bumping the key fully remounts the component, so the animation runs again.

## Hook (advanced)

When you can't wrap the JSX (Markdown-rendered headings, MDX, third-party components), animate an external ref:

```tsx
import { useRef } from "react";
import { useAnimateText } from "@vysmo/text-react";

function MyHeading({ children }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useAnimateText(ref, { preset: "enter/fade-up" });
  return <h1 ref={ref}>{children}</h1>;
}
```

## SSR

The wrapper is SSR-safe: `useEffect` bodies don't run on the server, and the module body itself doesn't touch `window` / `document`. Server renders the wrapping element with its raw text; client mounts the animation.

## License

MIT.
