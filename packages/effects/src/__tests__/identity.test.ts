import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  Runner,
  blur,
  vignette,
  grain,
  chromaticAberration,
  colorGrade,
  pixelate,
  bloom,
  glow,
  sharpen,
  duotone,
  posterize,
  edgeDetect,
  halftone,
  tiltShift,
  scanlines,
  lensDistortion,
  oilPaint,
  wave,
  bulge,
  swirl,
  motionBlur,
  radialBlur,
  rgbShift,
  vhs,
  pixelSort,
  datamosh,
  ascii,
  dither,
  gradientMap,
  type Effect,
  type UniformParams,
} from "../index.js";

const SIZE = 32;

interface IdentityCase {
  readonly effect: Effect<UniformParams>;
  readonly nullParams: Record<string, number | boolean | readonly number[]>;
}

/**
 * Each effect's "identity params" — the set of inputs under which it
 * must return the source texture verbatim. Framework-level identity
 * (defineEffect wrapping) can't guess these per-effect, so every new
 * effect is listed here.
 */
const CASES: readonly IdentityCase[] = [
  { effect: blur, nullParams: { radius: 0 } },
  { effect: vignette, nullParams: { intensity: 0 } },
  { effect: grain, nullParams: { intensity: 0 } },
  { effect: chromaticAberration, nullParams: { offset: 0 } },
  {
    effect: colorGrade,
    nullParams: { brightness: 0, contrast: 1, saturation: 1, hue: 0 },
  },
  { effect: pixelate, nullParams: { size: 1 } },
  { effect: bloom, nullParams: { intensity: 0 } },
  { effect: glow, nullParams: { intensity: 0 } },
  // Tier-1 additions (2026-04-30): every one short-circuits to source
  // when its identity parameter is at the documented zero.
  { effect: sharpen, nullParams: { amount: 0 } },
  // threshold has no identity case — it always replaces colour by design.
  { effect: duotone, nullParams: { intensity: 0 } },
  { effect: posterize, nullParams: { levels: 256 } },
  { effect: edgeDetect, nullParams: { intensity: 0 } },
  { effect: halftone, nullParams: { intensity: 0 } },
  // Tier-2/3/4 + bonus additions (2026-04-29).
  { effect: tiltShift, nullParams: { blurRadius: 0 } },
  { effect: scanlines, nullParams: { intensity: 0 } },
  { effect: lensDistortion, nullParams: { strength: 0 } },
  { effect: oilPaint, nullParams: { radius: 0 } },
  { effect: wave, nullParams: { amplitude: 0 } },
  { effect: bulge, nullParams: { strength: 0 } },
  { effect: swirl, nullParams: { angle: 0 } },
  { effect: motionBlur, nullParams: { distance: 0 } },
  { effect: radialBlur, nullParams: { strength: 0 } },
  { effect: rgbShift, nullParams: { intensity: 0 } },
  { effect: vhs, nullParams: { intensity: 0 } },
  { effect: pixelSort, nullParams: { intensity: 0 } },
  { effect: datamosh, nullParams: { intensity: 0 } },
  { effect: ascii, nullParams: { intensity: 0 } },
  { effect: dither, nullParams: { intensity: 0 } },
  { effect: gradientMap, nullParams: { intensity: 0 } },
];

const sourceCanvas = makeSolid(50, 140, 230);

let canvas: HTMLCanvasElement;
let runner: Runner;

beforeAll(() => {
  canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  runner = new Runner({ canvas });
});

afterAll(() => {
  runner.dispose();
});

describe.each(CASES)("identity: $effect.name", ({ effect, nullParams }) => {
  it("produces pixel-exact source when null params are passed", () => {
    runner.render(effect, { source: sourceCanvas, params: nullParams as never });
    const pixels = readPixels(runner);
    // Tolerance of 1 absorbs FBO roundtrip noise (LINEAR sampling at
    // texel centres should be exact on most GPUs, but allow 1 LSB).
    assertAllPixelsMatch(pixels, [50, 140, 230], 1);
  });
});

function makeSolid(r: number, g: number, b: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  return c;
}

function readPixels(r: Runner): Uint8Array {
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  r.gl.readPixels(
    0,
    0,
    SIZE,
    SIZE,
    r.gl.RGBA,
    r.gl.UNSIGNED_BYTE,
    pixels,
  );
  return pixels;
}

function assertAllPixelsMatch(
  pixels: Uint8Array,
  expected: readonly [number, number, number],
  tolerance: number,
): void {
  let worstDiff = 0;
  let worstIndex = -1;
  for (let i = 0; i < pixels.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const diff = Math.abs((pixels[i + c] ?? 0) - (expected[c] ?? 0));
      if (diff > worstDiff) {
        worstDiff = diff;
        worstIndex = i;
      }
    }
  }
  if (worstDiff > tolerance) {
    const idx = worstIndex >= 0 ? worstIndex : 0;
    expect.fail(
      `Pixel ${idx / 4} diff ${worstDiff} > tolerance ${tolerance}; expected rgb(${expected.join(",")}), got rgb(${pixels[idx]},${pixels[idx + 1]},${pixels[idx + 2]})`,
    );
  }
}
