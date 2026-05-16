# Vysmo

**Visual computing primitives for the modern web.**

WebGL2 transitions and filter effects, easing curves, choreographed text, scroll bindings, and the headless components built on top. Zero runtime dependencies per package. Tree-shakable to the byte. TypeScript-native. SSR-safe.

→ [**vysmo.com**](https://vysmo.com) — live playgrounds, full catalogs, the docs.

---

## Packages

Each package ships independently to npm under the [`@vysmo`](https://www.npmjs.com/org/vysmo) scope. Install only what you use; everything tree-shakes.

| Package | What it is | Live |
| --- | --- | --- |
| [`@vysmo/transitions`](./packages/transitions) | 60 WebGL2 transition shaders, defined as plain data. Mesh-based, endpoint-correct. | [vysmo.com/transitions](https://vysmo.com/transitions) |
| [`@vysmo/effects`](./packages/effects) | 30 filter effects (blur, bloom, glow, halftone, VHS, ASCII, …) with HDR-aware multi-pass. | [vysmo.com/effects](https://vysmo.com/effects) |
| [`@vysmo/text`](./packages/text) | Choreographed text animations driven by a single timeline. Generous preset library. | [vysmo.com/text](https://vysmo.com/text) |
| [`@vysmo/easings`](./packages/easings) | Authoring-grade easing curves — overshoot, spring, accelerate / decelerate. | [vysmo.com/easings](https://vysmo.com/easings) |
| [`@vysmo/scroll`](./packages/scroll) | Bind any progress-driven thing to scroll position. Pin, plateau, ranges. | [vysmo.com/scroll](https://vysmo.com/scroll) |
| [`@vysmo/flipbook`](./packages/flipbook) | Headless WebGL flipbook with drag-corners-to-scrub-mid-flip. | [vysmo.com/flipbook](https://vysmo.com/flipbook) |
| [`@vysmo/slideshow`](./packages/slideshow) | Headless image slideshow that runs any of the 60 transitions. | [vysmo.com/slideshow](https://vysmo.com/slideshow) |

### React wrappers

Same APIs, declarative components + hooks: [`@vysmo/transitions-react`](./packages/transitions-react), [`@vysmo/text-react`](./packages/text-react), [`@vysmo/flipbook-react`](./packages/flipbook-react), [`@vysmo/slideshow-react`](./packages/slideshow-react).

### Internal infrastructure

The runtime under the consumer packages: [`@vysmo/animations`](./packages/animations) (tweening engine), [`@vysmo/gl-core`](./packages/gl-core) (WebGL2 plumbing). You don't normally import these directly — they arrive transitively.

---

## Get started

```bash
pnpm add @vysmo/transitions
```

```ts
import { Runner, crossZoom } from "@vysmo/transitions";

const runner = new Runner({ canvas });
runner.render(crossZoom, { from: imageA, to: imageB, progress: 0.5 });
```

Full docs, parameter playgrounds, and copy-pasteable code live on each library's page at [vysmo.com](https://vysmo.com).

---

## Monorepo layout

```
packages/   — every published @vysmo/* package
```

This repo is the public source. Apps (the marketing site, internal tools) and the strategy / launch docs live in a separate private repo.

---

## License

[MIT](./LICENSE) — every package, forever. Use them in anything, commercial or not.

Brought to you by **Maesto LLC**, San Diego.
