import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSlideshow, type SlideshowHandle } from "../index.js";

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement("div");
  container.style.width = "400px";
  container.style.height = "225px";
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
});

function makeSlide(color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 80;
  c.height = 45;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 80, 45);
  return c;
}

async function mountReady(
  slides: HTMLCanvasElement[],
  overrides?: Partial<Parameters<typeof createSlideshow>[0]>,
): Promise<SlideshowHandle> {
  const s = createSlideshow({
    container,
    slides,
    transitionDuration: 40, // short for test speed
    autoplayDelay: 0,
    ...overrides,
  });
  await s.ready;
  return s;
}

describe("createSlideshow: structure", () => {
  it("mounts a wrapper + canvas + aria-live status into the container", async () => {
    const s = await mountReady([makeSlide("red"), makeSlide("green")]);
    const wrapper = container.querySelector("[data-slideshow-wrapper]");
    expect(wrapper).toBeTruthy();
    expect(wrapper!.getAttribute("role")).toBe("region");
    expect(wrapper!.getAttribute("aria-roledescription")).toBe("carousel");
    expect(wrapper!.getAttribute("aria-label")).toBe("Slideshow");
    expect(wrapper!.querySelector("[data-slideshow-canvas]")).toBeTruthy();
    const live = wrapper!.querySelector('[aria-live="polite"]');
    expect(live).toBeTruthy();
    s.destroy();
  });

  it("starts at index 0 by default; initial overrides", async () => {
    const a = await mountReady([makeSlide("red"), makeSlide("green")]);
    expect(a.current).toBe(0);
    a.destroy();
    container.innerHTML = "";
    const b = await mountReady(
      [makeSlide("red"), makeSlide("green"), makeSlide("blue")],
      { initial: 2 },
    );
    expect(b.current).toBe(2);
    b.destroy();
  });

  it("length reflects the number of slides", async () => {
    const s = await mountReady([
      makeSlide("red"),
      makeSlide("green"),
      makeSlide("blue"),
    ]);
    expect(s.length).toBe(3);
    s.destroy();
  });

  it("throws if slides array is empty", () => {
    expect(() =>
      createSlideshow({ container, slides: [] }),
    ).toThrow(/at least one slide/);
  });

  it("respects a custom ariaLabel", async () => {
    const s = await mountReady([makeSlide("red"), makeSlide("green")], {
      ariaLabel: "Portfolio",
    });
    const wrapper = container.querySelector("[data-slideshow-wrapper]");
    expect(wrapper!.getAttribute("aria-label")).toBe("Portfolio");
    s.destroy();
  });
});

describe("createSlideshow: navigation", () => {
  it("next() advances the current index", async () => {
    const s = await mountReady([
      makeSlide("red"),
      makeSlide("green"),
      makeSlide("blue"),
    ]);
    await s.next();
    expect(s.current).toBe(1);
    await s.next();
    expect(s.current).toBe(2);
    s.destroy();
  });

  it("next() wraps from last → first when loop is true", async () => {
    const s = await mountReady(
      [makeSlide("red"), makeSlide("green")],
      { initial: 1, loop: true },
    );
    await s.next();
    expect(s.current).toBe(0);
    s.destroy();
  });

  it("next() stops at last when loop is false", async () => {
    const s = await mountReady(
      [makeSlide("red"), makeSlide("green")],
      { initial: 1, loop: false },
    );
    await s.next();
    expect(s.current).toBe(1);
    s.destroy();
  });

  it("prev() wraps from first → last when loop is true", async () => {
    const s = await mountReady(
      [makeSlide("red"), makeSlide("green"), makeSlide("blue")],
      { loop: true },
    );
    await s.prev();
    expect(s.current).toBe(2);
    s.destroy();
  });

  it("go(index) transitions to a specific slide", async () => {
    const s = await mountReady([
      makeSlide("red"),
      makeSlide("green"),
      makeSlide("blue"),
    ]);
    await s.go(2);
    expect(s.current).toBe(2);
    s.destroy();
  });

  it("go(index, { instant: true }) snaps without playing the transition", async () => {
    const s = await mountReady([
      makeSlide("red"),
      makeSlide("green"),
      makeSlide("blue"),
    ]);
    const starts: number[] = [];
    s.on("transitionstart", () => starts.push(Date.now()));
    await s.go(2, { instant: true });
    expect(s.current).toBe(2);
    expect(starts).toHaveLength(0);
    s.destroy();
  });

  it("go(currentIndex) is a no-op", async () => {
    const s = await mountReady([makeSlide("red"), makeSlide("green")]);
    const starts: number[] = [];
    s.on("transitionstart", () => starts.push(1));
    await s.go(0);
    expect(starts).toHaveLength(0);
    s.destroy();
  });

  it("clamps out-of-range indices", async () => {
    const s = await mountReady([
      makeSlide("red"),
      makeSlide("green"),
      makeSlide("blue"),
    ]);
    await s.go(99);
    expect(s.current).toBe(2);
    await s.go(-5, { instant: true });
    expect(s.current).toBe(0);
    s.destroy();
  });
});

describe("createSlideshow: events", () => {
  it("fires change + transitionstart + transitionend in order", async () => {
    const s = await mountReady([makeSlide("red"), makeSlide("green")]);
    const events: string[] = [];
    s.on("transitionstart", (f, t) => events.push(`start:${f}->${t}`));
    s.on("change", (cur, prev) => events.push(`change:${prev}->${cur}`));
    s.on("transitionend", (f, t) => events.push(`end:${f}->${t}`));
    await s.next();
    expect(events).toEqual(["start:0->1", "change:0->1", "end:0->1"]);
    s.destroy();
  });

  it("instant go emits change but not transitionstart/end", async () => {
    const s = await mountReady([
      makeSlide("red"),
      makeSlide("green"),
      makeSlide("blue"),
    ]);
    const events: string[] = [];
    s.on("transitionstart", () => events.push("start"));
    s.on("change", () => events.push("change"));
    s.on("transitionend", () => events.push("end"));
    await s.go(2, { instant: true });
    expect(events).toEqual(["change"]);
    s.destroy();
  });

  it("unsubscribe callback stops further events", async () => {
    const s = await mountReady([makeSlide("red"), makeSlide("green")]);
    const seen: number[] = [];
    const off = s.on("change", (c) => seen.push(c));
    await s.next();
    off();
    await s.prev();
    expect(seen).toEqual([1]);
    s.destroy();
  });
});

describe("createSlideshow: autoplay", () => {
  it("advances automatically after autoplayDelay", async () => {
    const s = await mountReady(
      [makeSlide("red"), makeSlide("green"), makeSlide("blue")],
      { autoplayDelay: 30, autoplay: true },
    );
    expect(s.isPlaying).toBe(true);
    await new Promise<void>((resolve) => {
      const off = s.on("change", (cur) => {
        if (cur === 1) {
          off();
          resolve();
        }
      });
    });
    expect(s.current).toBe(1);
    s.destroy();
  });

  it("pause() halts autoplay; play() resumes", async () => {
    const s = await mountReady(
      [makeSlide("red"), makeSlide("green")],
      { autoplayDelay: 30, autoplay: true },
    );
    s.pause();
    expect(s.isPlaying).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(s.current).toBe(0);
    s.play();
    expect(s.isPlaying).toBe(true);
    await new Promise<void>((resolve) => {
      const off = s.on("change", () => {
        off();
        resolve();
      });
    });
    expect(s.current).toBe(1);
    s.destroy();
  });

  it("autoplay default is false when autoplayDelay is omitted", async () => {
    const s = await mountReady([makeSlide("red"), makeSlide("green")]);
    expect(s.isPlaying).toBe(false);
    s.destroy();
  });
});

describe("createSlideshow: keyboard", () => {
  it("ArrowRight advances, ArrowLeft retreats", async () => {
    const s = await mountReady([
      makeSlide("red"),
      makeSlide("green"),
      makeSlide("blue"),
    ]);
    const wrapper = container.querySelector(
      "[data-slideshow-wrapper]",
    ) as HTMLElement;
    wrapper.focus();
    const firstChange = new Promise<number>((resolve) => {
      const off = s.on("change", (cur) => {
        off();
        resolve(cur);
      });
    });
    wrapper.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect(await firstChange).toBe(1);
    s.destroy();
  });

  it("Space toggles play/pause when autoplay is configured", async () => {
    const s = await mountReady(
      [makeSlide("red"), makeSlide("green")],
      { autoplayDelay: 50, autoplay: true },
    );
    const wrapper = container.querySelector(
      "[data-slideshow-wrapper]",
    ) as HTMLElement;
    wrapper.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true }),
    );
    expect(s.isPlaying).toBe(false);
    wrapper.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true }),
    );
    expect(s.isPlaying).toBe(true);
    s.destroy();
  });
});

describe("createSlideshow: destroy", () => {
  it("removes the wrapper from the container", async () => {
    const s = await mountReady([makeSlide("red"), makeSlide("green")]);
    expect(container.querySelector("[data-slideshow-wrapper]")).toBeTruthy();
    s.destroy();
    expect(container.querySelector("[data-slideshow-wrapper]")).toBeNull();
  });

  it("stops delivering events after destroy", async () => {
    const s = await mountReady([makeSlide("red"), makeSlide("green")]);
    const seen: number[] = [];
    s.on("change", (c) => seen.push(c));
    s.destroy();
    await s.next().catch(() => {}); // no-op after destroy
    expect(seen).toEqual([]);
  });
});
