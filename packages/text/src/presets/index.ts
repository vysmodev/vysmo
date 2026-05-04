import type { Preset, PresetName } from "../types.js";
import { blurIn, depthZoom, elasticRise, fadeUp, flipX, scaleIn } from "./enter.js";
import { blurOut, fadeDown, flipAway, scaleOut } from "./exit.js";
import { coinFlip, pulse, shake, spin, wobble } from "./emphasis.js";
import { ALL_GENERATED } from "./generated.js";

const HANDCURATED: Record<string, Preset> = {
  "enter/fade-up": fadeUp,
  "enter/elastic-rise": elasticRise,
  "enter/blur-in": blurIn,
  "enter/scale-in": scaleIn,
  "enter/flip-x": flipX,
  "enter/depth-zoom": depthZoom,
  "exit/fade-down": fadeDown,
  "exit/blur-out": blurOut,
  "exit/scale-out": scaleOut,
  "exit/flip-away": flipAway,
  "emphasis/pulse": pulse,
  "emphasis/shake": shake,
  "emphasis/wobble": wobble,
  "emphasis/coin-flip": coinFlip,
  "emphasis/spin": spin,
};

// Merge handcurated + generated into a single runtime registry. Generated
// entries don't shadow handcurated ones — the catalog grows by addition.
const PRESETS: Record<string, Preset> = { ...HANDCURATED };
for (const { name, preset } of ALL_GENERATED) PRESETS[name] = preset;

/**
 * The hand-curated seed catalog, keyed by the closed
 * `HandcuratedPresetName` literal union. Useful for tests + tooling
 * that want to assert against the seed set without picking up
 * generated entries (which grow dynamically via `ALL_GENERATED`).
 */
export const HANDCURATED_NAMES: readonly string[] = Object.keys(HANDCURATED);

export function resolvePreset(name: PresetName): Preset {
  const p = PRESETS[name];
  if (!p) throw new Error(`@vysmo/text: unknown preset "${name}"`);
  return p;
}

export function listPresets(): PresetName[] {
  return Object.keys(PRESETS) as PresetName[];
}

export {
  fadeUp,
  elasticRise,
  blurIn,
  scaleIn,
  flipX,
  depthZoom,
  fadeDown,
  blurOut,
  scaleOut,
  flipAway,
  pulse,
  shake,
  wobble,
  coinFlip,
  spin,
};
