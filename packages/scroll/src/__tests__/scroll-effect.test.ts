import type { Runner as EffectRunner, Effect } from "@vysmo/effects";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createScrollEffect } from "../scroll-effect.js";

function mockRunner(): EffectRunner & { calls: Array<{ effect: unknown; args: unknown }> } {
  const calls: Array<{ effect: unknown; args: unknown }> = [];
  const runner = {
    calls,
    render(effect: unknown, args: unknown) {
      calls.push({ effect, args });
    },
  };
  return runner as unknown as EffectRunner & typeof runner;
}

const FAKE_EFFECT = {
  name: "fake-blur",
  defaults: { radius: 0 },
  shader: { glsl: "" },
} as unknown as Effect<{ radius: number }>;

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

describe("createScrollEffect", () => {
  it("invokes paramsAt with progress 0 when the section is below the viewport", async () => {
    const runner = mockRunner();
    const paramsSeen: number[] = [];
    const h = createScrollEffect({
      section,
      runner,
      effect: FAKE_EFFECT,
      source: {} as unknown as HTMLImageElement,
      paramsAt: (p) => {
        paramsSeen.push(p);
        return { radius: p * 10 };
      },
    });
    await waitForFrame();
    expect(paramsSeen[0]).toBe(0);
    const last = runner.calls.at(-1)!;
    expect((last.args as { params: { radius: number } }).params).toEqual({ radius: 0 });
    h.destroy();
  });

  it("maps progress through paramsAt as the user scrolls", async () => {
    const runner = mockRunner();
    const h = createScrollEffect({
      section,
      runner,
      effect: FAKE_EFFECT,
      source: {} as unknown as HTMLImageElement,
      paramsAt: (p) => ({ radius: p * 20 }),
    });
    await waitForFrame();
    window.scrollTo(0, 5000);
    await waitForFrame();
    const lastRadius = (runner.calls.at(-1)!.args as { params: { radius: number } }).params
      .radius;
    expect(lastRadius).toBe(20);
    h.destroy();
  });

  it("respects ease() before calling paramsAt", async () => {
    const runner = mockRunner();
    const easeCalls: number[] = [];
    const paramsAtInputs: number[] = [];
    const h = createScrollEffect({
      section,
      runner,
      effect: FAKE_EFFECT,
      source: {} as unknown as HTMLImageElement,
      ease: (t) => {
        easeCalls.push(t);
        return t * t;
      },
      paramsAt: (p) => {
        paramsAtInputs.push(p);
        return { radius: p };
      },
    });
    await waitForFrame();
    expect(easeCalls.length).toBeGreaterThan(0);
    expect(paramsAtInputs.length).toBeGreaterThan(0);
    // paramsAt input is the eased value, not the raw.
    expect(paramsAtInputs[0]).toBeCloseTo(0, 5);
    h.destroy();
  });

  it("destroy() unsubscribes — no further renders after scroll", async () => {
    const runner = mockRunner();
    const h = createScrollEffect({
      section,
      runner,
      effect: FAKE_EFFECT,
      source: {} as unknown as HTMLImageElement,
      paramsAt: (p) => ({ radius: p * 10 }),
    });
    await waitForFrame();
    h.destroy();
    const before = runner.calls.length;
    window.scrollTo(0, 5000);
    await waitForFrame();
    expect(runner.calls.length).toBe(before);
  });
});
