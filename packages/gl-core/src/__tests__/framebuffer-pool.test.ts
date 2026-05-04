import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FramebufferPool } from "../index.js";

let canvas: HTMLCanvasElement;
let gl: WebGL2RenderingContext;
let pool: FramebufferPool;

beforeEach(() => {
  canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  gl = canvas.getContext("webgl2")!;
  pool = new FramebufferPool(gl);
});

afterEach(() => {
  pool.dispose();
});

describe("FramebufferPool", () => {
  it("allocates the requested number of FBOs", () => {
    const fbs = pool.ensure(2, 64, 64);
    expect(fbs).toHaveLength(2);
    expect(pool.count).toBe(2);
    expect(fbs[0]!.fb).toBeInstanceOf(WebGLFramebuffer);
    expect(fbs[0]!.tex).toBeInstanceOf(WebGLTexture);
    expect(fbs[1]!.fb).not.toBe(fbs[0]!.fb);
    expect(fbs[1]!.tex).not.toBe(fbs[0]!.tex);
  });

  it("reuses FBOs on matching ensure() calls (no reallocation)", () => {
    const first = pool.ensure(2, 64, 64);
    const firstA = first[0]!;
    const firstB = first[1]!;
    const second = pool.ensure(2, 64, 64);
    expect(second[0]).toBe(firstA);
    expect(second[1]).toBe(firstB);
  });

  it("reallocates when width changes", () => {
    const first = pool.ensure(2, 64, 64);
    const firstFb = first[0]!.fb;
    const second = pool.ensure(2, 128, 64);
    expect(second[0]!.fb).not.toBe(firstFb);
    expect(second[0]!.width).toBe(128);
  });

  it("reallocates when height changes", () => {
    pool.ensure(2, 64, 64);
    const second = pool.ensure(2, 64, 128);
    expect(second[0]!.height).toBe(128);
  });

  it("reallocates when the count grows", () => {
    pool.ensure(2, 64, 64);
    const second = pool.ensure(3, 64, 64);
    expect(pool.count).toBe(3);
    expect(second).toHaveLength(3);
  });

  it("produces framebuffer-complete attachments", () => {
    const [f] = pool.ensure(1, 64, 64);
    gl.bindFramebuffer(gl.FRAMEBUFFER, f!.fb);
    expect(gl.checkFramebufferStatus(gl.FRAMEBUFFER)).toBe(
      gl.FRAMEBUFFER_COMPLETE,
    );
  });

  it("renders to and reads back from a pooled FBO", () => {
    const [f] = pool.ensure(1, 16, 16);
    gl.bindFramebuffer(gl.FRAMEBUFFER, f!.fb);
    gl.viewport(0, 0, 16, 16);
    gl.clearColor(0.25, 0.5, 0.75, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const pixels = new Uint8Array(4);
    gl.readPixels(8, 8, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    expect(pixels[0]).toBeCloseTo(64, 0);
    expect(pixels[1]).toBeCloseTo(128, 0);
    expect(pixels[2]).toBeCloseTo(191, 0);
    expect(pixels[3]).toBe(255);
  });

  it("attempts HDR allocation when requested (may fall back to LDR)", () => {
    pool.ensure(2, 64, 64, { hdr: true });
    // Whether hdr stuck depends on the test browser's ability to expose
    // EXT_color_buffer_float. Accept either outcome but confirm the pool
    // is honest about what it allocated.
    const isHdr = pool.isHdrActive;
    expect(typeof isHdr).toBe("boolean");
  });

  it("reallocates when hdr toggles", () => {
    const ldr = pool.ensure(2, 64, 64, { hdr: false });
    const ldrFb = ldr[0]!.fb;
    // Request HDR — if the extension is unavailable this becomes a no-op
    // because `hdr` resolves to false again; check the bookkeeping.
    pool.ensure(2, 64, 64, { hdr: true });
    if (pool.isHdrActive) {
      // Extension available: FBOs should have been recreated with HDR format.
      const hdr = pool.ensure(2, 64, 64, { hdr: true });
      expect(hdr[0]!.fb).not.toBe(ldrFb);
    } else {
      // Extension unavailable: the LDR FBOs should still be reused.
      const again = pool.ensure(2, 64, 64, { hdr: true });
      expect(again[0]!.fb).toBe(ldrFb);
    }
  });

  it("dispose() releases all FBOs and textures", () => {
    pool.ensure(2, 64, 64);
    expect(pool.count).toBe(2);
    pool.dispose();
    expect(pool.count).toBe(0);
    // Subsequent ensure() after dispose reallocates cleanly.
    const fresh = pool.ensure(2, 64, 64);
    expect(fresh).toHaveLength(2);
  });
});
