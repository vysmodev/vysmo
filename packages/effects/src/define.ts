import type {
  Effect,
  EffectShader,
  UniformParams,
  Widen,
} from "./types.js";

export interface DefineEffectSpec<P extends UniformParams> {
  name: string;
  glsl: string;
  wgsl?: string;
  defaults: P;
  passes?: number;
  hdr?: boolean;
}

/**
 * Build an `Effect` from a plain spec. Authors write a fragment-shader
 * `vec4 effect(vec2 uv) { … }` body and a `defaults` object of named
 * uniforms; the Runner wraps it with the standard headers (`#version
 * 300 es`, precision, `uSource` / `uResolution`, sampler helper
 * `getSourceColor`) and maps each key in `defaults` to a
 * `u<PascalCase>` uniform.
 *
 * Multi-pass effects set `passes > 1`; pass `i` reads the previous
 * pass's output via `getPrevious(uv)`. Effects that produce HDR
 * intermediates (bloom's bright-pass, glow) set `hdr: true` so the
 * pool allocates `RGBA16F` framebuffers — falls back to `RGBA8` when
 * `EXT_color_buffer_float` is unavailable.
 *
 * Prefer this over hand-typing an `Effect<{...}>` literal — the
 * generic `const P` inference preserves literal types in `defaults`,
 * then `Widen` relaxes them so callers can freely override with any
 * `number`, `boolean`, or vector tuple.
 */
export function defineEffect<const P extends UniformParams>(
  spec: DefineEffectSpec<P>,
): Effect<Widen<P>> {
  const shader: EffectShader = { glsl: spec.glsl };
  if (spec.wgsl !== undefined) shader.wgsl = spec.wgsl;
  const e: Effect<Widen<P>> = {
    name: spec.name,
    shader,
    defaults: spec.defaults as unknown as Widen<P>,
  };
  if (spec.passes !== undefined) e.passes = spec.passes;
  if (spec.hdr !== undefined) e.hdr = spec.hdr;
  return e;
}
