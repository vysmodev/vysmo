import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFlipbook, type FlipbookHandle } from "../index.js";

let container: HTMLElement;
const handles: FlipbookHandle[] = [];

beforeEach(() => {
  container = document.createElement("div");
  container.style.width = "400px";
  container.style.height = "300px";
  document.body.appendChild(container);
});

afterEach(() => {
  for (const h of handles.splice(0)) h.destroy();
  container.remove();
});

function track(h: FlipbookHandle): FlipbookHandle {
  handles.push(h);
  return h;
}

function makeCanvas(color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 16;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 16, 16);
  return c;
}

async function blobUrl(color: string): Promise<string> {
  const c = makeCanvas(color);
  const blob: Blob = await new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))));
  });
  return URL.createObjectURL(blob);
}

describe("createFlipbook: lazy mode", () => {
  it("ready resolves once the initial page is loaded (URL sources)", async () => {
    const urls = await Promise.all([
      blobUrl("#ff0000"),
      blobUrl("#00ff00"),
      blobUrl("#0000ff"),
    ]);
    const f = track(
      createFlipbook({
        container,
        pages: urls,
        lazy: true,
        flipDuration: 30,
      }),
    );
    await f.ready;
    expect(f.current).toBe(0);
  });

  it("navigating to an out-of-window page awaits its load", async () => {
    const urls = await Promise.all([
      blobUrl("#aa0000"),
      blobUrl("#00aa00"),
      blobUrl("#0000aa"),
      blobUrl("#aaaa00"),
      blobUrl("#00aaaa"),
    ]);
    const f = track(
      createFlipbook({
        container,
        pages: urls,
        lazy: true,
        preloadWindow: 1,
        flipDuration: 30,
      }),
    );
    await f.ready;
    await f.goTo(4);
    expect(f.current).toBe(4);
  });

  it("DOM-source pages in a lazy flipbook are treated as already loaded", async () => {
    const pages = [makeCanvas("#ff0000"), makeCanvas("#00ff00")];
    const f = track(
      createFlipbook({
        container,
        pages,
        lazy: true,
        flipDuration: 30,
      }),
    );
    await f.ready;
    expect(f.current).toBe(0);
    await f.next();
    expect(f.current).toBe(1);
  });

  it("mixed array (URL + DOM) lazy-loads URL pages, leaves DOM pages as-is", async () => {
    const url1 = await blobUrl("#ff8800");
    const canvas = makeCanvas("#0088ff");
    const url2 = await blobUrl("#88ff00");
    const f = track(
      createFlipbook({
        container,
        pages: [url1, canvas, url2],
        lazy: true,
        flipDuration: 30,
      }),
    );
    await f.ready;
    await f.next();
    expect(f.current).toBe(1);
    await f.next();
    expect(f.current).toBe(2);
  });

  it("eager mode (default) is unaffected by lazy code paths", async () => {
    const urls = await Promise.all([blobUrl("#abcdef"), blobUrl("#fedcba")]);
    const f = track(
      createFlipbook({
        container,
        pages: urls,
        flipDuration: 30,
      }),
    );
    await f.ready;
    expect(f.current).toBe(0);
    await f.next();
    expect(f.current).toBe(1);
  });

  it("preloadWindow > 1 keeps a wider window navigable", async () => {
    const urls = await Promise.all([
      blobUrl("#100000"),
      blobUrl("#001000"),
      blobUrl("#000010"),
      blobUrl("#101000"),
      blobUrl("#001010"),
    ]);
    const f = track(
      createFlipbook({
        container,
        pages: urls,
        lazy: true,
        preloadWindow: 2,
        flipDuration: 30,
      }),
    );
    await f.ready;
    for (let i = 0; i < urls.length; i++) await f.goTo(i);
    for (let i = urls.length - 1; i >= 0; i--) await f.goTo(i);
    expect(f.current).toBe(0);
  });
});
