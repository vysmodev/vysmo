import { defineConfig } from "vitest/config";

/**
 * Node-mode vitest run for SSR safety checks. The main vitest.config.ts
 * runs tests in a browser for WebGL coverage; this config targets
 * src/__tests__/ssr.test.ts specifically to verify the library loads
 * in Node without DOM globals.
 */
export default defineConfig({
  test: {
    include: ["src/__tests__/ssr.test.ts"],
  },
});
