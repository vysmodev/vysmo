import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Runner, paintBleed, pageCurl } from "../../index.js";

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

/**
 * Build a texture-backed FBO sized w × h with optional depth attachment.
 * Stand-in for what a host renderer (Skia/CanvasKit/Three.js) would
 * supply when bridging Vysmo's output into its own texture.
 */
function makeTextureBackedFBO(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  withDepth = false,
): { fb: WebGLFramebuffer; tex: WebGLTexture; depth?: WebGLRenderbuffer } {
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

  let depth: WebGLRenderbuffer | undefined;
  if (withDepth) {
    depth = gl.createRenderbuffer()!;
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depth,
    );
  }

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Test FBO incomplete: 0x${status.toString(16)}`);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return depth ? { fb, tex, depth } : { fb, tex };
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

describe("Runner — outputFramebuffer + viewport (zero-copy bridging)", () => {
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
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    runner.render(paintBleed, { from, to, progress: 0 });

    // Default FB has content (red, since progress=0).
    const pix = new Uint8Array(SIZE * SIZE * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pix);
    expect(pix[0]).toBeGreaterThan(200); // red dominant
    // Framebuffer binding restored to null.
    const fb = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
    expect(fb).toBeNull();
  });

  it("opts.outputFramebuffer: null behaves identically to no opts", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    runner.render(paintBleed, { from, to, progress: 0 }, { outputFramebuffer: null });

    const fb = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
    expect(fb).toBeNull();
  });

  it("writes the final output into a caller-supplied FBO", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    const target = makeTextureBackedFBO(gl, SIZE, SIZE);

    runner.render(
      paintBleed,
      { from, to, progress: 0 },
      { outputFramebuffer: target.fb },
    );

    // Caller's FBO holds the rendered red (progress=0).
    const pix = readFBO(gl, target.fb, SIZE, SIZE);
    expect(pix[0]).toBeGreaterThan(200);
    // Default FB was never written.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const defaultPix = new Uint8Array(SIZE * SIZE * 4);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, defaultPix);
    expect(anyNonZero(defaultPix)).toBe(false);

    gl.deleteFramebuffer(target.fb);
    gl.deleteTexture(target.tex);
  });

  it("leaves the caller's FBO bound at end of render() (consumer rebinds)", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    const target = makeTextureBackedFBO(gl, SIZE, SIZE);

    runner.render(
      paintBleed,
      { from, to, progress: 0 },
      { outputFramebuffer: target.fb },
    );

    const stillBound = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
    expect(stillBound).toBe(target.fb);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(target.fb);
    gl.deleteTexture(target.tex);
  });

  it("opts.viewport clips into the default framebuffer (standalone)", () => {
    const from = makeSolidCanvas(0, 255, 0);
    const to = makeSolidCanvas(0, 255, 0);
    // Render only into the bottom-left 16×16 quadrant.
    runner.render(
      paintBleed,
      { from, to, progress: 0 },
      { viewport: [0, 0, 16, 16] },
    );

    const pix = new Uint8Array(SIZE * SIZE * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pix);

    // Inside viewport region (e.g. pixel (4, 4)): green.
    const insideIdx = (4 * SIZE + 4) * 4;
    expect(pix[insideIdx + 1]).toBeGreaterThan(200);
    // Outside viewport (e.g. pixel (24, 24)): never written, alpha=0.
    const outsideIdx = (24 * SIZE + 24) * 4;
    expect(pix[outsideIdx + 3]).toBe(0);
  });

  it("outputFramebuffer + viewport writes into the FBO's viewport region", () => {
    const from = makeSolidCanvas(0, 0, 255);
    const to = makeSolidCanvas(0, 0, 255);
    // Larger FBO than canvas — confirms the runner honours viewport not canvas.
    const target = makeTextureBackedFBO(gl, 64, 64);

    runner.render(
      paintBleed,
      { from, to, progress: 0 },
      {
        outputFramebuffer: target.fb,
        viewport: [16, 16, 16, 16], // bottom-left of a centered 16×16 block
      },
    );

    const pix = readFBO(gl, target.fb, 64, 64);
    // Inside viewport — should be blue.
    const insideIdx = (20 * 64 + 20) * 4;
    expect(pix[insideIdx + 2]).toBeGreaterThan(200);
    // Outside viewport — never written.
    const outsideIdx = (4 * 64 + 4) * 4;
    expect(pix[outsideIdx + 3]).toBe(0);

    gl.deleteFramebuffer(target.fb);
    gl.deleteTexture(target.tex);
  });

  it("renderToPixels reads back from the caller's FBO when set", () => {
    const from = makeSolidCanvas(255, 200, 100);
    const to = makeSolidCanvas(255, 200, 100);
    const target = makeTextureBackedFBO(gl, SIZE, SIZE);
    const dst = new Uint8Array(SIZE * SIZE * 4);

    runner.renderToPixels(
      paintBleed,
      { from, to, progress: 0, dst },
      { outputFramebuffer: target.fb },
    );

    // dst contains what the FBO has.
    expect(dst[0]).toBeGreaterThan(200);
    expect(dst[1]).toBeGreaterThan(150);
    // The default framebuffer was never touched.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const defaultPix = new Uint8Array(SIZE * SIZE * 4);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, defaultPix);
    expect(anyNonZero(defaultPix)).toBe(false);

    gl.deleteFramebuffer(target.fb);
    gl.deleteTexture(target.tex);
  });

  it("renderToPixels with viewport sizes dst against viewport dims", () => {
    const from = makeSolidCanvas(50, 100, 200);
    const to = makeSolidCanvas(50, 100, 200);
    // dst only large enough for a 16×16 region, not the full canvas.
    const dst = new Uint8Array(16 * 16 * 4);

    expect(() => {
      runner.renderToPixels(
        paintBleed,
        { from, to, progress: 0, dst },
        { viewport: [0, 0, 16, 16] },
      );
    }).not.toThrow();
    expect(dst[2]).toBeGreaterThan(150); // blue dominant in our source
  });

  it("renderToPixels throws when dst is too small for the viewport", () => {
    const from = makeSolidCanvas(0, 0, 0);
    const to = makeSolidCanvas(0, 0, 0);
    const dst = new Uint8Array(15 * 16 * 4); // one row short
    expect(() => {
      runner.renderToPixels(
        paintBleed,
        { from, to, progress: 0, dst },
        { viewport: [0, 0, 16, 16] },
      );
    }).toThrow(/too small/);
  });

  it("mesh transition renders into a depth-attached FBO", () => {
    const from = makeSolidCanvas(200, 100, 50);
    const to = makeSolidCanvas(50, 100, 200);
    // pageCurl is a mesh transition (Transition.mesh set) — needs depth.
    const target = makeTextureBackedFBO(gl, SIZE, SIZE, /* withDepth */ true);

    expect(() => {
      runner.render(
        pageCurl,
        { from, to, progress: 0.5 },
        { outputFramebuffer: target.fb },
      );
    }).not.toThrow();

    const pix = readFBO(gl, target.fb, SIZE, SIZE);
    // Mesh ran and wrote something coloured into the FBO (not pure zeros).
    expect(anyNonZero(pix)).toBe(true);

    gl.deleteFramebuffer(target.fb);
    gl.deleteTexture(target.tex);
    if (target.depth) gl.deleteRenderbuffer(target.depth);
  });
});
