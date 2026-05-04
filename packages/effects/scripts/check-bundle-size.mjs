import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");

const BUDGET_GZIP = 12 * 1024; // 12 KB — full-bundle cap (runner + 30 effects, ~285 B / effect gzipped)
const BUDGET_CORE_GZIP = 4 * 1024; // 4 KB — cap for a user importing just runner + one effect (the meaningful tree-shake cap)

async function measure(label, entry, budget) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    minify: true,
    write: false,
    target: "es2022",
    platform: "neutral",
    external: [],
  });
  const bytes = result.outputFiles[0].contents;
  const raw = bytes.byteLength;
  const gz = gzipSync(bytes).byteLength;
  const pct = ((gz / budget) * 100).toFixed(1);
  const status = gz <= budget ? "✓" : "✗";
  console.log(
    `${status} ${label.padEnd(24)} raw ${(raw / 1024).toFixed(2)} KB  gzip ${(gz / 1024).toFixed(2)} KB  (${pct}% of ${(budget / 1024).toFixed(0)}KB budget)`,
  );
  return gz <= budget;
}

console.log("@vysmo/effects bundle size check");
console.log("================================\n");

const fullOk = await measure("Full entry", join(pkgRoot, "src/index.ts"), BUDGET_GZIP);

const coreEntry = join(pkgRoot, "scripts/_fixture-core.mjs");
const { writeFileSync, unlinkSync } = await import("node:fs");
writeFileSync(
  coreEntry,
  `import { Runner, blur } from "../src/index.js";
export const kit = { Runner, blur };`,
);
const coreOk = await measure("Core (Runner + blur)", coreEntry, BUDGET_CORE_GZIP);
try {
  unlinkSync(coreEntry);
} catch {}

if (!fullOk || !coreOk) {
  console.log("\nBudget exceeded. Reduce size or raise the cap.");
  process.exit(1);
}
console.log("\nAll within budget.");
