import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFlipbook, type FlipbookHandle } from "../index.js";

let container: HTMLElement;

beforeEach(() => {
  container = document.createElement("div");
  container.style.width = "400px";
  container.style.height = "300px";
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
});

function makePage(color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 80;
  c.height = 60;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 80, 60);
  return c;
}

async function mountReady(
  pages: HTMLCanvasElement[],
  overrides?: Partial<Parameters<typeof createFlipbook>[0]>,
): Promise<FlipbookHandle> {
  const f = createFlipbook({
    container,
    pages,
    flipDuration: 30,
    ...overrides,
  });
  await f.ready;
  return f;
}

describe("createFlipbook: structure", () => {
  it("mounts a wrapper + canvas + aria-live status into the container", async () => {
    const f = await mountReady([makePage("red"), makePage("green")]);
    const wrapper = container.querySelector("[data-page-flip-wrapper]");
    expect(wrapper).toBeTruthy();
    expect(wrapper!.getAttribute("role")).toBe("region");
    expect(wrapper!.getAttribute("aria-roledescription")).toBe("flipbook");
    expect(wrapper!.getAttribute("aria-label")).toBe("Flipbook");
    expect(wrapper!.querySelector("[data-page-flip-canvas]")).toBeTruthy();
    const live = wrapper!.querySelector('[aria-live="polite"]');
    expect(live).toBeTruthy();
    f.destroy();
  });

  it("starts at index 0 by default; initialPage overrides", async () => {
    const a = await mountReady([makePage("red"), makePage("green")]);
    expect(a.current).toBe(0);
    a.destroy();
    container.innerHTML = "";
    const b = await mountReady(
      [makePage("red"), makePage("green"), makePage("blue")],
      { initialPage: 2 },
    );
    expect(b.current).toBe(2);
    b.destroy();
  });

  it("length reflects the number of pages", async () => {
    const f = await mountReady([
      makePage("red"),
      makePage("green"),
      makePage("blue"),
    ]);
    expect(f.length).toBe(3);
    f.destroy();
  });

  it("throws when pages array is empty", () => {
    expect(() => createFlipbook({ container, pages: [] })).toThrow(
      /at least one page/,
    );
  });

  it("respects a custom ariaLabel", async () => {
    const f = await mountReady([makePage("red"), makePage("green")], {
      ariaLabel: "Magazine",
    });
    const wrapper = container.querySelector("[data-page-flip-wrapper]");
    expect(wrapper!.getAttribute("aria-label")).toBe("Magazine");
    f.destroy();
  });
});

describe("createFlipbook: navigation", () => {
  it("next() advances the current index", async () => {
    const f = await mountReady([
      makePage("red"),
      makePage("green"),
      makePage("blue"),
    ]);
    await f.next();
    expect(f.current).toBe(1);
    await f.next();
    expect(f.current).toBe(2);
    f.destroy();
  });

  it("next() stops at last when loop=false (default)", async () => {
    const f = await mountReady(
      [makePage("red"), makePage("green")],
      { initialPage: 1 },
    );
    await f.next();
    expect(f.current).toBe(1);
    f.destroy();
  });

  it("next() wraps last → first when loop=true", async () => {
    const f = await mountReady(
      [makePage("red"), makePage("green")],
      { initialPage: 1, loop: true },
    );
    await f.next();
    expect(f.current).toBe(0);
    f.destroy();
  });

  it("prev() stops at first when loop=false", async () => {
    const f = await mountReady([makePage("red"), makePage("green")]);
    await f.prev();
    expect(f.current).toBe(0);
    f.destroy();
  });

  it("prev() wraps first → last when loop=true", async () => {
    const f = await mountReady(
      [makePage("red"), makePage("green"), makePage("blue")],
      { loop: true },
    );
    await f.prev();
    expect(f.current).toBe(2);
    f.destroy();
  });

  it("goTo(index) flips to a specific page", async () => {
    const f = await mountReady([
      makePage("red"),
      makePage("green"),
      makePage("blue"),
    ]);
    await f.goTo(2);
    expect(f.current).toBe(2);
    f.destroy();
  });

  it("goTo(index, { instant: true }) snaps without playing the curl", async () => {
    const f = await mountReady([
      makePage("red"),
      makePage("green"),
      makePage("blue"),
    ]);
    const starts: number[] = [];
    f.on("flipstart", () => starts.push(1));
    await f.goTo(2, { instant: true });
    expect(f.current).toBe(2);
    expect(starts).toHaveLength(0);
    f.destroy();
  });

  it("goTo(currentIndex) is a no-op", async () => {
    const f = await mountReady([makePage("red"), makePage("green")]);
    const starts: number[] = [];
    f.on("flipstart", () => starts.push(1));
    await f.goTo(0);
    expect(starts).toHaveLength(0);
    f.destroy();
  });

  it("clamps out-of-range indices on instant goTo", async () => {
    const f = await mountReady([
      makePage("red"),
      makePage("green"),
      makePage("blue"),
    ]);
    await f.goTo(99, { instant: true });
    expect(f.current).toBe(2);
    await f.goTo(-5, { instant: true });
    expect(f.current).toBe(0);
    f.destroy();
  });
});

describe("createFlipbook: events", () => {
  it("fires flipstart + change + flipend in order on next()", async () => {
    const f = await mountReady([makePage("red"), makePage("green")]);
    const events: string[] = [];
    f.on("flipstart", (from, to) => events.push(`start:${from}->${to}`));
    f.on("change", (cur, prev) => events.push(`change:${prev}->${cur}`));
    f.on("flipend", (from, to) => events.push(`end:${from}->${to}`));
    await f.next();
    expect(events).toEqual(["start:0->1", "change:0->1", "end:0->1"]);
    f.destroy();
  });

  it("instant goTo emits change but not flipstart/end", async () => {
    const f = await mountReady([
      makePage("red"),
      makePage("green"),
      makePage("blue"),
    ]);
    const events: string[] = [];
    f.on("flipstart", () => events.push("start"));
    f.on("change", () => events.push("change"));
    f.on("flipend", () => events.push("end"));
    await f.goTo(2, { instant: true });
    expect(events).toEqual(["change"]);
    f.destroy();
  });

  it("unsubscribe callback stops further events", async () => {
    const f = await mountReady([makePage("red"), makePage("green")]);
    const seen: number[] = [];
    const off = f.on("change", (c) => seen.push(c));
    await f.next();
    off();
    await f.prev();
    expect(seen).toEqual([1]);
    f.destroy();
  });
});

describe("createFlipbook: keyboard", () => {
  it("ArrowRight advances; ArrowLeft retreats", async () => {
    const f = await mountReady([
      makePage("red"),
      makePage("green"),
      makePage("blue"),
    ]);
    const wrapper = container.querySelector(
      "[data-page-flip-wrapper]",
    ) as HTMLElement;
    wrapper.focus();
    const firstChange = new Promise<number>((resolve) => {
      const off = f.on("change", (cur) => {
        off();
        resolve(cur);
      });
    });
    wrapper.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect(await firstChange).toBe(1);
    f.destroy();
  });

  it("Home jumps to first page; End jumps to last", async () => {
    const f = await mountReady(
      [makePage("a"), makePage("b"), makePage("c"), makePage("d")],
      { initialPage: 1 },
    );
    const wrapper = container.querySelector(
      "[data-page-flip-wrapper]",
    ) as HTMLElement;
    wrapper.focus();

    const endChange = new Promise<number>((resolve) => {
      const off = f.on("change", (cur) => {
        off();
        resolve(cur);
      });
    });
    wrapper.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true }),
    );
    expect(await endChange).toBe(3);

    const homeChange = new Promise<number>((resolve) => {
      const off = f.on("change", (cur) => {
        off();
        resolve(cur);
      });
    });
    wrapper.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    );
    expect(await homeChange).toBe(0);
    f.destroy();
  });
});

describe("createFlipbook: pointer", () => {
  it("click on right half triggers next; left half triggers prev", async () => {
    const f = await mountReady(
      [makePage("a"), makePage("b"), makePage("c")],
      { initialPage: 1 },
    );
    const wrapper = container.querySelector(
      "[data-page-flip-wrapper]",
    ) as HTMLElement;
    const rect = wrapper.getBoundingClientRect();

    function clickAt(x: number, y: number): void {
      const id = 1;
      wrapper.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerId: id,
          clientX: x,
          clientY: y,
          button: 0,
          bubbles: true,
        }),
      );
      wrapper.dispatchEvent(
        new PointerEvent("pointerup", {
          pointerId: id,
          clientX: x,
          clientY: y,
          bubbles: true,
        }),
      );
    }

    const rightChange = new Promise<number>((resolve) => {
      const off = f.on("change", (cur) => {
        off();
        resolve(cur);
      });
    });
    clickAt(rect.left + rect.width * 0.85, rect.top + rect.height / 2);
    expect(await rightChange).toBe(2);

    const leftChange = new Promise<number>((resolve) => {
      const off = f.on("change", (cur) => {
        off();
        resolve(cur);
      });
    });
    clickAt(rect.left + rect.width * 0.15, rect.top + rect.height / 2);
    expect(await leftChange).toBe(1);

    f.destroy();
  });

  it("drag past 50% commits forward; release under 50% reverts", async () => {
    const f = await mountReady([makePage("a"), makePage("b"), makePage("c")]);
    const wrapper = container.querySelector(
      "[data-page-flip-wrapper]",
    ) as HTMLElement;
    const rect = wrapper.getBoundingClientRect();

    function dragRelease(dx: number): Promise<number | null> {
      return new Promise((resolve) => {
        const id = 2;
        const startX = rect.left + rect.width * 0.7;
        const y = rect.top + rect.height / 2;
        let resolved = false;
        const off = f.on("change", (cur) => {
          off();
          resolved = true;
          resolve(cur);
        });
        wrapper.dispatchEvent(
          new PointerEvent("pointerdown", {
            pointerId: id,
            clientX: startX,
            clientY: y,
            button: 0,
            bubbles: true,
          }),
        );
        wrapper.dispatchEvent(
          new PointerEvent("pointermove", {
            pointerId: id,
            clientX: startX + dx,
            clientY: y,
            bubbles: true,
          }),
        );
        wrapper.dispatchEvent(
          new PointerEvent("pointerup", {
            pointerId: id,
            clientX: startX + dx,
            clientY: y,
            bubbles: true,
          }),
        );
        // Resolve null after a short window if no change fires (revert path).
        setTimeout(() => {
          if (!resolved) {
            off();
            resolve(null);
          }
        }, 80);
      });
    }

    // Drag left by 80% of width — should commit forward.
    const after = await dragRelease(-rect.width * 0.8);
    expect(after).toBe(1);
    expect(f.current).toBe(1);

    // Drag left by 20% — should revert. f.current stays 1.
    const noop = await dragRelease(-rect.width * 0.2);
    expect(noop).toBeNull();
    expect(f.current).toBe(1);

    f.destroy();
  });

  it("drag at first page in backward direction is a no-op (loop=false)", async () => {
    const f = await mountReady([makePage("a"), makePage("b")]);
    const wrapper = container.querySelector(
      "[data-page-flip-wrapper]",
    ) as HTMLElement;
    const rect = wrapper.getBoundingClientRect();
    const id = 3;
    wrapper.dispatchEvent(
      new PointerEvent("pointerdown", {
        pointerId: id,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        button: 0,
        bubbles: true,
      }),
    );
    wrapper.dispatchEvent(
      new PointerEvent("pointermove", {
        pointerId: id,
        clientX: rect.left + rect.width * 1.2,
        clientY: rect.top + rect.height / 2,
        bubbles: true,
      }),
    );
    wrapper.dispatchEvent(
      new PointerEvent("pointerup", {
        pointerId: id,
        clientX: rect.left + rect.width * 1.2,
        clientY: rect.top + rect.height / 2,
        bubbles: true,
      }),
    );
    // No flip should commit; current stays at 0.
    await new Promise((r) => setTimeout(r, 60));
    expect(f.current).toBe(0);
    f.destroy();
  });
});

describe("createFlipbook: destroy", () => {
  it("removes the wrapper from the container", async () => {
    const f = await mountReady([makePage("red"), makePage("green")]);
    expect(container.querySelector("[data-page-flip-wrapper]")).toBeTruthy();
    f.destroy();
    expect(container.querySelector("[data-page-flip-wrapper]")).toBeNull();
  });

  it("stops delivering events after destroy", async () => {
    const f = await mountReady([makePage("red"), makePage("green")]);
    const seen: number[] = [];
    f.on("change", (c) => seen.push(c));
    f.destroy();
    await f.next().catch(() => {});
    expect(seen).toEqual([]);
  });
});
