# @vysmo/effects

30 WebGL2 visual filter primitives — blur, bloom, glow, color grade, sharpen, halftone, tilt-shift, scanlines, lens distortion, oil paint, wave, swirl, motion blur, VHS, datamosh, kaleidoscope, dither, gradient map and more. One Runner, one source, one render call. Multi-pass effects (bloom, glow) auto-allocate HDR ping-pong targets.

[Live demos + parameter playground](https://vysmo.com/effects) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/effects
```

## Quick start

```ts
import { Runner, blur } from "@vysmo/effects";

const canvas = document.querySelector("canvas")!;
const runner = new Runner({ canvas });

const image = new Image();
image.src = "/photo.jpg";
await image.decode();

runner.render(blur, { source: image, params: { radius: 12 } });
```

That's the entire shape. `runner.render()` is one draw call (or one pass per multi-pass effect like bloom). Re-render with new params or sources whenever you want a new frame.

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

## Built-in effects

Single-pass: `blur`, `vignette`, `grain`, `chromaticAberration`, `colorGrade`, `pixelate`, `sharpen`, `threshold`, `duotone`, `posterize`, `edgeDetect`, `halftone`, `tiltShift`, `scanlines`, `lensDistortion`, `oilPaint`, `wave`, `bulge`, `swirl`, `motionBlur`, `radialBlur`, `rgbShift`, `vhs`, `pixelSort`, `datamosh`, `kaleidoscope`, `dither`, `gradientMap`.

Multi-pass HDR (auto-allocates `RGBA16F` ping-pong framebuffers): `bloom`, `glow`.

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
      vec4 c = getSourceColor(uv);
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

The Runner wraps the GLSL with the standard header (`#version 300 es`, precision, `uSource` / `uResolution`, `getSourceColor` helper) and maps each `defaults` key to a `u<PascalCase>` uniform.

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
