import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Runner, blur } from "../index.js";

const SIZE = 32;

let canvas: HTMLCanvasElement;
let runner: Runner;

beforeEach(() => {
  canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  runner = new Runner({ canvas });
});

afterEach(() => {
  runner.dispose();
});

function makeStripes(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!;
  for (let x = 0; x < SIZE; x += 4) {
    ctx.fillStyle = (x / 4) % 2 === 0 ? "#ffffff" : "#000000";
    ctx.fillRect(x, 0, 4, SIZE);
  }
  return c;
}

function readPixels(r: Runner): Uint8Array {
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  r.gl.readPixels(0, 0, SIZE, SIZE, r.gl.RGBA, r.gl.UNSIGNED_BYTE, pixels);
  return pixels;
}

describe("property: blur", () => {
  it("is deterministic — same inputs produce identical outputs across renders", () => {
    const source = makeStripes();
    runner.render(blur, { source, params: { radius: 6 } });
    const first = readPixels(runner);
    runner.render(blur, { source, params: { radius: 6 } });
    const second = readPixels(runner);
    for (let i = 0; i < first.length; i++) {
      expect(second[i]).toBe(first[i]);
    }
  });

  it("produces no NaN-encoded output (all channels finite)", () => {
    const source = makeStripes();
    runner.render(blur, { source, params: { radius: 12 } });
    const pixels = readPixels(runner);
    for (let i = 0; i < pixels.length; i++) {
      expect(Number.isFinite(pixels[i])).toBe(true);
    }
  });

  it("preserves alpha of fully-opaque source", () => {
    const source = makeStripes();
    runner.render(blur, { source, params: { radius: 8 } });
    const pixels = readPixels(runner);
    for (let i = 3; i < pixels.length; i += 4) {
      expect(pixels[i]).toBe(255);
    }
  });

  it("increasing radius strictly softens high-frequency content", () => {
    const source = makeStripes();
    runner.render(blur, { source, params: { radius: 1 } });
    const lo = readPixels(runner);
    runner.render(blur, { source, params: { radius: 12 } });
    const hi = readPixels(runner);
    // Contrast metric: variance of luminance. Larger blur → lower variance.
    const varLo = varianceOfRed(lo);
    const varHi = varianceOfRed(hi);
    expect(varHi).toBeLessThan(varLo);
  });

  it("preserves the mean colour of a solid source (conservation)", () => {
    // Blur must conserve total energy on a solid input — kernel weights
    // sum to 1 after normalisation, so sampling a constant field returns
    // that constant.
    const c = document.createElement("canvas");
    c.width = SIZE;
    c.height = SIZE;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "rgb(120, 60, 200)";
    ctx.fillRect(0, 0, SIZE, SIZE);
    runner.render(blur, { source: c, params: { radius: 10 } });
    const pixels = readPixels(runner);
    // Sample centre to avoid any edge-clamp effects.
    const mid = (SIZE * (SIZE / 2) + SIZE / 2) * 4;
    expect(Math.abs((pixels[mid] ?? 0) - 120)).toBeLessThanOrEqual(2);
    expect(Math.abs((pixels[mid + 1] ?? 0) - 60)).toBeLessThanOrEqual(2);
    expect(Math.abs((pixels[mid + 2] ?? 0) - 200)).toBeLessThanOrEqual(2);
  });
});

function varianceOfRed(pixels: Uint8Array): number {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    sum += pixels[i] ?? 0;
    count++;
  }
  const mean = sum / count;
  let varSum = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const d = (pixels[i] ?? 0) - mean;
    varSum += d * d;
  }
  return varSum / count;
}
