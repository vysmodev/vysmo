import { describe, expect, it, vi } from "vitest";
import { createTestScheduler } from "../scheduler.js";
import { spring } from "../spring.js";

describe("spring", () => {
  it("settles at target", () => {
    const sched = createTestScheduler();
    const h = spring({
      from: 0,
      to: 100,
      stiffness: 200,
      damping: 20,
      scheduler: sched,
    });
    for (let i = 0; i < 500; i++) sched.tick(16);
    expect(h.state).toBe("finished");
    expect(h.value).toBe(100);
  });

  it("overshoots target with low damping", () => {
    const sched = createTestScheduler();
    const peaks: number[] = [];
    const h = spring({
      from: 0,
      to: 100,
      stiffness: 300,
      damping: 5,
      scheduler: sched,
      onUpdate: (v) => peaks.push(v),
    });
    for (let i = 0; i < 500; i++) sched.tick(16);
    expect(h.state).toBe("finished");
    expect(Math.max(...peaks)).toBeGreaterThan(100);
  });

  it("does not overshoot when overdamped", () => {
    const sched = createTestScheduler();
    const observed: number[] = [];
    const h = spring({
      from: 0,
      to: 100,
      stiffness: 100,
      damping: 40,
      scheduler: sched,
      onUpdate: (v) => observed.push(v),
    });
    for (let i = 0; i < 500; i++) sched.tick(16);
    expect(h.state).toBe("finished");
    const max = Math.max(...observed);
    expect(max).toBeLessThanOrEqual(100 + 0.1);
  });

  it("initial velocity kicks the spring", () => {
    const sched = createTestScheduler();
    const a = spring({
      from: 0,
      to: 100,
      velocity: 0,
      scheduler: sched,
      autoPlay: false,
    });
    const b = spring({
      from: 0,
      to: 100,
      velocity: 500,
      scheduler: sched,
      autoPlay: false,
    });
    a.play();
    b.play();
    for (let i = 0; i < 5; i++) sched.tick(16);
    expect(b.value).toBeGreaterThan(a.value);
  });

  it("onComplete fires once", () => {
    const sched = createTestScheduler();
    const spy = vi.fn();
    spring({ from: 0, to: 10, scheduler: sched, onComplete: spy });
    for (let i = 0; i < 500; i++) sched.tick(16);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("pause and resume preserves state", () => {
    const sched = createTestScheduler();
    const h = spring({
      from: 0,
      to: 100,
      stiffness: 50,
      damping: 15,
      scheduler: sched,
    });
    for (let i = 0; i < 5; i++) sched.tick(16);
    const mid = h.value;
    h.pause();
    for (let i = 0; i < 10; i++) sched.tick(16);
    expect(h.value).toBe(mid);
    h.play();
    for (let i = 0; i < 500; i++) sched.tick(16);
    expect(h.state).toBe("finished");
  });

  it("seek snaps to progress (no velocity preserved)", () => {
    const sched = createTestScheduler();
    const h = spring({
      from: 0,
      to: 100,
      scheduler: sched,
      autoPlay: false,
    });
    h.seek(0.5);
    expect(h.value).toBe(50);
    expect(h.progress).toBe(0.5);
  });

  it("from === to settles immediately", () => {
    const sched = createTestScheduler();
    const h = spring({ from: 50, to: 50, scheduler: sched });
    sched.tick(16);
    expect(h.state).toBe("finished");
    expect(h.value).toBe(50);
  });

  it("finished resolves on natural completion", async () => {
    const sched = createTestScheduler();
    const h = spring({ from: 0, to: 10, scheduler: sched });
    for (let i = 0; i < 500; i++) sched.tick(16);
    await expect(h.finished).resolves.toBeUndefined();
  });
});
