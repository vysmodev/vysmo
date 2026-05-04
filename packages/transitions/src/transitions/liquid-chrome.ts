import { defineTransition } from "./define.js";

/**
 * A liquid-metal blob expands from the centre, showing `to` through its
 * glossy surface. The silhouette is a three-lobe metaball with small
 * orbital wobbles so the boundary feels organic rather than a clean
 * circle. Inside the blob, a fake specular highlight (overhead-left
 * light) and rim brightening derived from the sampled `to` luminance
 * produce the T-1000 chrome read — all gain derived from sampled content,
 * so the full-frame rule holds (no synthetic white).
 *
 * Sample UVs only ever shift inward, so the clamp stays a no-op (no
 * radial streaks from out-of-bounds reads). Specular + rim + refraction
 * all scale by a `4·p·(1-p)` envelope, so at progress 0 and 1 the
 * mercury shading collapses to pure from/to respectively.
 */
export const liquidChrome = defineTransition({
  name: "liquid-chrome",
  defaults: {
    shine: 0.9,
    rim: 0.25,
    wobble: 0.12,
    refraction: 0.035,
    reflection: 0.0,
  },
  glsl: `
uniform float uShine;
uniform float uRim;
uniform float uWobble;
uniform float uRefraction;
uniform float uReflection;

// Polynomial smooth-min for organic metaball union.
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

vec4 transition(vec2 uv) {
  float aspect = uResolution.x / uResolution.y;
  vec2 c = vec2(0.5);
  vec2 aDelta = vec2((uv.x - c.x) * aspect, uv.y - c.y);
  float maxR = sqrt(aspect * aspect * 0.25 + 0.25);

  // Blob radius grows from fully off-frame (negative) to comfortably
  // past the farthest corner — guarantees clean endpoints.
  float blobR = mix(-0.2, maxR + 0.25, uProgress);

  // Orbital wobble: two small satellite blobs on curved paths. At
  // progress=0 blobR is negative so they're already off-frame; at
  // progress=1 blobR is huge so wobble is subsumed into the main mass.
  float t = uProgress;
  vec2 o1 = vec2(sin(t * 8.0), cos(t * 6.0)) * uWobble;
  vec2 o2 = vec2(cos(t * 7.0), -sin(t * 5.0)) * uWobble;

  // Three-lobe SDF, union via smooth-min.
  float d1 = length(aDelta) - blobR;
  float d2 = length(aDelta - o1 * 0.35) - blobR * 0.82;
  float d3 = length(aDelta - o2 * 0.35) - blobR * 0.82;
  float d = smin(smin(d1, d2, 0.08), d3, 0.08);

  // Inside-blob membership, with a narrow soft edge so the silhouette
  // doesn't alias but the body stays crisp.
  float insideMask = 1.0 - smoothstep(-0.006, 0.006, d);

  // Envelope so all surface shading vanishes at the endpoints.
  float envelope = 4.0 * uProgress * (1.0 - uProgress);

  // Depth within blob: 0 at centre, 1 at rim.
  float depthT = clamp(1.0 + d / max(blobR, 0.001), 0.0, 1.0);

  // Radial direction from blob core. Used for both refraction offset
  // and as a cheap surface-normal approximation for shading.
  vec2 nDir = length(aDelta) > 1e-4 ? aDelta / length(aDelta) : vec2(0.0);

  // Refraction: sample to from slightly inward — depth-T weighted so
  // the centre is undistorted and the rim bends sharpest. Stays in
  // bounds because the shift is always toward the blob core.
  float refract = uRefraction * depthT * envelope;
  vec2 refractOffset = nDir * refract;
  vec2 refractUv = clamp(uv - vec2(refractOffset.x / aspect, refractOffset.y), 0.0, 1.0);
  vec4 toSample = getToColor(refractUv);

  // Specular: fake overhead-left light bouncing off the "normal".
  vec2 lightDir = vec2(-0.7071, -0.7071);
  float lightDot = max(dot(nDir, lightDir), 0.0);
  float specBand = smoothstep(0.35, 0.95, depthT);
  float spec = pow(lightDot, 6.0) * specBand * envelope;

  // Rim brightening near the silhouette. Ramp by depthT so only the
  // outer shell of the blob catches the rim.
  float rimShell = smoothstep(0.82, 1.0, depthT);
  float rimAmt = rimShell * envelope * uRim;

  // Apply gain from sampled luminance — keeps all output within content.
  float lum = dot(toSample.rgb, vec3(0.299, 0.587, 0.114));
  vec3 chromed = toSample.rgb + (1.0 - toSample.rgb) * lum * (spec * uShine + rimAmt);

  // Environment reflection: sample the env map using the surface normal
  // direction as a (coarse) env lookup, and blend stronger at the rim
  // where fresnel would peak on a real dielectric. Gated by uReflection
  // so the default (0) is a no-op; envelope keeps endpoints clean.
  if (uReflection > 0.0) {
    vec2 envUv = vec2(0.5 + 0.5 * nDir.x, 0.5 - 0.5 * nDir.y);
    vec3 envColor = getEnvironment(envUv).rgb;
    float reflectBand = mix(0.15, 0.9, depthT) * envelope * uReflection;
    chromed = mix(chromed, envColor, reflectBand);
  }

  vec4 fromColor = getFromColor(uv);
  return mix(fromColor, vec4(chromed, 1.0), insideMask);
}
`,
});
