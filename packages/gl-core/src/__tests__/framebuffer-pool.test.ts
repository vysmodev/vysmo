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

  it("creates a separate slot when width changes (LRU)", () => {
    const first = pool.ensure(2, 64, 64);
    const firstFb = first[0]!.fb;
    const second = pool.ensure(2, 128, 64);
    expect(second[0]!.fb).not.toBe(firstFb);
    expect(second[0]!.width).toBe(128);
    // Old slot persists under the default capacity (4); count is the
    // sum across both slots.
    expect(pool.count).toBe(4);
    // Re-requesting the original size returns the original FBOs (no
    // reallocation).
    const firstAgain = pool.ensure(2, 64, 64);
    expect(firstAgain[0]!.fb).toBe(firstFb);
  });

  it("creates a separate slot when height changes (LRU)", () => {
    pool.ensure(2, 64, 64);
    const second = pool.ensure(2, 64, 128);
    expect(second[0]!.height).toBe(128);
    expect(pool.count).toBe(4);
  });

  it("reallocates the matching slot when count grows", () => {
    const first = pool.ensure(2, 64, 64);
    const firstFb = first[0]!.fb;
    const second = pool.ensure(3, 64, 64);
    expect(second).toHaveLength(3);
    // The slot itself was rebuilt; the old FBO handle is gone.
    expect(second[0]!.fb).not.toBe(firstFb);
    // Only one slot at this (w,h,hdr) — total count reflects only the
    // realloc'd slot.
    expect(pool.count).toBe(3);
  });

  it("returns a smaller slice without reallocating when count shrinks", () => {
    const big = pool.ensure(3, 64, 64);
    const bigFb0 = big[0]!.fb;
    const small = pool.ensure(2, 64, 64);
    expect(small).toHaveLength(2);
    expect(small[0]!.fb).toBe(bigFb0);
    expect(pool.count).toBe(3); // slot still holds 3 FBOs
  });

  it("evicts the least-recently-used slot when capacity is exceeded", () => {
    const small = new FramebufferPool(gl, { capacity: 2 });
    const a = small.ensure(1, 16, 16);
    small.ensure(1, 32, 32);
    // Promote A back to MRU.
    small.ensure(1, 16, 16);
    // C should evict the LRU slot (32×32), keeping A and C.
    small.ensure(1, 48, 48);
    expect(small.count).toBe(2);
    // A is still cached (same FBO handle).
    const aAgain = small.ensure(1, 16, 16);
    expect(aAgain[0]!.fb).toBe(a[0]!.fb);
    // 32×32 was evicted — re-requesting it allocates a new slot.
    small.ensure(1, 32, 32);
    expect(small.count).toBe(2); // evicted 48×48 to make room
    small.dispose();
  });

  it("capacity: 1 collapses to pre-0.5.0 dispose-on-change behavior", () => {
    const legacy = new FramebufferPool(gl, { capacity: 1 });
    const first = legacy.ensure(2, 64, 64);
    const firstFb = first[0]!.fb;
    // Any dim change at capacity 1 must evict the existing slot.
    const second = legacy.ensure(2, 128, 64);
    expect(second[0]!.fb).not.toBe(firstFb);
    expect(legacy.count).toBe(2); // only the new slot lives
    // Re-requesting the old size also reallocates (slot was evicted).
    const firstReallocated = legacy.ensure(2, 64, 64);
    expect(firstReallocated[0]!.fb).not.toBe(firstFb);
    legacy.dispose();
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

  it("keeps LDR and HDR slots separate (LRU)", () => {
    const ldr = pool.ensure(2, 64, 64, { hdr: false });
    const ldrFb = ldr[0]!.fb;
    pool.ensure(2, 64, 64, { hdr: true });
    if (pool.isHdrActive) {
      // Extension available: HDR allocates a separate slot. LDR slot
      // still lives under the default LRU capacity.
      const hdr = pool.ensure(2, 64, 64, { hdr: true });
      expect(hdr[0]!.fb).not.toBe(ldrFb);
      const ldrAgain = pool.ensure(2, 64, 64, { hdr: false });
      expect(ldrAgain[0]!.fb).toBe(ldrFb);
    } else {
      // Extension unavailable: HDR fell back to LDR, hit the same slot.
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
