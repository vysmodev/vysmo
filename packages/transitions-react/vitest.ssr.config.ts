import { defineConfig } from "vitest/config";

/**
 * Node-mode vitest run for SSR safety checks. The main vitest.config.ts
 * runs tests in Chromium for real WebGL coverage; this config targets
 * the SSR test specifically to verify the wrapper's module graph loads
 * in Node without DOM globals.
 */
export default defineConfig({
  test: {
    include: ["src/__tests__/ssr.test.ts"],
  },
});
