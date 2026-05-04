import { defineConfig } from "vitest/config";

/**
 * Node-mode vitest run for SSR safety checks. The main vitest.config.ts
 * runs tests in Chromium for real WebGL coverage; this config targets
 * src/__tests__/ssr.test.ts specifically to verify the library's module
 * graph loads in Node without DOM globals.
 */
export default defineConfig({
  test: {
    include: ["src/__tests__/ssr.test.ts"],
  },
});
