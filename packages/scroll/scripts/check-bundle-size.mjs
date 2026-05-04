import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");

// `@vysmo/transitions` and `@vysmo/effects` are real npm dependencies once
// published — don't double-count them. Consumers install them separately.
const PEERS = ["@vysmo/transitions", "@vysmo/effects"];

// Tiny package — observer + 3 factories + zone math + helpers.
const BUDGET_FULL = 3 * 1024;        // 3 KB — full bundle (peers external)
const BUDGET_PROGRESS = 1.5 * 1024;  // 1.5 KB — createScrollProgress alone

async function bundle(entry) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    minify: true,
    write: false,
    target: "es2022",
    platform: "neutral",
    external: PEERS,
  });
  return result.outputFiles[0].contents;
}

async function measure(label, contents, budget) {
  const raw = contents.byteLength;
  const gz = gzipSync(contents).byteLength;
  const pct = ((gz / budget) * 100).toFixed(1);
  const status = gz <= budget ? "✓" : "✗";
  console.log(
    `${status} ${label.padEnd(34)} raw ${(raw / 1024).toFixed(2)} KB  gzip ${(gz / 1024).toFixed(2)} KB  (${pct}% of ${(budget / 1024).toFixed(0)}KB budget)`,
  );
  return gz <= budget;
}

console.log("@vysmo/scroll bundle size check");
console.log("===============================\n");

const full = await bundle(join(pkgRoot, "src/index.ts"));
const fullOk = await measure("Full entry (peers external)", full, BUDGET_FULL);

const tmp = mkdtempSync(join(tmpdir(), "scroll-bundle-"));
const progressEntry = join(tmp, "progress.ts");
writeFileSync(
  progressEntry,
  `import { createScrollProgress } from "${join(pkgRoot, "src/index.ts")}";\nexport default createScrollProgress;\n`,
);
const progressOnly = await bundle(progressEntry);
const progressOk = await measure("createScrollProgress only", progressOnly, BUDGET_PROGRESS);

if (!fullOk || !progressOk) {
  console.log("\nBudget exceeded. Reduce size or raise the cap.");
  process.exit(1);
}
console.log("\nAll within budget.");
