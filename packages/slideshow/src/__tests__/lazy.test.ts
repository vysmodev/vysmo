import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSlideshow, type SlideshowHandle } from "../index.js";

let container: HTMLElement;
const handles: SlideshowHandle[] = [];

beforeEach(() => {
  container = document.createElement("div");
  container.style.width = "400px";
  container.style.height = "225px";
  document.body.appendChild(container);
});

afterEach(() => {
  for (const h of handles.splice(0)) h.destroy();
  container.remove();
});

function track(h: SlideshowHandle): SlideshowHandle {
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

describe("createSlideshow: lazy mode", () => {
  it("ready resolves once the initial slide is loaded (URL sources)", async () => {
    const urls = await Promise.all([
      blobUrl("#ff0000"),
      blobUrl("#00ff00"),
      blobUrl("#0000ff"),
    ]);
    const s = track(
      createSlideshow({
        container,
        slides: urls,
        lazy: true,
        transitionDuration: 30,
      }),
    );
    await s.ready;
    // Doesn't throw — initial slide rendered without preload-before-ready.
    expect(s.current).toBe(0);
  });

  it("navigating to an un-preloaded URL works (awaits load mid-navigation)", async () => {
    const urls = await Promise.all([
      blobUrl("#aa0000"),
      blobUrl("#00aa00"),
      blobUrl("#0000aa"),
      blobUrl("#aaaa00"),
      blobUrl("#00aaaa"),
    ]);
    const s = track(
      createSlideshow({
        container,
        slides: urls,
        lazy: true,
        preloadWindow: 1, // window of 1 means slides 3-4 aren't preloaded at start
        transitionDuration: 30,
      }),
    );
    await s.ready;
    // Jump to slide 4, which is outside the initial preload window.
    await s.go(4);
    expect(s.current).toBe(4);
  });

  it("DOM-source slides in a lazy slideshow are treated as already loaded", async () => {
    const slides = [makeCanvas("#ff0000"), makeCanvas("#00ff00")];
    const s = track(
      createSlideshow({
        container,
        slides,
        lazy: true,
        transitionDuration: 30,
      }),
    );
    await s.ready;
    expect(s.current).toBe(0);
    await s.next();
    expect(s.current).toBe(1);
  });

  it("mixed array (URL + DOM) lazy-loads URL slides, leaves DOM slides as-is", async () => {
    const url1 = await blobUrl("#ff8800");
    const canvas = makeCanvas("#0088ff");
    const url2 = await blobUrl("#88ff00");
    const s = track(
      createSlideshow({
        container,
        slides: [url1, canvas, url2],
        lazy: true,
        transitionDuration: 30,
      }),
    );
    await s.ready;
    await s.next();
    expect(s.current).toBe(1);
    await s.next();
    expect(s.current).toBe(2);
  });

  it("eager mode (default) is unaffected by lazy code paths", async () => {
    const urls = await Promise.all([blobUrl("#abcdef"), blobUrl("#fedcba")]);
    const s = track(
      createSlideshow({
        container,
        slides: urls,
        // lazy not set
        transitionDuration: 30,
      }),
    );
    await s.ready;
    expect(s.current).toBe(0);
    await s.next();
    expect(s.current).toBe(1);
  });

  it("preloadWindow > 1 keeps a wider window resident", async () => {
    // We can't easily assert "exactly N textures loaded" without poking
    // into the runner internals. But we can assert that navigation
    // through the window works without errors / hangs.
    const urls = await Promise.all([
      blobUrl("#100000"),
      blobUrl("#001000"),
      blobUrl("#000010"),
      blobUrl("#101000"),
      blobUrl("#001010"),
    ]);
    const s = track(
      createSlideshow({
        container,
        slides: urls,
        lazy: true,
        preloadWindow: 2,
        transitionDuration: 30,
      }),
    );
    await s.ready;
    // Walk forward and back across the window.
    for (let i = 0; i < urls.length; i++) await s.go(i);
    for (let i = urls.length - 1; i >= 0; i--) await s.go(i);
    expect(s.current).toBe(0);
  });
});
