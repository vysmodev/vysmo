import {
  animateText,
  evaluateSpecs,
  listPresets,
  resolvePreset,
  splitText,
  type AnimateTextHandle,
  type AnimateTextOptions,
  type HandcuratedPresetName,
  type Preset,
  type PresetName,
  type Splits,
  type TextAnimationSpec,
} from "../index.js";
import { power2Out } from "@vysmo/easings";

// --- HandcuratedPresetName is a closed union (typos rejected) --------------

const _h: HandcuratedPresetName = "enter/fade-up";
void _h;

// @ts-expect-error — typo is rejected against the closed union
const _hBad: HandcuratedPresetName = "enter/fadeup";
void _hBad;

// --- PresetName is open (so the catalog can grow via generated entries) ----

const _n: PresetName = "enter/fade-up";
const _nGen: PresetName = "enter/some-generated-name";
void [_n, _nGen];

// --- listPresets / resolvePreset return the union and a full Preset --------

const names = listPresets();
const _names: PresetName[] = names;
void _names;

const p: Preset = resolvePreset("emphasis/shake");
const _pname: PresetName = p.name;
const _pstagger: number = p.stagger;
const _panims: TextAnimationSpec[] = p.animations;
void [_pname, _pstagger, _panims];

// --- animateText options accept a preset OR raw animations -----------------

declare const el: HTMLElement;

const opt1: AnimateTextOptions = { preset: "enter/scale-in" };
const opt2: AnimateTextOptions = {
  animations: [{ prop: "opacity", from: 0, to: 1, duration: 300, ease: power2Out }],
  stagger: 20,
  staggerOrder: "center",
};
void [opt1, opt2];

const handle: AnimateTextHandle = animateText(el, { preset: "enter/fade-up" });
const _s: Splits = handle.splits;
const _f: Promise<void> = handle.finished;
void [_s, _f];

// --- animateText rejects bogus props at compile time -----------------------

animateText(el, {
  animations: [
    // @ts-expect-error — "wiggle" is not a TextProperty
    { prop: "wiggle", from: 0, to: 1 },
  ],
});

// --- splitText returns Splits with slices: HTMLElement[] -------------------

const splits = splitText(el, { mode: "word" });
const _slices: HTMLElement[] = splits.slices;
void _slices;

// --- evaluateSpecs runs purely on TextAnimationSpec[] ----------------------

const v = evaluateSpecs(p.animations, 100);
const _opacity: number | undefined = v.opacity;
void _opacity;
