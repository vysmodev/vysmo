import { defineTransition } from "./define.js";

/**
 * A concentric wavefront expands from a center point, distorting pixels
 * radially at the wavefront's crest. Behind the wave: `to`. Ahead: `from`.
 */
export const shockwave = defineTransition({
  name: "shockwave",
  defaults: {
    center: [0.5, 0.5],
    thickness: 0.15,
    strength: 0.04,
  },
  glsl: `
uniform vec2 uCenter;
uniform float uThickness;
uniform float uStrength;

vec4 transition(vec2 uv) {
  vec2 pixel = uv * uResolution;
  vec2 pixelCenter = uCenter * uResolution;
  vec2 delta = pixel - pixelCenter;
  float r = length(delta);
  vec2 dir = r > 0.5 ? delta / r : vec2(1.0, 0.0);

  float maxR = max(
    max(length(pixelCenter), length(pixelCenter - vec2(uResolution.x, 0.0))),
    max(length(pixelCenter - vec2(0.0, uResolution.y)), length(pixelCenter - uResolution))
  );
  float normalizedR = r / max(maxR, 0.0001);

  // Wavefront position sweeps from outside-at-center (-thickness) to
  // outside-at-corner (1+thickness) so distortion & seam fully exit the frame
  // at the endpoints.
  float wavePos = uProgress * (1.0 + 2.0 * uThickness) - uThickness;
  float distToWave = normalizedR - wavePos;

  // Distortion magnitude peaks at the wavefront and zeroes at endpoints.
  float env = 4.0 * uProgress * (1.0 - uProgress);
  float waveX = distToWave / max(uThickness, 0.001);
  float waveMag = exp(-waveX * waveX * 4.0) * env * uStrength;

  // Displace each image radially away from center by the wave magnitude.
  vec2 disp = dir * waveMag;

  // Behind the wavefront (distToWave < 0): show "to". Ahead: show "from".
  // 1 - smoothstep form (smoothstep(high, low) is GLSL UB).
  float sweep = 1.0 - smoothstep(-uThickness, uThickness, distToWave);

  vec4 fromColor = getFromColor(clamp(uv + disp, 0.0, 1.0));
  vec4 toColor = getToColor(clamp(uv - disp, 0.0, 1.0));

  return mix(fromColor, toColor, sweep);
}
`,
});
