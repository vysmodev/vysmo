import { describe, expect, it } from "vitest";

/**
 * SSR safety: the module graph must load in Node without DOM globals,
 * because @vysmo/animations powers @vysmo/text which is loaded by SSR
 * frameworks (Astro, Next, etc.) at build time.
 *
 * The defaultScheduler guards `requestAnimationFrame` / `performance.now`
 * behind `typeof` checks, so importing the module — and even calling
 * the functions — must work in plain Node.
 */
describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("module loads without DOM globals", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
    expect(typeof mod.animate).toBe("function");
    expect(typeof mod.spring).toBe("function");
    expect(typeof mod.timeline).toBe("function");
    expect(typeof mod.interpolate).toBe("function");
    expect(typeof mod.defaultScheduler).toBe("object");
    expect(typeof mod.createTestScheduler).toBe("function");
  });

  it("interpolate is pure and runs in Node", async () => {
    const { interpolate } = await import("../index.js");
    expect(interpolate(0, 100, 0.5)).toBe(50);
    expect(interpolate([0, 0], [10, 20], 0.5)).toEqual([5, 10]);
    expect(interpolate({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.25)).toEqual({ x: 2.5, y: 5 });
  });

  it("createTestScheduler works fully in Node (no DOM dependency)", async () => {
    const { animate, createTestScheduler } = await import("../index.js");
    const sched = createTestScheduler();
    let last = -1;
    animate({ from: 0, to: 100, duration: 100, scheduler: sched, onUpdate: (v) => (last = v) });
    sched.tick(0);
    sched.tick(50);
    sched.tick(50);
    expect(last).toBe(100);
  });

  it("defaultScheduler.now() returns a finite number in Node (Date.now fallback)", async () => {
    const { defaultScheduler } = await import("../index.js");
    expect(Number.isFinite(defaultScheduler.now())).toBe(true);
  });
});
