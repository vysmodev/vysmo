import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Runner, blur } from "../index.js";

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
  tolerance = 6,
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

describe("effects Runner — shared-context mode", () => {
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

  it("uses the provided gl context", () => {
    expect(runner.gl).toBe(gl);
  });

  it("renders an effect with a bare WebGLTexture source", () => {
    const sourceTex = makeUpstreamTexture(gl, 200, 100, 50);
    runner.render(blur, { source: sourceTex, params: { radius: 2 } });
    const pix = readCanvas(gl);
    expectAllPixelsApprox(pix, [200, 100, 50]);
    gl.deleteTexture(sourceTex);
  });

  it("renders an effect with a SizedTexture source", () => {
    const sourceTex = makeUpstreamTexture(gl, 50, 200, 100);
    runner.render(blur, {
      source: { texture: sourceTex, width: SIZE, height: SIZE },
      params: { radius: 2 },
    });
    const pix = readCanvas(gl);
    expectAllPixelsApprox(pix, [50, 200, 100]);
    gl.deleteTexture(sourceTex);
  });

  it("dispose() leaves the gl context alive", () => {
    const sourceTex = makeUpstreamTexture(gl, 50, 100, 200);
    runner.render(blur, { source: sourceTex });
    runner.dispose();
    expect(gl.isContextLost()).toBe(false);
    gl.deleteTexture(sourceTex);
  });
});

describe("effects Runner — state cleanup after render()", () => {
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
    const source = makeSolidCanvas(255, 0, 0);
    runner.render(blur, { source });
    expect(gl.getParameter(gl.CURRENT_PROGRAM)).toBeNull();
  });

  it("unbinds touched texture units", () => {
    const source = makeSolidCanvas(255, 0, 0);
    runner.render(blur, { source });
    for (let unit = 0; unit < 2; unit++) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      expect(gl.getParameter(gl.TEXTURE_BINDING_2D)).toBeNull();
    }
  });

  it("restores active texture to TEXTURE0 after render", () => {
    const source = makeSolidCanvas(255, 0, 0);
    runner.render(blur, { source });
    expect(gl.getParameter(gl.ACTIVE_TEXTURE)).toBe(gl.TEXTURE0);
  });

  it("resets UNPACK_FLIP_Y_WEBGL after upload", () => {
    const source = makeSolidCanvas(255, 0, 0);
    runner.render(blur, { source });
    expect(gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL)).toBe(false);
  });

  it("resets UNPACK_PREMULTIPLY_ALPHA_WEBGL after upload", () => {
    const source = makeSolidCanvas(255, 0, 0);
    runner.render(blur, { source });
    expect(gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL)).toBe(false);
  });

  it("unbinds VAO and framebuffer after render", () => {
    const source = makeSolidCanvas(255, 0, 0);
    runner.render(blur, { source });
    expect(gl.getParameter(gl.VERTEX_ARRAY_BINDING)).toBeNull();
    expect(gl.getParameter(gl.FRAMEBUFFER_BINDING)).toBeNull();
  });
});
