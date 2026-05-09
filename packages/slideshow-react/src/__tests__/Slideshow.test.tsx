import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { paintBleed } from "@vysmo/transitions";
import { Slideshow } from "../Slideshow.js";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function makeSolid(r: number, g: number, b: number, size = 32): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context unavailable");
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

describe("<Slideshow>", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "200px";
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("mounts a slideshow into its host div", async () => {
    const slides = [makeSolid(255, 0, 0), makeSolid(0, 255, 0), makeSolid(0, 0, 255)];
    await act(async () => {
      root.render(<Slideshow slides={slides} />);
    });
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
  });

  it("forwards className and style to the host", async () => {
    const slides = [makeSolid(255, 0, 0), makeSolid(0, 0, 255)];
    await act(async () => {
      root.render(
        <Slideshow
          slides={slides}
          className="my-slideshow"
          style={{ borderRadius: "8px" }}
        />,
      );
    });
    const host = container.firstElementChild as HTMLDivElement;
    expect(host.classList.contains("my-slideshow")).toBe(true);
    expect(host.style.borderRadius).toBe("8px");
  });

  it("renders chrome (arrows, dots) when opted in", async () => {
    const slides = [makeSolid(255, 0, 0), makeSolid(0, 255, 0), makeSolid(0, 0, 255)];
    await act(async () => {
      root.render(<Slideshow slides={slides} arrows dots />);
    });
    // Both chrome elements live inside the slideshow's wrapper div.
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("wires onChange when a slide change happens", async () => {
    const slides = [makeSolid(255, 0, 0), makeSolid(0, 255, 0), makeSolid(0, 0, 255)];
    let captured: { current: number; previous: number } | null = null;
    await act(async () => {
      root.render(
        <Slideshow
          slides={slides}
          transition={paintBleed}
          transitionDuration={50}
          onChange={(current, previous) => {
            captured = { current, previous };
          }}
        />,
      );
    });
    const wrapper = container.querySelector("[role='region']") as HTMLDivElement;
    wrapper.focus();
    wrapper.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await new Promise((r) => setTimeout(r, 200));
    expect(captured).not.toBeNull();
    expect(captured!.current).toBe(1);
    expect(captured!.previous).toBe(0);
  });

  it("destroys on unmount without throwing", async () => {
    const slides = [makeSolid(255, 0, 0), makeSolid(0, 255, 0)];
    await act(async () => {
      root.render(<Slideshow slides={slides} />);
    });
    await act(async () => {
      root.unmount();
    });
    root = createRoot(container);
    expect(container.querySelector("canvas")).toBeNull();
  });
});
