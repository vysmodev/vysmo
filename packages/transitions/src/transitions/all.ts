import type { Transition, UniformParams } from "../types.js";

import { bloomReveal } from "./bloom-reveal.js";
import { chromaticPulse } from "./chromatic-pulse.js";
import { clockWipe } from "./clock-wipe.js";
import { colorPhase } from "./color-phase.js";
import { crossZoom } from "./cross-zoom.js";
import { crosshatch } from "./crosshatch.js";
import { directionalBurn } from "./directional-burn.js";
import { directionalWarp } from "./directional-warp.js";
import { dissolve } from "./dissolve.js";
import { dreamy } from "./dreamy.js";
import { dreamyZoom } from "./dreamy-zoom.js";
import { dripWipe } from "./drip-wipe.js";
import { emberScatter } from "./ember-scatter.js";
import { filmBurn } from "./film-burn.js";
import { filmGrain } from "./film-grain.js";
import { flowWarp } from "./flow-warp.js";
import { fluidFlow } from "./fluid-flow.js";
import { glassShatter } from "./glass-shatter.js";
import { glitch } from "./glitch.js";
import { godRaysReveal } from "./god-rays-reveal.js";
import { gravityPull } from "./gravity-pull.js";
import { gridReveal } from "./grid-reveal.js";
import { heatHaze } from "./heat-haze.js";
import { inkBloom } from "./ink-bloom.js";
import { inkDiffuse } from "./ink-diffuse.js";
import { irisZoom } from "./iris-zoom.js";
import { kineticBands } from "./kinetic-bands.js";
import { lenticularFlip } from "./lenticular-flip.js";
import { lightLeak } from "./light-leak.js";
import { linearBlur } from "./linear-blur.js";
import { liquidChrome } from "./liquid-chrome.js";
import { liquidMorph } from "./liquid-morph.js";
import { luminaMelt } from "./lumina-melt.js";
import { mosaic } from "./mosaic.js";
import { noiseDissolve } from "./noise-dissolve.js";
import { pageCurl } from "./page-curl.js";
import { paintBleed } from "./paint-bleed.js";
import { pinwheel } from "./pinwheel.js";
import { pixelate } from "./pixelate.js";
import { polkaDotsCurtain } from "./polka-dots-curtain.js";
import { polygonFlip } from "./polygon-flip.js";
import { portalDive } from "./portal-dive.js";
import { prismSplit } from "./prism-split.js";
import { push } from "./push.js";
import { radialReveal } from "./radial-reveal.js";
import { ripple } from "./ripple.js";
import { rippleWave } from "./ripple-wave.js";
import { shapeReveal } from "./shape-reveal.js";
import { shockwave } from "./shockwave.js";
import { singularity } from "./singularity.js";
import { slide } from "./slide.js";
import { smolderingEdge } from "./smoldering-edge.js";
import { split } from "./split.js";
import { swirl } from "./swirl.js";
import { tangentMotionBlur } from "./tangent-motion-blur.js";
import { tileScatter } from "./tile-scatter.js";
import { warpZoom } from "./warp-zoom.js";
import { waveStripes } from "./wave-stripes.js";
import { wind } from "./wind.js";
import { wipeDirectional } from "./wipe-directional.js";

/**
 * Every built-in transition, in a single array. The catalog source of
 * truth — counts, tests, and tooling read from here so they cannot
 * drift from `transitions/index.ts`. Add new transitions here whenever
 * you add them to the index re-exports.
 */
export const ALL_TRANSITIONS: readonly Transition<UniformParams>[] = [
  bloomReveal,
  chromaticPulse,
  clockWipe,
  colorPhase,
  crossZoom,
  crosshatch,
  directionalBurn,
  directionalWarp,
  dissolve,
  dreamy,
  dreamyZoom,
  dripWipe,
  emberScatter,
  filmBurn,
  filmGrain,
  flowWarp,
  fluidFlow,
  glassShatter,
  glitch,
  godRaysReveal,
  gravityPull,
  gridReveal,
  heatHaze,
  inkBloom,
  inkDiffuse,
  irisZoom,
  kineticBands,
  lenticularFlip,
  lightLeak,
  linearBlur,
  liquidChrome,
  liquidMorph,
  luminaMelt,
  mosaic,
  noiseDissolve,
  pageCurl,
  paintBleed,
  pinwheel,
  pixelate,
  polkaDotsCurtain,
  polygonFlip,
  portalDive,
  prismSplit,
  push,
  radialReveal,
  ripple,
  rippleWave,
  shapeReveal,
  shockwave,
  singularity,
  slide,
  smolderingEdge,
  split,
  swirl,
  tangentMotionBlur,
  tileScatter,
  warpZoom,
  waveStripes,
  wind,
  wipeDirectional,
] as const;
