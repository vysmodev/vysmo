import type {
  TextureSource,
  UniformValue,
  UniformParams,
  Widen,
} from "@vysmo/gl-core";

export type { TextureSource, UniformValue, UniformParams, Widen };

export interface TransitionShader {
  glsl: string;
  /**
   * Full vertex-shader main() body. Required when the transition declares
   * a `mesh`. Runner prepends a header with `#version 300 es`, precision,
   * standard uniforms (uProgress, uResolution, uPass, uPassCount,
   * uInstances, plus author's custom uniforms), the standard attribute
   * inputs (aPosition, aUv, aOffset, aCentroid, aBary, aRandom), and
   * `out vec2 vUv`. The author writes `void main() { ... }` and is
   * responsible for assigning `gl_Position` and passing through `vUv`
   * (and any other varyings they declare themselves).
   */
  vertex?: string;
  wgsl?: string;
}

export interface MeshGeometry {
  /**
   * Grid subdivisions of the [-1, 1] plane. `[nx, ny]` yields `2·nx·ny`
   * triangles.
   */
  subdivisions: readonly [number, number];
  /**
   * Number of mesh instances rendered per pass via drawArraysInstanced.
   * The vertex shader can branch on `gl_InstanceID` (0..instances-1) to
   * produce overlapping meshes with different behaviours (e.g. a back
   * plane + a rotating foreground). Defaults to 1.
   */
  instances?: number;
}

export interface Transition<P extends UniformParams = UniformParams> {
  name: string;
  shader: TransitionShader;
  defaults: P;
  /**
   * Number of fragment-shader passes the runner should execute per
   * render(). Defaults to 1. When > 1, the runner ping-pongs between
   * two framebuffers; each pass can read the previous pass's output
   * via getPrevious(uv). The final pass renders to the canvas.
   *
   * Ignored when `mesh` is set (mesh transitions are single-pass in v1).
   */
  passes?: number;
  /**
   * If set, the runner renders this transition with a subdivided-plane
   * mesh and the author-provided vertex shader, enabling true vertex
   * geometry effects (per-triangle rotation, flying tiles, real 3D
   * flips). Transitions without `mesh` keep using the fullscreen-triangle
   * fragment-only pipeline.
   */
  mesh?: MeshGeometry;
}

export interface RenderArgs<P extends UniformParams> {
  /**
   * Source image. Accepts any `TextureSource` (`HTMLImageElement`,
   * `HTMLCanvasElement`, `HTMLVideoElement`, `ImageBitmap`,
   * `OffscreenCanvas`, raw `WebGLTexture`) **or** a URL string. URL
   * inputs must be pre-loaded via `runner.preload([url])` before
   * `render()` is called — `render()` itself is synchronous and will
   * throw if asked to draw an un-preloaded URL.
   */
  from: TextureSource | string;
  /** Target image. Same input types as `from`; see `from` for URL pre-loading rules. */
  to: TextureSource | string;
  progress: number;
  params?: Partial<P>;
  /**
   * Optional displacement-map texture. Transitions that read it via the
   * `getDisplacement(uv)` shader helper (e.g. flow-warp) will use it to
   * drive per-pixel UV offsets. Mid-gray (RGB ≈ 128) is interpreted as
   * "no displacement"; brighter / darker pixels offset positively /
   * negatively. If omitted, the runner binds a default 1×1 mid-gray
   * texture so displacement-using transitions degrade to no-op rather
   * than failing.
   *
   * Accepts URL strings on the same pre-load contract as `from` / `to`.
   */
  displacement?: TextureSource | string;
  /**
   * Optional environment-map texture. Transitions that read it via the
   * getEnvironment(uv) shader helper (e.g. liquid-chrome with reflection
   * enabled) use it to fake reflections off metallic / glass surfaces.
   * If omitted, the runner binds a default 1×1 mid-gray texture so
   * environment-using transitions degrade to a neutral no-op.
   *
   * Accepts URL strings on the same pre-load contract as `from` / `to`.
   */
  environment?: TextureSource | string;
}
