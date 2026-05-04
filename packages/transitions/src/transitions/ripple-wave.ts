import { defineTransition } from "./define.js";

/**
 * A water-like ripple emanates from a source point. The mesh deforms
 * in z so the wave has real geometric presence (depth, lighting), but
 * the wave shape, surface normal, and refraction are all recomputed
 * per-fragment — so the refraction stays smooth even at high amplitude
 * regardless of mesh subdivision. No faceting, no interpolation
 * crystalline artifacts.
 *
 * Wave profile is asymmetric around the travelling front: sharp cut-
 * off ahead (no pre-wave ripple) and moderate Gaussian decay behind
 * (one dominant leading ring followed by a fading secondary ring).
 * Refraction shifts the sample uv along the in-plane surface normal,
 * so the image visibly bends through the water. A tight specular
 * highlight adds a crest sparkle.
 *
 * Endpoints: envelope = 4·p·(1-p) gates z, refraction, lighting and
 * specular all to zero at progress 0 and 1. The mask is pinned to
 * saturated 0 and 1 respectively — pixel-pure endpoints.
 */
export const rippleWave = defineTransition({
  name: "ripple-wave",
  mesh: { subdivisions: [48, 48], instances: 1 },
  defaults: {
    amplitude: 0.1,
    source: [0.5, 0.5] as const,
  },
  vertex: `
uniform float uAmplitude;
uniform vec2 uSource;

out vec2 vClipPos;

#define PI 3.14159265359
#define WAVELENGTH 0.35
#define MAX_R 3.0
#define TRANSITION_WIDTH 0.03

void main() {
  vUv = aUv;
  vClipPos = aPosition;

  // Mesh still deforms in z for real 3D presence; fragment will do
  // the smooth per-pixel wave. Both use the same analytic wave.
  vec2 sourceClip = uSource * 2.0 - 1.0;
  float r = distance(aPosition, sourceClip);
  float frontR = mix(
    -TRANSITION_WIDTH,
    MAX_R + TRANSITION_WIDTH,
    uProgress
  );
  float phase = (r - frontR) / WAVELENGTH;
  float k = mix(0.5, 4.0, step(0.0, phase));
  float decay = exp(-phase * phase * k);
  float envelope = 4.0 * uProgress * (1.0 - uProgress);
  float wave = sin(phase * 2.0 * PI) * decay;
  float z = uAmplitude * envelope * wave;

  gl_Position = vec4(aPosition, -z, 1.0);
}
`,
  glsl: `
uniform float uAmplitude;
uniform vec2 uSource;

in vec2 vClipPos;

#define PI 3.14159265359
#define WAVELENGTH 0.35
#define MAX_R 3.0
#define TRANSITION_WIDTH 0.03

vec4 transition(vec2 uv) {
  vec2 sourceClip = uSource * 2.0 - 1.0;
  vec2 toSource = vClipPos - sourceClip;
  float r = length(toSource);
  vec2 radialDir = r > 1e-5 ? toSource / r : vec2(0.0);

  float frontR = mix(
    -TRANSITION_WIDTH,
    MAX_R + TRANSITION_WIDTH,
    uProgress
  );
  float phase = (r - frontR) / WAVELENGTH;

  // Asymmetric decay: sharp ahead of front (k=4, no pre-wave), moderate
  // behind (k=0.5, one dominant ring + soft fading second ring).
  float k = mix(0.5, 4.0, step(0.0, phase));
  float decay = exp(-phase * phase * k);
  float envelope = 4.0 * uProgress * (1.0 - uProgress);
  float sinP = sin(phase * 2.0 * PI);
  float cosP = cos(phase * 2.0 * PI);

  // d(wave)/d(phase) = 2π·cos·decay − 2·phase·k·sin·decay
  float dWave = decay * (2.0 * PI * cosP - 2.0 * phase * k * sinP);
  float dzdr = uAmplitude * envelope * dWave / WAVELENGTH;

  vec3 normal = normalize(vec3(-dzdr * radialDir, 1.0));

  float mask = smoothstep(
    -TRANSITION_WIDTH,
    TRANSITION_WIDTH,
    frontR - r
  );

  // Refraction: gentle in-plane offset, clamped so high amplitudes
  // don't generate wild UV jumps that would moire through even mipmapped
  // trilinear sampling.
  vec2 refractOffset = normal.xy * 0.22;
  refractOffset = clamp(refractOffset, vec2(-0.08), vec2(0.08));
  vec2 sampleUv = clamp(uv + refractOffset, 0.0, 1.0);

  // Diffuse lighting referenced so flat = 1.0 exactly.
  vec3 lightDir = normalize(vec3(0.3, 0.5, -1.0));
  float directional = dot(normal, -lightDir);
  float flatDot = -lightDir.z;
  float rippleGain = (directional - flatDot) * 0.6;
  float vLight = clamp(1.0 + rippleGain * envelope, 0.6, 1.35);

  // Tight specular highlight on the crest — zero at endpoints (envelope),
  // zero on flat water (normal parallel to z).
  vec3 refl = reflect(lightDir, normal);
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  float spec = pow(max(dot(refl, viewDir), 0.0), 48.0);
  float specBase = pow(max(dot(vec3(0, 0, 1), -lightDir), 0.0), 48.0);
  float specGain = max(spec - specBase, 0.0) * envelope * 0.7;

  vec3 fromCol = getFromColor(sampleUv).rgb;
  vec3 toCol = getToColor(sampleUv).rgb;
  vec3 col = mix(fromCol, toCol, mask) * vLight + vec3(specGain);
  return vec4(col, 1.0);
}
`,
});
