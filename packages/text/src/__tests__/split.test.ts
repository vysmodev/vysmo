import { afterEach, describe, expect, it } from "vitest";
import { splitText } from "../split.js";

let mounted: HTMLElement[] = [];

function mount(text: string, style?: Partial<CSSStyleDeclaration>): HTMLElement {
  const el = document.createElement("p");
  el.textContent = text;
  if (style) Object.assign(el.style, style);
  document.body.appendChild(el);
  mounted.push(el);
  return el;
}

afterEach(() => {
  for (const el of mounted) el.remove();
  mounted = [];
});

describe("splitText — character mode", () => {
  it("wraps each visible grapheme in a span, keeping whitespace as text nodes", () => {
    const el = mount("ab c");
    const splits = splitText(el, { mode: "character" });
    expect(splits.slices).toHaveLength(3);
    for (const s of splits.slices) {
      expect(s.tagName).toBe("SPAN");
      expect(s.getAttribute("data-text-slice")).toBe("character");
      expect(s.style.display).toBe("inline-block");
    }
    expect(splits.slices.map((s) => s.textContent).join("")).toBe("abc");
  });

  it("treats emoji as a single grapheme", () => {
    const el = mount("a👨‍👩‍👧b");
    const splits = splitText(el, { mode: "character" });
    const texts = splits.slices.map((s) => s.textContent);
    expect(texts).toEqual(["a", "👨‍👩‍👧", "b"]);
  });

  it("treats combining marks as a single grapheme", () => {
    // "é" built from e + combining acute (U+0065 U+0301) — two code points, one grapheme.
    const el = mount("éa");
    const splits = splitText(el, { mode: "character" });
    expect(splits.slices).toHaveLength(2);
    expect(splits.slices[0]!.textContent).toBe("é");
  });

  it("exposes the original string to screen readers via a visually-hidden copy", () => {
    const el = mount("Accessible text");
    splitText(el, { mode: "character" });
    const sr = el.querySelector("[data-text-sr]") as HTMLElement | null;
    expect(sr).not.toBeNull();
    expect(sr!.textContent).toBe("Accessible text");
    expect(sr!.style.position).toBe("absolute");
  });

  it("marks visible slices aria-hidden so screen readers use the SR copy", () => {
    const el = mount("Hi");
    const splits = splitText(el, { mode: "character" });
    for (const s of splits.slices) {
      expect(s.getAttribute("aria-hidden")).toBe("true");
    }
  });
});

describe("splitText — word mode", () => {
  it("wraps words AND punctuation; only whitespace stays as raw text nodes", () => {
    const el = mount("Hello, world!");
    const splits = splitText(el, { mode: "word" });
    expect(splits.slices.map((s) => s.textContent)).toEqual(["Hello", ",", "world", "!"]);
    for (const s of splits.slices) {
      expect(s.getAttribute("data-text-slice")).toBe("word");
    }
  });

  it("preserves whitespace between words in rendered text", () => {
    const el = mount("a bb ccc");
    splitText(el, { mode: "word" });
    const visible = el.textContent ?? "";
    // SR-only copy prepends "a bb ccc"; the split copy appends "a bb ccc" again.
    expect(visible).toContain("a bb ccc");
  });

  it("segments Arabic text into word slices with its locale-aware boundaries", () => {
    // "مرحبا بالعالم" = "Hello world". Word mode keeps each word whole, so
    // contextual shaping within each span still applies correctly.
    const el = mount("مرحبا بالعالم", { direction: "rtl" });
    const splits = splitText(el, { mode: "word", locale: "ar" });
    const texts = splits.slices.map((s) => s.textContent);
    expect(texts).toContain("مرحبا");
    expect(texts).toContain("بالعالم");
  });

  it("wraps punctuation in non-latin scripts too (CJK fullwidth, Arabic)", () => {
    const el = mount("你好，世界！", { direction: "ltr" });
    const splits = splitText(el, { mode: "word", locale: "zh" });
    const texts = splits.slices.map((s) => s.textContent);
    expect(texts).toContain("，");
    expect(texts).toContain("！");
  });
});

describe("splitText — line mode", () => {
  it("groups words into lines by their measured top position", () => {
    const el = mount("one two three four five six seven eight nine ten eleven twelve", {
      width: "60px",
      fontSize: "16px",
      lineHeight: "20px",
      fontFamily: "monospace",
    });
    const splits = splitText(el, { mode: "line" });
    expect(splits.slices.length).toBeGreaterThan(1);
    for (const s of splits.slices) {
      expect(s.getAttribute("data-text-slice")).toBe("line");
    }
    const rendered = splits.slices.map((s) => s.textContent?.trim()).join(" ");
    for (const word of ["one", "twelve", "seven"]) {
      expect(rendered).toContain(word);
    }
  });
});

describe("splitText — restore", () => {
  it("restore() returns the element to its original textContent", () => {
    const el = mount("Hello world");
    const splits = splitText(el, { mode: "character" });
    expect(el.querySelectorAll("[data-text-slice]").length).toBeGreaterThan(0);
    splits.restore();
    expect(el.textContent).toBe("Hello world");
    expect(el.querySelectorAll("[data-text-slice]").length).toBe(0);
  });

  it("restore() is idempotent", () => {
    const el = mount("abc");
    const splits = splitText(el, { mode: "character" });
    splits.restore();
    splits.restore();
    expect(el.textContent).toBe("abc");
  });
});
