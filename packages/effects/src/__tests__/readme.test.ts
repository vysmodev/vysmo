import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_EFFECTS } from "../index.js";

/**
 * Guard against the README's hardcoded effect count drifting from the
 * actual catalog. If the count changes, this test fails on every
 * phrase that still embeds the stale number, so the README copy is
 * forced into sync with `ALL_EFFECTS`.
 *
 * Add a phrase here when you write a new "N effects" sentence in the
 * README. The list is the contract.
 */

const README_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "README.md",
);

const COUNT_PHRASES = (n: number) => [
  `Runner + all ${n} effects`,
];

describe("README catalog count stays in sync with ALL_EFFECTS", () => {
  const readme = readFileSync(README_PATH, "utf-8");
  const expected = ALL_EFFECTS.length;

  for (const phrase of COUNT_PHRASES(expected)) {
    it(`README contains "${phrase}"`, () => {
      expect(readme).toContain(phrase);
    });
  }
});
