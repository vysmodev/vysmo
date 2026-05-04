import type { TextProperty } from "./types.js";

export type PropValues = Partial<Record<TextProperty, number>>;

const TRANSFORM_PROPS: ReadonlyArray<TextProperty> = [
  "translateX",
  "translateY",
  "translateZ",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "scale",
  "scaleX",
  "scaleY",
  "skewX",
  "skewY",
];

const FILTER_PROPS: ReadonlyArray<TextProperty> = [
  "blur",
  "brightness",
  "contrast",
  "saturate",
  "hueRotate",
];

/**
 * Compose numeric per-axis values into the CSS strings the browser wants.
 * `transform` and `filter` are each composed as a single declaration so
 * successive writes don't leak stale parts from previous frames.
 */
export function applyProps(el: HTMLElement, vals: PropValues): void {
  if (vals.opacity !== undefined) {
    el.style.opacity = String(vals.opacity);
  }

  const hasTransform = TRANSFORM_PROPS.some((p) => vals[p] !== undefined);
  if (hasTransform) {
    const parts: string[] = [];
    if (
      vals.translateX !== undefined ||
      vals.translateY !== undefined ||
      vals.translateZ !== undefined
    ) {
      parts.push(
        `translate3d(${vals.translateX ?? 0}px, ${vals.translateY ?? 0}px, ${vals.translateZ ?? 0}px)`,
      );
    }
    if (vals.rotate !== undefined) parts.push(`rotate(${vals.rotate}deg)`);
    if (vals.rotateX !== undefined) parts.push(`rotateX(${vals.rotateX}deg)`);
    if (vals.rotateY !== undefined) parts.push(`rotateY(${vals.rotateY}deg)`);
    if (vals.rotateZ !== undefined) parts.push(`rotateZ(${vals.rotateZ}deg)`);
    if (vals.scale !== undefined) parts.push(`scale(${vals.scale})`);
    if (vals.scaleX !== undefined) parts.push(`scaleX(${vals.scaleX})`);
    if (vals.scaleY !== undefined) parts.push(`scaleY(${vals.scaleY})`);
    if (vals.skewX !== undefined) parts.push(`skewX(${vals.skewX}deg)`);
    if (vals.skewY !== undefined) parts.push(`skewY(${vals.skewY}deg)`);
    el.style.transform = parts.join(" ");
  }

  const hasFilter = FILTER_PROPS.some((p) => vals[p] !== undefined);
  if (hasFilter) {
    const parts: string[] = [];
    if (vals.blur !== undefined) parts.push(`blur(${vals.blur}px)`);
    if (vals.brightness !== undefined) parts.push(`brightness(${vals.brightness})`);
    if (vals.contrast !== undefined) parts.push(`contrast(${vals.contrast})`);
    if (vals.saturate !== undefined) parts.push(`saturate(${vals.saturate})`);
    if (vals.hueRotate !== undefined) parts.push(`hue-rotate(${vals.hueRotate}deg)`);
    el.style.filter = parts.join(" ");
  }
}

export function clearProps(el: HTMLElement): void {
  el.style.removeProperty("opacity");
  el.style.removeProperty("transform");
  el.style.removeProperty("filter");
}
