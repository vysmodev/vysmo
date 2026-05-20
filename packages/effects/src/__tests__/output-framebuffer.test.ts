import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Runner, blur, vignette } from "../index.js";

const SIZE = 32;

function makeSolidCanvas(r: number, g: number, b: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  return c;
}

function makeTextureBackedFBO(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
): { fb: WebGLFramebuffer; tex: WebGLTexture } {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Test FBO incomplete: 0x${status.toString(16)}`);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fb, tex };
}

function readFBO(
  gl: WebGL2RenderingContext,
  fb: WebGLFramebuffer,
  w: number,
  h: number,
): Uint8Array {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  const pixels = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return pixels;
}

function anyNonZero(buf: Uint8Array): boolean {
  for (let i = 0; i < buf.length; i++) if (buf[i] !== 0) return true;
  return false;
}

describe("effects Runner — outputFramebuffer + viewport (zero-copy bridging)", () => {
  let canvas: HTMLCanvasElement;
  let gl: WebGL2RenderingContext;
  let runner: Runner;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true })!;
    runner = new Runner({ gl, canvas });
  });

  afterEach(() => {
    runner.dispose();
  });

  it("default behaviour unchanged when no opts are passed", () => {
    const source = makeSolidCanvas(100, 200, 50);
    runner.render(vignette, { source });
    const fb = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
    expect(fb).toBeNull();
    const pix = new Uint8Array(SIZE * SIZE * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pix);
    expect(anyNonZero(pix)).toBe(true);
  });

  it("opts.outputFramebuffer: null behaves identically to no opts", () => {
    const source = makeSolidCanvas(100, 200, 50);
    runner.render(vignette, { source }, { outputFramebuffer: null });
    const fb = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
    expect(fb).toBeNull();
  });

  it("writes a single-pass effect into a caller-supplied FBO", () => {
    const source = makeSolidCanvas(200, 100, 50);
    const target = makeTextureBackedFBO(gl, SIZE, SIZE);

    runner.render(vignette, { source }, { outputFramebuffer: target.fb });

    const pix = readFBO(gl, target.fb, SIZE, SIZE);
    expect(anyNonZero(pix)).toBe(true);
    // Default FB was never written.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const defaultPix = new Uint8Array(SIZE * SIZE * 4);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, defaultPix);
    expect(anyNonZero(defaultPix)).toBe(false);

    gl.deleteFramebuffer(target.fb);
    gl.deleteTexture(target.tex);
  });

  it("writes a multi-pass effect (blur) into a caller-supplied FBO", () => {
    const source = makeSolidCanvas(200, 50, 50);
    const target = makeTextureBackedFBO(gl, SIZE, SIZE);

    runner.render(
      blur,
      { source, params: { radius: 4 } },
      { outputFramebuffer: target.fb },
    );

    const pix = readFBO(gl, target.fb, SIZE, SIZE);
    // Blurred red — center pixel should be roughly red-dominant.
    const ci = (16 * SIZE + 16) * 4;
    expect(pix[ci]).toBeGreaterThan(150);

    gl.deleteFramebuffer(target.fb);
    gl.deleteTexture(target.tex);
  });

  it("leaves the caller's FBO bound at end of render() (consumer rebinds)", () => {
    const source = makeSolidCanvas(100, 100, 100);
    const target = makeTextureBackedFBO(gl, SIZE, SIZE);

    runner.render(vignette, { source }, { outputFramebuffer: target.fb });

    const stillBound = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
    expect(stillBound).toBe(target.fb);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(target.fb);
    gl.deleteTexture(target.tex);
  });

  it("opts.viewport clips into the default framebuffer (standalone)", () => {
    const source = makeSolidCanvas(0, 255, 0);
    runner.render(vignette, { source }, { viewport: [0, 0, 16, 16] });

    const pix = new Uint8Array(SIZE * SIZE * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pix);

    const insideIdx = (4 * SIZE + 4) * 4;
    expect(pix[insideIdx + 1]).toBeGreaterThan(150);
    const outsideIdx = (24 * SIZE + 24) * 4;
    expect(pix[outsideIdx + 3]).toBe(0);
  });

  it("outputFramebuffer + viewport writes into the FBO's viewport region", () => {
    const source = makeSolidCanvas(50, 50, 200);
    const target = makeTextureBackedFBO(gl, 64, 64);

    runner.render(
      vignette,
      { source },
      {
        outputFramebuffer: target.fb,
        viewport: [16, 16, 16, 16],
      },
    );

    const pix = readFBO(gl, target.fb, 64, 64);
    const insideIdx = (20 * 64 + 20) * 4;
    expect(pix[insideIdx + 2]).toBeGreaterThan(100);
    const outsideIdx = (4 * 64 + 4) * 4;
    expect(pix[outsideIdx + 3]).toBe(0);

    gl.deleteFramebuffer(target.fb);
    gl.deleteTexture(target.tex);
  });

  it("renderToPixels reads back from the caller's FBO when set", () => {
    const source = makeSolidCanvas(255, 100, 0);
    const target = makeTextureBackedFBO(gl, SIZE, SIZE);
    const dst = new Uint8Array(SIZE * SIZE * 4);

    runner.renderToPixels(
      vignette,
      { source, dst },
      { outputFramebuffer: target.fb },
    );

    expect(dst[0]).toBeGreaterThan(100);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const defaultPix = new Uint8Array(SIZE * SIZE * 4);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, defaultPix);
    expect(anyNonZero(defaultPix)).toBe(false);

    gl.deleteFramebuffer(target.fb);
    gl.deleteTexture(target.tex);
  });

  it("renderToPixels with viewport sizes dst against viewport dims", () => {
    const source = makeSolidCanvas(100, 50, 200);
    const dst = new Uint8Array(16 * 16 * 4);

    expect(() => {
      runner.renderToPixels(
        vignette,
        { source, dst },
        { viewport: [0, 0, 16, 16] },
      );
    }).not.toThrow();
    expect(anyNonZero(dst)).toBe(true);
  });

  it("renderToPixels throws when dst is too small for the viewport", () => {
    const source = makeSolidCanvas(0, 0, 0);
    const dst = new Uint8Array(15 * 16 * 4);
    expect(() => {
      runner.renderToPixels(
        vignette,
        { source, dst },
        { viewport: [0, 0, 16, 16] },
      );
    }).toThrow(/too small/);
  });

  it("uses LRU pool for distinct viewport sizes across consecutive renders", () => {
    const source = makeSolidCanvas(100, 100, 100);
    const a = makeTextureBackedFBO(gl, 32, 32);
    const b = makeTextureBackedFBO(gl, 16, 16);
    const c = makeTextureBackedFBO(gl, 32, 32);

    // Multi-pass effect at two distinct sizes, then back to the first
    // size — under LRU, the original 32×32 ping-pong slot must still
    // be cached on the third call.
    runner.render(
      blur,
      { source, params: { radius: 2 } },
      { outputFramebuffer: a.fb, viewport: [0, 0, 32, 32] },
    );
    runner.render(
      blur,
      { source, params: { radius: 2 } },
      { outputFramebuffer: b.fb, viewport: [0, 0, 16, 16] },
    );
    runner.render(
      blur,
      { source, params: { radius: 2 } },
      { outputFramebuffer: c.fb, viewport: [0, 0, 32, 32] },
    );

    const pix = readFBO(gl, c.fb, 32, 32);
    expect(anyNonZero(pix)).toBe(true);

    gl.deleteFramebuffer(a.fb);
    gl.deleteTexture(a.tex);
    gl.deleteFramebuffer(b.fb);
    gl.deleteTexture(b.tex);
    gl.deleteFramebuffer(c.fb);
    gl.deleteTexture(c.tex);
  });
});
