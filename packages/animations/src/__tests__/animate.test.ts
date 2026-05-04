import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { animate } from "../animate.js";
import { createTestScheduler } from "../scheduler.js";

describe("animate(numbers)", () => {
  it("interpolates from→to across the duration", () => {
    const sched = createTestScheduler();
    const updates: number[] = [];
    animate({
      from: 0,
      to: 100,
      duration: 1000,
      scheduler: sched,
      onUpdate: (v) => updates.push(v),
    });
    sched.tick(0);
    sched.tick(500);
    sched.tick(500);
    expect(updates[0]).toBe(0);
    expect(updates[updates.length - 1]).toBe(100);
  });

  it("exposes current value at end", async () => {
    const sched = createTestScheduler();
    const h = animate({ from: 0, to: 50, duration: 100, scheduler: sched });
    sched.tick(0);
    sched.tick(100);
    expect(h.value).toBe(50);
    expect(h.state).toBe("finished");
  });

  it("respects delay", () => {
    const sched = createTestScheduler();
    const startSpy = vi.fn();
    const h = animate({
      from: 0,
      to: 100,
      duration: 200,
      delay: 100,
      scheduler: sched,
      onStart: startSpy,
    });
    sched.tick(0);
    sched.tick(50);
    expect(startSpy).not.toHaveBeenCalled();
    expect(h.value).toBe(0);
    sched.tick(100);
    expect(startSpy).toHaveBeenCalledOnce();
  });

  it("resolves finished promise on natural completion", async () => {
    const sched = createTestScheduler();
    const h = animate({ from: 0, to: 10, duration: 50, scheduler: sched });
    sched.tick(0);
    sched.tick(50);
    await expect(h.finished).resolves.toBeUndefined();
  });

  it("applies easing fn", () => {
    const sched = createTestScheduler();
    const updates: number[] = [];
    animate({
      from: 0,
      to: 100,
      duration: 100,
      ease: (t) => t * t,
      scheduler: sched,
      onUpdate: (v) => updates.push(v),
    });
    sched.tick(0);
    sched.tick(50);
    const midpoint = updates[updates.length - 1]!;
    expect(midpoint).toBeCloseTo(25, 1);
  });

  it("calls onUpdate on every frame", () => {
    const sched = createTestScheduler();
    const fn = vi.fn();
    animate({ from: 0, to: 1, duration: 100, scheduler: sched, onUpdate: fn });
    sched.tick(0);
    sched.tick(25);
    sched.tick(25);
    sched.tick(25);
    sched.tick(25);
    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(4);
  });
});

describe("animate(objects)", () => {
  it("interpolates object shapes", () => {
    const sched = createTestScheduler();
    const updates: Array<{ x: number; y: number }> = [];
    animate({
      from: { x: 0, y: 0 },
      to: { x: 100, y: 50 },
      duration: 100,
      scheduler: sched,
      onUpdate: (v) => updates.push(v),
    });
    sched.tick(0);
    sched.tick(100);
    expect(updates[updates.length - 1]).toEqual({ x: 100, y: 50 });
  });
});

describe("control: pause / play / seek / stop", () => {
  it("pause halts updates", () => {
    const sched = createTestScheduler();
    const fn = vi.fn();
    const h = animate({ from: 0, to: 100, duration: 1000, scheduler: sched, onUpdate: fn });
    sched.tick(0);
    sched.tick(100);
    h.pause();
    const callsBefore = fn.mock.calls.length;
    sched.tick(500);
    expect(fn.mock.calls.length).toBe(callsBefore);
    expect(h.state).toBe("paused");
  });

  it("play after pause resumes from same progress", () => {
    const sched = createTestScheduler();
    const h = animate({ from: 0, to: 100, duration: 1000, scheduler: sched });
    sched.tick(0);
    sched.tick(300);
    const progressBefore = h.progress;
    h.pause();
    sched.tick(10000);
    h.play();
    sched.tick(0);
    expect(h.progress).toBeCloseTo(progressBefore, 2);
  });

  it("seek jumps to a given progress", () => {
    const sched = createTestScheduler();
    const h = animate({
      from: 0,
      to: 100,
      duration: 1000,
      autoPlay: false,
      scheduler: sched,
    });
    h.seek(0.5);
    expect(h.value).toBe(50);
    expect(h.progress).toBe(0.5);
  });

  it("stop resets value to from", () => {
    const sched = createTestScheduler();
    const h = animate({ from: 0, to: 100, duration: 1000, scheduler: sched });
    sched.tick(0);
    sched.tick(500);
    h.stop();
    expect(h.value).toBe(0);
    expect(h.state).toBe("idle");
  });

  it("autoPlay: false does not start automatically", () => {
    const sched = createTestScheduler();
    const fn = vi.fn();
    const h = animate({
      from: 0,
      to: 100,
      duration: 100,
      autoPlay: false,
      scheduler: sched,
      onUpdate: fn,
    });
    sched.tick(0);
    sched.tick(500);
    expect(fn).toHaveBeenCalledTimes(1); // the initial apply at creation
    expect(h.state).toBe("idle");
  });
});

describe("loop modes", () => {
  it("loop: 3 plays three times", () => {
    const sched = createTestScheduler();
    const completeSpy = vi.fn();
    animate({
      from: 0,
      to: 10,
      duration: 50,
      loop: 3,
      scheduler: sched,
      onComplete: completeSpy,
    });
    for (let i = 0; i < 10; i++) sched.tick(50);
    expect(completeSpy).toHaveBeenCalledTimes(3);
  });

  it("loop: yoyo alternates direction", () => {
    const sched = createTestScheduler();
    const values: number[] = [];
    animate({
      from: 0,
      to: 100,
      duration: 100,
      loop: "yoyo",
      scheduler: sched,
      onUpdate: (v) => values.push(v),
    });
    sched.tick(0);
    sched.tick(100); // first pass → should be near 100
    const peakAtFirstEnd = values[values.length - 1]!;
    sched.tick(100); // second pass (yoyo back) → should be near 0
    const endOfSecond = values[values.length - 1]!;
    expect(peakAtFirstEnd).toBe(100);
    expect(endOfSecond).toBe(0);
  });
});

describe("invalid inputs", () => {
  it("throws on non-positive duration", () => {
    expect(() => animate({ from: 0, to: 1, duration: 0 })).toThrow(RangeError);
    expect(() => animate({ from: 0, to: 1, duration: -100 })).toThrow(RangeError);
  });
});
