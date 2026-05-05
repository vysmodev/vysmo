# @vysmo/transitions

60 WebGL2 transition shaders, defined as plain data. Mesh-based, tree-shakable to the byte, endpoint-correct by construction. One Runner takes any combination of canvas / image / video sources and crossfades, displaces, warps, or curls between them.

[Live demos + parameter playground](https://vysmo.com/transitions) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/transitions
```

For the runner you also need a way to drive the `progress` value from `0` to `1` over time. Anything works — `requestAnimationFrame`, [`@vysmo/animations`](https://www.npmjs.com/package/@vysmo/animations), [`@vysmo/scroll`](https://www.npmjs.com/package/@vysmo/scroll), Motion, GSAP — the library doesn't care.

## Quick start

```ts
import { Runner, crossZoom } from "@vysmo/transitions";

const canvas = document.querySelector("canvas")!;
const runner = new Runner({ canvas });

const from = new Image();
from.src = "/a.jpg";
const to = new Image();
to.src = "/b.jpg";

await Promise.all([from.decode(), to.decode()]);

// Hand-rolled rAF driver — replace with @vysmo/animations or any
// tween library if you prefer:
const start = performance.now();
const tick = (now: number) => {
  const p = Math.min(1, (now - start) / 1200);
  runner.render(crossZoom, { from, to, progress: p });
  if (p < 1) requestAnimationFrame(tick);
};
requestAnimationFrame(tick);
```

That's the entire shape. `runner.render()` is one draw call per frame, regardless of the transition.

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

Every built-in transition with its parameters, defaults, and usable ranges. Ranges mirror the playground sliders — passing a number outside the range is allowed but typically degrades the visual.

### Light & Optics

#### `filmBurn` · `film-burn`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `scale` | number | `6` | 0.5 – 18 | 0.05 |
| `edgeWidth` | number | `0.05` | 0 – 1 | 0.05 |
| `chroma` | number | `0` | 0 – 1 | 0.01 |
| `flameColor` | vec3 preset | `Ember [1.6, 0.7, 0.15]` | Ember · Molten · Deep red · Acid · Ice blue · Electric · Violet | — |

#### `lightLeak` · `light-leak`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `Right [1, 0]` | Right · Left · Down · Up · Diagonal · Anti-diag | — |
| `color` | vec3 preset | `Sunset [1, 0.85, 0.55]` | Sunset · Magic hour · Daylight · Cyan · Magenta | — |
| `bandWidth` | number | `0.2` | 0 – 1 | 0.05 |
| `intensity` | number | `1` | 0 – 3 | 0.01 |

#### `heatHaze` · `heat-haze`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `intensity` | number | `0.04` | 0 – 1.5 | 0.01 |
| `frequency` | number | `14` | 0 – 56 | 1 |
| `flow` | number | `5` | 0 – 15 | 1 |

#### `bloomReveal` · `bloom-reveal`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `scale` | number | `5` | 0.5 – 15 | 0.05 |
| `softness` | number | `0.08` | 0 – 0.4 | 0.005 |
| `threshold` | number | `0.55` | 0 – 1 | 0.01 |
| `intensity` | number | `3` | 0 – 9 | 0.01 |

#### `directionalBurn` · `directional-burn`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `Right [1, 0]` | Right · Left · Down · Up · Diagonal · Anti-diag | — |
| `scale` | number | `10` | 0.5 – 30 | 0.05 |
| `edgeWidth` | number | `0.035` | 0 – 1 | 0.05 |
| `flameColor` | vec3 preset | `Ember [1.6, 0.7, 0.15]` | Ember · Molten · Deep red · Acid · Ice blue · Electric · Violet | — |

#### `prismSplit` · `prism-split`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `Right [1, 0]` | Right · Left · Down · Up · Diagonal · Anti-diag | — |
| `intensity` | number | `0.04` | 0 – 0.07 | 0.005 |
| `softness` | number | `0.2` | 0 – 0.4 | 0.005 |

#### `emberScatter` · `ember-scatter`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `count` | number | `5` | 0 – 24 | 1 |
| `scale` | number | `8` | 0.5 – 24 | 0.05 |
| `edgeWidth` | number | `0.04` | 0 – 1 | 0.05 |
| `stagger` | number | `0.35` | 0 – 1 | 0.01 |
| `flameColor` | vec3 preset | `Ember [1.6, 0.7, 0.15]` | Ember · Molten · Deep red · Acid · Ice blue · Electric · Violet | — |

#### `godRaysReveal` · `god-rays-reveal`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `scale` | number | `5` | 0.5 – 15 | 0.05 |
| `softness` | number | `0.08` | 0 – 0.4 | 0.005 |
| `threshold` | number | `0.45` | 0 – 1 | 0.01 |
| `intensity` | number | `1.6` | 0 – 4.8 | 0.01 |
| `decay` | number | `0.92` | 0.5 – 1 | 0.005 |
| `source` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |

#### `chromaticPulse` · `chromatic-pulse`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `intensity` | number | `0.6` | 0 – 1.8 | 0.01 |

### Fluid & Ink

#### `paintBleed` · `paint-bleed`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `Right [-1, 0]` | Right · Left · Down · Up · Diagonal · Anti-diag | — |
| `scale` | number | `10` | 0.5 – 30 | 0.05 |
| `softness` | number | `0.02` | 0 – 0.4 | 0.005 |
| `noiseStrength` | number | `0.35` | 0 – 1.5 | 0.01 |

#### `inkDiffuse` · `ink-diffuse`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `scale` | number | `7` | 0.5 – 21 | 0.05 |
| `softness` | number | `0.08` | 0 – 0.4 | 0.005 |

#### `inkBloom` · `ink-bloom`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `scale` | number | `5` | 0.5 – 15 | 0.05 |
| `edgeWidth` | number | `0.07` | 0 – 1 | 0.05 |
| `bloomWidth` | number | `0.12` | 0 – 1 | 0.05 |
| `inkColor` | vec3 preset | `Indigo [0.25, 0.08, 0.45]` | Indigo · Sumi · Crimson · Forest · Sapphire | — |

#### `fluidFlow` · `fluid-flow`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `strength` | number | `0.12` | 0 – 1.5 | 0.01 |
| `scale` | number | `3` | 0.5 – 9 | 0.05 |

#### `liquidMorph` · `liquid-morph`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `scale` | number | `3` | 0.5 – 9 | 0.05 |
| `strength` | number | `0.1` | 0 – 1.5 | 0.01 |
| `flow` | number | `3` | 0 – 9 | 0.1 |

#### `dripWipe` · `drip-wipe`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `Left [-1, 0]` | Right · Left · Down · Up | — |
| `width` | number | `0.5` | 0 – 1.5 | 0.05 |
| `scaleX` | number | `40` | 0.5 – 120 | 0.05 |
| `scaleY` | number | `40` | 0.5 – 120 | 0.05 |

#### `smolderingEdge` · `smoldering-edge`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `[1, 1]` | Right · Left · Down · Up · Diagonal · Anti-diag | — |
| `scale` | number | `3` | 0.5 – 9 | 0.05 |
| `edgeWidth` | number | `0.04` | 0 – 1 | 0.05 |
| `trailLength` | number | `0.18` | 0 – 1 | 0.01 |
| `emberColor` | vec3 preset | `Ember [1.4, 0.5, 0.1]` | Ember · Molten · Deep red · Acid | — |

#### `luminaMelt` · `lumina-melt`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `softness` | number | `0.15` | 0 – 0.4 | 0.005 |
| `invert` | enum | `Bright melts first (0)` | Bright melts first (0) · Dark melts first (1) | — |

### Wipes & Slides

#### `dissolve` · `dissolve`

_No params._

#### `wipeDirectional` · `wipe-directional`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `angle` | enum | `Right (0)` | Right (0) · Down (-1.5708) · Left (3.1416) · Up (1.5708) · Diagonal (-0.7854) · Anti-diag (-2.3562) | — |
| `softness` | number | `0.05` | 0 – 0.4 | 0.005 |

#### `slide` · `slide`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `Left [-1, 0]` | Right · Left · Down · Up | — |
| `feather` | number | `0.015` | 0 – 0.4 | 0.005 |
| `blur` | number | `0` | 0 – 0.1 | 0.005 |

#### `push` · `push`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `Left [1, 0]` | Right · Left · Down · Up | — |

#### `split` · `split`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `axis` | enum | `Horizontal (0)` | Horizontal (0) · Vertical (1) | — |
| `mode` | enum | `Open (0)` | Open (0) · Close (1) | — |
| `softness` | number | `0.01` | 0 – 0.4 | 0.005 |

#### `clockWipe` · `clock-wipe`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `startAngle` | number | `-1.5708` | -3.1416 – 3.1416 | 0.01 |
| `direction` | enum | `Clockwise (1)` | Clockwise (1) · Counter-clockwise (-1) | — |
| `softness` | number | `0.02` | 0 – 0.4 | 0.005 |

#### `radialReveal` · `radial-reveal`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `softness` | number | `0.05` | 0 – 0.4 | 0.005 |

#### `irisZoom` · `iris-zoom`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `width` | number | `0.08` | 0 – 1 | 0.05 |
| `scale` | number | `8` | 0.5 – 24 | 0.05 |

#### `shapeReveal` · `shape-reveal`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `sides` | enum | `Hexagon (6)` | Triangle (3) · Diamond (4) · Pentagon (5) · Hexagon (6) · Octagon (8) · Dodecagon (12) · Circle (32) | — |
| `rotation` | number | `0` | -6.2832 – 6.2832 | 0.01 |
| `softness` | number | `0.05` | 0 – 0.4 | 0.005 |

#### `gridReveal` · `grid-reveal`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `count` | number | `8` | 3 – 24 | 1 |
| `stagger` | number | `0.7` | 0 – 1 | 0.01 |
| `pattern` | enum | `Radial (1)` | Sequential (0) · Radial (1) · Random (2) | — |

### Distort & Warp

#### `warpZoom` · `warp-zoom`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `strength` | number | `1` | 0 – 3 | 0.01 |
| `rotation` | number | `1` | -6.2832 – 6.2832 | 0.01 |
| `blur` | number | `0.02` | 0 – 0.4 | 0.005 |

#### `crossZoom` · `cross-zoom`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `strength` | number | `1.2` | 0 – 3.6 | 0.01 |
| `blur` | number | `0.04` | 0 – 0.4 | 0.005 |

#### `directionalWarp` · `directional-warp`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `[-1, 1]` | Right · Left · Down · Up · Diagonal · Anti-diag | — |
| `smoothness` | number | `0.5` | 0 – 1 | 0.01 |

#### `swirl` · `swirl`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `radius` | number | `1` | 0 – 3 | 0.1 |
| `strength` | number | `25.13` | 0 – 75.39 | 0.01 |

#### `flowWarp` · `flow-warp`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `intensity` | number | `0.4` | 0 – 1.5 | 0.01 |
| `angle1` | number | `0.7854` | -3.1416 – 3.1416 | 0.01 |
| `angle2` | number | `-2.3562` | -3.1416 – 3.1416 | 0.01 |

#### `ripple` · `ripple`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `amplitude` | number | `0.03` | 0 – 1.5 | 0.01 |
| `frequency` | number | `6` | 0 – 24 | 1 |
| `speed` | number | `8` | 0 – 24 | 0.05 |

#### `rippleWave` · `ripple-wave`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `amplitude` | number | `0.1` | 0 – 1.5 | 0.01 |
| `source` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |

#### `shockwave` · `shockwave`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `thickness` | number | `0.15` | 0 – 1 | 0.01 |
| `strength` | number | `0.04` | 0 – 1.5 | 0.01 |

#### `gravityPull` · `gravity-pull`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `intensity` | number | `0.15` | 0 – 1.5 | 0.01 |

#### `portalDive` · `portal-dive`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `twist` | number | `3.1416` | -6.2832 – 6.2832 | 0.01 |
| `depth` | number | `1` | 0 – 3 | 0.05 |
| `reflection` | number | `0` | 0 – 1 | 0.01 |

#### `singularity` · `singularity`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |

#### `wind` · `wind`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `size` | number | `0.2` | 0 – 1 | 0.01 |
| `direction` | vec2 preset | `Right [1, 0]` | Right · Left · Down · Up · Diagonal · Anti-diag | — |

#### `linearBlur` · `linear-blur`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `Right [1, 0]` | Right · Left · Down · Up · Diagonal · Anti-diag | — |
| `intensity` | number | `0.1` | 0 – 1.5 | 0.01 |

#### `tangentMotionBlur` · `tangent-motion-blur`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `Right [1, 0]` | Right · Left · Down · Up · Diagonal · Anti-diag | — |
| `intensity` | number | `0.08` | 0 – 1.5 | 0.01 |
| `softness` | number | `0.2` | 0 – 0.4 | 0.005 |

### Glitch & Noise

#### `glitch` · `glitch`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `intensity` | number | `0.6` | 0 – 1.8 | 0.01 |
| `chroma` | number | `0.02` | 0 – 0.05 | 0.002 |
| `blocks` | number | `30` | 0 – 90 | 1 |

#### `noiseDissolve` · `noise-dissolve`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `scale` | number | `20` | 0.5 – 60 | 0.05 |
| `softness` | number | `0.05` | 0 – 0.4 | 0.005 |

#### `pixelate` · `pixelate`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `maxBlockSize` | number | `40` | 0 – 120 | 0.05 |

#### `mosaic` · `mosaic`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `count` | number | `14` | 3 – 24 | 1 |
| `jitter` | number | `0.08` | 0 – 1 | 0.01 |
| `stagger` | number | `0.4` | 0 – 1 | 0.01 |

#### `filmGrain` · `film-grain`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `grain` | number | `1` | 0 – 3 | 0.1 |

#### `crosshatch` · `crosshatch`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `threshold` | number | `3` | 3 – 30 | 0.5 |
| `fadeEdge` | number | `0.1` | 0 – 1 | 0.01 |

### Cinematic

#### `dreamy` · `dreamy`

_No params._

#### `dreamyZoom` · `dreamy-zoom`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `intensity` | number | `0.5` | 0 – 1 | 0.01 |

#### `colorPhase` · `color-phase`

_No params._

#### `liquidChrome` · `liquid-chrome`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `shine` | number | `0.9` | 0 – 1 | 0.01 |
| `rim` | number | `0.25` | 0 – 1 | 0.01 |
| `wobble` | number | `0.12` | 0 – 1 | 0.01 |
| `refraction` | number | `0.035` | 0 – 1 | 0.01 |
| `reflection` | number | `0` | 0 – 1 | 0.01 |

### Geometric

#### `kineticBands` · `kinetic-bands`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `count` | number | `12` | 2 – 24 | 1 |
| `stagger` | number | `0.6` | 0 – 1 | 0.01 |
| `softness` | number | `0.02` | 0 – 0.4 | 0.005 |
| `direction` | vec2 preset | `Right [1, 0]` | Right · Left · Down · Up | — |

#### `polkaDotsCurtain` · `polka-dots-curtain`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `dots` | number | `15` | 1 – 45 | 1 |
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `softness` | number | `0.05` | 0 – 0.4 | 0.005 |

#### `waveStripes` · `wave-stripes`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `direction` | vec2 preset | `Right [1, 0]` | Right · Left · Down · Up | — |

#### `pinwheel` · `pinwheel`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `center` | vec2 preset | `Center [0.5, 0.5]` | Center · Top · Bottom · Left · Right · TL · TR | — |
| `spokes` | number | `8` | 0 – 24 | 1 |
| `softness` | number | `0.05` | 0 – 0.4 | 0.005 |

### 3D Mesh

#### `pageCurl` · `page-curl`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `tilt` | number | `0.12` | 0 – 1 | 0.01 |
| `backColor` | vec3 preset | `Paper [0.97, 0.96, 0.94]` | Paper · Parchment · Ivory · Cool gray · Slate | — |

#### `polygonFlip` · `polygon-flip`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `rim` | number | `0.25` | 0 – 1 | 0.01 |

#### `glassShatter` · `glass-shatter`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `cells` | number | `14` | 0 – 42 | 1 |
| `reflection` | number | `0` | 0 – 1 | 0.01 |

#### `tileScatter` · `tile-scatter`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `scatter` | number | `1` | 0 – 3 | 0.1 |

#### `lenticularFlip` · `lenticular-flip`

| Param | Type | Default | Range / Options | Step |
|---|---|---|---|---|
| `stripCount` | number | `22` | 3 – 60 | 1 |

<!-- catalog:end -->

## Parameter overrides

Each transition exports its own `defaults` object. Override per render:

```ts
runner.render(pixelate, {
  from, to, progress,
  params: { steps: 60, brightness: 1.4 }, // typed from pixelate.defaults
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
