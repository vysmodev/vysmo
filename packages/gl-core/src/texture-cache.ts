import type { TextureSource } from "./types.js";

export interface TextureCacheOptions {
  /**
   * GL_TEXTURE_MIN_FILTER. Defaults to `LINEAR_MIPMAP_LINEAR` when
   * `generateMipmaps` is true, else `LINEAR`. Effects libraries that
   * sample neighbours (not LOD) typically want `LINEAR` without mipmaps.
   */
  minFilter?: GLenum;
  /** GL_TEXTURE_MAG_FILTER. Defaults to `LINEAR`. */
  magFilter?: GLenum;
  /** GL_TEXTURE_WRAP_S. Defaults to `CLAMP_TO_EDGE`. */
  wrapS?: GLenum;
  /** GL_TEXTURE_WRAP_T. Defaults to `CLAMP_TO_EDGE`. */
  wrapT?: GLenum;
  /**
   * Whether to call `gl.generateMipmap` after each upload. Required when
   * `minFilter` is a mipmapped enum. Defaults to true.
   */
  generateMipmaps?: boolean;
  /** UNPACK_FLIP_Y_WEBGL. Defaults to true. */
  flipY?: boolean;
  /** UNPACK_PREMULTIPLY_ALPHA_WEBGL. Defaults to false. */
  premultiplyAlpha?: boolean;
}

interface CachedTexture {
  texture: WebGLTexture;
  owned: boolean;
  /** True once the source's pixels have been uploaded at least once. */
  uploaded: boolean;
}

function isWebGLTexture(source: TextureSource): source is WebGLTexture {
  return (
    typeof WebGLTexture !== "undefined" && source instanceof WebGLTexture
  );
}

/**
 * Returns true if the source's pixels can never change after construction —
 * so we can upload to the GPU once and skip re-uploads on subsequent
 * `resolve()` calls. This is a major win for static-image transitions,
 * where re-uploading a 1920×1080 RGBA texture (~8 MB) plus regenerating its
 * mipmap chain every frame causes visible GPU stalls.
 *
 * Conservatively immutable: HTMLImageElement (.src can be reassigned but
 * that's rare and the caller can drop their reference and create a new
 * Image) and ImageBitmap (no public mutation API). Everything else —
 * <video>, <canvas>, OffscreenCanvas, ImageData — keeps re-uploading.
 */
function isImmutableSource(source: TextureSource): boolean {
  if (
    typeof HTMLImageElement !== "undefined" &&
    source instanceof HTMLImageElement
  ) {
    return true;
  }
  if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
    return true;
  }
  return false;
}

/**
 * Lazy GPU texture uploader keyed on source identity (WeakMap). Mutable
 * sources (video, canvas, OffscreenCanvas, ImageData) re-upload on every
 * `resolve()` because their pixels change frame-to-frame. Immutable
 * sources (HTMLImageElement, ImageBitmap) upload once and reuse the
 * cached upload.
 *
 * Raw `WebGLTexture` sources bypass the cache entirely — the caller
 * already owns the GPU-side data.
 *
 * **Binding side effect:** `resolve()` binds the resulting texture to
 * `gl.TEXTURE_2D` on the currently-active texture unit. When juggling
 * multiple sources across multiple sampler units, resolve **all** sources
 * before any `gl.activeTexture` + `gl.bindTexture` calls — otherwise a
 * later resolve() will clobber a previously-bound unit.
 */
export class TextureCache {
  private cache = new WeakMap<object, CachedTexture>();
  /** Strong refs to every owned texture so `dispose()` can free them. */
  private owned = new Set<WebGLTexture>();
  private gl: WebGL2RenderingContext;
  private minFilter: GLenum;
  private magFilter: GLenum;
  private wrapS: GLenum;
  private wrapT: GLenum;
  private generateMipmaps: boolean;
  private flipY: boolean;
  private premultiplyAlpha: boolean;

  /**
   * @param gl       Owning WebGL2 context.
   * @param options  Sampler defaults applied to every uploaded texture
   *                 (filters, wrap modes, mipmap generation, flip-Y,
   *                 premultiplied alpha). All defaults match what most
   *                 image-style consumers want.
   */
  constructor(gl: WebGL2RenderingContext, options: TextureCacheOptions = {}) {
    this.gl = gl;
    this.generateMipmaps = options.generateMipmaps ?? true;
    this.minFilter =
      options.minFilter ??
      (this.generateMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    this.magFilter = options.magFilter ?? gl.LINEAR;
    this.wrapS = options.wrapS ?? gl.CLAMP_TO_EDGE;
    this.wrapT = options.wrapT ?? gl.CLAMP_TO_EDGE;
    this.flipY = options.flipY ?? true;
    this.premultiplyAlpha = options.premultiplyAlpha ?? false;
  }

  /**
   * Look up (or create) a `WebGLTexture` for `source` and ensure its
   * latest pixels are on the GPU. The returned texture is bound to
   * `gl.TEXTURE_2D` on the active unit as a side effect — see the
   * class-level note on bind ordering.
   *
   * - `WebGLTexture` source → returned as-is (caller already owns GPU
   *   data; no upload).
   * - Mutable source (`HTMLVideoElement`, `<canvas>`, `OffscreenCanvas`)
   *   → re-uploaded every call so animated sources stay current.
   * - Immutable source (`HTMLImageElement`, `ImageBitmap`) → uploaded
   *   once on first call; subsequent calls only rebind.
   */
  resolve(source: TextureSource): WebGLTexture {
    if (isWebGLTexture(source)) return source;

    const gl = this.gl;
    let entry = this.cache.get(source);
    const immutable = isImmutableSource(source);

    if (!entry) {
      const texture = gl.createTexture();
      if (!texture) throw new Error("gl.createTexture returned null");
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
      entry = { texture, owned: true, uploaded: false };
      this.cache.set(source, entry);
      this.owned.add(texture);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, entry.texture);
      // Fast path: source can't have changed since the first upload, so
      // skip the texImage2D + generateMipmap calls entirely.
      if (immutable && entry.uploaded) return entry.texture;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      source as TexImageSource,
    );
    if (this.generateMipmaps) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    entry.uploaded = true;

    return entry.texture;
  }

  /**
   * Free every texture this cache has uploaded. Call at teardown when
   * you want pixels freed *before* the GL context goes away (e.g.
   * tearing down a long-lived editor surface). After dispose(),
   * `resolve()` will allocate fresh textures on next call.
   *
   * The source-keyed `WeakMap` itself is dropped — entries for sources
   * that are still GC-reachable will be re-uploaded on next `resolve()`.
   */
  dispose(): void {
    const gl = this.gl;
    for (const tex of this.owned) gl.deleteTexture(tex);
    this.owned.clear();
    this.cache = new WeakMap();
  }
}
