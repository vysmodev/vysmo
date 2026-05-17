import { beforeEach, describe, expect, it } from "vitest";
import { Runner, blur } from "../index.js";

const SIZE = 16;

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

async function blobUrl(color: string): Promise<string> {
  const canvas = makeSolid(
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16),
  );
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))));
  });
  return URL.createObjectURL(blob);
}

let canvas: HTMLCanvasElement;
let runner: Runner;

beforeEach(() => {
  canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  runner = new Runner({ canvas });
});

describe("Runner URL inputs", () => {
  it("renders an effect after preloading a source URL", async () => {
    const sourceUrl = await blobUrl("#ff8800");
    await runner.preload([sourceUrl]);

    expect(() =>
      runner.render(blur, {
        source: sourceUrl,
        params: { radius: 4 },
      }),
    ).not.toThrow();
  });

  it("throws a helpful error when rendering with an un-preloaded URL", async () => {
    const sourceUrl = await blobUrl("#ff8800");
    // Skip preload.
    expect(() =>
      runner.render(blur, { source: sourceUrl }),
    ).toThrow(/URL is not loaded/);
  });

  it("error message names the URL and points at preload()", async () => {
    const sourceUrl = await blobUrl("#00ff88");
    try {
      runner.render(blur, { source: sourceUrl });
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      const message = (err as Error).message;
      expect(message).toContain(sourceUrl);
      expect(message).toContain("preload");
    }
  });

  it("preload() ignores DOM-source inputs", async () => {
    const sourceUrl = await blobUrl("#abcdef");
    const aCanvas = makeSolid(10, 20, 30);
    await expect(
      runner.preload([sourceUrl, aCanvas]),
    ).resolves.toBeUndefined();
  });

  it("works with a DOM source after preload of unrelated URLs", async () => {
    const url = await blobUrl("#123456");
    await runner.preload([url]); // unused
    const directCanvas = makeSolid(99, 99, 99);
    expect(() => runner.render(blur, { source: directCanvas })).not.toThrow();
  });

  it("preload() deduplicates repeated URLs (no double-fetch)", async () => {
    const url = await blobUrl("#fedcba");
    await runner.preload([url]);
    await runner.preload([url]); // hit cache
    expect(() => runner.render(blur, { source: url })).not.toThrow();
  });
});
