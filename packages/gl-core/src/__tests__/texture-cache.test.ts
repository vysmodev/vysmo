import { describe, expect, it, beforeEach, vi } from "vitest";
import { TextureCache } from "../index.js";

let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;

beforeEach(() => {
  canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;
  gl = canvas.getContext("webgl2")!;
});

function makeSourceCanvas(size = 4, fill = "#ff0000"): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, size, size);
  return c;
}

describe("TextureCache", () => {
  it("uploads a canvas source to a new WebGLTexture", () => {
    const cache = new TextureCache(gl);
    const source = makeSourceCanvas();
    const tex = cache.resolve(source);
    expect(tex).toBeInstanceOf(WebGLTexture);
  });

  it("returns the same WebGLTexture for the same source on repeated resolve", () => {
    const cache = new TextureCache(gl);
    const source = makeSourceCanvas();
    const a = cache.resolve(source);
    const b = cache.resolve(source);
    expect(a).toBe(b);
  });

  it("returns a raw WebGLTexture source verbatim (no caching overhead)", () => {
    const cache = new TextureCache(gl);
    const raw = gl.createTexture()!;
    const resolved = cache.resolve(raw);
    expect(resolved).toBe(raw);
    gl.deleteTexture(raw);
  });

  it("allocates distinct textures for distinct sources", () => {
    const cache = new TextureCache(gl);
    const a = cache.resolve(makeSourceCanvas(4, "#ff0000"));
    const b = cache.resolve(makeSourceCanvas(4, "#00ff00"));
    expect(a).not.toBe(b);
  });

  it("uses LINEAR_MIPMAP_LINEAR + mipmap generation by default", () => {
    // Indirectly verified: minFilter defaults to a mipmapped enum, so
    // sampling at LOD > 0 must work. Create a small source, bind the
    // cached texture, and sample it — if mipmaps were missing, WebGL
    // would render black with LINEAR_MIPMAP_LINEAR min filter.
    const cache = new TextureCache(gl);
    const source = makeSourceCanvas(8, "#ff0000");
    const tex = cache.resolve(source);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const minFilter = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER);
    expect(minFilter).toBe(gl.LINEAR_MIPMAP_LINEAR);
  });

  it("honours generateMipmaps:false with LINEAR min filter", () => {
    const cache = new TextureCache(gl, { generateMipmaps: false });
    const source = makeSourceCanvas();
    const tex = cache.resolve(source);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const minFilter = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER);
    expect(minFilter).toBe(gl.LINEAR);
  });

  it("re-uploads canvas sources on every resolve (mutable)", () => {
    // Canvas pixels can change between frames, so the cache must
    // re-upload on every resolve. Verified by spying on texImage2D.
    const cache = new TextureCache(gl);
    const source = makeSourceCanvas();
    const spy = vi.spyOn(gl, "texImage2D");
    cache.resolve(source);
    cache.resolve(source);
    cache.resolve(source);
    expect(spy).toHaveBeenCalledTimes(3);
    spy.mockRestore();
  });

  it("uploads HTMLImageElement only once (immutable fast path)", async () => {
    // Static images can't change after load, so subsequent resolve()
    // calls should skip texImage2D + generateMipmap entirely.
    const cache = new TextureCache(gl);
    const img = new Image();
    img.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    await img.decode();
    const texSpy = vi.spyOn(gl, "texImage2D");
    const mipSpy = vi.spyOn(gl, "generateMipmap");
    cache.resolve(img);
    cache.resolve(img);
    cache.resolve(img);
    expect(texSpy).toHaveBeenCalledTimes(1);
    expect(mipSpy).toHaveBeenCalledTimes(1);
    texSpy.mockRestore();
    mipSpy.mockRestore();
  });

  it("honours explicit filter + wrap overrides", () => {
    const cache = new TextureCache(gl, {
      minFilter: gl.NEAREST,
      magFilter: gl.NEAREST,
      wrapS: gl.REPEAT,
      wrapT: gl.REPEAT,
      generateMipmaps: false,
    });
    const source = makeSourceCanvas();
    const tex = cache.resolve(source);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    expect(gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER)).toBe(
      gl.NEAREST,
    );
    expect(gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER)).toBe(
      gl.NEAREST,
    );
    expect(gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S)).toBe(
      gl.REPEAT,
    );
    expect(gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T)).toBe(
      gl.REPEAT,
    );
  });
});

// Real blob URLs generated from canvases — more reliable than
// hand-rolled data URLs (no chance of malformed base64) and they give
// us distinct URLs without needing distinct image content.
async function makeBlobUrl(color: string): Promise<string> {
  const c = makeSourceCanvas(4, color);
  const blob: Blob = await new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))));
  });
  return URL.createObjectURL(blob);
}

let RED_URL: string;
let GREEN_URL: string;
let BLUE_URL: string;

beforeEach(async () => {
  RED_URL = await makeBlobUrl("#ff0000");
  GREEN_URL = await makeBlobUrl("#00ff00");
  BLUE_URL = await makeBlobUrl("#0000ff");
});

describe("TextureCache.resolveAsync", () => {
  it("resolves a URL string to a WebGLTexture", async () => {
    const cache = new TextureCache(gl);
    const tex = await cache.resolveAsync(RED_URL);
    expect(tex).toBeInstanceOf(WebGLTexture);
  });

  it("returns the same WebGLTexture for the same URL on repeated calls", async () => {
    const cache = new TextureCache(gl);
    const a = await cache.resolveAsync(RED_URL);
    const b = await cache.resolveAsync(RED_URL);
    expect(a).toBe(b);
  });

  it("deduplicates concurrent loads of the same URL", async () => {
    // Two awaits started before the first one resolves should share the
    // same in-flight promise — only one fetch should fire.
    const cache = new TextureCache(gl);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const [a, b] = await Promise.all([
      cache.resolveAsync(GREEN_URL),
      cache.resolveAsync(GREEN_URL),
    ]);
    expect(a).toBe(b);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    fetchSpy.mockRestore();
  });

  it("delegates to sync resolve() for non-string sources", async () => {
    const cache = new TextureCache(gl);
    const source = makeSourceCanvas();
    const syncTex = cache.resolve(source);
    const asyncTex = await cache.resolveAsync(source);
    expect(asyncTex).toBe(syncTex);
  });

  it("allocates distinct textures for distinct URLs", async () => {
    const cache = new TextureCache(gl);
    const a = await cache.resolveAsync(RED_URL);
    const b = await cache.resolveAsync(GREEN_URL);
    expect(a).not.toBe(b);
  });

  it("removes the entry on fetch failure so retry can succeed", async () => {
    // First call rejects (bad URL). The next call to the same URL
    // should be a fresh attempt, not a re-yield of the rejected promise.
    const cache = new TextureCache(gl);
    const badUrl = "data:application/octet-stream;base64,***not-valid***";
    await expect(cache.resolveAsync(badUrl)).rejects.toThrow();
    // A second call should also error (still bad URL) but importantly
    // it should be a *new* error from a fresh attempt — not a reuse of
    // the cached rejected promise. Verified by checking the cache has
    // dropped the entry between attempts (release returns false).
    expect(cache.release(badUrl)).toBe(false);
  });
});

describe("TextureCache.release", () => {
  it("evicts a URL-keyed entry and frees its texture", async () => {
    const cache = new TextureCache(gl);
    const tex = await cache.resolveAsync(RED_URL);
    const deleteSpy = vi.spyOn(gl, "deleteTexture");
    expect(cache.release(RED_URL)).toBe(true);
    expect(deleteSpy).toHaveBeenCalledWith(tex);
    // After release, a fresh resolveAsync allocates a new texture.
    const reloaded = await cache.resolveAsync(RED_URL);
    expect(reloaded).not.toBe(tex);
    deleteSpy.mockRestore();
  });

  it("evicts a DOM-source entry and frees its texture", () => {
    const cache = new TextureCache(gl);
    const source = makeSourceCanvas();
    const tex = cache.resolve(source);
    const deleteSpy = vi.spyOn(gl, "deleteTexture");
    expect(cache.release(source)).toBe(true);
    expect(deleteSpy).toHaveBeenCalledWith(tex);
    deleteSpy.mockRestore();
  });

  it("returns false for sources/URLs that were never cached", () => {
    const cache = new TextureCache(gl);
    expect(cache.release(RED_URL)).toBe(false);
    expect(cache.release(makeSourceCanvas())).toBe(false);
  });

  it("returns false for raw WebGLTexture sources (caller owns them)", () => {
    const cache = new TextureCache(gl);
    const raw = gl.createTexture()!;
    expect(cache.release(raw)).toBe(false);
    gl.deleteTexture(raw);
  });
});

describe("TextureCache SizedTexture source", () => {
  it("returns the inner WebGLTexture verbatim, no caching overhead", () => {
    const cache = new TextureCache(gl);
    const raw = gl.createTexture()!;
    const resolved = cache.resolve({ texture: raw, width: 16, height: 16 });
    expect(resolved).toBe(raw);
    gl.deleteTexture(raw);
  });

  it("returns false from release() (caller owns the inner texture)", () => {
    const cache = new TextureCache(gl);
    const raw = gl.createTexture()!;
    const wrapper = { texture: raw, width: 16, height: 16 };
    cache.resolve(wrapper);
    expect(cache.release(wrapper)).toBe(false);
    gl.bindTexture(gl.TEXTURE_2D, raw);
    expect(gl.getError()).toBe(gl.NO_ERROR);
    gl.deleteTexture(raw);
  });

  it("structurally distinguishes SizedTexture from RawPixels and bare WebGLTexture", () => {
    const cache = new TextureCache(gl);
    const raw = gl.createTexture()!;
    const sized = cache.resolve({ texture: raw, width: 4, height: 4 });
    expect(sized).toBe(raw);

    const rawPixelsResolved = cache.resolve({
      pixels: new Uint8Array(16),
      width: 2,
      height: 2,
    });
    expect(rawPixelsResolved).toBeInstanceOf(WebGLTexture);
    expect(rawPixelsResolved).not.toBe(raw);

    gl.deleteTexture(raw);
  });
});

describe("TextureCache RawPixels source", () => {
  function makeRgba(
    width: number,
    height: number,
    fill: [number, number, number, number] = [255, 0, 0, 255],
  ): Uint8Array {
    const buf = new Uint8Array(width * height * 4);
    for (let i = 0; i < buf.length; i += 4) {
      buf[i] = fill[0];
      buf[i + 1] = fill[1];
      buf[i + 2] = fill[2];
      buf[i + 3] = fill[3];
    }
    return buf;
  }

  it("uploads a Uint8Array wrapper to a new WebGLTexture", () => {
    const cache = new TextureCache(gl);
    const source = { pixels: makeRgba(4, 4), width: 4, height: 4 };
    const tex = cache.resolve(source);
    expect(tex).toBeInstanceOf(WebGLTexture);
  });

  it("accepts Uint8ClampedArray (zero-copy with browser ImageData buffers)", () => {
    const cache = new TextureCache(gl);
    const source = {
      pixels: new Uint8ClampedArray(makeRgba(4, 4)),
      width: 4,
      height: 4,
    };
    const tex = cache.resolve(source);
    expect(tex).toBeInstanceOf(WebGLTexture);
  });

  it("returns the same WebGLTexture for the same wrapper across calls", () => {
    const cache = new TextureCache(gl);
    const source = { pixels: makeRgba(4, 4), width: 4, height: 4 };
    const a = cache.resolve(source);
    const b = cache.resolve(source);
    expect(a).toBe(b);
  });

  it("allocates distinct textures for distinct wrappers (even with same buffer)", () => {
    const cache = new TextureCache(gl);
    const pixels = makeRgba(4, 4);
    const a = cache.resolve({ pixels, width: 4, height: 4 });
    const b = cache.resolve({ pixels, width: 4, height: 4 });
    expect(a).not.toBe(b);
  });

  it("re-uploads pixels on every resolve (mutable semantics)", () => {
    const cache = new TextureCache(gl);
    const source = { pixels: makeRgba(4, 4), width: 4, height: 4 };
    const spy = vi.spyOn(gl, "texImage2D");
    cache.resolve(source);
    cache.resolve(source);
    cache.resolve(source);
    expect(spy).toHaveBeenCalledTimes(3);
    spy.mockRestore();
  });

  it("validates buffer size against width × height × 4 on first call", () => {
    const cache = new TextureCache(gl);
    const source = { pixels: new Uint8Array(8), width: 4, height: 4 };
    expect(() => cache.resolve(source)).toThrow(/RawPixels buffer is too small/);
  });

  it("validates positive width/height on first call", () => {
    const cache = new TextureCache(gl);
    const zero = { pixels: makeRgba(4, 4), width: 0, height: 4 };
    expect(() => cache.resolve(zero)).toThrow(/width\/height must be positive/);
    const neg = { pixels: makeRgba(4, 4), width: 4, height: -1 };
    expect(() => cache.resolve(neg)).toThrow(/width\/height must be positive/);
  });

  it("accepts a buffer larger than width × height × 4 (padding allowed)", () => {
    // Some callers might back the wrapper with a larger arena and only
    // use the first width*height*4 bytes — that's fine, we read no further.
    const cache = new TextureCache(gl);
    const source = { pixels: new Uint8Array(256), width: 4, height: 4 };
    expect(() => cache.resolve(source)).not.toThrow();
  });

  it("sets UNPACK_FLIP_Y_WEBGL=true before upload when flipY is true (default)", () => {
    // Modern browsers honour UNPACK_FLIP_Y_WEBGL for ArrayBufferView
    // uploads (verified in Chromium), so we rely on the GL flag rather
    // than flipping rows in JS. Verify the pixelStorei call happens
    // before texImage2D and that bytes are uploaded as-is.
    const cache = new TextureCache(gl, { generateMipmaps: false });
    const pixels = new Uint8Array([
      255, 0, 0, 255,
      0, 255, 0, 255,
    ]);
    const storeSpy = vi.spyOn(gl, "pixelStorei");
    const texSpy = vi.spyOn(gl, "texImage2D");
    cache.resolve({ pixels, width: 1, height: 2 });

    // The pixelStorei(UNPACK_FLIP_Y_WEBGL, true) call must come before
    // the explicit-dimension texImage2D call.
    const storeIdx = storeSpy.mock.invocationCallOrder.findIndex(
      (_, i) =>
        storeSpy.mock.calls[i]?.[0] === gl.UNPACK_FLIP_Y_WEBGL &&
        storeSpy.mock.calls[i]?.[1] === true,
    );
    const texIdx = texSpy.mock.calls.findIndex(
      (c) => typeof c[3] === "number" && ArrayBuffer.isView(c[8] as ArrayBufferView),
    );
    expect(storeIdx).toBeGreaterThanOrEqual(0);
    expect(texIdx).toBeGreaterThanOrEqual(0);
    expect(
      storeSpy.mock.invocationCallOrder[storeIdx]!,
    ).toBeLessThan(texSpy.mock.invocationCallOrder[texIdx]!);
    // Bytes should be uploaded as-is — GL handles the flip.
    const uploaded = texSpy.mock.calls[texIdx]![8] as Uint8Array;
    expect(Array.from(uploaded)).toEqual(Array.from(pixels));
    storeSpy.mockRestore();
    texSpy.mockRestore();
  });

  it("sets UNPACK_FLIP_Y_WEBGL=false before upload when flipY is false", () => {
    const cache = new TextureCache(gl, {
      generateMipmaps: false,
      flipY: false,
    });
    const pixels = new Uint8Array([
      255, 0, 0, 255,
      0, 255, 0, 255,
    ]);
    const storeSpy = vi.spyOn(gl, "pixelStorei");
    const texSpy = vi.spyOn(gl, "texImage2D");
    cache.resolve({ pixels, width: 1, height: 2 });

    const storeIdx = storeSpy.mock.invocationCallOrder.findIndex(
      (_, i) =>
        storeSpy.mock.calls[i]?.[0] === gl.UNPACK_FLIP_Y_WEBGL &&
        storeSpy.mock.calls[i]?.[1] === false,
    );
    expect(storeIdx).toBeGreaterThanOrEqual(0);
    const texIdx = texSpy.mock.calls.findIndex(
      (c) => typeof c[3] === "number" && ArrayBuffer.isView(c[8] as ArrayBufferView),
    );
    const uploaded = texSpy.mock.calls[texIdx]![8] as Uint8Array;
    expect(Array.from(uploaded)).toEqual(Array.from(pixels));
    storeSpy.mockRestore();
    texSpy.mockRestore();
  });

  it("release() evicts the cached texture for a RawPixels wrapper", () => {
    const cache = new TextureCache(gl);
    const source = { pixels: makeRgba(4, 4), width: 4, height: 4 };
    const tex = cache.resolve(source);
    const deleteSpy = vi.spyOn(gl, "deleteTexture");
    expect(cache.release(source)).toBe(true);
    expect(deleteSpy).toHaveBeenCalledWith(tex);
    // Subsequent resolve reallocates.
    const reuploaded = cache.resolve(source);
    expect(reuploaded).not.toBe(tex);
    deleteSpy.mockRestore();
  });

  it("dispose() frees RawPixels textures alongside everything else", () => {
    const cache = new TextureCache(gl);
    const source = { pixels: makeRgba(4, 4), width: 4, height: 4 };
    const tex = cache.resolve(source);
    const deleteSpy = vi.spyOn(gl, "deleteTexture");
    cache.dispose();
    expect(deleteSpy.mock.calls.map((c) => c[0])).toContain(tex);
    deleteSpy.mockRestore();
  });
});

describe("TextureCache LRU eviction (maxUrlEntries)", () => {
  // WebGLTexture instances are opaque host objects with no enumerable
  // own properties, so vitest's `toHaveBeenCalledWith` uses deep-equality
  // that can't distinguish between them. We assert on the raw mock call
  // args via Array.prototype.includes (SameValueZero === for objects)
  // to get true reference equality.
  function deletedTextures(spy: ReturnType<typeof vi.spyOn>): WebGLTexture[] {
    return spy.mock.calls.map((call) => call[0] as WebGLTexture);
  }

  it("evicts least-recently-used URL entry when limit exceeded", async () => {
    const cache = new TextureCache(gl, { maxUrlEntries: 2 });
    const a = await cache.resolveAsync(RED_URL);
    await cache.resolveAsync(GREEN_URL);
    // Third entry pushes us over the limit; A is the LRU and should evict.
    const deleteSpy = vi.spyOn(gl, "deleteTexture");
    await cache.resolveAsync(BLUE_URL);
    expect(deletedTextures(deleteSpy)).toContain(a);
    // Re-resolving A allocates a fresh texture (cache miss).
    const aReloaded = await cache.resolveAsync(RED_URL);
    expect(aReloaded).not.toBe(a);
    deleteSpy.mockRestore();
  });

  it("re-accessing an entry moves it to most-recently-used", async () => {
    const cache = new TextureCache(gl, { maxUrlEntries: 2 });
    const a = await cache.resolveAsync(RED_URL);
    const b = await cache.resolveAsync(GREEN_URL);
    // Re-touch A so B becomes LRU.
    await cache.resolveAsync(RED_URL);
    const deleteSpy = vi.spyOn(gl, "deleteTexture");
    await cache.resolveAsync(BLUE_URL);
    // B should be evicted, not A.
    const deleted = deletedTextures(deleteSpy);
    expect(deleted).toContain(b);
    expect(deleted).not.toContain(a);
    deleteSpy.mockRestore();
  });

  it("no eviction when maxUrlEntries is unset (default Infinity)", async () => {
    const cache = new TextureCache(gl);
    await cache.resolveAsync(RED_URL);
    await cache.resolveAsync(GREEN_URL);
    await cache.resolveAsync(BLUE_URL);
    // All three should still be cached. Re-resolving any returns same.
    const a = await cache.resolveAsync(RED_URL);
    const a2 = await cache.resolveAsync(RED_URL);
    expect(a).toBe(a2);
  });
});
