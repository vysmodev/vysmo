/**
 * In-place row reversal for a tightly-packed RGBA8 buffer. The first
 * `width * height * 4` bytes of `buf` are flipped vertically — handy
 * when bridging between GL bottom-up convention (what `gl.readPixels`
 * writes) and the top-down convention that DOM / Skia / `ImageData`
 * use.
 *
 * Bytes beyond the first `width * height * 4` are untouched, so it's
 * safe to call on an oversize arena.
 */
export function flipRgba8RowsInPlace(
  buf: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
): void {
  const rowBytes = width * 4;
  const tmp = new Uint8Array(rowBytes);
  for (let i = 0; i < Math.floor(height / 2); i++) {
    const topStart = i * rowBytes;
    const botStart = (height - 1 - i) * rowBytes;
    tmp.set(buf.subarray(topStart, topStart + rowBytes));
    buf.copyWithin(topStart, botStart, botStart + rowBytes);
    buf.set(tmp, botStart);
  }
}
