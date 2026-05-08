import { beforeAll, afterAll, describe, expect, it } from "vitest";
import {
  ALL_TRANSITIONS,
  Runner,
  directionalBurn,
  directionalWarp,
  flowWarp,
  kineticBands,
  lightLeak,
  paintBleed,
  slide,
  smolderingEdge,
  tangentMotionBlur,
  wind,
  wipeDirectional,
  type Transition,
  type UniformParams,
} from "../index.js";

const SIZE = 32;
const TOLERANCE = 2;

function makeSolid(r: number, g: number, b: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  return canvas;
}

function readPixels(runner: Runner): Uint8Array {
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  runner.gl.readPixels(
    0,
    0,
    SIZE,
    SIZE,
    runner.gl.RGBA,
    runner.gl.UNSIGNED_BYTE,
    pixels,
  );
  return pixels;
}

function assertAllPixelsMatch(
  pixels: Uint8Array,
  expected: [number, number, number],
  tolerance = TOLERANCE,
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
    const actual = [
      pixels[worstIndex] ?? 0,
      pixels[worstIndex + 1] ?? 0,
      pixels[worstIndex + 2] ?? 0,
    ];
    expect.fail(
      `Pixel at index ${worstIndex} = [${actual.join(", ")}], expected ≈ [${expected.join(", ")}] (max diff ${worstDiff})`,
    );
  }
}

// Source of truth for the catalog: ALL_TRANSITIONS from the package.
// Adding a new transition to the package's index automatically picks it
// up here.
const TRANSITIONS = ALL_TRANSITIONS;

describe("endpoint correctness — every transition must be pixel-pure from/to at progress 0/1", () => {
  let runner: Runner;
  let from: HTMLCanvasElement;
  let to: HTMLCanvasElement;

  beforeAll(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    runner = new Runner({
      canvas,
      contextAttributes: { preserveDrawingBuffer: true },
    });
    from = makeSolid(255, 0, 0);
    to = makeSolid(0, 0, 255);
  });

  afterAll(() => {
    runner.dispose();
  });

  for (const transition of TRANSITIONS) {
    it(`${transition.name} at progress=0 is pure "from"`, () => {
      runner.render(transition, { from, to, progress: 0 });
      assertAllPixelsMatch(readPixels(runner), [255, 0, 0]);
    });

    it(`${transition.name} at progress=1 is pure "to"`, () => {
      runner.render(transition, { from, to, progress: 1 });
      assertAllPixelsMatch(readPixels(runner), [0, 0, 255]);
    });
  }

  // Regression: TextureCache.resolve() calls gl.bindTexture() against the
  // active unit; if the runner interleaves resolves with activeTexture()
  // calls, a supplied displacement source can clobber unit 1 (uTo). Prior
  // tests passed because they never supplied a displacement and hit the
  // default 1×1 path that skips resolve().
  it("endpoints stay correct when a displacement source is supplied", () => {
    const displacement = makeSolid(200, 80, 40);
    runner.render(flowWarp, { from, to, progress: 0, displacement });
    assertAllPixelsMatch(readPixels(runner), [255, 0, 0]);
    runner.render(flowWarp, { from, to, progress: 1, displacement });
    assertAllPixelsMatch(readPixels(runner), [0, 0, 255]);
  });

  // Regression: shaders that compute `0.5 + dot(uv - 0.5, dir)` without
  // dividing by maxProj = (|dx| + |dy|)/2 produce a sliver of the previous
  // image at the corners when direction is non-axis-aligned. These tests
  // exercise the diagonal case so the fix can't silently regress.
  const DIAGONAL_DIRECTIONAL: ReadonlyArray<[string, Transition<UniformParams>]> = [
    ["slide", slide as Transition<UniformParams>],
    ["paintBleed", paintBleed as Transition<UniformParams>],
      ["kineticBands", kineticBands as Transition<UniformParams>],
    ["lightLeak", lightLeak as Transition<UniformParams>],
    ["tangentMotionBlur", tangentMotionBlur as Transition<UniformParams>],
    ["wind", wind as Transition<UniformParams>],
    ["directionalBurn", directionalBurn as Transition<UniformParams>],
    ["smolderingEdge", smolderingEdge as Transition<UniformParams>],
    ["directionalWarp", directionalWarp as Transition<UniformParams>],
  ];
  for (const [name, transition] of DIAGONAL_DIRECTIONAL) {
    it(`${name} endpoints correct with diagonal direction [1, 1]`, () => {
      const params = { direction: [1, 1] as const };
      runner.render(transition, { from, to, progress: 0, params });
      assertAllPixelsMatch(readPixels(runner), [255, 0, 0]);
      runner.render(transition, { from, to, progress: 1, params });
      assertAllPixelsMatch(readPixels(runner), [0, 0, 255]);
    });
  }

  // wipe-directional uses an angle (radians), not a vec2 — but the same
  // gradient pattern. Verify diagonal angle (π/4 = 45°) is endpoint-correct.
  it("wipeDirectional endpoints correct at 45° (diagonal angle)", () => {
    const params = { angle: Math.PI / 4 };
    runner.render(wipeDirectional, { from, to, progress: 0, params });
    assertAllPixelsMatch(readPixels(runner), [255, 0, 0]);
    runner.render(wipeDirectional, { from, to, progress: 1, params });
    assertAllPixelsMatch(readPixels(runner), [0, 0, 255]);
  });
});
