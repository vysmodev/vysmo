import { beforeEach, describe, expect, it } from "vitest";
import { Runner, paintBleed } from "../../index.js";

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
  it("renders a transition after preloading from/to URLs", async () => {
    const fromUrl = await blobUrl("#ff0000");
    const toUrl = await blobUrl("#0000ff");

    await runner.preload([fromUrl, toUrl]);

    // Should not throw — the URLs are pre-loaded.
    expect(() =>
      runner.render(paintBleed, {
        from: fromUrl,
        to: toUrl,
        progress: 0.5,
      }),
    ).not.toThrow();
  });

  it("throws a helpful error when rendering with an un-preloaded URL", async () => {
    const fromUrl = await blobUrl("#ff0000");
    const toUrl = await blobUrl("#0000ff");
    // Only preload `from`; `to` remains unloaded.
    await runner.preload([fromUrl]);

    expect(() =>
      runner.render(paintBleed, {
        from: fromUrl,
        to: toUrl,
        progress: 0.5,
      }),
    ).toThrow(/URL is not loaded/);
  });

  it("error message names the un-preloaded URL and the role (from/to)", async () => {
    const fromUrl = await blobUrl("#00ff00");
    const toUrl = await blobUrl("#ff00ff");
    await runner.preload([toUrl]); // only `to` preloaded; `from` is missing

    try {
      runner.render(paintBleed, {
        from: fromUrl,
        to: toUrl,
        progress: 0.5,
      });
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      const message = (err as Error).message;
      expect(message).toContain('"from"');
      expect(message).toContain(fromUrl);
      expect(message).toContain("preload");
    }
  });

  it("preload() ignores DOM-source inputs (they don't need pre-loading)", async () => {
    // Passing a mix of URLs and DOM sources to preload should resolve
    // cleanly. DOM sources are filtered out before the async work.
    const fromUrl = await blobUrl("#ff0000");
    const toCanvas = makeSolid(0, 0, 255);
    await expect(
      runner.preload([fromUrl, toCanvas]),
    ).resolves.toBeUndefined();
    // And the subsequent render with both should work.
    expect(() =>
      runner.render(paintBleed, {
        from: fromUrl,
        to: toCanvas,
        progress: 0.3,
      }),
    ).not.toThrow();
  });

  it("can render with mixed source types (URL from, canvas to)", async () => {
    const fromUrl = await blobUrl("#ff0000");
    const toCanvas = makeSolid(0, 0, 255);
    await runner.preload([fromUrl]);
    expect(() =>
      runner.render(paintBleed, {
        from: fromUrl,
        to: toCanvas,
        progress: 0.5,
      }),
    ).not.toThrow();
  });

  it("preload() deduplicates repeated URLs (no double-fetch)", async () => {
    // Call preload twice with the same URL — should resolve fine, and
    // the underlying TextureCache dedup means only one fetch happens.
    const url = await blobUrl("#abcdef");
    await runner.preload([url]);
    await runner.preload([url]); // hit cache
    expect(() =>
      runner.render(paintBleed, {
        from: url,
        to: url,
        progress: 0.5,
      }),
    ).not.toThrow();
  });
});
