import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { Flipbook } from "../Flipbook.js";

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

describe("<Flipbook>", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    container.style.width = "200px";
    container.style.height = "300px";
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("mounts a flipbook into its host div", async () => {
    const pages = [makeSolid(255, 0, 0), makeSolid(0, 255, 0), makeSolid(0, 0, 255)];
    await act(async () => {
      root.render(<Flipbook pages={pages} />);
    });
    // The flipbook creates its own canvas inside the host div.
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeTruthy();
  });

  it("forwards className and style to the host", async () => {
    const pages = [makeSolid(255, 0, 0), makeSolid(0, 0, 255)];
    await act(async () => {
      root.render(
        <Flipbook
          pages={pages}
          className="my-flipbook"
          style={{ borderRadius: "8px" }}
        />,
      );
    });
    const host = container.firstElementChild as HTMLDivElement;
    expect(host.classList.contains("my-flipbook")).toBe(true);
    expect(host.style.borderRadius).toBe("8px");
  });

  it("wires onChange when a page change happens", async () => {
    const pages = [makeSolid(255, 0, 0), makeSolid(0, 255, 0), makeSolid(0, 0, 255)];
    let captured: { current: number; previous: number } | null = null;
    await act(async () => {
      root.render(
        <Flipbook
          pages={pages}
          flipDuration={50}
          onChange={(current, previous) => {
            captured = { current, previous };
          }}
        />,
      );
    });
    // Flipbook creates an inner wrapper with role=region; keyboard nav
    // listens on that, not the React-rendered host. Dispatch there.
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
    const pages = [makeSolid(255, 0, 0), makeSolid(0, 255, 0)];
    await act(async () => {
      root.render(<Flipbook pages={pages} />);
    });
    await act(async () => {
      root.unmount();
    });
    root = createRoot(container);
    expect(container.querySelector("canvas")).toBeNull();
  });
});
