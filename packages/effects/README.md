# @vysmo/effects

30 WebGL2 visual filter primitives — blur, bloom, glow, color grade, sharpen, halftone, tilt-shift, scanlines, lens distortion, oil paint, wave, swirl, motion blur, VHS, datamosh, ASCII, dither, gradient map and more. One Runner, one source, one render call. Multi-pass effects (bloom, glow) auto-allocate HDR ping-pong targets.

[Live demos + parameter playground](https://vysmo.com/effects) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/effects
```

## Quick start

Single-pass effect:

```ts
import { Runner, blur } from "@vysmo/effects";

const runner = new Runner({ canvas });
const image = document.querySelector("img")!;
await image.decode();

runner.render(blur, {
  source: image,
  params: { radius: 12 },
});
```

Multi-pass HDR effect — same shape, no extra setup:

```ts
import { Runner, bloom } from "@vysmo/effects";

const runner = new Runner({ canvas });
const image = document.querySelector("img")!;
await image.decode();

// Bloom auto-allocates ping-pong RGBA16F targets internally
// so highlights survive the bright-pass / blur / composite chain.
runner.render(bloom, {
  source: image,
  params: { intensity: 1.2, threshold: 0.7 },
});
```

Author your own — same `defineX` pattern as `@vysmo/transitions`:

```ts
import { defineEffect, Runner } from "@vysmo/effects";

const tint = defineEffect({
  name: "tint",
  defaults: { strength: 0.5, color: [1, 0.4, 0.8] as const },
  glsl: `
uniform float uStrength;
uniform vec3 uColor;
vec4 effect(vec2 uv) {
  vec4 src = getSource(uv);
  return vec4(mix(src.rgb, uColor, uStrength), src.a);
}`,
});

new Runner({ canvas }).render(tint, { source: image });
```

`runner.render()` is one draw call (or one pass per multi-pass effect like bloom). Re-render with new params or sources whenever you want a new frame.

## Tree-shake by what you import

Every effect is its own module. Import only the ones you ship:

```ts
import { Runner, blur, vignette, grain } from "@vysmo/effects";
// → Runner + 3 effects, ~5 KB gzipped
```

vs

```ts
import * as effects from "@vysmo/effects";
// → Runner + all 30 effects, ~9 KB gzipped
```

`sideEffects: false`, no CSS, no global state.

## Catalog

<!-- catalog:start -->

Every shipped effect with its parameters, defaults, and accepted values. The catalog mirrors the playground at [vysmo.com/effects/docs#catalog](https://vysmo.com/effects/docs#catalog). Categorisation tracks fragment-shader pass count — single-pass, two- and three-pass separable Gaussian, multi-pass HDR.

### Single-pass

#### `vignette`

Radial corner darkening. Identity at intensity 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.6` | 0 – 1, step 0.01 |
| `radius` | number | `0.5` | 0 – 1, step 0.01 |
| `softness` | number | `0.4` | 0 – 1, step 0.01 |
| `color` | vec3 | `[0, 0, 0]` | vec3 (read-only in playground) |

#### `grain`

Procedural film-grain overlay. Identity at intensity 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.1` | 0 – 0.6, step 0.005 |
| `size` | number | `1` | 1 – 8, step 0.5 |
| `seed` | number | `0` | 0 – 64, step 1 |

#### `chromaticAberration`

RGB channel offset along an axis. Identity at offset 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `offset` | number | `8` | 0 – 24, step 0.5 |
| `direction` | vec2 | `[1, 0]` | vec2 (read-only in playground) |

#### `colorGrade`

Brightness, contrast, saturation, hue. Pixel-pure identity at the defaults.

| Prop | Type | Default | Values |
|---|---|---|---|
| `brightness` | number | `0` | -0.5 – 0.5, step 0.01 |
| `contrast` | number | `1` | 0 – 2, step 0.01 |
| `saturation` | number | `1` | 0 – 2, step 0.01 |
| `hue` | number | `0` | 0 – 6.28, step 0.01 |

#### `pixelate`

Mosaic / chunky-pixel quantisation. Identity at size ≤ 1.

| Prop | Type | Default | Values |
|---|---|---|---|
| `size` | number | `8` | 1 – 64, step 0.5 |

#### `sharpen`

Unsharp-mask convolution. Identity at amount 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `amount` | number | `0.6` | 0 – 3, step 0.01 |
| `radius` | number | `1` | 0.5 – 4, step 0.1 |

#### `threshold`

Luma-based binary threshold with optional softness.

| Prop | Type | Default | Values |
|---|---|---|---|
| `cutoff` | number | `0.5` | 0 – 1, step 0.01 |
| `softness` | number | `0` | 0 – 0.5, step 0.005 |
| `lowColor` | vec3 | `[0, 0, 0]` | vec3 (read-only in playground) |
| `highColor` | vec3 | `[1, 1, 1]` | vec3 (read-only in playground) |

#### `duotone`

Luma-driven gradient mapping between two colours.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `1` | 0 – 1, step 0.01 |
| `shadow` | vec3 | `[0.13, 0.18, 0.55]` | vec3 (read-only in playground) |
| `highlight` | vec3 | `[0.96, 0.78, 0.34]` | vec3 (read-only in playground) |

#### `posterize`

Per-channel colour quantisation. Identity at levels ≥ 256.

| Prop | Type | Default | Values |
|---|---|---|---|
| `levels` | number | `4` | 2 – 12, step 1 |

#### `edgeDetect`

3×3 Sobel filter on luma. Identity at intensity 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `1` | 0 – 1, step 0.01 |
| `radius` | number | `1` | 0.5 – 3, step 0.1 |
| `color` | vec3 | `[1, 1, 1]` | vec3 (read-only in playground) |

#### `halftone`

Print-style dot pattern; dot radius scales with luma.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `1` | 0 – 1, step 0.01 |
| `dotSize` | number | `8` | 3 – 32, step 0.5 |
| `angle` | number | `0.785` | 0 – 1.57, step 0.01 |
| `inkColor` | vec3 | `[0, 0, 0]` | vec3 (read-only in playground) |
| `paperColor` | vec3 | `[1, 1, 1]` | vec3 (read-only in playground) |

#### `scanlines`

CRT-style horizontal banding. Identity at intensity 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.4` | 0 – 1, step 0.01 |
| `density` | number | `2` | 1 – 16, step 0.5 |
| `offset` | number | `0` | 0 – 6.28, step 0.01 |

#### `lensDistortion`

Barrel (positive) / pincushion (negative). Identity at strength 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `strength` | number | `0.3` | -1 – 1, step 0.01 |

#### `oilPaint`

Simplified Kuwahara filter — painterly edge-preserving smoothing.

| Prop | Type | Default | Values |
|---|---|---|---|
| `radius` | number | `3` | 0 – 6, step 0.5 |

#### `wave`

Sinusoidal UV displacement along an axis. Identity at amplitude 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `amplitude` | number | `8` | 0 – 32, step 0.5 |
| `frequency` | number | `4` | 0 – 12, step 0.1 |
| `axis` | vec2 | `[0, 1]` | vec2 (read-only in playground) |
| `phase` | number | `0` | 0 – 6.28, step 0.01 |

#### `bulge`

Radial pinch / bulge with quadratic falloff. Identity at strength 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `strength` | number | `0.5` | -1 – 1, step 0.01 |
| `centre` | vec2 | `[0.5, 0.5]` | vec2 (read-only in playground) |
| `radius` | number | `0.5` | 0.05 – 1, step 0.01 |

#### `swirl`

Angular UV rotation falling off with radial distance. Identity at angle 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `angle` | number | `1.5` | -6.28 – 6.28, step 0.05 |
| `centre` | vec2 | `[0.5, 0.5]` | vec2 (read-only in playground) |
| `radius` | number | `0.5` | 0.05 – 1, step 0.01 |

#### `motionBlur`

Directional 16-tap smear along a vector. Identity at distance 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `distance` | number | `16` | 0 – 64, step 0.5 |
| `direction` | vec2 | `[1, 0]` | vec2 (read-only in playground) |

#### `radialBlur`

Zoom-streak blur sampled along the centre→pixel ray.

| Prop | Type | Default | Values |
|---|---|---|---|
| `strength` | number | `0.1` | 0 – 1, step 0.01 |
| `centre` | vec2 | `[0.5, 0.5]` | vec2 (read-only in playground) |

#### `rgbShift`

Per-row hashed channel offsets. Glitchy sibling of chromatic aberration.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.5` | 0 – 1, step 0.01 |
| `seed` | number | `0` | 0 – 100, step 1 |

#### `vhs`

Combo: jitter + chromatic offset + scanlines + soft blur. One knob.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.6` | 0 – 1, step 0.01 |
| `seed` | number | `0` | 0 – 100, step 1 |

#### `pixelSort`

Cheap procedural fake — bright pixels stretched into horizontal bars.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.6` | 0 – 1, step 0.01 |
| `threshold` | number | `0.5` | 0 – 1, step 0.01 |

#### `datamosh`

Block-snapped noise warp mimicking codec corruption.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.5` | 0 – 1, step 0.01 |
| `seed` | number | `0` | 0 – 100, step 1 |

#### `ascii`

Quantise the source into a grid of glyphs picked by cell luminance — sparse to dense, source colour preserved as the ink.

| Prop | Type | Default | Values |
|---|---|---|---|
| `size` | number | `12` | 4 – 32, step 1 |
| `intensity` | number | `1` | 0 – 1, step 0.01 |

#### `dither`

Bayer-matrix ordered dither + per-channel quantisation.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `1` | 0 – 1, step 0.01 |
| `levels` | number | `4` | 2 – 32, step 1 |

#### `gradientMap`

Three-stop luma gradient — duotone with a midtone hinge.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `1` | 0 – 1, step 0.01 |
| `shadow` | vec3 | `[0.05, 0.05, 0.15]` | vec3 (read-only in playground) |
| `midtone` | vec3 | `[0.65, 0.18, 0.55]` | vec3 (read-only in playground) |
| `highlight` | vec3 | `[1, 0.85, 0.45]` | vec3 (read-only in playground) |

### Two-pass (separable Gaussian)

#### `blur`

Separable Gaussian blur. Two passes, identity at radius 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `radius` | number | `16` | 0 – 32, step 0.5 |

### Three-pass (separable Gaussian + composite)

#### `tiltShift`

Selective separable blur with a rotatable in-focus band. Identity at blurRadius 0.

| Prop | Type | Default | Values |
|---|---|---|---|
| `focus` | vec2 | `[0.5, 0.5]` | vec2 (read-only in playground) |
| `angle` | number | `0` | 0 – 3.14, step 0.01 |
| `focusWidth` | number | `0.25` | 0.05 – 0.8, step 0.01 |
| `blurRadius` | number | `16` | 0 – 32, step 0.5 |

### Multi-pass HDR

#### `bloom`

Bright-highlight halo via 4-pass HDR ping-pong. Additive composite.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `1` | 0 – 2, step 0.01 |
| `threshold` | number | `0.8` | 0 – 1, step 0.01 |
| `softness` | number | `0.1` | 0 – 0.5, step 0.01 |
| `radius` | number | `32` | 1 – 64, step 1 |

#### `glow`

Wider, softer, screen-blended sibling of bloom. Tintable halo.

| Prop | Type | Default | Values |
|---|---|---|---|
| `intensity` | number | `0.7` | 0 – 2, step 0.01 |
| `threshold` | number | `0.3` | 0 – 1, step 0.01 |
| `softness` | number | `0.2` | 0 – 0.5, step 0.01 |
| `radius` | number | `48` | 1 – 96, step 1 |
| `tint` | vec3 | `[1, 1, 1]` | vec3 (read-only in playground) |

<!-- catalog:end -->

Each effect is a typed `Effect<P>` — the parameter type `P` is inferred from `defaults`, so overrides are typed without any hand-typing.

## Parameter overrides

Each effect exports its own `defaults` object. Override per render:

```ts
runner.render(bloom, {
  source: image,
  params: { threshold: 0.7, intensity: 1.6, radius: 12 }, // typed from bloom.defaults
});
```

Anything you don't override falls back to the default. Defaults are tuned to look good out of the box.

## Defining your own effect

```ts
import { defineEffect } from "@vysmo/effects";

export const sepia = defineEffect({
  name: "sepia",
  defaults: { strength: 1 },
  glsl: `
    vec4 effect(vec2 uv) {
      vec4 c = getSource(uv);
      vec3 sepia = vec3(
        dot(c.rgb, vec3(0.393, 0.769, 0.189)),
        dot(c.rgb, vec3(0.349, 0.686, 0.168)),
        dot(c.rgb, vec3(0.272, 0.534, 0.131))
      );
      return vec4(mix(c.rgb, sepia, uStrength), c.a);
    }
  `,
});

runner.render(sepia, { source: image, params: { strength: 0.6 } });
```

The Runner wraps the GLSL with the standard header (`#version 300 es`, precision, `uSource` / `uResolution`, `getSource` helper) and maps each `defaults` key to a `u<PascalCase>` uniform.

For multi-pass effects, set `passes > 1` and read prior passes with `getPrevious(uv)`. For HDR intermediates, set `hdr: true` (requires `EXT_color_buffer_float`; falls back silently when unavailable).

## Source flexibility

`args.source` accepts any `TextureSource`:

- `HTMLImageElement` (uploaded once — cached)
- `HTMLVideoElement` (re-uploaded each render — animated)
- `HTMLCanvasElement` / `OffscreenCanvas` (re-uploaded each render)
- `ImageBitmap` (uploaded once — cached)
- `WebGLTexture` (used as-is — bring-your-own GPU data)

## Composing effects

Effects don't chain through one Runner — each `render()` writes to the canvas. To stack effects, render the first to a canvas, feed it as the source to the next, repeat. Or write a single `defineEffect` that does the composition in one shader (faster).

## Characteristics

- **WebGL2 only.** No WebGL1 fallback.
- **Zero runtime dependencies** except `@vysmo/gl-core` (transitive).
- **SSR-safe at module load.** No DOM access at import — all checks guarded by `typeof X !== "undefined"`.
- **Tree-shakable.** Importing 1–3 effects ships ~3–5 KB gzipped; the full bundle is ~9 KB.

## License

MIT.
