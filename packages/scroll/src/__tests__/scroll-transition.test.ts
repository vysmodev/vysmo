import type { Runner as TransitionRunner, Transition, UniformParams } from "@vysmo/transitions";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createScrollTransition } from "../scroll-transition.js";

/**
 * Mock Runner — satisfies the narrow shape `createScrollTransition` uses
 * without touching WebGL. The test asserts that scroll drives render() with
 * the correct progress / args, which is the whole contract here.
 */
function mockRunner(): TransitionRunner & { calls: Array<{ transition: unknown; args: unknown }> } {
  const calls: Array<{ transition: unknown; args: unknown }> = [];
  const runner = {
    calls,
    render(transition: unknown, args: unknown) {
      calls.push({ transition, args });
    },
  };
  return runner as unknown as TransitionRunner & typeof runner;
}

const FAKE_TRANSITION = {
  name: "fake",
  defaults: { amount: 0.5 },
  shader: { glsl: "" },
} as unknown as Transition<{ amount: number }>;

let spacerBefore: HTMLElement;
let section: HTMLElement;
let spacerAfter: HTMLElement;

beforeEach(() => {
  spacerBefore = document.createElement("div");
  spacerBefore.style.cssText = "height:2000px;";
  document.body.appendChild(spacerBefore);

  section = document.createElement("div");
  section.style.cssText = "width:100%;height:400px;";
  document.body.appendChild(section);

  spacerAfter = document.createElement("div");
  spacerAfter.style.cssText = "height:5000px;";
  document.body.appendChild(spacerAfter);

  window.scrollTo(0, 0);
});

afterEach(() => {
  spacerBefore.remove();
  section.remove();
  spacerAfter.remove();
  window.scrollTo(0, 0);
});

async function waitForFrame(): Promise<void> {
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
}

describe("createScrollTransition", () => {
  it("renders at progress 0 when the section is below the viewport", async () => {
    const runner = mockRunner();
    const h = createScrollTransition({
      section,
      runner,
      transition: FAKE_TRANSITION,
      from: {} as unknown as UniformParams extends never ? never : HTMLImageElement,
      to: {} as unknown as HTMLImageElement,
    });
    await waitForFrame();
    expect(runner.calls.length).toBeGreaterThanOrEqual(1);
    const last = runner.calls.at(-1)!;
    expect(last.transition).toBe(FAKE_TRANSITION);
    expect((last.args as { progress: number }).progress).toBe(0);
    h.destroy();
  });

  it("drives progress from 0 → 1 as the user scrolls past", async () => {
    const runner = mockRunner();
    const h = createScrollTransition({
      section,
      runner,
      transition: FAKE_TRANSITION,
      from: {} as unknown as HTMLImageElement,
      to: {} as unknown as HTMLImageElement,
    });
    await waitForFrame();
    window.scrollTo(0, 5000);
    await waitForFrame();
    const progresses = runner.calls.map((c) => (c.args as { progress: number }).progress);
    expect(progresses[0]).toBe(0);
    expect(progresses.at(-1)).toBe(1);
    h.destroy();
  });

  it("forwards params through to the runner", async () => {
    const runner = mockRunner();
    const h = createScrollTransition({
      section,
      runner,
      transition: FAKE_TRANSITION,
      from: {} as unknown as HTMLImageElement,
      to: {} as unknown as HTMLImageElement,
      params: { amount: 0.75 },
    });
    await waitForFrame();
    const last = runner.calls.at(-1)!;
    expect((last.args as { params: { amount: number } }).params).toEqual({ amount: 0.75 });
    h.destroy();
  });

  it("applies ease() to the raw progress", async () => {
    const runner = mockRunner();
    const h = createScrollTransition({
      section,
      runner,
      transition: FAKE_TRANSITION,
      from: {} as unknown as HTMLImageElement,
      to: {} as unknown as HTMLImageElement,
      // raw 0.5 → eased 0.25
      ease: (t) => t * t,
    });
    await waitForFrame();
    // Scroll midway.
    window.scrollTo(0, 2400);
    await waitForFrame();
    const mids = runner.calls.map((c) => (c.args as { progress: number }).progress);
    for (const p of mids) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
    h.destroy();
  });

  it("does not re-render when the clamped progress hasn't changed", async () => {
    const runner = mockRunner();
    const h = createScrollTransition({
      section,
      runner,
      transition: FAKE_TRANSITION,
      from: {} as unknown as HTMLImageElement,
      to: {} as unknown as HTMLImageElement,
    });
    await waitForFrame();
    const before = runner.calls.length;
    await waitForFrame();
    await waitForFrame();
    expect(runner.calls.length).toBe(before);
    h.destroy();
  });

  it("destroy() unsubscribes — no further renders after scroll", async () => {
    const runner = mockRunner();
    const h = createScrollTransition({
      section,
      runner,
      transition: FAKE_TRANSITION,
      from: {} as unknown as HTMLImageElement,
      to: {} as unknown as HTMLImageElement,
    });
    await waitForFrame();
    h.destroy();
    const before = runner.calls.length;
    window.scrollTo(0, 5000);
    await waitForFrame();
    expect(runner.calls.length).toBe(before);
  });
});
