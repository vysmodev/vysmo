import { defineConfig } from "vitest/config";

/**
 * Node-mode vitest run for tests that need filesystem / SSR-style
 * environment instead of the Chromium browser harness used by the main
 * config: SSR safety checks (`ssr.test.ts`) and README count drift
 * checks (`readme.test.ts`) both live here.
 */
export default defineConfig({
  test: {
    include: [
      "src/__tests__/ssr.test.ts",
      "src/__tests__/readme.test.ts",
    ],
  },
});
