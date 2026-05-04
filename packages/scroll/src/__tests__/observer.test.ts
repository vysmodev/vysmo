import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollObserver, sharedScrollObserver } from "../index.js";

let el: HTMLElement;

beforeEach(() => {
  el = document.createElement("div");
  el.style.height = "200px";
  el.style.width = "200px";
  document.body.appendChild(el);
});

afterEach(() => {
  el.remove();
});

describe("ScrollObserver", () => {
  it("delivers the current rect + viewport on flush", () => {
    const observer = new ScrollObserver();
    const onScroll = vi.fn();
    observer.subscribe(el, { onScroll });
    observer.flush();
    expect(onScroll).toHaveBeenCalledTimes(1);
    const [rect, viewport] = onScroll.mock.calls[0]!;
    expect(rect).toBeInstanceOf(DOMRect);
    expect(viewport.width).toBe(window.innerWidth);
    expect(viewport.height).toBe(window.innerHeight);
  });

  it("notifies multiple subscribers on one flush", () => {
    const observer = new ScrollObserver();
    const el2 = document.createElement("div");
    document.body.appendChild(el2);
    const a = vi.fn();
    const b = vi.fn();
    observer.subscribe(el, { onScroll: a });
    observer.subscribe(el2, { onScroll: b });
    observer.flush();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    el2.remove();
  });

  it("unsubscribing stops further notifications for that element", () => {
    const observer = new ScrollObserver();
    const onScroll = vi.fn();
    const unsub = observer.subscribe(el, { onScroll });
    observer.flush();
    expect(onScroll).toHaveBeenCalledTimes(1);
    unsub();
    observer.flush();
    expect(onScroll).toHaveBeenCalledTimes(1);
  });

  it("sharedScrollObserver returns a stable singleton", () => {
    const a = sharedScrollObserver();
    const b = sharedScrollObserver();
    expect(a).toBe(b);
  });
});
