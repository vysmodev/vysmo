import {
  createScrollEffect,
  createScrollProgress,
  createScrollTransition,
  sharedScrollObserver,
  type Handle,
} from "../index.js";
import type { Runner as TransitionRunner, Transition, TextureSource } from "@vysmo/transitions";
import type { Runner as EffectRunner, Effect } from "@vysmo/effects";

declare const el: HTMLElement;
declare const section: HTMLElement;
declare const img1: TextureSource;
declare const img2: TextureSource;
declare const tRunner: TransitionRunner;
declare const eRunner: EffectRunner;
declare const myTransition: Transition<{ amount: number }>;
declare const myEffect: Effect<{ radius: number }>;

const _progress: Handle = createScrollProgress({
  element: el,
  onProgress: (p) => void p,
});

const _progressEased: Handle = createScrollProgress({
  element: el,
  ease: (t) => t * t,
  onProgress: () => {},
});

const _scrollTrans: Handle = createScrollTransition({
  section,
  runner: tRunner,
  transition: myTransition,
  from: img1,
  to: img2,
});

const _scrollTransFull: Handle = createScrollTransition({
  section,
  runner: tRunner,
  transition: myTransition,
  from: img1,
  to: img2,
  params: { amount: 0.5 },
  ease: (t) => t * t,
});

const _scrollEffect: Handle = createScrollEffect({
  section,
  runner: eRunner,
  effect: myEffect,
  source: img1,
  paramsAt: (p) => ({ radius: p * 20 }),
});

const _scrollEffectEased: Handle = createScrollEffect({
  section,
  runner: eRunner,
  effect: myEffect,
  source: img1,
  ease: (t) => 1 - (1 - t) * (1 - t),
  paramsAt: (p) => ({ radius: p * 20 }),
});

const _obs = sharedScrollObserver();

void [_progress, _progressEased, _scrollTrans, _scrollTransFull, _scrollEffect, _scrollEffectEased, _obs];

// --- Negative assertions ------------------------------------------------

// @ts-expect-error — onProgress is required
createScrollProgress({ element: el });

// @ts-expect-error — paramsAt is required
createScrollEffect({ section, runner: eRunner, effect: myEffect, source: img1 });

createScrollTransition({
  section,
  runner: tRunner,
  transition: myTransition,
  from: img1,
  to: img2,
  // @ts-expect-error — params shape must match the transition's param type
  params: { wrongKey: 1 },
});
