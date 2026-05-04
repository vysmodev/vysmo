import { defineConfig } from "vitest/config";

/**
 * Node-mode vitest run for SSR safety checks. The main vitest.config.ts
 * runs tests in Node already (animations is DOM-agnostic), but this
 * config is kept as a parallel structural pattern with the other
 * libraries — and it pins the SSR test to a separate run so any DOM
 * globals leaking into the source would be caught the same way they
 * are in `@vysmo/text` etc.
 */
export default defineConfig({
  test: {
    include: ["src/__tests__/ssr.test.ts"],
  },
});
