# @vysmo/gl-core

Minimal WebGL2 plumbing — shader compile / link, uniform dispatch, texture cache, ping-pong framebuffer pool. The shared infra under [`@vysmo/transitions`](https://www.npmjs.com/package/@vysmo/transitions) and [`@vysmo/effects`](https://www.npmjs.com/package/@vysmo/effects).

> **Most users don't import this directly.** It's the WebGL plumbing the
> two consumer packages stand on. If you want transitions or effects,
> install one of those — `gl-core` arrives transitively and you never
> need to know it exists.
>
> If you're building your own WebGL2 primitive on top of these helpers
> (custom shader-based component, your own runner), this is the API.

## Install

```bash
pnpm add @vysmo/gl-core
```

## What's in the box

| Export | Purpose |
|--------|---------|
| `compileShader(gl, type, source)` | Compile one shader stage. Throws with full info log on failure. |
| `linkProgram(gl, vs, fs)` | Link a vertex + fragment pair into a `WebGLProgram`. Throws with link log on failure. |
| `buildProgram(gl, fragmentSource, vertexSource?)` | One-shot compile + link + cleanup. Vertex defaults to `FULLSCREEN_VERTEX_SHADER`. |
| `FULLSCREEN_VERTEX_SHADER` | GLSL ES 3.0 vertex shader that draws a single screen-covering triangle without any attribute buffers. The starting point for any fragment-only pass. |
| `TextureCache` | Lazy GPU texture uploader keyed on source identity. Static images upload once; videos / canvases re-upload per call. |
| `FramebufferPool` | Reusable ping-pong FBO allocator. LDR (`RGBA8`) by default, opt-in HDR (`RGBA16F`) for multi-pass effects that need values outside `[0, 1]`. |
| `setUniform(gl, loc, value)` | Type-dispatched uniform upload — handles scalars, bool, and 2/3/4-component vectors. |
| `paramKeyToUniformName(key)` | Convention helper: `"softness"` → `"uSoftness"`. Pairs with the runner's preset → uniform binding. |

Plus types: `TextureSource`, `UniformValue`, `UniformParams`, `Widen<P>`, `TextureCacheOptions`, `PooledFramebuffer`, `EnsureOptions`.

## Usage sketch

```ts
import {
  buildProgram,
  TextureCache,
  FramebufferPool,
  setUniform,
} from "@vysmo/gl-core";

const gl = canvas.getContext("webgl2")!;
const program = buildProgram(gl, fragmentSource);
const textures = new TextureCache(gl);
const pool = new FramebufferPool(gl);

function render(image: HTMLImageElement, t: number) {
  // CRITICAL: ensure() FBOs first, then bind textures. Both write to
  // the active TEXTURE_2D unit; reversing the order clobbers the source.
  pool.ensure(2, canvas.width, canvas.height);
  gl.activeTexture(gl.TEXTURE0);
  textures.resolve(image);

  gl.useProgram(program);
  setUniform(gl, gl.getUniformLocation(program, "uTime")!, t);
  // ... bind FBO from pool, draw, ping-pong, etc.
}
```

## Characteristics

- **WebGL2 only.** No WebGL1 fallback.
- **SSR-safe at module load.** No DOM access at import; all DOM-class checks (`HTMLImageElement`, `WebGLTexture`) are guarded by `typeof X !== "undefined"`. The library can be imported in Node — only the methods that need a live GL context require a browser.
- **Zero runtime dependencies.**
- **Tree-shakable.** Importing only `buildProgram` ships ~0.5 KB gzipped.
- **Tested in real WebGL.** Browser tests run in headless Chromium via Playwright; SSR test runs in Node.

## Important call-site rules

- **Bind order:** call `FramebufferPool.ensure()` and `TextureCache.resolve()` for *all* sources **before** any `gl.activeTexture` + `gl.bindTexture` for sampler inputs. Both create textures by binding to `TEXTURE_2D` on the active unit; reversing the order silently corrupts your sampler bindings. The class docstrings repeat this — it's the most common subtle bug when integrating gl-core.
- **HDR fallback:** `FramebufferPool.ensure({ hdr: true })` requires `EXT_color_buffer_float`. When unavailable the pool silently falls back to LDR — check `pool.isHdrActive` if exact format matters for correctness.
- **Texture immutability:** `TextureCache` skips re-uploads for `HTMLImageElement` and `ImageBitmap` (treated as immutable). If you reassign `img.src`, drop the cache entry by creating a new `Image()` instead.

## License

MIT.
