import type { TextureSource, UniformParams } from "@vysmo/gl-core";

export type { TextureSource, UniformValue, UniformParams, Widen } from "@vysmo/gl-core";

export interface EffectShader {
  glsl: string;
  wgsl?: string;
}

export interface Effect<P extends UniformParams = UniformParams> {
  name: string;
  shader: EffectShader;
  defaults: P;
  /**
   * Number of fragment-shader passes the runner should execute per
   * render(). Defaults to 1. When > 1, the runner ping-pongs between
   * two framebuffers; each pass can read the previous pass's output
   * via getPrevious(uv). The final pass renders to the canvas.
   */
  passes?: number;
  /**
   * When true, intermediate render targets are allocated as `RGBA16F`
   * instead of `RGBA8`. Required for effects that produce out-of-[0,1]
   * intermediate values (bloom's bright-pass, glow). Only meaningful
   * when `passes > 1`. Requires WebGL2 + `EXT_color_buffer_float`.
   */
  hdr?: boolean;
}

export interface RenderArgs<P extends UniformParams> {
  /**
   * Image to apply the effect to. Accepts any `TextureSource`
   * (`HTMLImageElement`, `HTMLCanvasElement`, `HTMLVideoElement`,
   * `ImageBitmap`, `OffscreenCanvas`, raw `WebGLTexture`) **or** a URL
   * string. URL inputs must be pre-loaded via `runner.preload([url])`
   * before `render()` is called — `render()` itself is synchronous and
   * will throw if asked to draw an un-preloaded URL.
   */
  source: TextureSource | string;
  params?: Partial<P>;
}
