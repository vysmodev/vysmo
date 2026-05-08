import type { Effect, UniformParams } from "../types.js";

import { ascii } from "./ascii.js";
import { bloom } from "./bloom.js";
import { blur } from "./blur.js";
import { bulge } from "./bulge.js";
import { chromaticAberration } from "./chromatic-aberration.js";
import { colorGrade } from "./color-grade.js";
import { datamosh } from "./datamosh.js";
import { dither } from "./dither.js";
import { duotone } from "./duotone.js";
import { edgeDetect } from "./edge-detect.js";
import { glow } from "./glow.js";
import { gradientMap } from "./gradient-map.js";
import { grain } from "./grain.js";
import { halftone } from "./halftone.js";
import { lensDistortion } from "./lens-distortion.js";
import { motionBlur } from "./motion-blur.js";
import { oilPaint } from "./oil-paint.js";
import { pixelSort } from "./pixel-sort.js";
import { pixelate } from "./pixelate.js";
import { posterize } from "./posterize.js";
import { radialBlur } from "./radial-blur.js";
import { rgbShift } from "./rgb-shift.js";
import { scanlines } from "./scanlines.js";
import { sharpen } from "./sharpen.js";
import { swirl } from "./swirl.js";
import { threshold } from "./threshold.js";
import { tiltShift } from "./tilt-shift.js";
import { vhs } from "./vhs.js";
import { vignette } from "./vignette.js";
import { wave } from "./wave.js";

/**
 * Every built-in effect, in a single array. The catalog source of
 * truth — counts, tests, and tooling read from here so they cannot
 * drift from `effects/index.ts`. Add new effects here whenever you add
 * them to the index re-exports.
 */
export const ALL_EFFECTS: readonly Effect<UniformParams>[] = [
  ascii,
  bloom,
  blur,
  bulge,
  chromaticAberration,
  colorGrade,
  datamosh,
  dither,
  duotone,
  edgeDetect,
  glow,
  gradientMap,
  grain,
  halftone,
  lensDistortion,
  motionBlur,
  oilPaint,
  pixelSort,
  pixelate,
  posterize,
  radialBlur,
  rgbShift,
  scanlines,
  sharpen,
  swirl,
  threshold,
  tiltShift,
  vhs,
  vignette,
  wave,
] as const;
