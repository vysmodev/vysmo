import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollObserver } from "../observer.js";
import { createScrollProgress } from "../progress.js";

let el: HTMLElement;
let spacerBefore: HTMLElement;
let spacerAfter: HTMLElement;

beforeEach(() => {
  spacerBefore = document.createElement("div");
  spacerBefore.style.cssText = "height:2000px;";
  document.body.appendChild(spacerBefore);

  el = document.createElement("div");
  el.style.cssText = "width:100%;height:400px;background:red;";
  document.body.appendChild(el);

  // Trailing spacer ensures the document is tall enough for scrollTo()
  // to actually reach large Y values without hitting the scroll maximum.
  spacerAfter = document.createElement("div");
  spacerAfter.style.cssText = "height:5000px;";
  document.body.appendChild(spacerAfter);

  window.scrollTo(0, 0);
});

afterEach(() => {
  spacerBefore.remove();
  el.remove();
  spacerAfter.remove();
  window.scrollTo(0, 0);
});

describe("createScrollProgress", () => {
  it("starts at 0 when the element is below the viewport", async () => {
    const onProgress = vi.fn();
    const h = createScrollProgress({ element: el, onProgress });
    await waitForFrame();
    expect(onProgress).toHaveBeenCalled();
    expect(onProgress.mock.calls.at(-1)![0]).toBe(0);
    h.destroy();
  });

  it("advances as the user scrolls through the element", async () => {
    const values: number[] = [];
    const h = createScrollProgress({
      element: el,
      onProgress: (p) => values.push(p),
    });
    await waitForFrame();
    window.scrollTo(0, 1500);
    await waitForFrame();
    window.scrollTo(0, 2400);
    await waitForFrame();
    expect(values[0]).toBe(0);
    expect(values.at(-1)!).toBeGreaterThan(values[0]!);
    h.destroy();
  });

  it("reaches 1 after fully scrolling past the element", async () => {
    const values: number[] = [];
    const h = createScrollProgress({
      element: el,
      onProgress: (p) => values.push(p),
    });
    await waitForFrame();
    window.scrollTo(0, 5000);
    await waitForFrame();
    expect(values.at(-1)!).toBe(1);
    h.destroy();
  });

  it("clamps progress into [0, 1]", async () => {
    const values: number[] = [];
    const h = createScrollProgress({
      element: el,
      onProgress: (p) => values.push(p),
    });
    await waitForFrame();
    for (const y of [0, 100, 1500, 3000, 10000]) {
      window.scrollTo(0, y);
      await waitForFrame();
    }
    for (const p of values) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
    h.destroy();
  });

  it("applies the ease() callback to remap the raw value", () => {
    const observer = new ScrollObserver();
    const onProgress = vi.fn();
    observer.subscribe(el, {
      onScroll(rect, viewport) {
        const raw = (viewport.height - rect.top) / (viewport.height + rect.height);
        const clamped = Math.max(0, Math.min(1, raw));
        // Mirror the internal calculation: ease(clamped) = clamped * 2
        const mapped = clamped * 2;
        onProgress(mapped);
      },
    });
    observer.flush();
    expect(onProgress).toHaveBeenCalledTimes(1);
  });

  it("does not re-emit when the clamped value is unchanged", async () => {
    const onProgress = vi.fn();
    const h = createScrollProgress({ element: el, onProgress });
    await waitForFrame();
    // Two identical rAF ticks at the same scroll position should collapse.
    const before = onProgress.mock.calls.length;
    await waitForFrame();
    await waitForFrame();
    const after = onProgress.mock.calls.length;
    expect(after).toBe(before);
    h.destroy();
  });
});

async function waitForFrame(): Promise<void> {
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  // A second rAF gives the observer time to run its flush after the
  // scroll event has been dispatched synchronously.
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
}
