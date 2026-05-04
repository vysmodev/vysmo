import { animate, type AnimationHandle } from "@vysmo/animations";
import { parseEasing, type EasingFn } from "@vysmo/easings";
import { applyProps, clearProps, type PropValues } from "./properties.js";
import { resolvePreset } from "./presets/index.js";
import { splitText } from "./split.js";
import { computeStaggerDelays } from "./stagger.js";
import type {
  AnimateTextHandle,
  AnimateTextOptions,
  StaggerOrder,
  TextAnimationSpec,
  TextValue,
  TransformOrigin,
} from "./types.js";

const DEFAULT_DURATION = 600;
const DEFAULT_STAGGER = 30;

function linear(t: number): number {
  return t;
}

/**
 * Resolve a spec's `ease` to a callable function. Strings (e.g.
 * `"power2.out"`, `"back.out(2)"`) go through `@vysmo/easings` →
 * `parseEasing()`; functions pass through as-is. Called once per spec
 * at plan time so the per-frame hot path stays a direct call.
 */
function resolveEase(
  ease: string | EasingFn | ((t: number) => number) | undefined,
): (t: number) => number {
  if (ease === undefined) return linear;
  if (typeof ease === "string") return parseEasing(ease);
  return ease;
}

/**
 * Convert a `TransformOrigin` to the CSS string the browser wants. Two
 * forms: 2D (`x% y%`) and 3D (`x% y% Zpx`). Z is omitted when undefined
 * so 2D presets don't get a meaningless trailing `0px`.
 */
function originToCss(o: TransformOrigin): string {
  const x = `${o.x * 100}%`;
  const y = `${o.y * 100}%`;
  return o.z === undefined ? `${x} ${y}` : `${x} ${y} ${o.z}px`;
}

function isRange(v: TextValue): v is { min: number; max: number } {
  return typeof v === "object";
}

function midpoint(v: TextValue): number {
  return isRange(v) ? (v.min + v.max) / 2 : v;
}

function resolveValue(v: TextValue, rng: () => number): number {
  if (!isRange(v)) return v;
  if (v.min === v.max) return v.min;
  return v.min + rng() * (v.max - v.min);
}

/**
 * Pure, time-point evaluation of a spec array against a single per-slice
 * clock. Useful for tests and headless rendering. The live animateText
 * renderer subtracts the per-spec stagger offset *before* calling the
 * equivalent of this function, so pass the already-offset slice time.
 *
 * Range `from` / `to` values resolve deterministically to their midpoint
 * here — the live runtime samples per slice via the rng option, but
 * `evaluateSpecs` has no slice context, so it returns the spread's
 * average. Tests that exercise per-slice scatter should drive the live
 * renderer instead.
 */
export function evaluateSpecs(specs: TextAnimationSpec[], t: number): PropValues {
  const vals: PropValues = {};
  for (const spec of specs) {
    const delay = spec.delay ?? 0;
    if (t < delay) continue;
    const duration = spec.duration ?? DEFAULT_DURATION;
    const local = duration <= 0 ? 1 : Math.min(1, Math.max(0, (t - delay) / duration));
    const eased = resolveEase(spec.ease)(local);
    const from = midpoint(spec.from);
    const to = midpoint(spec.to);
    vals[spec.prop] = from + (to - from) * eased;
  }
  return vals;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type SpecPlan = {
  spec: TextAnimationSpec;
  /** Stagger offsets per slice (no jitter applied). */
  staggerOffsets: number[];
  /** Per-slice jitter delay (zero unless `spec.jitterDelay` is set). */
  jitters: number[];
  /** staggerOffsets[i] + jitters[i] — the slice's effective spec start. */
  effectiveOffsets: number[];
  /** Per-slice resolved `from` value (range-aware). */
  fromValues: number[];
  /** Per-slice resolved `to` value (range-aware). */
  toValues: number[];
  /** Easing resolved once at plan time; strings parsed via `@vysmo/easings`. */
  ease: (t: number) => number;
};

function planSpec(
  spec: TextAnimationSpec,
  sliceCount: number,
  defaultStagger: number,
  defaultOrder: StaggerOrder,
  rng: () => number,
): SpecPlan {
  const stagger = spec.stagger ?? defaultStagger;
  const order = spec.staggerOrder ?? defaultOrder;
  const staggerOffsets = computeStaggerDelays(sliceCount, stagger, order, rng);

  const jitterMax = spec.jitterDelay ?? 0;
  const jitters = new Array<number>(sliceCount);
  for (let i = 0; i < sliceCount; i++) {
    jitters[i] = jitterMax > 0 ? rng() * jitterMax : 0;
  }

  const fromValues = new Array<number>(sliceCount);
  const toValues = new Array<number>(sliceCount);
  for (let i = 0; i < sliceCount; i++) {
    fromValues[i] = resolveValue(spec.from, rng);
    toValues[i] = resolveValue(spec.to, rng);
  }

  const effectiveOffsets = new Array<number>(sliceCount);
  for (let i = 0; i < sliceCount; i++) {
    effectiveOffsets[i] = staggerOffsets[i]! + jitters[i]!;
  }

  return {
    spec,
    staggerOffsets,
    jitters,
    effectiveOffsets,
    fromValues,
    toValues,
    ease: resolveEase(spec.ease),
  };
}

function specEnd(plan: SpecPlan): number {
  let maxOffset = 0;
  for (const o of plan.effectiveOffsets) {
    if (o > maxOffset) maxOffset = o;
  }
  const specLocalEnd = (plan.spec.delay ?? 0) + (plan.spec.duration ?? DEFAULT_DURATION);
  return maxOffset + specLocalEnd;
}

function evaluateForSlice(plans: SpecPlan[], sliceIndex: number, masterT: number): PropValues {
  const vals: PropValues = {};
  const touched = new Set<string>();
  // Forward pass: standard "later wins" for any spec whose window has opened.
  for (const plan of plans) {
    const { spec, effectiveOffsets, fromValues, toValues } = plan;
    const offset = effectiveOffsets[sliceIndex] ?? 0;
    const localT = masterT - offset;
    const delay = spec.delay ?? 0;
    if (localT < delay) continue;
    const duration = spec.duration ?? DEFAULT_DURATION;
    const progress =
      duration <= 0 ? 1 : Math.min(1, Math.max(0, (localT - delay) / duration));
    const eased = plan.ease(progress);
    const from = fromValues[sliceIndex] ?? 0;
    const to = toValues[sliceIndex] ?? 0;
    vals[spec.prop] = from + (to - from) * eased;
    touched.add(spec.prop);
  }
  // Back-fill: for any prop that hasn't touched yet on this slice (stagger
  // hasn't fired, or the spec delay is still in the future), hold the FIRST
  // spec's from-value so the transform/filter composition stays complete.
  for (const plan of plans) {
    if (!touched.has(plan.spec.prop)) {
      vals[plan.spec.prop] = plan.fromValues[sliceIndex] ?? 0;
      touched.add(plan.spec.prop);
    }
  }
  return vals;
}

/**
 * Walk the plans for a slice and return the latest opened spec's
 * `transformOrigin`, or undefined if no override has fired yet. Used to
 * implement last-write-wins per slice, evaluated each frame so seek()
 * stays consistent without separate event state.
 */
function activeOriginForSlice(plans: SpecPlan[], sliceIndex: number, masterT: number): TransformOrigin | undefined {
  let active: TransformOrigin | undefined;
  for (const plan of plans) {
    if (plan.spec.transformOrigin === undefined) continue;
    const offset = plan.effectiveOffsets[sliceIndex] ?? 0;
    const delay = plan.spec.delay ?? 0;
    if (masterT - offset >= delay) active = plan.spec.transformOrigin;
  }
  return active;
}

/**
 * The latest opened spec's `perspective` across all slices. A spec's
 * window is considered open as soon as any slice has reached its
 * effective start time, since `perspective` is container-scoped.
 */
function activePerspective(plans: SpecPlan[], masterT: number): number | undefined {
  let active: number | undefined;
  for (const plan of plans) {
    if (plan.spec.perspective === undefined) continue;
    let minOffset = Infinity;
    for (const o of plan.effectiveOffsets) {
      if (o < minOffset) minOffset = o;
    }
    if (minOffset === Infinity) continue;
    const delay = plan.spec.delay ?? 0;
    if (masterT - minOffset >= delay) active = plan.spec.perspective;
  }
  return active;
}

/**
 * Animate an element's text with per-slice, per-property choreography.
 *
 * Each spec is an independent timeline — its own `duration`, `delay`,
 * `ease`, `stagger`, and `staggerOrder`. Specs run on a single master
 * clock so one rAF tick produces one DOM write per slice, and same-prop
 * specs chain via `delay` (later wins once its window opens).
 *
 * For 3D transforms (rotateX/Y, translateZ) set `perspective` so children
 * render with depth.
 */
export function animateText(
  element: HTMLElement,
  options: AnimateTextOptions = {},
): AnimateTextHandle {
  const preset =
    options.preset === undefined
      ? null
      : typeof options.preset === "string"
        ? resolvePreset(options.preset)
        : options.preset;

  const splits = splitText(element, {
    mode: options.split ?? preset?.split ?? "character",
    ...(options.locale !== undefined ? { locale: options.locale } : {}),
  });

  const specs: TextAnimationSpec[] = options.animations ?? preset?.animations ?? [];
  const defaultStagger = options.stagger ?? preset?.stagger ?? DEFAULT_STAGGER;
  const defaultOrder: StaggerOrder = options.staggerOrder ?? preset?.staggerOrder ?? "start";
  const rng = options.rng ?? Math.random;
  const sliceCount = splits.slices.length;

  const plans = specs.map((s) => planSpec(s, sliceCount, defaultStagger, defaultOrder, rng));
  const totalDuration = plans.length === 0 ? 0 : Math.max(...plans.map(specEnd));

  const baselinePerspective = options.perspective ?? preset?.perspective;
  const perspectiveOrigin = options.perspectiveOrigin;
  const baselineTransformOrigin = options.transformOrigin ?? preset?.transformOrigin;

  let containerPerspectiveApplied = false;
  let containerPerspectiveOriginApplied = false;
  if (baselinePerspective !== undefined) {
    element.style.perspective = `${baselinePerspective}px`;
    containerPerspectiveApplied = true;
  }
  if (perspectiveOrigin !== undefined) {
    element.style.perspectiveOrigin = perspectiveOrigin;
    containerPerspectiveOriginApplied = true;
  }
  if (baselineTransformOrigin !== undefined) {
    const css = originToCss(baselineTransformOrigin);
    for (const slice of splits.slices) slice.style.transformOrigin = css;
  }

  // Track which slices we've ever written a per-spec transformOrigin to,
  // so stop() can clear them even if the baseline didn't set one.
  const sliceOriginDirty = new Array<boolean>(sliceCount).fill(false);

  const autoPlay = options.autoPlay ?? true;
  const respect = options.respectReducedMotion ?? true;
  const reduced = respect && prefersReducedMotion();

  for (let i = 0; i < sliceCount; i++) {
    applyProps(splits.slices[i]!, evaluateForSlice(plans, i, 0));
  }

  function applyOverrides(masterT: number): void {
    for (let i = 0; i < sliceCount; i++) {
      const origin = activeOriginForSlice(plans, i, masterT);
      if (origin !== undefined) {
        splits.slices[i]!.style.transformOrigin = originToCss(origin);
        sliceOriginDirty[i] = true;
      } else if (sliceOriginDirty[i] && baselineTransformOrigin === undefined) {
        // No override active and no baseline to fall back to — leave the
        // last-written value in place. Per-spec rule: "don't reset between
        // specs". Cleared on stop().
      }
    }
    const persp = activePerspective(plans, masterT);
    if (persp !== undefined) {
      element.style.perspective = `${persp}px`;
      containerPerspectiveApplied = true;
    }
  }

  function restoreContainer(): void {
    if (containerPerspectiveApplied) {
      element.style.removeProperty("perspective");
      containerPerspectiveApplied = false;
    }
    if (containerPerspectiveOriginApplied) {
      element.style.removeProperty("perspective-origin");
      containerPerspectiveOriginApplied = false;
    }
    if (baselineTransformOrigin !== undefined) {
      for (const slice of splits.slices) slice.style.removeProperty("transform-origin");
    } else {
      for (let i = 0; i < sliceCount; i++) {
        if (sliceOriginDirty[i]) {
          splits.slices[i]!.style.removeProperty("transform-origin");
          sliceOriginDirty[i] = false;
        }
      }
    }
  }

  if (plans.length === 0 || reduced || totalDuration <= 0) {
    for (let i = 0; i < sliceCount; i++) {
      applyProps(splits.slices[i]!, evaluateForSlice(plans, i, totalDuration));
    }
    applyOverrides(totalDuration);
    const handle: AnimateTextHandle = {
      play() {
        return handle;
      },
      pause() {
        return handle;
      },
      stop() {
        for (const slice of splits.slices) clearProps(slice);
        restoreContainer();
        return handle;
      },
      seek() {
        return handle;
      },
      finished: Promise.resolve(),
      splits,
    };
    return handle;
  }

  const initialDelay = Math.max(0, options.delay ?? 0);
  const repeat = options.repeat ?? preset?.repeat ?? 1;
  const totalCycles = repeat === "infinite" ? Infinity : Math.max(1, repeat);
  const repeatDelay = Math.max(0, options.repeatDelay ?? preset?.repeatDelay ?? 0);

  const schedulerOpt = options.scheduler !== undefined ? { scheduler: options.scheduler } : {};

  function renderAt(masterT: number): void {
    for (let i = 0; i < sliceCount; i++) {
      applyProps(splits.slices[i]!, evaluateForSlice(plans, i, masterT));
    }
    applyOverrides(masterT);
  }

  let stopped = false;
  let cyclesLeft = totalCycles;
  let currentCycle: AnimationHandle<number> | null = null;
  let initialTimer: number | null = null;
  let gapTimer: number | null = null;
  let resolveFinished!: () => void;
  const finished = new Promise<void>((res) => {
    resolveFinished = res;
  });
  finished.catch(() => {});

  function clearTimers(): void {
    if (initialTimer !== null) {
      window.clearTimeout(initialTimer);
      initialTimer = null;
    }
    if (gapTimer !== null) {
      window.clearTimeout(gapTimer);
      gapTimer = null;
    }
  }

  function startCycle(): void {
    if (stopped) return;
    currentCycle = animate({
      from: 0,
      to: 1,
      duration: totalDuration,
      autoPlay: true,
      ...schedulerOpt,
      onUpdate: (_v, p) => renderAt(p * totalDuration),
    });
    currentCycle.finished
      .then(() => {
        if (stopped) return;
        cyclesLeft = cyclesLeft === Infinity ? Infinity : cyclesLeft - 1;
        if (cyclesLeft <= 0) {
          resolveFinished();
          return;
        }
        if (repeatDelay > 0) {
          gapTimer = window.setTimeout(startCycle, repeatDelay);
        } else {
          startCycle();
        }
      })
      .catch(() => undefined);
  }

  function kickoff(): void {
    if (initialDelay > 0) {
      initialTimer = window.setTimeout(() => {
        initialTimer = null;
        startCycle();
      }, initialDelay);
    } else {
      startCycle();
    }
  }

  const handle: AnimateTextHandle = {
    play() {
      if (currentCycle === null) kickoff();
      else currentCycle.play();
      return handle;
    },
    pause() {
      currentCycle?.pause();
      return handle;
    },
    stop() {
      stopped = true;
      clearTimers();
      currentCycle?.stop();
      currentCycle = null;
      for (const slice of splits.slices) clearProps(slice);
      restoreContainer();
      resolveFinished();
      return handle;
    },
    seek(p) {
      currentCycle?.seek(p);
      return handle;
    },
    get finished() {
      return finished;
    },
    splits,
  };

  if (autoPlay) kickoff();
  return handle;
}
