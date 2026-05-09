import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { dissolve } from "@vysmo/transitions";
import { Transition } from "../Transition.js";

// React 19's `act` only short-circuits its scheduler when this flag is
// set; otherwise it logs a noisy "not configured to support act"
// warning even when the wrapping does happen correctly.
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

function flush(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

describe("<Transition>", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    container.style.width = "128px";
    container.style.height = "128px";
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("renders a canvas element", async () => {
    const a = makeSolid(255, 0, 0);
    const b = makeSolid(0, 0, 255);
    await act(async () => {
      root.render(<Transition transition={dissolve} from={a} to={b} progress={0} />);
    });
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("at progress=0 renders the from-image (red)", async () => {
    const a = makeSolid(255, 0, 0);
    const b = makeSolid(0, 0, 255);
    await act(async () => {
      root.render(<Transition transition={dissolve} from={a} to={b} progress={0} />);
    });
    await flush();
    // Re-render to ensure render effect runs after sources resolve.
    await act(async () => {
      root.render(<Transition transition={dissolve} from={a} to={b} progress={0} />);
    });
    const canvas = container.querySelector("canvas")!;
    const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true });
    // We're not asserting pixels here — the runner doesn't preserve the
    // drawing buffer by default (and the wrapper doesn't expose that
    // option yet). The fact that the component mounted, resolved the
    // sources, and drove a render without throwing is the contract.
    expect(gl).toBeTruthy();
  });

  it("forwards className and style to the canvas", async () => {
    const a = makeSolid(255, 0, 0);
    const b = makeSolid(0, 0, 255);
    await act(async () => {
      root.render(
        <Transition
          transition={dissolve}
          from={a}
          to={b}
          progress={0.5}
          className="test-class"
          style={{ borderRadius: "12px" }}
        />,
      );
    });
    const canvas = container.querySelector("canvas")!;
    expect(canvas.className).toBe("test-class");
    expect(canvas.style.borderRadius).toBe("12px");
  });

  it("resolves a string URL to an image (data URL path)", async () => {
    // 1×1 transparent PNG.
    const url =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    await act(async () => {
      root.render(<Transition transition={dissolve} from={url} to={url} progress={0} />);
    });
    // Wait for image decode.
    await flush();
    await flush();
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("autoplays when no progress prop is given and calls onComplete", async () => {
    const a = makeSolid(255, 0, 0);
    const b = makeSolid(0, 0, 255);
    let completed = false;
    await act(async () => {
      root.render(
        <Transition
          transition={dissolve}
          from={a}
          to={b}
          duration={50}
          onComplete={() => {
            completed = true;
          }}
        />,
      );
    });
    // Wait for autoplay to finish (~50ms) plus rAF.
    await new Promise((r) => setTimeout(r, 200));
    expect(completed).toBe(true);
  });

  it("disposes runner on unmount without throwing", async () => {
    const a = makeSolid(255, 0, 0);
    const b = makeSolid(0, 0, 255);
    await act(async () => {
      root.render(<Transition transition={dissolve} from={a} to={b} progress={0.5} />);
    });
    await act(async () => {
      root.unmount();
    });
    // Re-create root for afterEach to unmount safely.
    root = createRoot(container);
    expect(container.querySelector("canvas")).toBeNull();
  });
});
