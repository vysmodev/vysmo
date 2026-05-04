import { describe, expect, it } from "vitest";
import { applyProps, clearProps } from "../properties.js";

function el(): HTMLElement {
  return document.createElement("span");
}

describe("applyProps", () => {
  it("sets opacity as a raw string", () => {
    const e = el();
    applyProps(e, { opacity: 0.5 });
    expect(e.style.opacity).toBe("0.5");
  });

  it("composes translate/rotate/scale into one transform declaration", () => {
    const e = el();
    applyProps(e, { translateX: 10, translateY: -5, rotate: 30, scale: 1.2 });
    expect(e.style.transform).toMatch(/translate3d\(10px, -5px, 0px\)/);
    expect(e.style.transform).toMatch(/rotate\(30deg\)/);
    expect(e.style.transform).toMatch(/scale\(1\.2\)/);
  });

  it("emits translate3d when any single translate axis is set", () => {
    const e = el();
    applyProps(e, { translateY: 20 });
    expect(e.style.transform).toBe("translate3d(0px, 20px, 0px)");
  });

  it("composes blur/brightness/etc into one filter declaration", () => {
    const e = el();
    applyProps(e, { blur: 4, brightness: 1.2, hueRotate: 90 });
    expect(e.style.filter).toMatch(/blur\(4px\)/);
    expect(e.style.filter).toMatch(/brightness\(1\.2\)/);
    expect(e.style.filter).toMatch(/hue-rotate\(90deg\)/);
  });

  it("leaves transform/filter untouched when no relevant prop is present", () => {
    const e = el();
    e.style.transform = "translateX(100px)";
    applyProps(e, { opacity: 0.9 });
    expect(e.style.transform).toBe("translateX(100px)");
  });

  it("replaces the previous transform composition on each call", () => {
    const e = el();
    applyProps(e, { rotate: 10, scale: 2 });
    applyProps(e, { translateX: 50 });
    expect(e.style.transform).toBe("translate3d(50px, 0px, 0px)");
    expect(e.style.transform).not.toContain("rotate");
  });
});

describe("clearProps", () => {
  it("removes opacity/transform/filter from the element", () => {
    const e = el();
    applyProps(e, { opacity: 0.3, translateY: 5, blur: 2 });
    clearProps(e);
    expect(e.style.opacity).toBe("");
    expect(e.style.transform).toBe("");
    expect(e.style.filter).toBe("");
  });
});
