import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Runner, blur, threshold } from "../index.js";

const SIZE = 16;
const TOLERANCE = 6;

function solidRgba(
  width: number,
  height: number,
  r: number,
  g: number,
  b: number,
  a = 255,
): Uint8Array {
  const buf = new Uint8Array(width * height * 4);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = a;
  }
  return buf;
}

function makeSolidCanvas(r: number, g: number, b: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  return c;
}

function expectAllPixelsApprox(
  buf: Uint8Array | Uint8ClampedArray,
  expected: [number, number, number],
  tolerance = TOLERANCE,
): void {
  let worstDiff = 0;
  let worstIndex = -1;
  for (let i = 0; i < buf.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const diff = Math.abs((buf[i + c] ?? 0) - (expected[c] ?? 0));
      if (diff > worstDiff) {
        worstDiff = diff;
        worstIndex = i;
      }
    }
  }
  if (worstDiff > tolerance) {
    const actual = [
      buf[worstIndex] ?? 0,
      buf[worstIndex + 1] ?? 0,
      buf[worstIndex + 2] ?? 0,
    ];
    expect.fail(
      `Pixel at index ${worstIndex} = [${actual.join(", ")}], expected ≈ ` +
        `[${expected.join(", ")}] (max diff ${worstDiff})`,
    );
  }
}

let canvas: HTMLCanvasElement;
let runner: Runner;

beforeEach(() => {
  canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  runner = new Runner({
    canvas,
    contextAttributes: { preserveDrawingBuffer: true },
  });
});

afterEach(() => {
  runner.dispose();
});

describe("Runner — RawPixels source variant (effects)", () => {
  it("renders an effect with a RawPixels source", () => {
    // blur on a solid colour should preserve the colour.
    const source = { pixels: solidRgba(SIZE, SIZE, 200, 100, 50), width: SIZE, height: SIZE };
    runner.render(blur, { source, params: { radius: 2 } });
    const pix = new Uint8Array(SIZE * SIZE * 4);
    runner.gl.readPixels(0, 0, SIZE, SIZE, runner.gl.RGBA, runner.gl.UNSIGNED_BYTE, pix);
    expectAllPixelsApprox(pix, [200, 100, 50]);
  });

  it("accepts Uint8ClampedArray", () => {
    const source = {
      pixels: new Uint8ClampedArray(solidRgba(SIZE, SIZE, 50, 200, 100)),
      width: SIZE,
      height: SIZE,
    };
    runner.render(blur, { source, params: { radius: 1 } });
    const pix = new Uint8Array(SIZE * SIZE * 4);
    runner.gl.readPixels(0, 0, SIZE, SIZE, runner.gl.RGBA, runner.gl.UNSIGNED_BYTE, pix);
    expectAllPixelsApprox(pix, [50, 200, 100]);
  });

  it("re-uploads pixels when the wrapper is reused with mutated bytes", () => {
    const pixels = solidRgba(SIZE, SIZE, 255, 0, 0);
    const wrapper = { pixels, width: SIZE, height: SIZE };

    runner.render(blur, { source: wrapper, params: { radius: 1 } });
    const pixA = new Uint8Array(SIZE * SIZE * 4);
    runner.gl.readPixels(0, 0, SIZE, SIZE, runner.gl.RGBA, runner.gl.UNSIGNED_BYTE, pixA);
    expectAllPixelsApprox(pixA, [255, 0, 0]);

    pixels.set(solidRgba(SIZE, SIZE, 0, 255, 0));
    runner.render(blur, { source: wrapper, params: { radius: 1 } });
    const pixB = new Uint8Array(SIZE * SIZE * 4);
    runner.gl.readPixels(0, 0, SIZE, SIZE, runner.gl.RGBA, runner.gl.UNSIGNED_BYTE, pixB);
    expectAllPixelsApprox(pixB, [0, 255, 0]);
  });

  it("throws when the buffer is undersized", () => {
    const source = { pixels: new Uint8Array(8), width: SIZE, height: SIZE };
    expect(() => runner.render(blur, { source })).toThrow(
      /RawPixels buffer is too small/,
    );
  });
});

describe("Runner.renderToPixels — effects", () => {
  it("renders an effect into a caller-owned Uint8Array", () => {
    const source = makeSolidCanvas(200, 100, 50);
    const dst = new Uint8Array(SIZE * SIZE * 4);

    runner.renderToPixels(blur, { source, params: { radius: 2 }, dst });
    expectAllPixelsApprox(dst, [200, 100, 50]);
  });

  it("renders into a Uint8ClampedArray", () => {
    const source = makeSolidCanvas(50, 100, 200);
    const dst = new Uint8ClampedArray(SIZE * SIZE * 4);

    runner.renderToPixels(blur, { source, params: { radius: 2 }, dst });
    expectAllPixelsApprox(dst, [50, 100, 200]);
  });

  it("accepts an oversize dst (only the pixel prefix is written)", () => {
    const source = makeSolidCanvas(200, 100, 50);
    const dst = new Uint8Array(SIZE * SIZE * 4 + 1024);
    dst.fill(0xAB, SIZE * SIZE * 4);

    runner.renderToPixels(blur, { source, params: { radius: 2 }, dst });
    expectAllPixelsApprox(dst.subarray(0, SIZE * SIZE * 4), [200, 100, 50]);
    for (let i = SIZE * SIZE * 4; i < dst.length; i++) {
      expect(dst[i]).toBe(0xAB);
    }
  });

  it("throws when dst is too small", () => {
    const source = makeSolidCanvas(200, 100, 50);
    const dst = new Uint8Array(SIZE * SIZE * 4 - 1);
    expect(() =>
      runner.renderToPixels(blur, { source, params: { radius: 2 }, dst }),
    ).toThrow(/dst buffer is too small/);
  });

  it("works with multi-pass effects (threshold isn't multi-pass; test via params)", () => {
    // threshold drives a binary classification — at the limits we still
    // get a uniform output for a uniform input. This exercises the
    // single-pass branch the same way blur does; the multi-pass branch
    // is covered by the effects' identity tests in identity.test.ts.
    const source = makeSolidCanvas(0, 255, 0);
    const dst = new Uint8Array(SIZE * SIZE * 4);

    runner.renderToPixels(threshold, {
      source,
      params: { cutoff: 0.1 },
      dst,
    });
    expectAllPixelsApprox(dst, [255, 255, 255]);
  });

  it("round-trips RawPixels in, RawPixels out with matching orientation", () => {
    // Half-yellow-top, half-magenta-bottom. blur smears boundaries
    // slightly but the top corners are far enough from the seam to be
    // close to pure source.
    const pixels = new Uint8Array(SIZE * SIZE * 4);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const i = (y * SIZE + x) * 4;
        if (y < SIZE / 2) {
          pixels[i] = 255; pixels[i + 1] = 255; pixels[i + 2] = 0; // yellow
        } else {
          pixels[i] = 255; pixels[i + 1] = 0; pixels[i + 2] = 255; // magenta
        }
        pixels[i + 3] = 255;
      }
    }
    const src = { pixels, width: SIZE, height: SIZE };
    const dst = new Uint8Array(SIZE * SIZE * 4);

    runner.renderToPixels(blur, {
      source: src,
      params: { radius: 1 },
      dst,
    });

    // Top corner (y=0, x=0): yellow
    expect(dst[0]).toBeGreaterThan(200);     // R high
    expect(dst[1]).toBeGreaterThan(200);     // G high
    expect(dst[2]).toBeLessThan(60);          // B low
    // Bottom corner (y=15, x=0): magenta
    const botStart = (SIZE - 1) * SIZE * 4;
    expect(dst[botStart]).toBeGreaterThan(200);     // R high
    expect(dst[botStart + 1]).toBeLessThan(60);     // G low
    expect(dst[botStart + 2]).toBeGreaterThan(200); // B high
  });
});
