import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Runner, paintBleed } from "../../index.js";

const SIZE = 16;
const TOLERANCE = 2;

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

describe("Runner — RawPixels source variant", () => {
  it("renders a paintBleed with both from and to as RawPixels", () => {
    const from = { pixels: solidRgba(SIZE, SIZE, 255, 0, 0), width: SIZE, height: SIZE };
    const to = { pixels: solidRgba(SIZE, SIZE, 0, 0, 255), width: SIZE, height: SIZE };

    // At progress=0 the output should be pure `from` (red).
    runner.render(paintBleed, { from, to, progress: 0 });
    const pix = new Uint8Array(SIZE * SIZE * 4);
    runner.gl.readPixels(0, 0, SIZE, SIZE, runner.gl.RGBA, runner.gl.UNSIGNED_BYTE, pix);
    expectAllPixelsApprox(pix, [255, 0, 0]);
  });

  it("at progress=1 the output is pure `to` (RawPixels)", () => {
    const from = { pixels: solidRgba(SIZE, SIZE, 255, 0, 0), width: SIZE, height: SIZE };
    const to = { pixels: solidRgba(SIZE, SIZE, 0, 0, 255), width: SIZE, height: SIZE };

    runner.render(paintBleed, { from, to, progress: 1 });
    const pix = new Uint8Array(SIZE * SIZE * 4);
    runner.gl.readPixels(0, 0, SIZE, SIZE, runner.gl.RGBA, runner.gl.UNSIGNED_BYTE, pix);
    expectAllPixelsApprox(pix, [0, 0, 255]);
  });

  it("mixes RawPixels and DOM sources in the same call", () => {
    const from = { pixels: solidRgba(SIZE, SIZE, 255, 0, 0), width: SIZE, height: SIZE };
    const to = makeSolidCanvas(0, 0, 255);

    runner.render(paintBleed, { from, to, progress: 1 });
    const pix = new Uint8Array(SIZE * SIZE * 4);
    runner.gl.readPixels(0, 0, SIZE, SIZE, runner.gl.RGBA, runner.gl.UNSIGNED_BYTE, pix);
    expectAllPixelsApprox(pix, [0, 0, 255]);
  });

  it("re-uploads pixels on every render when the wrapper is reused", () => {
    // Reusing the wrapper but mutating its `pixels` buffer between
    // renders is the recommended pattern for bridging from another
    // renderer. The cache should pick up the new bytes each time.
    const pixels = solidRgba(SIZE, SIZE, 255, 0, 0);
    const wrapper = { pixels, width: SIZE, height: SIZE };
    const to = { pixels: solidRgba(SIZE, SIZE, 0, 0, 255), width: SIZE, height: SIZE };

    runner.render(paintBleed, { from: wrapper, to, progress: 0 });
    const pixA = new Uint8Array(SIZE * SIZE * 4);
    runner.gl.readPixels(0, 0, SIZE, SIZE, runner.gl.RGBA, runner.gl.UNSIGNED_BYTE, pixA);
    expectAllPixelsApprox(pixA, [255, 0, 0]);

    // Mutate the underlying buffer; the wrapper identity stays the same.
    pixels.set(solidRgba(SIZE, SIZE, 0, 255, 0));
    runner.render(paintBleed, { from: wrapper, to, progress: 0 });
    const pixB = new Uint8Array(SIZE * SIZE * 4);
    runner.gl.readPixels(0, 0, SIZE, SIZE, runner.gl.RGBA, runner.gl.UNSIGNED_BYTE, pixB);
    expectAllPixelsApprox(pixB, [0, 255, 0]);
  });

  it("throws a helpful error when the RawPixels buffer is undersized", () => {
    const from = { pixels: new Uint8Array(8), width: SIZE, height: SIZE };
    const to = { pixels: solidRgba(SIZE, SIZE, 0, 0, 255), width: SIZE, height: SIZE };
    expect(() => runner.render(paintBleed, { from, to, progress: 0 })).toThrow(
      /RawPixels buffer is too small/,
    );
  });
});

describe("Runner.renderToPixels — transitions", () => {
  it("renders into a caller-owned Uint8Array (top-down, flipY=true default)", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    const dst = new Uint8Array(SIZE * SIZE * 4);

    runner.renderToPixels(paintBleed, { from, to, progress: 1, dst });
    expectAllPixelsApprox(dst, [0, 0, 255]);
  });

  it("renders into a Uint8ClampedArray (ImageData-compatible buffer)", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    const dst = new Uint8ClampedArray(SIZE * SIZE * 4);

    runner.renderToPixels(paintBleed, { from, to, progress: 0, dst });
    expectAllPixelsApprox(dst, [255, 0, 0]);
  });

  it("accepts an oversize dst buffer (only the prefix is written)", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    const dst = new Uint8Array(SIZE * SIZE * 4 + 1024);
    // Sentinel bytes past the pixel region — should stay untouched.
    dst.fill(0xAB, SIZE * SIZE * 4);

    runner.renderToPixels(paintBleed, { from, to, progress: 0, dst });
    expectAllPixelsApprox(dst.subarray(0, SIZE * SIZE * 4), [255, 0, 0]);
    for (let i = SIZE * SIZE * 4; i < dst.length; i++) {
      expect(dst[i]).toBe(0xAB);
    }
  });

  it("throws when dst is too small for the canvas", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    const dst = new Uint8Array(SIZE * SIZE * 4 - 1);
    expect(() =>
      runner.renderToPixels(paintBleed, { from, to, progress: 0, dst }),
    ).toThrow(/dst buffer is too small/);
  });

  it("round-trips RawPixels in, RawPixels out with matching orientation", () => {
    // Half-red-top, half-blue-bottom source. With flipY=true default,
    // top-down in => top-down out. The output's top half should be
    // close to red and bottom half close to blue at progress=0.
    const pixels = new Uint8Array(SIZE * SIZE * 4);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const i = (y * SIZE + x) * 4;
        if (y < SIZE / 2) {
          pixels[i] = 255; pixels[i + 1] = 0; pixels[i + 2] = 0;
        } else {
          pixels[i] = 0; pixels[i + 1] = 0; pixels[i + 2] = 255;
        }
        pixels[i + 3] = 255;
      }
    }
    const src = { pixels, width: SIZE, height: SIZE };
    const dst = new Uint8Array(SIZE * SIZE * 4);

    runner.renderToPixels(paintBleed, {
      from: src,
      to: src,
      progress: 0,
      dst,
    });

    // First row (y=0, top) should be red; last row (y=15, bottom) blue.
    const firstRowMid = ((0 * SIZE) + Math.floor(SIZE / 2)) * 4;
    const lastRowMid = (((SIZE - 1) * SIZE) + Math.floor(SIZE / 2)) * 4;
    expect(dst[firstRowMid]).toBeGreaterThan(200);    // red top
    expect(dst[firstRowMid + 2]).toBeLessThan(60);
    expect(dst[lastRowMid + 2]).toBeGreaterThan(200); // blue bottom
    expect(dst[lastRowMid]).toBeLessThan(60);
  });
});

describe("Runner.renderToPixels — flipY: false (GL bottom-up readback)", () => {
  let bottomUpRunner: Runner;
  let bottomUpCanvas: HTMLCanvasElement;

  beforeEach(() => {
    bottomUpCanvas = document.createElement("canvas");
    bottomUpCanvas.width = SIZE;
    bottomUpCanvas.height = SIZE;
    bottomUpRunner = new Runner({
      canvas: bottomUpCanvas,
      contextAttributes: { preserveDrawingBuffer: true },
      textureCache: { flipY: false },
    });
  });

  afterEach(() => {
    bottomUpRunner.dispose();
  });

  it("returns bottom-up bytes when flipY: false", () => {
    // Same half-red-top, half-blue-bottom source. With flipY:false:
    // - RawPixels uploads as-is (no row flip on upload)
    // - readPixels writes bottom-up (no flip on readback)
    // Net: y=0 in input ends up at y=(h-1) in output (image was
    // rendered with y=0 sampling from texture y=0 which the shader UV
    // mapping pushes to canvas bottom).
    const pixels = new Uint8Array(SIZE * SIZE * 4);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const i = (y * SIZE + x) * 4;
        if (y < SIZE / 2) {
          pixels[i] = 255; pixels[i + 1] = 0; pixels[i + 2] = 0;
        } else {
          pixels[i] = 0; pixels[i + 1] = 0; pixels[i + 2] = 255;
        }
        pixels[i + 3] = 255;
      }
    }
    const src = { pixels, width: SIZE, height: SIZE };
    const dst = new Uint8Array(SIZE * SIZE * 4);

    bottomUpRunner.renderToPixels(paintBleed, {
      from: src,
      to: src,
      progress: 0,
      dst,
    });

    // With flipY:false, output row 0 is what came from input row 0
    // (texture y=0, drawn at canvas bottom, read back at GL y=0).
    // So output top-row is red (matches input top row).
    const firstRowMid = ((0 * SIZE) + Math.floor(SIZE / 2)) * 4;
    const lastRowMid = (((SIZE - 1) * SIZE) + Math.floor(SIZE / 2)) * 4;
    expect(dst[firstRowMid]).toBeGreaterThan(200);
    expect(dst[lastRowMid + 2]).toBeGreaterThan(200);
  });
});
