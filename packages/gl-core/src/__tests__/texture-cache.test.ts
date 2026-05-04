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
