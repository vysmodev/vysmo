# @vysmo/transitions

65 WebGL2 transition shaders, defined as plain data. Mesh-based, tree-shakable to the byte, endpoint-correct by construction. One Runner takes any combination of canvas / image / video sources and crossfades, displaces, warps, or curls between them.

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
// → Runner + all 65 transitions, ~28 KB gzipped
```

`sideEffects: false`, no CSS, no global state.

## Built-in transitions

Fragment-only (default pipeline): `dissolve`, `wipeDirectional`, `slide`, `radialReveal`, `crossZoom`, `glitch`, `noiseDissolve`, `clockWipe`, `ripple`, `pixelate`, `kineticBands`, `lightLeak`, `liquidMorph`, `gridReveal`, `warpZoom`, `chromaticPulse`, `push`, `shapeReveal`, `paintBleed`, `shockwave`, `swirl`, `split`, `directionalWarp`, `crossWarp`, `wind`, `linearBlur`, `luminaMelt`, `pinwheel`, `dreamy`, `tangentMotionBlur`, `colourDistance`, `colorPhase`, `filmBurn`, `mosaic`, `flyEye`, `emberScatter`, `directionalBurn`, `inkBloom`, `plasmaPulse`, `smolderingEdge`, `windowSlice`, `polkaDotsCurtain`, `crosshatch`, `dreamyZoom`, `heatHaze`, `prismSplit`, `irisZoom`, `gravityPull`, `waveStripes`, `flowWarp`, `dripWipe`, `portalDive`, `liquidChrome`, `glassShatter`, `bloomReveal`, `godRaysReveal`, `fluidFlow`, `filmGrain`, `singularity`, `rippleWave`, `tileScatter`.

Multi-pass (auto-allocates ping-pong framebuffers): `inkDiffuse`.

Mesh (true vertex geometry — real 3D flips, page curls): `lenticularFlip`, `particleAssemble`, `polygonFlip`, `pageCurl`.

Each transition is a `Transition<P>` — the parameter type `P` is inferred from `defaults`, so overrides are typed without any hand-typing.

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
- **Tree-shakable.** Runner alone is ~4.6 KB gzipped; Runner + 3 typical transitions is ~6.5 KB; full bundle (Runner + all 65) is ~28 KB. Each additional transition adds ~0.4 KB.
- **Endpoint-tested.** 144 endpoint-correctness tests run in headless Chromium per CI.

## License

MIT.
