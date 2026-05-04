import { createTestScheduler } from "@vysmo/animations";
import { afterEach, describe, expect, it } from "vitest";
import { animateText, evaluateSpecs } from "../animate.js";
import { pulse } from "../presets/emphasis.js";

let mounted: HTMLElement[] = [];

function mount(text: string): HTMLElement {
  const el = document.createElement("p");
  el.textContent = text;
  document.body.appendChild(el);
  mounted.push(el);
  return el;
}

afterEach(() => {
  for (const el of mounted) el.remove();
  mounted = [];
});

describe("evaluateSpecs", () => {
  it("returns the from-value at t=0 for a delay-0 spec", () => {
    const vals = evaluateSpecs(
      [{ prop: "opacity", from: 0, to: 1, duration: 500 }],
      0,
    );
    expect(vals.opacity).toBe(0);
  });

  it("returns the to-value at the end of the window", () => {
    const vals = evaluateSpecs(
      [{ prop: "opacity", from: 0, to: 1, duration: 500 }],
      500,
    );
    expect(vals.opacity).toBe(1);
  });

  it("skips specs whose delay hasn't elapsed", () => {
    const vals = evaluateSpecs(
      [
        { prop: "scale", from: 1, to: 1.25, duration: 200, delay: 0 },
        { prop: "scale", from: 1.25, to: 1, duration: 250, delay: 200 },
      ],
      100,
    );
    expect(vals.scale).toBeCloseTo(1.125, 3);
  });

  it("later-delayed spec wins once active (prop chaining)", () => {
    const vals = evaluateSpecs(
      [
        { prop: "scale", from: 1, to: 1.25, duration: 200, delay: 0 },
        { prop: "scale", from: 1.25, to: 1, duration: 250, delay: 200 },
      ],
      325,
    );
    // window-local in spec[1]: (325-200)/250 = 0.5 → 1.25 + (1-1.25)*0.5 = 1.125
    expect(vals.scale).toBeCloseTo(1.125, 3);
  });

  it("both animation windows closed → holds the most-recent to-value", () => {
    const vals = evaluateSpecs(
      [
        { prop: "scale", from: 1, to: 1.25, duration: 200, delay: 0 },
        { prop: "scale", from: 1.25, to: 1, duration: 250, delay: 200 },
      ],
      1000,
    );
    expect(vals.scale).toBe(1);
  });
});

describe("animateText", () => {
  it("splits the element and returns a handle with slice metadata", () => {
    const el = mount("abc");
    const handle = animateText(el, {
      animations: [{ prop: "opacity", from: 0, to: 1, duration: 100 }],
      autoPlay: false,
      respectReducedMotion: false,
    });
    expect(handle.splits.slices).toHaveLength(3);
    expect(handle.splits.original).toBe("abc");
  });

  it("applies the initial from-state on creation (no flash of final state)", () => {
    const el = mount("Hi");
    const handle = animateText(el, {
      animations: [{ prop: "opacity", from: 0, to: 1, duration: 100 }],
      autoPlay: false,
      respectReducedMotion: false,
    });
    for (const slice of handle.splits.slices) {
      expect(slice.style.opacity).toBe("0");
    }
  });

  it("drives slices from 0 → 1 via the injected scheduler", async () => {
    const el = mount("Hi");
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [{ prop: "opacity", from: 0, to: 1, duration: 100 }],
      stagger: 0,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(100);
    for (const slice of handle.splits.slices) {
      expect(slice.style.opacity).toBe("1");
    }
    await handle.finished;
  });

  it("stagger delays slices by their index", () => {
    const el = mount("abcd");
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [{ prop: "opacity", from: 0, to: 1, duration: 100 }],
      stagger: 50,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(50);
    // At t=50: slice 0 is halfway (opacity ~0.5), slice 3 hasn't started (opacity 0).
    const first = Number(handle.splits.slices[0]!.style.opacity);
    const last = Number(handle.splits.slices[3]!.style.opacity);
    expect(first).toBeGreaterThan(last);
    expect(last).toBe(0);
  });

  it("stop() resets slice styles", () => {
    const el = mount("ab");
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [{ prop: "opacity", from: 0, to: 1, duration: 100 }],
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(50);
    handle.stop();
    for (const slice of handle.splits.slices) {
      expect(slice.style.opacity).toBe("");
      expect(slice.style.transform).toBe("");
    }
  });

  it("preset drives the split mode, stagger, and animations", () => {
    const el = mount("Hi");
    const handle = animateText(el, {
      preset: "enter/fade-up",
      autoPlay: false,
      respectReducedMotion: false,
    });
    expect(handle.splits.mode).toBe("character");
    // fade-up's initial state: opacity 0, translateY 20 — both visible in inline style.
    for (const slice of handle.splits.slices) {
      expect(slice.style.opacity).toBe("0");
      expect(slice.style.transform).toContain("20px");
    }
  });

  it("accepts a Preset object directly (tree-shakable path)", async () => {
    const { fadeUp } = await import("../presets/enter.js");
    const el = mount("Hi");
    const handle = animateText(el, {
      preset: fadeUp,
      autoPlay: false,
      respectReducedMotion: false,
    });
    expect(handle.splits.mode).toBe("character");
    for (const slice of handle.splits.slices) {
      expect(slice.style.opacity).toBe("0");
    }
  });

  it("no specs + no preset → finished resolves immediately, no work done", async () => {
    const el = mount("Hi");
    const handle = animateText(el, { respectReducedMotion: false });
    await expect(handle.finished).resolves.toBeUndefined();
  });

  it("emphasis/pulse chains two specs on scale", () => {
    // Sanity-check the preset via evaluateSpecs — visually, pulse grows then shrinks.
    const atMid = evaluateSpecs(pulse.animations, 200);
    expect(atMid.scale).toBeCloseTo(1.25, 2);
    const atEnd = evaluateSpecs(pulse.animations, 450);
    expect(atEnd.scale).toBeCloseTo(1, 2);
  });

  it("applies container perspective + perspective-origin + slice transform-origin", () => {
    const el = mount("Hi");
    animateText(el, {
      preset: "enter/flip-x",
      autoPlay: false,
      respectReducedMotion: false,
    });
    expect(el.style.perspective).toBe("800px");
    const firstSlice = el.querySelector<HTMLElement>("[data-text-slice=\"character\"]");
    expect(firstSlice?.style.transformOrigin).toBe("50% 100%");
  });

  it("stop() restores container perspective and slice transform-origin", () => {
    const el = mount("Hi");
    const handle = animateText(el, {
      preset: "enter/flip-x",
      respectReducedMotion: false,
      autoPlay: false,
    });
    expect(el.style.perspective).toBe("800px");
    handle.stop();
    expect(el.style.perspective).toBe("");
    const firstSlice = el.querySelector<HTMLElement>("[data-text-slice=\"character\"]");
    expect(firstSlice?.style.transformOrigin).toBe("");
  });

  it("per-spec stagger overrides the root stagger for that one prop", () => {
    const el = mount("abcd");
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [
        { prop: "opacity", from: 0, to: 1, duration: 100, stagger: 0 },
        { prop: "translateY", from: 20, to: 0, duration: 100, stagger: 200 },
      ],
      stagger: 0,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(100);
    // At t=100: opacity (stagger=0) is fully at 1 on every slice.
    for (const slice of handle.splits.slices) {
      expect(slice.style.opacity).toBe("1");
    }
    // translateY (stagger=200) has only fired on slice 0 so far — slice 3 is
    // still at its from value (20px).
    const first = handle.splits.slices[0]!;
    const last = handle.splits.slices[3]!;
    expect(first.style.transform).toContain("0px, 0px");
    expect(last.style.transform).toContain("0px, 20px");
  });

  it("repeat: 2 with repeatDelay: 0 plays two cycles back-to-back", async () => {
    const el = mount("Hi");
    const sched = createTestScheduler();
    const completeSpy: number[] = [];
    const handle = animateText(el, {
      animations: [
        {
          prop: "opacity",
          from: 0,
          to: 1,
          duration: 100,
          ease: (t) => {
            if (t === 1) completeSpy.push(1);
            return t;
          },
        },
      ],
      stagger: 0,
      repeat: 2,
      repeatDelay: 0,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(100); // cycle 1 finishes
    await Promise.resolve();
    await Promise.resolve();
    sched.tick(0); // cycle 2 first frame
    sched.tick(100); // cycle 2 finishes
    await expect(handle.finished).resolves.toBeUndefined();
    // Ease hit t=1 at least twice — once per cycle.
    expect(completeSpy.length).toBeGreaterThanOrEqual(2);
  });

  it("repeat: 'infinite' does not resolve finished; stop() does", async () => {
    const el = mount("Hi");
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [{ prop: "opacity", from: 0, to: 1, duration: 50 }],
      stagger: 0,
      repeat: "infinite",
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(50); // cycle 1 completes
    await Promise.resolve();
    await Promise.resolve();

    let done = false;
    handle.finished.then(() => {
      done = true;
    });
    await Promise.resolve();
    expect(done).toBe(false);

    handle.stop();
    await expect(handle.finished).resolves.toBeUndefined();
    expect(done).toBe(true);
  });

  it("preset.repeat / preset.repeatDelay are honoured as defaults", () => {
    // Build a tiny preset object without touching the library catalog, so
    // we don't depend on a specific real preset's defaults.
    const handle = animateText(mount("Hi"), {
      preset: {
        name: "emphasis/pulse",
        split: "character",
        stagger: 0,
        repeat: 3,
        repeatDelay: 0,
        animations: [{ prop: "opacity", from: 0.5, to: 1, duration: 50 }],
      },
      autoPlay: false,
      respectReducedMotion: false,
    });
    expect(handle.splits.mode).toBe("character");
  });

  it("transforms compose rotateX with translate3d when both are active", () => {
    const el = mount("Hi");
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [
        { prop: "rotateX", from: -90, to: 0, duration: 100 },
        { prop: "translateY", from: 10, to: 0, duration: 100 },
      ],
      stagger: 0,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(50);
    const t = handle.splits.slices[0]!.style.transform;
    expect(t).toContain("translate3d(");
    expect(t).toContain("rotateX(");
  });
});

/** Counter-style rng — every call returns a fixed sequence (mod len). */
function makeSeqRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length]!;
}

describe("range from / to (per-slice scatter)", () => {
  it("range `from` resolves a different value per slice via rng", () => {
    const el = mount("ABCD");
    // Four slices × (from, to) pairs. Since `to` is scalar (0), only the
    // `from` reads draw from the rng. Stagger is also 0 so it skips its draw.
    const rng = makeSeqRng([0, 0.25, 0.5, 0.75]);
    const handle = animateText(el, {
      animations: [
        { prop: "translateY", from: { min: 0, max: 100 }, to: 0, duration: 100 },
      ],
      stagger: 0,
      rng,
      autoPlay: false,
      respectReducedMotion: false,
    });
    // Initial render is at masterT=0 → progress=0 → each slice shows its `from`.
    const slices = handle.splits.slices;
    expect(slices[0]!.style.transform).toContain("0px, 0px, 0px");
    expect(slices[1]!.style.transform).toContain("0px, 25px, 0px");
    expect(slices[2]!.style.transform).toContain("0px, 50px, 0px");
    expect(slices[3]!.style.transform).toContain("0px, 75px, 0px");
  });

  it("range with min === max produces a constant without consuming rng draws", () => {
    const el = mount("AB");
    let rngCalls = 0;
    const rng = (): number => {
      rngCalls++;
      return 0.5;
    };
    animateText(el, {
      animations: [
        { prop: "translateY", from: { min: 5, max: 5 }, to: 0, duration: 100 },
      ],
      stagger: 0,
      rng,
      autoPlay: false,
      respectReducedMotion: false,
    });
    // Stagger is 0 so it shouldn't draw. min===max should not draw either.
    expect(rngCalls).toBe(0);
  });

  it("scalar `from` continues to work (regression)", () => {
    const el = mount("AB");
    const handle = animateText(el, {
      animations: [{ prop: "translateY", from: 20, to: 0, duration: 100 }],
      stagger: 0,
      autoPlay: false,
      respectReducedMotion: false,
    });
    for (const slice of handle.splits.slices) {
      expect(slice.style.transform).toContain("0px, 20px, 0px");
    }
  });

  it("range `to` resolves per slice and animates toward that value", () => {
    const el = mount("AB");
    const rng = makeSeqRng([0, 1]);
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [
        { prop: "translateY", from: 0, to: { min: -50, max: 50 }, duration: 100 },
      ],
      stagger: 0,
      scheduler: sched,
      rng,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(100); // animation complete — each slice lands at its resolved `to`
    expect(handle.splits.slices[0]!.style.transform).toContain("0px, -50px, 0px");
    expect(handle.splits.slices[1]!.style.transform).toContain("0px, 50px, 0px");
  });
});

describe("jitterDelay (per-slice random delay)", () => {
  it("jitterDelay shifts each slice's effective start time by [0, jitterDelay]", () => {
    const el = mount("AB");
    // Slice 0 jitter = 0 → starts at t=0; slice 1 jitter = 100 → starts at t=100.
    // With duration=100, at t=100: slice 0 is at end (1), slice 1 is at start (0).
    const rng = makeSeqRng([0, 1]);
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [
        { prop: "opacity", from: 0, to: 1, duration: 100, jitterDelay: 100 },
      ],
      stagger: 0,
      scheduler: sched,
      rng,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(100);
    expect(handle.splits.slices[0]!.style.opacity).toBe("1");
    expect(handle.splits.slices[1]!.style.opacity).toBe("0");
  });

  it("jitterDelay = 0 (default) draws no rng samples for jitter", () => {
    const el = mount("AB");
    let calls = 0;
    const rng = (): number => {
      calls++;
      return 0;
    };
    animateText(el, {
      animations: [{ prop: "opacity", from: 0, to: 1, duration: 100 }],
      stagger: 0,
      rng,
      autoPlay: false,
      respectReducedMotion: false,
    });
    expect(calls).toBe(0);
  });

  it("jitterDelay extends totalDuration so the last slice still finishes", async () => {
    const el = mount("AB");
    const rng = makeSeqRng([0, 1]);
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [
        { prop: "opacity", from: 0, to: 1, duration: 100, jitterDelay: 100 },
      ],
      stagger: 0,
      scheduler: sched,
      rng,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(200); // jitter (100) + duration (100) — slice 1 should be done
    await handle.finished;
    expect(handle.splits.slices[1]!.style.opacity).toBe("1");
  });
});

describe("per-spec transformOrigin", () => {
  it("writes the override to the slice's inline style at spec start", () => {
    const el = mount("AB");
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [
        {
          prop: "rotateX",
          from: -90,
          to: 0,
          duration: 100,
          transformOrigin: { x: 0.5, y: 0 },
        },
      ],
      stagger: 0,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    expect(handle.splits.slices[0]!.style.transformOrigin).toBe("50% 0%");
  });

  it("last-write-wins when two overlapping specs declare different origins", () => {
    const el = mount("A");
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [
        {
          prop: "rotateX",
          from: -90,
          to: 0,
          duration: 200,
          transformOrigin: { x: 0.5, y: 0 },
        },
        {
          prop: "rotateY",
          from: -90,
          to: 0,
          duration: 200,
          delay: 100,
          transformOrigin: { x: 1, y: 0.5 },
        },
      ],
      stagger: 0,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    sched.tick(50); // only first spec is open
    expect(handle.splits.slices[0]!.style.transformOrigin).toBe("50% 0%");
    sched.tick(150); // second spec's window opened — wins
    expect(handle.splits.slices[0]!.style.transformOrigin).toBe("100% 50%");
  });

  it("stop() clears slice transform-origin when no preset baseline was set", () => {
    const el = mount("A");
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [
        {
          prop: "rotateX",
          from: -90,
          to: 0,
          duration: 100,
          transformOrigin: { x: 0.5, y: 0 },
        },
      ],
      stagger: 0,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    expect(handle.splits.slices[0]!.style.transformOrigin).toBe("50% 0%");
    handle.stop();
    expect(handle.splits.slices[0]!.style.transformOrigin).toBe("");
  });
});

describe("per-spec perspective", () => {
  it("writes the override to the container at spec start", () => {
    const el = mount("AB");
    const sched = createTestScheduler();
    animateText(el, {
      animations: [
        {
          prop: "rotateY",
          from: -90,
          to: 0,
          duration: 100,
          perspective: 1200,
        },
      ],
      stagger: 0,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    expect(el.style.perspective).toBe("1200px");
  });

  it("last-write-wins across overlapping specs", () => {
    const el = mount("A");
    const sched = createTestScheduler();
    animateText(el, {
      perspective: 800, // baseline
      animations: [
        {
          prop: "rotateX",
          from: -90,
          to: 0,
          duration: 200,
          perspective: 1000,
        },
        {
          prop: "rotateY",
          from: -90,
          to: 0,
          duration: 200,
          delay: 100,
          perspective: 1500,
        },
      ],
      stagger: 0,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    expect(el.style.perspective).toBe("1000px"); // first override fired
    sched.tick(150);
    expect(el.style.perspective).toBe("1500px"); // second override wins
  });

  it("stop() restores container even after a per-spec override", () => {
    const el = mount("A");
    const sched = createTestScheduler();
    const handle = animateText(el, {
      animations: [
        {
          prop: "rotateY",
          from: -90,
          to: 0,
          duration: 100,
          perspective: 1200,
        },
      ],
      stagger: 0,
      scheduler: sched,
      respectReducedMotion: false,
    });
    sched.tick(0);
    expect(el.style.perspective).toBe("1200px");
    handle.stop();
    expect(el.style.perspective).toBe("");
  });
});
