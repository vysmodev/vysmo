import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_TRANSITIONS } from "@vysmo/transitions";

/**
 * The slideshow README references the size of the transitions catalog
 * (it's the pool of shaders the slideshow can drive). When a transition
 * is added or removed in `@vysmo/transitions`, this guard fails so the
 * slideshow README copy is forced into sync.
 *
 * Add a phrase here when you write a new "N transitions" sentence in
 * the README. The list is the contract.
 */

const README_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "README.md",
);

const COUNT_PHRASES = (n: number) => [
  `driven by any of the ${n} [\`@vysmo/transitions\`]`,
];

describe("README transition count stays in sync with @vysmo/transitions", () => {
  const readme = readFileSync(README_PATH, "utf-8");
  const expected = ALL_TRANSITIONS.length;

  for (const phrase of COUNT_PHRASES(expected)) {
    it(`README contains "${phrase}"`, () => {
      expect(readme).toContain(phrase);
    });
  }
});
