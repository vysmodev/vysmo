import { defineTransition } from "./define.js";

/**
 * Classic book-page curl — impossible in a fragment shader because it
 * needs real geometry deformation, silhouette, and depth-ordered self-
 * occlusion.
 *
 * A tilted hinge line sweeps across the plane. Vertices on the curled
 * side wrap around a cylinder whose effective radius grows with the
 * fraction of the sweep completed (sqrt growth: a real rolled page
 * starts tight and fattens as more length wraps). Front face samples
 * `from` with Lambert-ish shading; back face uses the configurable
 * `backColor` with softened shading so it reads as bright paper even
 * where the key light can't reach.
 *
 * Instance 0 is a back plane showing `to`; it also casts a soft drop
 * shadow from the curl, so the rolled paper visibly floats above the
 * revealed page. Shadow envelope is 4·p·(1-p) so it gates cleanly to
 * zero at both endpoints.
 *
 * Mesh is densely subdivided along the curl direction (128 cells) so
 * the cylinder silhouette reads smooth at typical canvas sizes.
 *
 * Endpoints: progress 0 → every foreground vertex flat at z=0, front-
 * facing, `from` at its uv, vLight=1; shadow mask zero. Pixel-pure
 * from. Progress 1 → every foreground vertex curled past the viewport
 * edge (clipped out), back plane visible with shadow mask zero. Pixel-
 * pure to.
 */
export const pageCurl = defineTransition({
  name: "page-curl",
  mesh: { subdivisions: [128, 32], instances: 2 },
  defaults: {
    tilt: 0.12,
    backColor: [0.97, 0.96, 0.94] as const,
  },
  vertex: `
uniform float uTilt;
const float uRadius = 0.5;

out float vLight;
out float vAlpha;
flat out int vInstance;

#define PI 3.14159265359

void main() {
  vInstance = gl_InstanceID;
  vUv = aUv;

  if (gl_InstanceID == 0) {
    gl_Position = vec4(aPosition, 0.99, 1.0);
    vLight = 1.0;
    vAlpha = 1.0;
    return;
  }

  vec2 sweepDir = vec2(cos(uTilt), sin(uTilt));
  vec2 hingeDir = vec2(-sweepDir.y, sweepDir.x);

  float s = dot(aPosition, sweepDir);
  float h = dot(aPosition, hingeDir);

  float maxExtent = abs(sweepDir.x) + abs(sweepDir.y);
  float hingePos = mix(
    maxExtent + uRadius,
    -maxExtent - 2.0 * uRadius,
    uProgress
  );

  float d = s - hingePos;

  if (d <= 0.0) {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vLight = 1.0;
    vAlpha = 1.0;
    return;
  }

  float totalTravel = 2.0 * maxExtent + 3.0 * uRadius;
  float traveled = maxExtent + uRadius - hingePos;
  float rEff = uRadius * (0.18 + 0.82 * sqrt(traveled / totalTravel));

  float theta = d / rEff;
  float newS = hingePos + rEff * sin(theta);
  float newZ = rEff * (cos(theta) - 1.0);

  vec2 newPos = newS * sweepDir + h * hingeDir;
  gl_Position = vec4(newPos, newZ, 1.0);

  vec3 normal = vec3(sin(theta) * sweepDir, -cos(theta));
  vec3 lightDir = normalize(vec3(0.35, 0.55, -1.0));
  vLight = clamp(0.5 + 0.55 * dot(normal, lightDir), 0.3, 1.0);

  vAlpha = 1.0 - smoothstep(PI, PI * 2.0, theta);
}
`,
  glsl: `
uniform float uTilt;
uniform vec3 uBackColor;
const float uRadius = 0.5;

in float vLight;
in float vAlpha;
flat in int vInstance;

vec4 transition(vec2 uv) {
  if (vInstance == 0) {
    // Back plane: the destination page, with a soft drop shadow cast
    // by the curl floating above it. Shadow is strongest right past
    // the hinge (where the curl overhangs) and fades over a few
    // effective radii. 4·p·(1-p) envelope keeps endpoints pure.
    vec3 col = getToColor(uv).rgb;

    vec2 sweepDir = vec2(cos(uTilt), sin(uTilt));
    float maxExtent = abs(sweepDir.x) + abs(sweepDir.y);
    float hingePos = mix(
      maxExtent + uRadius,
      -maxExtent - 2.0 * uRadius,
      uProgress
    );

    vec2 clipPos = uv * 2.0 - 1.0;
    float s = dot(clipPos, sweepDir);
    float d = s - hingePos;

    float totalTravel = 2.0 * maxExtent + 3.0 * uRadius;
    float traveled = max(maxExtent + uRadius - hingePos, 0.0);
    float rEff = uRadius * (0.18 + 0.82 * sqrt(traveled / totalTravel));

    float distPastHinge = max(d, 0.0);
    float shadow = 1.0 - smoothstep(0.0, 3.5 * rEff, distPastHinge);
    float envelope = 4.0 * uProgress * (1.0 - uProgress);
    col *= 1.0 - shadow * 0.55 * envelope;

    return vec4(col, 1.0);
  }

  if (vAlpha < 0.01) discard;

  vec3 col;
  float alpha;
  if (gl_FrontFacing) {
    col = getFromColor(uv).rgb * vLight;
    // Smooth fade on the image side so the seam at the wrap-around
    // (theta ≈ 2π, page disappearing past itself) doesn't read as a
    // hard edge.
    alpha = vAlpha;
  } else {
    // Paper back: author-chosen colour with gentle shading that never
    // drops below ~85%, so the back reads as diffusely lit paper even
    // where the key light can't reach (the far side of the curl).
    float backLight = 0.85 + 0.15 * vLight;
    col = uBackColor * backLight;
    // Always opaque inside the visible mesh — paper isn't transparent.
    // Letting the back's alpha follow vAlpha lets the next page bleed
    // through the back during the wrap-around fade, breaking the
    // illusion of a solid page. Hard discard above (vAlpha < 0.01)
    // already handles culling for fully wrapped vertices.
    alpha = 1.0;
  }
  return vec4(col, alpha);
}
`,
});
