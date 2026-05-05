export { animateText, evaluateSpecs } from "./animate.js";
export { splitText } from "./split.js";
export { applyProps, clearProps } from "./properties.js";
export type { PropValues } from "./properties.js";
export { computeStaggerDelays } from "./stagger.js";
export type {
  AnimateTextHandle,
  AnimateTextOptions,
  HandcuratedPresetName,
  Preset,
  PresetName,
  SplitMode,
  SplitOptions,
  Splits,
  StaggerOrder,
  TextAnimationSpec,
  TextProperty,
  TextValue,
  TransformOrigin,
} from "./types.js";
export {
  listPresets,
  resolvePreset,
  fadeUp,
  elasticRise,
  blurIn,
  scaleIn,
  flipX,
  depthZoom,
  fadeDown,
  scaleOut,
  flipAway,
  pulse,
  shake,
  wobble,
  coinFlip,
  spin,
} from "./presets/index.js";
