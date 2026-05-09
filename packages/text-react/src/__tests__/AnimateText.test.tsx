import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { AnimateText } from "../AnimateText.js";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("<AnimateText>", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("renders children inside a span by default", async () => {
    await act(async () => {
      root.render(<AnimateText preset="enter/fade-up">Hello world</AnimateText>);
    });
    const span = container.querySelector("span");
    expect(span).toBeTruthy();
    // animateText splits the text into per-slice spans + appends a
    // hidden screen-reader copy. Both contain the full text, so
    // textContent doubles — verify via the SR copy attribute instead.
    const sr = span!.querySelector("[data-text-sr]");
    expect(sr?.textContent).toBe("Hello world");
  });

  it("renders as a different tag when `as` is set", async () => {
    await act(async () => {
      root.render(
        <AnimateText as="h1" preset="enter/fade-up">
          Headline
        </AnimateText>,
      );
    });
    const h1 = container.querySelector("h1");
    expect(h1).toBeTruthy();
    const sr = h1!.querySelector("[data-text-sr]");
    expect(sr?.textContent).toBe("Headline");
  });

  it("forwards className and style", async () => {
    await act(async () => {
      root.render(
        <AnimateText
          preset="enter/fade-up"
          className="test-class"
          style={{ color: "red" }}
        >
          Styled
        </AnimateText>,
      );
    });
    const span = container.querySelector("span")!;
    expect(span.className).toBe("test-class");
    expect(span.style.color).toBe("red");
  });

  it("splits the text into slices via animateText", async () => {
    await act(async () => {
      root.render(
        <AnimateText preset="enter/fade-up" split="character">
          Hi
        </AnimateText>,
      );
    });
    // animateText splits the text into per-character spans wrapped in
    // word containers — both root and inner spans use data attributes.
    const span = container.querySelector("span")!;
    const slices = span.querySelectorAll("[data-text-slice]");
    expect(slices.length).toBeGreaterThan(0);
  });

  it("calls onComplete after the animation finishes", async () => {
    let completed = false;
    await act(async () => {
      root.render(
        <AnimateText
          preset="enter/fade-up"
          onComplete={() => {
            completed = true;
          }}
        >
          x
        </AnimateText>,
      );
    });
    // fade-up is sub-second; give it 1.5s to complete.
    await new Promise((r) => setTimeout(r, 1500));
    expect(completed).toBe(true);
  });

  it("stops the handle on unmount without throwing", async () => {
    await act(async () => {
      root.render(<AnimateText preset="enter/fade-up">Goodbye</AnimateText>);
    });
    await act(async () => {
      root.unmount();
    });
    root = createRoot(container);
    expect(container.querySelector("span")).toBeNull();
  });
});
