import { describe, expect, it } from "vitest";

/**
 * SSR safety: the module must load in Node without DOM globals. This
 * verifies that no top-level code touches `window` / `document` / etc
 * — `useEffect` bodies don't run on the server, so as long as the
 * imports + module bodies are clean, the wrapper is SSR-safe.
 */
describe("SSR safety", () => {
  it("window is undefined in this runtime", () => {
    expect(typeof window).toBe("undefined");
  });

  it("module loads without DOM globals", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
    expect(typeof mod.Transition).toBe("function");
    expect(typeof mod.useTransitionRunner).toBe("function");
    expect(typeof mod.resolveSource).toBe("function");
  });
});
