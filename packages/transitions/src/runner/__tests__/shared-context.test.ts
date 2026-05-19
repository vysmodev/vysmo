import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Runner, paintBleed } from "../../index.js";

const SIZE = 16;

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
 * Simulate an "upstream renderer" by uploading a solid-colour texture
 * directly onto a caller-owned GL context. Stand-in for what Skia/
 * CanvasKit would produce: a `WebGLTexture` handle the consumer hands
 * to Vysmo for zero-upload rendering.
 */
function makeUpstreamTexture(
  gl: WebGL2RenderingContext,
  r: number,
  g: number,
  b: number,
): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error("gl.createTexture returned null");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = 255;
  }
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    SIZE,
    SIZE,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels,
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

function readCanvas(gl: WebGL2RenderingContext): Uint8Array {
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return pixels;
}

function expectAllPixelsApprox(
  buf: Uint8Array,
  expected: [number, number, number],
  tolerance = 2,
): void {
  let worstDiff = 0;
  let worstIndex = -1;
  for (let i = 0; i < buf.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const diff = Math.abs((buf[i + c] ?? 0) - (expected[c] ?? 0));
      if (diff > worstDiff) {
        worstDiff = diff;
        worstIndex = i;
      }
    }
  }
  if (worstDiff > tolerance) {
    expect.fail(
      `Pixel at index ${worstIndex} differs by ${worstDiff} from expected ` +
        `[${expected.join(", ")}]`,
    );
  }
}

describe("Runner — shared-context mode (`new Runner({ gl })`)", () => {
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

  it("uses the provided gl context instead of creating a new one", () => {
    expect(runner.gl).toBe(gl);
  });

  it("derives canvas from gl.canvas when not explicitly passed", () => {
    const r = new Runner({ gl });
    expect(r.gl).toBe(gl);
    r.dispose();
  });

  it("renders using a bare WebGLTexture as a source (zero upload)", () => {
    const fromTex = makeUpstreamTexture(gl, 255, 0, 0);
    const toTex = makeUpstreamTexture(gl, 0, 0, 255);

    runner.render(paintBleed, {
      from: fromTex,
      to: toTex,
      progress: 0,
    });

    const pix = readCanvas(gl);
    expectAllPixelsApprox(pix, [255, 0, 0]);

    gl.deleteTexture(fromTex);
    gl.deleteTexture(toTex);
  });

  it("renders using a SizedTexture wrapper as a source", () => {
    const fromTex = makeUpstreamTexture(gl, 255, 0, 0);
    const toTex = makeUpstreamTexture(gl, 0, 0, 255);

    runner.render(paintBleed, {
      from: { texture: fromTex, width: SIZE, height: SIZE },
      to: { texture: toTex, width: SIZE, height: SIZE },
      progress: 1,
    });

    const pix = readCanvas(gl);
    expectAllPixelsApprox(pix, [0, 0, 255]);

    gl.deleteTexture(fromTex);
    gl.deleteTexture(toTex);
  });

  it("dispose() leaves the gl context alive (consumer owns it)", () => {
    const fromTex = makeUpstreamTexture(gl, 50, 100, 200);
    runner.render(paintBleed, {
      from: fromTex,
      to: fromTex,
      progress: 0,
    });

    runner.dispose();

    // Context is still usable after the runner is disposed — the
    // consumer can keep rendering with it.
    expect(gl.isContextLost()).toBe(false);
    // And the consumer's texture is intact (Runner doesn't delete it).
    gl.bindTexture(gl.TEXTURE_2D, fromTex);
    expect(gl.getError()).toBe(gl.NO_ERROR);

    gl.deleteTexture(fromTex);
  });
});

describe("Runner — state cleanup after render()", () => {
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

  it("resets useProgram to null after render", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    runner.render(paintBleed, { from, to, progress: 0.5 });

    const current = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram | null;
    expect(current).toBeNull();
  });

  it("unbinds all texture units that render() touched", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    runner.render(paintBleed, { from, to, progress: 0.5 });

    for (let unit = 0; unit < 5; unit++) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      const bound = gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture | null;
      expect(bound).toBeNull();
    }
  });

  it("restores active texture to TEXTURE0 after render", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    runner.render(paintBleed, { from, to, progress: 0.5 });

    const active = gl.getParameter(gl.ACTIVE_TEXTURE);
    expect(active).toBe(gl.TEXTURE0);
  });

  it("resets pixelStorei UNPACK_FLIP_Y_WEBGL to false after upload", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    runner.render(paintBleed, { from, to, progress: 0.5 });

    const flipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
    expect(flipY).toBe(false);
  });

  it("resets pixelStorei UNPACK_PREMULTIPLY_ALPHA_WEBGL to false after upload", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    runner.render(paintBleed, { from, to, progress: 0.5 });

    const pma = gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
    expect(pma).toBe(false);
  });

  it("unbinds the vertex array after render", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    runner.render(paintBleed, { from, to, progress: 0.5 });

    const vao = gl.getParameter(gl.VERTEX_ARRAY_BINDING) as WebGLVertexArrayObject | null;
    expect(vao).toBeNull();
  });

  it("unbinds the framebuffer after render", () => {
    const from = makeSolidCanvas(255, 0, 0);
    const to = makeSolidCanvas(0, 0, 255);
    runner.render(paintBleed, { from, to, progress: 0.5 });

    const fb = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null;
    expect(fb).toBeNull();
  });
});

describe("Runner — owned vs shared context behaviour", () => {
  it("owned-context mode (canvas only) still attaches context-loss listeners", () => {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;

    // Spy on addEventListener to verify wiring.
    const calls: string[] = [];
    const origAdd = canvas.addEventListener.bind(canvas);
    canvas.addEventListener = ((type: string, listener: EventListener) => {
      calls.push(type);
      return origAdd(type, listener);
    }) as typeof canvas.addEventListener;

    const r = new Runner({ canvas });
    expect(calls).toContain("webglcontextlost");
    expect(calls).toContain("webglcontextrestored");
    r.dispose();
  });

  it("shared-context mode does NOT attach context-loss listeners", () => {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const gl = canvas.getContext("webgl2")!;

    const calls: string[] = [];
    const origAdd = canvas.addEventListener.bind(canvas);
    canvas.addEventListener = ((type: string, listener: EventListener) => {
      calls.push(type);
      return origAdd(type, listener);
    }) as typeof canvas.addEventListener;

    const r = new Runner({ gl, canvas });
    expect(calls).not.toContain("webglcontextlost");
    expect(calls).not.toContain("webglcontextrestored");
    r.dispose();
  });
});
