import type {
  RawPixels,
  RenderOptions,
  SizedTexture,
  TextureSource,
  UniformValue,
  UniformParams,
  Widen,
  TextureCacheOptions,
  FramebufferPoolOptions,
} from "../index.js";

// --- TextureSource accepts the documented DOM types -----------------------

declare const htmlImage: HTMLImageElement;
declare const htmlVideo: HTMLVideoElement;
declare const htmlCanvas: HTMLCanvasElement;
declare const offscreen: OffscreenCanvas;
declare const bitmap: ImageBitmap;
declare const rawTexture: WebGLTexture;

const _img: TextureSource = htmlImage;
const _vid: TextureSource = htmlVideo;
const _cnv: TextureSource = htmlCanvas;
const _off: TextureSource = offscreen;
const _bmp: TextureSource = bitmap;
const _tex: TextureSource = rawTexture;

const _raw: TextureSource = {
  pixels: new Uint8Array(16),
  width: 2,
  height: 2,
};
const _rawClamped: TextureSource = {
  pixels: new Uint8ClampedArray(16),
  width: 2,
  height: 2,
};
const _rawTyped: RawPixels = {
  pixels: new Uint8Array(64),
  width: 4,
  height: 4,
};

const _sized: TextureSource = {
  texture: rawTexture,
  width: 16,
  height: 16,
};
const _sizedTyped: SizedTexture = {
  texture: rawTexture,
  width: 32,
  height: 32,
};

// WebGLTexture is an empty interface in lib.dom, so structural typing
// makes primitives-vs-TextureSource assertions noisy. Skip the negative
// check here; the positive assertions above are what actually matter.

void [_img, _vid, _cnv, _off, _bmp, _tex, _raw, _rawClamped, _rawTyped, _sized, _sizedTyped];

// --- UniformValue covers scalars and 2/3/4-vectors ------------------------

const _scalar: UniformValue = 1;
const _flag: UniformValue = true;
const _v2: UniformValue = [0, 0];
const _v3: UniformValue = [0, 0, 0];
const _v4: UniformValue = [0, 0, 0, 0];

// @ts-expect-error — 5-vectors aren't a supported uniform shape
const _v5: UniformValue = [0, 0, 0, 0, 0];

// @ts-expect-error — strings aren't a uniform value
const _badUniform: UniformValue = "foo";

void [_scalar, _flag, _v2, _v3, _v4, _v5, _badUniform];

// --- UniformParams is a record of UniformValue ----------------------------

const params: UniformParams = {
  radius: 8,
  enabled: true,
  offset: [1, 2],
};
void params;

// --- Widen relaxes literal tuples back to general tuples ------------------

type Narrowed = { readonly offset: readonly [-1, 0]; readonly radius: 8 };
type Widened = Widen<Narrowed>;
const widened: Widened = {
  offset: [3, 4],
  radius: 12,
};
void widened;

// --- TextureCacheOptions accepts all advertised fields --------------------

const opts: TextureCacheOptions = {
  minFilter: 0x2601,
  magFilter: 0x2601,
  wrapS: 0x812f,
  wrapT: 0x812f,
  generateMipmaps: false,
  flipY: true,
  premultiplyAlpha: false,
};
void opts;

// @ts-expect-error — generateMipmaps is a boolean, not a number
const _badOpts: TextureCacheOptions = { generateMipmaps: 1 };
void _badOpts;

// --- RenderOptions — both fields are optional and independent ------------

declare const fakeFb: WebGLFramebuffer;

const _emptyOpts: RenderOptions = {};
const _fboOpts: RenderOptions = { outputFramebuffer: fakeFb };
const _fboNullOpts: RenderOptions = { outputFramebuffer: null };
const _viewportOpts: RenderOptions = { viewport: [0, 0, 512, 512] };
const _bothOpts: RenderOptions = {
  outputFramebuffer: fakeFb,
  viewport: [16, 16, 64, 64],
};
void [_emptyOpts, _fboOpts, _fboNullOpts, _viewportOpts, _bothOpts];

// @ts-expect-error — viewport is a 4-tuple, not 3
const _badViewport: RenderOptions = { viewport: [0, 0, 100] };
void _badViewport;

// WebGLFramebuffer is an empty interface in lib.dom (same trap as
// WebGLTexture above) — structural typing makes negative assertions on
// outputFramebuffer noisy. Positive assertions above carry the load.

// --- FramebufferPoolOptions ---------------------------------------------

const _poolOpts: FramebufferPoolOptions = { capacity: 8 };
const _emptyPoolOpts: FramebufferPoolOptions = {};
void [_poolOpts, _emptyPoolOpts];
