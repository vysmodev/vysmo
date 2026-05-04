import type {
  MeshGeometry,
  Transition,
  TransitionShader,
  UniformParams,
  Widen,
} from "../types.js";

export interface DefineTransitionSpec<P extends UniformParams> {
  name: string;
  glsl: string;
  /**
   * Full vertex-shader main(). Required when `mesh` is set. See
   * TransitionShader.vertex for shell details.
   */
  vertex?: string;
  wgsl?: string;
  defaults: P;
  passes?: number;
  mesh?: MeshGeometry;
}

/**
 * Build a `Transition` from a plain spec. Authors write a fragment-shader
 * `vec4 transition(vec2 uv) { … }` body and a `defaults` object of named
 * uniforms; the Runner wraps it with the standard headers (`#version
 * 300 es`, precision, `uFrom` / `uTo` / `uProgress` / `uResolution`,
 * sampler helpers `getFromColor` / `getToColor`) and maps each key in
 * `defaults` to a `u<PascalCase>` uniform via the runner's binding rule.
 *
 * Mesh transitions add a `vertex` shader body and a `mesh` geometry
 * descriptor; multi-pass transitions add `passes`.
 *
 * The returned object is a plain `Transition<Widen<P>>` — the `Widen`
 * step lifts literal default tuples (e.g. `readonly [-1, 0]`) back to
 * the general uniform tuple types so callers can override freely.
 *
 * Per the project's engineering invariants, every defined transition
 * must clear the endpoint-correctness, polish-degrades-at-endpoints,
 * no-hard-cuts, full-frame, and continuous-motion rules.
 */
export function defineTransition<const P extends UniformParams>(
  spec: DefineTransitionSpec<P>,
): Transition<Widen<P>> {
  const shader: TransitionShader = { glsl: spec.glsl };
  if (spec.vertex !== undefined) shader.vertex = spec.vertex;
  if (spec.wgsl !== undefined) shader.wgsl = spec.wgsl;
  const t: Transition<Widen<P>> = {
    name: spec.name,
    shader,
    defaults: spec.defaults as unknown as Widen<P>,
  };
  if (spec.passes !== undefined) t.passes = spec.passes;
  if (spec.mesh !== undefined) t.mesh = spec.mesh;
  return t;
}
