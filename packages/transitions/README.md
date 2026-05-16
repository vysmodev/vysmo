# @vysmo/transitions

60 WebGL2 transition shaders, defined as plain data. Mesh-based, tree-shakable to the byte, endpoint-correct by construction. One Runner takes any combination of canvas / image / video sources and crossfades, displaces, warps, or curls between them.

[Live demos + parameter playground](https://vysmo.com/transitions) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/transitions @vysmo/animations
```

The runner doesn't drive time — you do. The Quick start uses [`@vysmo/animations`](https://www.npmjs.com/package/@vysmo/animations) for a four-line tween from `0` to `1`, but the runner doesn't care: any rAF loop, [`@vysmo/scroll`](https://www.npmjs.com/package/@vysmo/scroll) handler, Motion / GSAP timeline, or scrubbed input works.

## Quick start

End-to-end: load two images, drive a transition between them. The runner is thin enough that this is genuinely all you need.

```ts
import { Runner, paintBleed } from "@vysmo/transitions";
import { animate } from "@vysmo/animations";

const canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
const runner = new Runner({ canvas });

// Two images you want to crossfade between.
const fromImg = new Image();
const toImg = new Image();
fromImg.src = "/photo-a.jpg";
toImg.src = "/photo-b.jpg";

await Promise.all([fromImg.decode(), toImg.decode()]);

// Animate progress 0 → 1 and render every frame.
animate({
  from: 0,
  to: 1,
  duration: 1200,
  onUpdate: (p) => runner.render(paintBleed, {
    from: fromImg,
    to: toImg,
    progress: p,
  }),
});
```

`runner.render()` is one draw call per frame, regardless of the transition.

## Tree-shake by what you import

Every transition is its own module. Import only the ones you ship:

```ts
import { Runner, crossZoom, pageCurl } from "@vysmo/transitions";
// → Runner + 2 transitions, ~6 KB gzipped
```

vs

```ts
import * as transitions from "@vysmo/transitions";
// → Runner + all 60 transitions, ~28 KB gzipped
```

`sideEffects: false`, no CSS, no global state.

## Catalog

Each transition is a `Transition<P>` — the parameter type `P` is inferred from `defaults`, so overrides are typed without any hand-typing. The auto-generated catalog below mirrors the playground's slider ranges.

<!-- catalog:start -->

Every built-in transition with its parameters, defaults, and accepted values. The catalog mirrors the playground at [vysmo.com/transitions/docs#catalog](https://vysmo.com/transitions/docs#catalog).

### Light & Optics

#### `filmBurn`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `scale` | number | `6` | 0.5 – 18, step 0.05 |
| `edgeWidth` | number | `0.05` | 0 – 1, step 0.05 |
| `chroma` | number | `0` | 0 – 1, step 0.01 |
| `flameColor` | vec3 | `[1.6, 0.7, 0.15]` | `[1.6, 0.7, 0.15]` Ember · `[1.8, 0.4, 0.05]` Molten · `[1.2, 0.15, 0.1]` Deep red · `[0.5, 1.6, 0.4]` Acid · `[0.4, 1, 1.6]` Ice blue · `[1.2, 1.6, 2.5]` Electric · `[1.4, 0.6, 1.8]` Violet |

#### `lightLeak`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[1, 0]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up · `[1, -1]` Diagonal · `[-1, -1]` Anti-diag |
| `color` | vec3 | `[1, 0.85, 0.55]` | `[1, 0.85, 0.55]` Sunset · `[1, 0.7, 0.85]` Magic hour · `[1, 0.96, 0.92]` Daylight · `[0.5, 1, 1.1]` Cyan · `[1.1, 0.4, 0.95]` Magenta |
| `bandWidth` | number | `0.2` | 0 – 1, step 0.05 |
| `intensity` | number | `1` | 0 – 3, step 0.01 |

#### `heatHaze`

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.04` | 0 – 1.5, step 0.01 |
| `frequency` | number | `14` | 0 – 56, step 1 |
| `flow` | number | `5` | 0 – 15, step 1 |

#### `bloomReveal`

| Prop | Type | Default | Values |
|---|---|---|---|
| `scale` | number | `5` | 0.5 – 15, step 0.05 |
| `softness` | number | `0.08` | 0 – 0.4, step 0.005 |
| `threshold` | number | `0.55` | 0 – 1, step 0.01 |
| `intensity` | number | `3` | 0 – 9, step 0.01 |

#### `directionalBurn`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[1, 0]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up · `[1, -1]` Diagonal · `[-1, -1]` Anti-diag |
| `scale` | number | `10` | 0.5 – 30, step 0.05 |
| `edgeWidth` | number | `0.035` | 0 – 1, step 0.05 |
| `flameColor` | vec3 | `[1.6, 0.7, 0.15]` | `[1.6, 0.7, 0.15]` Ember · `[1.8, 0.4, 0.05]` Molten · `[1.2, 0.15, 0.1]` Deep red · `[0.5, 1.6, 0.4]` Acid · `[0.4, 1, 1.6]` Ice blue · `[1.2, 1.6, 2.5]` Electric · `[1.4, 0.6, 1.8]` Violet |

#### `prismSplit`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[1, 0]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up · `[1, -1]` Diagonal · `[-1, -1]` Anti-diag |
| `intensity` | number | `0.04` | 0 – 0.07, step 0.005 |
| `softness` | number | `0.2` | 0 – 0.4, step 0.005 |

#### `emberScatter`

| Prop | Type | Default | Values |
|---|---|---|---|
| `count` | number | `5` | 0 – 24, step 1 |
| `scale` | number | `8` | 0.5 – 24, step 0.05 |
| `edgeWidth` | number | `0.04` | 0 – 1, step 0.05 |
| `stagger` | number | `0.35` | 0 – 1, step 0.01 |
| `flameColor` | vec3 | `[1.6, 0.7, 0.15]` | `[1.6, 0.7, 0.15]` Ember · `[1.8, 0.4, 0.05]` Molten · `[1.2, 0.15, 0.1]` Deep red · `[0.5, 1.6, 0.4]` Acid · `[0.4, 1, 1.6]` Ice blue · `[1.2, 1.6, 2.5]` Electric · `[1.4, 0.6, 1.8]` Violet |

#### `godRaysReveal`

| Prop | Type | Default | Values |
|---|---|---|---|
| `scale` | number | `5` | 0.5 – 15, step 0.05 |
| `softness` | number | `0.08` | 0 – 0.4, step 0.005 |
| `threshold` | number | `0.45` | 0 – 1, step 0.01 |
| `intensity` | number | `1.6` | 0 – 4.8, step 0.01 |
| `decay` | number | `0.92` | 0.5 – 1, step 0.005 |
| `source` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |

#### `chromaticPulse`

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.6` | 0 – 1.8, step 0.01 |

### Fluid & Ink

#### `paintBleed`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[-1, 0]` | `[-1, 0]` Right · `[1, 0]` Left · `[0, 1]` Down · `[0, -1]` Up · `[-1, 1]` Diagonal · `[1, 1]` Anti-diag |
| `scale` | number | `10` | 0.5 – 30, step 0.05 |
| `softness` | number | `0.02` | 0 – 0.4, step 0.005 |
| `noiseStrength` | number | `0.35` | 0 – 1.5, step 0.01 |

#### `inkDiffuse`

| Prop | Type | Default | Values |
|---|---|---|---|
| `scale` | number | `7` | 0.5 – 21, step 0.05 |
| `softness` | number | `0.08` | 0 – 0.4, step 0.005 |

#### `inkBloom`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `scale` | number | `5` | 0.5 – 15, step 0.05 |
| `edgeWidth` | number | `0.07` | 0 – 1, step 0.05 |
| `bloomWidth` | number | `0.12` | 0 – 1, step 0.05 |
| `inkColor` | vec3 | `[0.25, 0.08, 0.45]` | `[0.25, 0.08, 0.45]` Indigo · `[0.06, 0.06, 0.08]` Sumi · `[0.55, 0.05, 0.12]` Crimson · `[0.06, 0.32, 0.18]` Forest · `[0.05, 0.18, 0.55]` Sapphire |

#### `fluidFlow`

| Prop | Type | Default | Values |
|---|---|---|---|
| `strength` | number | `0.12` | 0 – 1.5, step 0.01 |
| `scale` | number | `3` | 0.5 – 9, step 0.05 |

#### `liquidMorph`

| Prop | Type | Default | Values |
|---|---|---|---|
| `scale` | number | `3` | 0.5 – 9, step 0.05 |
| `strength` | number | `0.1` | 0 – 1.5, step 0.01 |
| `flow` | number | `3` | 0 – 9, step 0.1 |

#### `dripWipe`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[-1, 0]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up |
| `width` | number | `0.5` | 0 – 1.5, step 0.05 |
| `scaleX` | number | `40` | 0.5 – 120, step 0.05 |
| `scaleY` | number | `40` | 0.5 – 120, step 0.05 |

#### `smolderingEdge`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[1, 1]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up · `[1, -1]` Diagonal · `[-1, -1]` Anti-diag |
| `scale` | number | `3` | 0.5 – 9, step 0.05 |
| `edgeWidth` | number | `0.04` | 0 – 1, step 0.05 |
| `trailLength` | number | `0.18` | 0 – 1, step 0.01 |
| `emberColor` | vec3 | `[1.4, 0.5, 0.1]` | `[1.4, 0.5, 0.1]` Ember · `[1.7, 0.3, 0.05]` Molten · `[1.1, 0.12, 0.08]` Deep red · `[0.4, 1.5, 0.3]` Acid |

#### `luminaMelt`

| Prop | Type | Default | Values |
|---|---|---|---|
| `softness` | number | `0.15` | 0 – 0.4, step 0.005 |
| `invert` | enum | `0` | `0` Bright melts first · `1` Dark melts first |

### Wipes & Slides

#### `dissolve`

_No params._

#### `wipeDirectional`

| Prop | Type | Default | Values |
|---|---|---|---|
| `angle` | enum | `0` | `0` Right · `-1.5708` Down · `3.1416` Left · `1.5708` Up · `-0.7854` Diagonal · `-2.3562` Anti-diag |
| `softness` | number | `0.05` | 0 – 0.4, step 0.005 |

#### `slide`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[-1, 0]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up |
| `feather` | number | `0.015` | 0 – 0.4, step 0.005 |
| `blur` | number | `0` | 0 – 0.1, step 0.005 |

#### `push`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[1, 0]` | `[-1, 0]` Right · `[1, 0]` Left · `[0, 1]` Down · `[0, -1]` Up |

#### `split`

| Prop | Type | Default | Values |
|---|---|---|---|
| `axis` | enum | `0` | `0` Horizontal · `1` Vertical |
| `mode` | enum | `0` | `0` Open · `1` Close |
| `softness` | number | `0.01` | 0 – 0.4, step 0.005 |

#### `clockWipe`

| Prop | Type | Default | Values |
|---|---|---|---|
| `startAngle` | number | `-1.5708` | -3.1416 – 3.1416, step 0.01 |
| `direction` | enum | `1` | `1` Clockwise · `-1` Counter-clockwise |
| `softness` | number | `0.02` | 0 – 0.4, step 0.005 |

#### `radialReveal`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `softness` | number | `0.05` | 0 – 0.4, step 0.005 |

#### `irisZoom`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `width` | number | `0.08` | 0 – 1, step 0.05 |
| `scale` | number | `8` | 0.5 – 24, step 0.05 |

#### `shapeReveal`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `sides` | enum | `6` | `3` Triangle · `4` Diamond · `5` Pentagon · `6` Hexagon · `8` Octagon · `12` Dodecagon · `32` Circle |
| `rotation` | number | `0` | -6.2832 – 6.2832, step 0.01 |
| `softness` | number | `0.05` | 0 – 0.4, step 0.005 |

#### `gridReveal`

| Prop | Type | Default | Values |
|---|---|---|---|
| `count` | number | `8` | 3 – 24, step 1 |
| `stagger` | number | `0.7` | 0 – 1, step 0.01 |
| `pattern` | enum | `1` | `0` Sequential · `1` Radial · `2` Random |

### Distort & Warp

#### `warpZoom`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `strength` | number | `1` | 0 – 3, step 0.01 |
| `rotation` | number | `1` | -6.2832 – 6.2832, step 0.01 |
| `blur` | number | `0.02` | 0 – 0.4, step 0.005 |

#### `crossZoom`

| Prop | Type | Default | Values |
|---|---|---|---|
| `strength` | number | `1.2` | 0 – 3.6, step 0.01 |
| `blur` | number | `0.04` | 0 – 0.4, step 0.005 |

#### `directionalWarp`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[-1, 1]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up · `[1, -1]` Diagonal · `[-1, -1]` Anti-diag |
| `smoothness` | number | `0.5` | 0 – 1, step 0.01 |

#### `swirl`

| Prop | Type | Default | Values |
|---|---|---|---|
| `radius` | number | `1` | 0 – 3, step 0.1 |
| `strength` | number | `25.13` | 0 – 75.39, step 0.01 |

#### `flowWarp`

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.4` | 0 – 1.5, step 0.01 |
| `angle1` | number | `0.7854` | -3.1416 – 3.1416, step 0.01 |
| `angle2` | number | `-2.3562` | -3.1416 – 3.1416, step 0.01 |

#### `ripple`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `amplitude` | number | `0.03` | 0 – 1.5, step 0.01 |
| `frequency` | number | `6` | 0 – 24, step 1 |
| `speed` | number | `8` | 0 – 24, step 0.05 |

#### `rippleWave`

| Prop | Type | Default | Values |
|---|---|---|---|
| `amplitude` | number | `0.1` | 0 – 1.5, step 0.01 |
| `source` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |

#### `shockwave`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `thickness` | number | `0.15` | 0 – 1, step 0.01 |
| `strength` | number | `0.04` | 0 – 1.5, step 0.01 |

#### `gravityPull`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `intensity` | number | `0.15` | 0 – 1.5, step 0.01 |

#### `portalDive`

| Prop | Type | Default | Values |
|---|---|---|---|
| `twist` | number | `3.1416` | -6.2832 – 6.2832, step 0.01 |
| `depth` | number | `1` | 0 – 3, step 0.05 |
| `reflection` | number | `0` | 0 – 1, step 0.01 |

#### `singularity`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |

#### `wind`

| Prop | Type | Default | Values |
|---|---|---|---|
| `size` | number | `0.2` | 0 – 1, step 0.01 |
| `direction` | vec2 | `[1, 0]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up · `[1, -1]` Diagonal · `[-1, -1]` Anti-diag |

#### `linearBlur`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[1, 0]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up · `[1, -1]` Diagonal · `[-1, -1]` Anti-diag |
| `intensity` | number | `0.1` | 0 – 1.5, step 0.01 |

#### `tangentMotionBlur`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[1, 0]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up · `[1, -1]` Diagonal · `[-1, -1]` Anti-diag |
| `intensity` | number | `0.08` | 0 – 1.5, step 0.01 |
| `softness` | number | `0.2` | 0 – 0.4, step 0.005 |

### Glitch & Noise

#### `glitch`

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.6` | 0 – 1.8, step 0.01 |
| `chroma` | number | `0.02` | 0 – 0.05, step 0.002 |
| `blocks` | number | `30` | 0 – 90, step 1 |

#### `noiseDissolve`

| Prop | Type | Default | Values |
|---|---|---|---|
| `scale` | number | `20` | 0.5 – 60, step 0.05 |
| `softness` | number | `0.05` | 0 – 0.4, step 0.005 |

#### `pixelate`

| Prop | Type | Default | Values |
|---|---|---|---|
| `maxBlockSize` | number | `40` | 0 – 120, step 0.05 |

#### `mosaic`

| Prop | Type | Default | Values |
|---|---|---|---|
| `count` | number | `14` | 3 – 24, step 1 |
| `jitter` | number | `0.08` | 0 – 1, step 0.01 |
| `stagger` | number | `0.4` | 0 – 1, step 0.01 |

#### `filmGrain`

| Prop | Type | Default | Values |
|---|---|---|---|
| `grain` | number | `1` | 0 – 3, step 0.1 |

#### `crosshatch`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `threshold` | number | `3` | 3 – 30, step 0.5 |
| `fadeEdge` | number | `0.1` | 0 – 1, step 0.01 |

### Cinematic

#### `dreamy`

_No params._

#### `dreamyZoom`

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.5` | 0 – 1, step 0.01 |

#### `colorPhase`

_No params._

#### `liquidChrome`

| Prop | Type | Default | Values |
|---|---|---|---|
| `shine` | number | `0.9` | 0 – 1, step 0.01 |
| `rim` | number | `0.25` | 0 – 1, step 0.01 |
| `wobble` | number | `0.12` | 0 – 1, step 0.01 |
| `refraction` | number | `0.035` | 0 – 1, step 0.01 |
| `reflection` | number | `0` | 0 – 1, step 0.01 |

### Geometric

#### `kineticBands`

| Prop | Type | Default | Values |
|---|---|---|---|
| `count` | number | `12` | 2 – 24, step 1 |
| `stagger` | number | `0.6` | 0 – 1, step 0.01 |
| `softness` | number | `0.02` | 0 – 0.4, step 0.005 |
| `direction` | vec2 | `[1, 0]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up |

#### `polkaDotsCurtain`

| Prop | Type | Default | Values |
|---|---|---|---|
| `dots` | number | `15` | 1 – 45, step 1 |
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `softness` | number | `0.05` | 0 – 0.4, step 0.005 |

#### `waveStripes`

| Prop | Type | Default | Values |
|---|---|---|---|
| `direction` | vec2 | `[1, 0]` | `[1, 0]` Right · `[-1, 0]` Left · `[0, -1]` Down · `[0, 1]` Up |

#### `pinwheel`

| Prop | Type | Default | Values |
|---|---|---|---|
| `center` | vec2 | `[0.5, 0.5]` | `[0.5, 0.5]` Center · `[0.5, 0.85]` Top · `[0.5, 0.15]` Bottom · `[0.15, 0.5]` Left · `[0.85, 0.5]` Right · `[0.15, 0.85]` TL · `[0.85, 0.85]` TR |
| `spokes` | number | `8` | 0 – 24, step 1 |
| `softness` | number | `0.05` | 0 – 0.4, step 0.005 |

### 3D Mesh

#### `pageCurl`

| Prop | Type | Default | Values |
|---|---|---|---|
| `tilt` | number | `0.12` | 0 – 1, step 0.01 |
| `backColor` | vec3 | `[0.97, 0.96, 0.94]` | `[0.97, 0.96, 0.94]` Paper · `[0.93, 0.86, 0.72]` Parchment · `[0.99, 0.98, 0.92]` Ivory · `[0.86, 0.88, 0.92]` Cool gray · `[0.32, 0.34, 0.4]` Slate |

#### `polygonFlip`

| Prop | Type | Default | Values |
|---|---|---|---|
| `rim` | number | `0.25` | 0 – 1, step 0.01 |

#### `glassShatter`

| Prop | Type | Default | Values |
|---|---|---|---|
| `cells` | number | `14` | 0 – 42, step 1 |
| `reflection` | number | `0` | 0 – 1, step 0.01 |

#### `tileScatter`

| Prop | Type | Default | Values |
|---|---|---|---|
| `scatter` | number | `1` | 0 – 3, step 0.1 |

#### `lenticularFlip`

| Prop | Type | Default | Values |
|---|---|---|---|
| `stripCount` | number | `22` | 3 – 60, step 1 |

<!-- catalog:end -->

## Parameter overrides

Each transition exports its own `defaults` object. Override per render:

```ts
import { pixelate } from "@vysmo/transitions";

runner.render(pixelate, {
  from, to, progress,
  params: { maxBlockSize: 60 }, // typed from pixelate.defaults
});
```

Anything you don't override falls back to the default. Defaults are tuned to look good out of the box.

## Defining your own transition

```ts
import { defineTransition } from "@vysmo/transitions";

export const myFade = defineTransition({
  name: "my-fade",
  defaults: { gamma: 2.2 },
  glsl: `
    vec4 transition(vec2 uv) {
      vec4 a = getFromColor(uv);
      vec4 b = getToColor(uv);
      float p = pow(uProgress, uGamma);
      return mix(a, b, p);
    }
  `,
});

runner.render(myFade, { from, to, progress: 0.5, params: { gamma: 1.8 } });
```

The Runner wraps the GLSL with the standard header (`#version 300 es`, precision, `uFrom` / `uTo` / `uProgress` / `uResolution`, `getFromColor` / `getToColor` helpers) and maps each `defaults` key to a `u<PascalCase>` uniform.

## Transition shape contracts

Every built-in transition clears five non-negotiable invariants. Custom transitions should too:

- **Endpoint correctness.** `progress=0` is pixel-pure `from`; `progress=1` is pixel-pure `to`. Enforced by [`endpoint-correctness.test.ts`](src/__tests__/endpoint-correctness.test.ts).
- **Polish degrades at endpoints.** Visual params (feather, blur, chroma split, displacement) hit zero at both ends — typically scaled by `4 * p * (1 - p)`.
- **No hard cuts.** Every boundary between `from` and `to` is feathered or motion-softened.
- **Full-frame.** Every pixel at every progress samples meaningful content. No black background, no letterboxing.
- **Continuous motion.** No visual freeze at any progress value. Symmetric envelopes don't drive position.

## Source flexibility

`from` / `to` accept any `TextureSource`:

- `HTMLImageElement` (uploaded once — cached)
- `HTMLVideoElement` (re-uploaded each render — animated source)
- `HTMLCanvasElement` / `OffscreenCanvas` (re-uploaded each render)
- `ImageBitmap` (uploaded once — cached)
- `WebGLTexture` (used as-is — bring-your-own GPU data)

Mix freely. Page-curl an image to a video. Crossfade two canvases. Transition between a static logo and a live camera feed.

## Characteristics

- **WebGL2 only.** No WebGL1 fallback.
- **Zero runtime dependencies** except `@vysmo/gl-core` (transitive).
- **SSR-safe at module load.** No DOM access at import — all checks guarded by `typeof X !== "undefined"`.
- **Tree-shakable.** Runner alone is ~4.6 KB gzipped; Runner + 3 typical transitions is ~6.5 KB; full bundle (Runner + all 60) is ~28 KB. Each additional transition adds ~0.4 KB.
- **Endpoint-tested.** Every transition is verified pixel-pure at `progress=0` and `progress=1` in headless Chromium per CI.

## License

MIT.
