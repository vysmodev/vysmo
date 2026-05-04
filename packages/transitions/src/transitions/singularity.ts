import { defineTransition } from "./define.js";

/**
 * The image collapses to a single point and re-expands as the other.
 * A scale factor runs from 1 at progress 0 to 0 at progress 0.5 to 1
 * again at progress 1. Sampling from / to at
 *
 *   sampleUv = center + (uv - center) · scale
 *
 * means that as scale approaches 0 the whole frame converges on
 * whatever from/to looks like at the centre pixel — so the image
 * visibly shrinks to a dot, flashes, and re-expands as the other
 * content. A content-derived whitening pulse at progress ≈ 0.5
 * sells the event-horizon moment without injecting synthetic
 * colour. Crossfade happens in a narrow window around progress 0.5
 * so from and to don't visibly coexist except at the flash instant.
 *
 * Endpoints: scale = 1 at progress 0/1, so the sample UV is identity
 * and we render pure from / to. The flash envelope is zero there too.
 */
export const singularity = defineTransition({
  name: "singularity",
  defaults: {
    center: [0.5, 0.5],
  },
  glsl: `
uniform vec2 uCenter;

vec4 transition(vec2 uv) {
  // Scale: 1 at endpoints, 0 at progress 0.5. Clamped above epsilon so
  // the flash frame still samples a real texel instead of hitting the
  // exact centre pixel (and to give the collapse a tiny residual
  // chromatic core rather than a hard dot).
  float raw = abs(uProgress - 0.5) * 2.0;
  float scale = max(raw, 1e-3);

  vec2 sampleUv = clamp(uCenter + (uv - uCenter) * scale, 0.0, 1.0);

  vec4 fromC = getFromColor(sampleUv);
  vec4 toC = getToColor(sampleUv);

  // Tight crossfade around the collapse — from dominates until almost
  // progress 0.5, to takes over just after. This keeps the geometry
  // (shrinking → dot → growing) as the dominant narrative, not a
  // mushy overlap.
  float blend = smoothstep(0.48, 0.52, uProgress);
  vec3 result = mix(fromC.rgb, toC.rgb, blend);

  // Event-horizon whitening: content-derived gain that peaks at the
  // instant of collapse. Smooth falloff to zero by progress 0.3/0.7
  // so there's no residual brightness outside the flash.
  float flash = 1.0 - smoothstep(0.0, 0.2, raw);
  float lum = dot(result, vec3(0.299, 0.587, 0.114));
  result += (1.0 - result) * lum * flash;

  return vec4(result, 1.0);
}
`,
});
