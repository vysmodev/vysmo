import type { SplitMode, SplitOptions, Splits } from "./types.js";

const WHITESPACE_ONLY = /^\s+$/;

function hasSegmenter(): boolean {
  return typeof Intl !== "undefined" && typeof Intl.Segmenter === "function";
}

function graphemeSegments(text: string, locale: string | undefined): string[] {
  if (hasSegmenter()) {
    const seg = new Intl.Segmenter(locale, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

function wordSegments(
  text: string,
  locale: string | undefined,
): Array<{ segment: string; isWordLike: boolean }> {
  if (hasSegmenter()) {
    const seg = new Intl.Segmenter(locale, { granularity: "word" });
    return Array.from(seg.segment(text), (s) => ({
      segment: s.segment,
      isWordLike: s.isWordLike ?? false,
    }));
  }
  const parts = text.split(/(\s+)/).filter((s) => s.length > 0);
  return parts.map((segment) => ({
    segment,
    isWordLike: !WHITESPACE_ONLY.test(segment),
  }));
}

function makeSliceSpan(text: string, kind: SplitMode): HTMLElement {
  const span = document.createElement("span");
  span.textContent = text;
  span.style.display = "inline-block";
  span.style.willChange = "transform, opacity, filter";
  span.setAttribute("data-text-slice", kind);
  span.setAttribute("aria-hidden", "true");
  return span;
}

function appendScreenReaderCopy(element: HTMLElement, text: string): void {
  const sr = document.createElement("span");
  sr.textContent = text;
  sr.setAttribute("data-text-sr", "");
  const s = sr.style;
  s.position = "absolute";
  s.width = "1px";
  s.height = "1px";
  s.padding = "0";
  s.margin = "-1px";
  s.overflow = "hidden";
  s.clip = "rect(0, 0, 0, 0)";
  s.whiteSpace = "nowrap";
  s.border = "0";
  element.appendChild(sr);
}

/**
 * Split an element's text into per-slice spans suitable for independent
 * transform/filter/opacity animation. Grapheme-safe via `Intl.Segmenter`
 * when available (falls back to `Array.from(text)` for character mode and
 * a whitespace-preserving regex for word mode).
 *
 * Line mode requires the element to be in the DOM and laid out — line
 * boundaries are detected via `getBoundingClientRect().top` after words
 * have been inserted.
 *
 * Script compatibility:
 * - LTR and RTL (Arabic, Hebrew): word and line modes work correctly; the
 *   browser's bidi algorithm places inline-block siblings in visual order.
 * - Connected / contextually-shaped scripts (Arabic, Devanagari, Lao,
 *   Khmer, …): character mode breaks shaping because each grapheme lands
 *   in its own inline-block box, preventing letters from joining. Prefer
 *   word or line mode for these scripts.
 */
export function splitText(element: HTMLElement, options: SplitOptions = {}): Splits {
  if (typeof document === "undefined") {
    throw new Error("splitText: requires a browser environment");
  }

  const mode: SplitMode = options.mode ?? "character";
  const original = element.textContent ?? "";

  element.textContent = "";
  appendScreenReaderCopy(element, original);

  const slices: HTMLElement[] = [];

  if (mode === "character") {
    for (const g of graphemeSegments(original, options.locale)) {
      if (WHITESPACE_ONLY.test(g)) {
        element.appendChild(document.createTextNode(g));
      } else {
        const span = makeSliceSpan(g, "character");
        element.appendChild(span);
        slices.push(span);
      }
    }
  } else if (mode === "word") {
    // Wrap every non-whitespace segment (words AND punctuation) so nothing
    // is left behind at opacity 0 / blur. Intl.Segmenter's word granularity
    // classifies commas/exclamations/etc as `isWordLike: false`; relying on
    // that would leave punctuation unanimated while its neighbours faded.
    for (const { segment } of wordSegments(original, options.locale)) {
      if (WHITESPACE_ONLY.test(segment)) {
        element.appendChild(document.createTextNode(segment));
      } else {
        const span = makeSliceSpan(segment, "word");
        element.appendChild(span);
        slices.push(span);
      }
    }
  } else {
    // Line mode: insert temporary word spans, measure, wrap each visual
    // line into a single line span, then demote inner word spans back to
    // plain text so only the line span carries animatable style.
    const tempWords: HTMLElement[] = [];
    for (const { segment } of wordSegments(original, options.locale)) {
      if (WHITESPACE_ONLY.test(segment)) {
        element.appendChild(document.createTextNode(segment));
      } else {
        const span = makeSliceSpan(segment, "word");
        element.appendChild(span);
        tempWords.push(span);
      }
    }

    const groups: HTMLElement[][] = [];
    let currentTop: number | null = null;
    let currentGroup: HTMLElement[] = [];
    for (const span of tempWords) {
      const top = Math.round(span.getBoundingClientRect().top);
      if (currentTop === null || Math.abs(top - currentTop) > 1) {
        if (currentGroup.length > 0) groups.push(currentGroup);
        currentGroup = [];
        currentTop = top;
      }
      currentGroup.push(span);
    }
    if (currentGroup.length > 0) groups.push(currentGroup);

    for (const group of groups) {
      const firstWord = group[0]!;
      const lastWord = group[group.length - 1]!;
      const lineWrap = makeSliceSpan("", "line");
      lineWrap.textContent = "";
      firstWord.parentNode!.insertBefore(lineWrap, firstWord);
      let node: ChildNode | null = firstWord;
      while (node) {
        const next: ChildNode | null = node.nextSibling;
        lineWrap.appendChild(node);
        if (node === lastWord) break;
        node = next;
      }
      // Demote inner word spans to plain text — only the line span animates.
      for (const word of group) {
        word.replaceWith(document.createTextNode(word.textContent ?? ""));
      }
      slices.push(lineWrap);
    }
  }

  let restored = false;
  const splits: Splits = {
    slices,
    mode,
    original,
    restore() {
      if (restored) return;
      restored = true;
      element.textContent = original;
    },
  };

  return splits;
}
