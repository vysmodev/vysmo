import type { RawPixels, SizedTexture, TextureSource } from "./types.js";

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
  /**
   * Maximum number of URL-keyed entries (from `resolveAsync(url)`) to
   * retain. When exceeded, least-recently-used entries are evicted: the
   * GL texture is deleted and the cache entry dropped. Defaults to
   * `Infinity` (no eviction — preserves prior behavior).
   *
   * Only applies to URL inputs. DOM-source entries
   * (`HTMLImageElement`, `HTMLCanvasElement`, etc.) are not subject to
   * LRU eviction — they're cleaned up naturally when the source object
   * is garbage collected (entries are stored in a WeakMap).
   *
   * Typical use: lazy-loading slideshows / flipbooks that page through
   * many images and only need a small window resident on the GPU.
   */
  maxUrlEntries?: number;
}

interface CachedTexture {
  texture: WebGLTexture;
  owned: boolean;
  /** True once the source's pixels have been uploaded at least once. */
  uploaded: boolean;
}

interface UrlCacheEntry {
  /**
   * Resolves to the GL texture once the URL has been fetched + decoded
   * + uploaded. Concurrent callers for the same URL await the same
   * promise (request deduplication).
   */
  promise: Promise<WebGLTexture>;
  /**
   * Set once the promise fulfills. Used by `release()` and eviction to
   * free the GL-side resource without having to await the promise.
   */
  texture: WebGLTexture | null;
}

function isWebGLTexture(source: TextureSource): source is WebGLTexture {
  return (
    typeof WebGLTexture !== "undefined" && source instanceof WebGLTexture
  );
}

/**
 * Structural detection for the `SizedTexture` variant — a wrapper that
 * pairs an existing `WebGLTexture` with its dimensions. We dispatch on
 * the `texture` field being a `WebGLTexture` instance to avoid mistaking
 * other plain objects (e.g. `RawPixels`, which has `pixels` instead).
 */
function isSizedTexture(source: TextureSource): source is SizedTexture {
  if (typeof source !== "object" || source === null) return false;
  if (typeof WebGLTexture !== "undefined" && source instanceof WebGLTexture) {
    return false;
  }
  const candidate = source as Partial<SizedTexture>;
  return (
    "texture" in candidate &&
    typeof WebGLTexture !== "undefined" &&
    candidate.texture instanceof WebGLTexture &&
    typeof candidate.width === "number" &&
    typeof candidate.height === "number"
  );
}

/**
 * Structural detection for the `RawPixels` variant of TextureSource.
 * A plain object with `pixels` (a TypedArray), `width` and `height` —
 * none of the other source variants have a `pixels` field, so this key
 * is unambiguous. We check `ArrayBuffer.isView(pixels)` defensively so
 * that a stray `{ pixels: "abc", width: 1, height: 1 }` doesn't slip
 * past structural narrowing at runtime.
 */
function isRawPixels(source: TextureSource): source is RawPixels {
  if (typeof source !== "object" || source === null) return false;
  if (typeof WebGLTexture !== "undefined" && source instanceof WebGLTexture) {
    return false;
  }
  const candidate = source as Partial<RawPixels>;
  return (
    "pixels" in candidate &&
    typeof candidate.width === "number" &&
    typeof candidate.height === "number" &&
    ArrayBuffer.isView(candidate.pixels as ArrayBufferView)
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
 * sources (video, canvas, OffscreenCanvas, RawPixels) re-upload on every
 * `resolve()` because their pixels change frame-to-frame. Immutable
 * sources (HTMLImageElement, ImageBitmap) upload once and reuse the
 * cached upload.
 *
 * Raw `WebGLTexture` sources bypass the cache entirely — the caller
 * already owns the GPU-side data. `RawPixels` (`{ pixels, width,
 * height }`) sources are keyed by the wrapper object's identity:
 * reuse the wrapper across frames to reuse the underlying GL texture.
 *
 * **Binding side effect:** `resolve()` binds the resulting texture to
 * `gl.TEXTURE_2D` on the currently-active texture unit. When juggling
 * multiple sources across multiple sampler units, resolve **all** sources
 * before any `gl.activeTexture` + `gl.bindTexture` calls — otherwise a
 * later resolve() will clobber a previously-bound unit.
 */
export class TextureCache {
  private cache = new WeakMap<object, CachedTexture>();
  /**
   * URL-keyed cache. `Map` insertion order doubles as LRU order: every
   * cache hit re-inserts the entry at the end so `entries().next()`
   * yields the least-recently-used when we need to evict.
   */
  private urlCache = new Map<string, UrlCacheEntry>();
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
  private maxUrlEntries: number;

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
    this.maxUrlEntries = options.maxUrlEntries ?? Infinity;
  }

  /**
   * Look up (or create) a `WebGLTexture` for `source` and ensure its
   * latest pixels are on the GPU. The returned texture is bound to
   * `gl.TEXTURE_2D` on the active unit as a side effect — see the
   * class-level note on bind ordering.
   *
   * - `WebGLTexture` source → returned as-is (caller already owns GPU
   *   data; no upload).
   * - `SizedTexture` source (`{ texture, width, height }`) → inner
   *   texture returned as-is, dimensions are forward-compat metadata.
   * - Mutable source (`HTMLVideoElement`, `<canvas>`, `OffscreenCanvas`,
   *   `RawPixels`) → re-uploaded every call so animated sources stay
   *   current.
   * - Immutable source (`HTMLImageElement`, `ImageBitmap`) → uploaded
   *   once on first call; subsequent calls only rebind.
   */
  resolve(source: TextureSource): WebGLTexture {
    // Check SizedTexture before WebGLTexture: WebGLTexture is an empty
    // interface in lib.dom, so narrowing it out first would erase the
    // SizedTexture branch from TS's view (every variant is structurally
    // assignable to `{}`). With this order, SizedTexture narrows cleanly
    // from the full union.
    if (isSizedTexture(source)) return source.texture;
    if (isWebGLTexture(source)) return source;

    const gl = this.gl;
    const raw = isRawPixels(source);
    let entry = this.cache.get(source);
    const immutable = !raw && isImmutableSource(source);

    if (!entry) {
      if (raw) this.validateRawPixels(source);
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
    if (raw) {
      // UNPACK_FLIP_Y_WEBGL is honoured for ArrayBufferView uploads in
      // modern browsers (verified in Chromium), so we rely on the GL
      // flag set just above rather than flipping rows in JS — same
      // orientation behaviour as DOM sources, no CPU cost.
      const { pixels, width, height } = source;
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels,
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source as TexImageSource,
      );
    }
    if (this.generateMipmaps) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    // Reset pixel-storage state to GL defaults so we don't poison an
    // outer renderer's expectations. WebGL specifies these as `false`
    // at context creation; leaving our overrides set would silently
    // flip / premultiply textures uploaded by a shared-context
    // consumer's later code (Skia/CanvasKit etc.).
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    entry.uploaded = true;

    return entry.texture;
  }

  /**
   * Sanity-check a RawPixels wrapper on first sight so callers see a
   * clear error instead of a downstream `INVALID_OPERATION` from WebGL
   * when the buffer is too small for the declared dimensions.
   */
  private validateRawPixels(source: RawPixels): void {
    const { pixels, width, height } = source;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new Error(
        `TextureCache: RawPixels width/height must be positive numbers (got ${width}×${height}).`,
      );
    }
    const expected = width * height * 4;
    if (pixels.length < expected) {
      throw new Error(
        `TextureCache: RawPixels buffer is too small for ${width}×${height} RGBA8 ` +
          `(need ${expected} bytes, got ${pixels.length}).`,
      );
    }
  }

  /**
   * Async sibling of `resolve()`. Accepts either an existing
   * `TextureSource` (synchronous fast path — delegates to `resolve()`
   * and wraps in `Promise.resolve`) **or** a URL string, which fetches +
   * decodes + uploads on first call and caches by URL on subsequent
   * calls.
   *
   * URL inputs:
   * - Resolved via `fetch()` + `createImageBitmap()`, then uploaded.
   * - Cached by URL string. Concurrent calls with the same URL share
   *   one in-flight promise (request deduplication).
   * - Subject to LRU eviction if `maxUrlEntries` was set on construction.
   * - Cross-origin URLs require correct CORS headers (`Access-Control-
   *   Allow-Origin`) — same as any other WebGL texture source. Document
   *   this in your library's README / Next.js guide.
   * - If the fetch fails or decode throws, the cache entry is removed
   *   so a subsequent `resolveAsync(url)` call retries cleanly.
   *
   * **Binding side effect:** same as `resolve()` — the returned texture
   * is bound to `gl.TEXTURE_2D` on the active unit. Resolve all sources
   * before any `activeTexture` + `bindTexture` calls.
   */
  async resolveAsync(
    source: TextureSource | string,
  ): Promise<WebGLTexture> {
    if (typeof source !== "string") {
      return this.resolve(source);
    }

    const url = source;
    const existing = this.urlCache.get(url);
    if (existing) {
      // Touch LRU: re-insert at end of insertion order so this becomes
      // the most-recently-used entry.
      this.urlCache.delete(url);
      this.urlCache.set(url, existing);
      return existing.promise;
    }

    const entry: UrlCacheEntry = { promise: null!, texture: null };
    entry.promise = this.loadUrlAsTexture(url).then(
      (tex) => {
        entry.texture = tex;
        return tex;
      },
      (err) => {
        // Failed loads shouldn't poison the cache — drop the entry so
        // a retry can try again from scratch.
        this.urlCache.delete(url);
        throw err;
      },
    );
    this.urlCache.set(url, entry);
    this.evictIfOverLimit();
    return entry.promise;
  }

  /**
   * Synchronous lookup of a URL-keyed texture. Returns the cached
   * `WebGLTexture` if the URL has been fully resolved by a prior
   * `resolveAsync(url)` call, otherwise `undefined`.
   *
   * Designed for per-frame render loops where the caller has already
   * pre-loaded URLs via `resolveAsync(url)` (or a wrapper's `preload()`
   * helper) and wants synchronous access without re-awaiting promises.
   *
   * Returns `undefined` for in-flight loads (promise still pending)
   * AND for never-requested URLs. Distinguish via the cache's external
   * loading state if you need to.
   *
   * Touches LRU order so the entry stays warm in lazy-loading scenarios.
   */
  getUrlTexture(url: string): WebGLTexture | undefined {
    const entry = this.urlCache.get(url);
    if (!entry || !entry.texture) return undefined;
    // Touch LRU: this URL was just accessed, so it shouldn't be evicted
    // first under memory pressure.
    this.urlCache.delete(url);
    this.urlCache.set(url, entry);
    return entry.texture;
  }

  /**
   * Manually evict a single cache entry. Returns true if anything was
   * released, false if the source/URL wasn't cached.
   *
   * - URL string: removes the URL entry and deletes the GL texture (if
   *   already loaded; pending loads are dropped from the index but the
   *   promise still resolves for any in-flight callers).
   * - DOM source: removes the WeakMap entry and deletes the GL texture.
   * - Raw `WebGLTexture` / `SizedTexture`: never cached, returns false.
   *   Caller owns the underlying GL texture.
   *
   * Used by lazy-loading slideshows / flipbooks to release textures
   * that have scrolled out of the preload window.
   */
  release(source: TextureSource | string): boolean {
    const gl = this.gl;
    if (typeof source === "string") {
      const entry = this.urlCache.get(source);
      if (!entry) return false;
      if (entry.texture) {
        gl.deleteTexture(entry.texture);
        this.owned.delete(entry.texture);
      }
      this.urlCache.delete(source);
      return true;
    }
    if (isWebGLTexture(source)) return false;
    if (isSizedTexture(source)) return false;
    const entry = this.cache.get(source);
    if (!entry) return false;
    gl.deleteTexture(entry.texture);
    this.owned.delete(entry.texture);
    this.cache.delete(source);
    return true;
  }

  /**
   * Fetch + decode + upload a URL to a fresh GL texture. The returned
   * texture is owned by the cache (tracked in `this.owned`, freed on
   * `dispose()`).
   */
  private async loadUrlAsTexture(url: string): Promise<WebGLTexture> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `TextureCache: failed to fetch ${url}: ${response.status} ${response.statusText}`,
      );
    }
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    try {
      return this.uploadAsNewTexture(bitmap);
    } finally {
      // ImageBitmap holds decoded pixels in memory; once they're on the
      // GPU we don't need the CPU-side copy.
      bitmap.close?.();
    }
  }

  /**
   * Create a new GL texture, configure its sampler state, and upload
   * the source's pixels. The texture is added to `this.owned` so
   * `dispose()` can free it. Does NOT touch any cache — caller is
   * responsible for storing the returned texture wherever it tracks
   * its entries.
   *
   * Same binding side effect as `resolve()`: the new texture is bound
   * to `gl.TEXTURE_2D` on the active unit.
   */
  private uploadAsNewTexture(source: TexImageSource): WebGLTexture {
    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) throw new Error("gl.createTexture returned null");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      source,
    );
    if (this.generateMipmaps) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    this.owned.add(texture);
    return texture;
  }

  /**
   * Drop oldest URL entries until we're at or below `maxUrlEntries`.
   * Eviction order is insertion order in `this.urlCache` (which we
   * keep aligned with LRU order by re-inserting on every hit).
   */
  private evictIfOverLimit(): void {
    if (this.urlCache.size <= this.maxUrlEntries) return;
    const gl = this.gl;
    for (const [url, entry] of this.urlCache) {
      if (this.urlCache.size <= this.maxUrlEntries) break;
      if (entry.texture) {
        gl.deleteTexture(entry.texture);
        this.owned.delete(entry.texture);
      }
      this.urlCache.delete(url);
    }
  }

  /**
   * Free every texture this cache has uploaded. Call at teardown when
   * you want pixels freed *before* the GL context goes away (e.g.
   * tearing down a long-lived editor surface). After dispose(),
   * `resolve()` will allocate fresh textures on next call.
   *
   * The source-keyed `WeakMap` itself is dropped — entries for sources
   * that are still GC-reachable will be re-uploaded on next `resolve()`.
   * URL cache is also fully cleared.
   */
  dispose(): void {
    const gl = this.gl;
    for (const tex of this.owned) gl.deleteTexture(tex);
    this.owned.clear();
    this.cache = new WeakMap();
    this.urlCache.clear();
  }
}
