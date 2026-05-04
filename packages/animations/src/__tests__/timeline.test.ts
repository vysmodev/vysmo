import { describe, expect, it, vi } from "vitest";
import { createTestScheduler } from "../scheduler.js";
import { timeline } from "../timeline.js";

describe("timeline sequencing", () => {
  it("plays two entries in sequence at default > position", () => {
    const sched = createTestScheduler();
    const valuesA: number[] = [];
    const valuesB: number[] = [];
    const tl = timeline({ scheduler: sched });
    tl.add({ from: 0, to: 10, duration: 100, onUpdate: (v) => valuesA.push(v) });
    tl.add({ from: 10, to: 20, duration: 100, onUpdate: (v) => valuesB.push(v) });
    tl.play();
    sched.tick(0);
    sched.tick(50);
    expect(valuesA.length).toBeGreaterThan(0);
    expect(valuesB.length).toBe(0);
    sched.tick(150);
    expect(valuesA[valuesA.length - 1]).toBe(10);
    expect(valuesB.length).toBeGreaterThan(0);
    sched.tick(50);
    expect(tl.state).toBe("finished");
    expect(valuesB[valuesB.length - 1]).toBe(20);
  });

  it("< position plays in parallel with previous", () => {
    const sched = createTestScheduler();
    const valuesA: number[] = [];
    const valuesB: number[] = [];
    const tl = timeline({ scheduler: sched });
    tl.add({ from: 0, to: 10, duration: 100, onUpdate: (v) => valuesA.push(v) });
    tl.add({ from: 0, to: 20, duration: 100, onUpdate: (v) => valuesB.push(v) }, "<");
    tl.play();
    sched.tick(0);
    sched.tick(50);
    expect(valuesA.length).toBeGreaterThan(0);
    expect(valuesB.length).toBeGreaterThan(0);
  });

  it("numeric absolute position", () => {
    const sched = createTestScheduler();
    const spyA = vi.fn();
    const spyB = vi.fn();
    const tl = timeline({ scheduler: sched });
    tl.add({ from: 0, to: 1, duration: 100, onUpdate: spyA });
    tl.add({ from: 0, to: 1, duration: 100, onUpdate: spyB }, 500);
    tl.play();
    sched.tick(0);
    sched.tick(200);
    expect(spyB).not.toHaveBeenCalled();
    sched.tick(400);
    expect(spyB).toHaveBeenCalled();
  });

  it("> offset overlaps entries", () => {
    const sched = createTestScheduler();
    const spyA = vi.fn();
    const spyB = vi.fn();
    const tl = timeline({ scheduler: sched });
    tl.add({ from: 0, to: 1, duration: 100, onUpdate: spyA });
    tl.add({ from: 0, to: 1, duration: 100, onUpdate: spyB }, ">-50");
    tl.play();
    sched.tick(0);
    sched.tick(60);
    expect(spyA).toHaveBeenCalled();
    expect(spyB).toHaveBeenCalled();
  });

  it("total duration is max of all entry end-times", () => {
    const tl = timeline();
    tl.add({ from: 0, to: 1, duration: 100 });
    tl.add({ from: 0, to: 1, duration: 300 }, "<");
    tl.add({ from: 0, to: 1, duration: 50 });
    expect(tl.duration).toBe(350);
  });

  it("onComplete fires once at end", () => {
    const sched = createTestScheduler();
    const complete = vi.fn();
    const tl = timeline({ scheduler: sched, onComplete: complete });
    tl.add({ from: 0, to: 1, duration: 100 });
    tl.play();
    sched.tick(0);
    sched.tick(100);
    expect(complete).toHaveBeenCalledTimes(1);
    sched.tick(200);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("finished promise resolves", async () => {
    const sched = createTestScheduler();
    const tl = timeline({ scheduler: sched });
    tl.add({ from: 0, to: 1, duration: 100 });
    tl.play();
    sched.tick(0);
    sched.tick(100);
    await expect(tl.finished).resolves.toBeUndefined();
  });

  it("pause and resume", () => {
    const sched = createTestScheduler();
    const spy = vi.fn();
    const tl = timeline({ scheduler: sched });
    tl.add({ from: 0, to: 100, duration: 1000, onUpdate: spy });
    tl.play();
    sched.tick(0);
    sched.tick(500);
    tl.pause();
    const callsBefore = spy.mock.calls.length;
    sched.tick(500);
    expect(spy.mock.calls.length).toBe(callsBefore);
    tl.play();
    sched.tick(0);
    sched.tick(500);
    expect(tl.state).toBe("finished");
  });

  it("seek jumps to progress and applies values", () => {
    const sched = createTestScheduler();
    let lastValue = 0;
    const tl = timeline({ scheduler: sched });
    tl.add({ from: 0, to: 100, duration: 100, onUpdate: (v) => (lastValue = v) });
    tl.add({ from: 0, to: 100, duration: 100, onUpdate: (v) => (lastValue = v) });
    tl.seek(0.5);
    expect(tl.progress).toBe(0.5);
  });

  it("rejects non-positive entry duration", () => {
    const tl = timeline();
    expect(() => tl.add({ from: 0, to: 1, duration: 0 })).toThrow(RangeError);
  });

  it("rejects malformed position", () => {
    const tl = timeline();
    tl.add({ from: 0, to: 1, duration: 100 });
    expect(() => tl.add({ from: 0, to: 1, duration: 100 }, ">abc" as never)).toThrow(RangeError);
  });
});
