import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");

// Peers shipped separately on npm — don't double-count.
const PEERS = ["@vysmo/animations", "@vysmo/easings", "@vysmo/transitions"];

const BUDGET_FULL = 5 * 1024; // 5 KB — full bundle (peers external)

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
    `${status} ${label.padEnd(28)} raw ${(raw / 1024).toFixed(2)} KB  gzip ${(gz / 1024).toFixed(2)} KB  (${pct}% of ${(budget / 1024).toFixed(0)}KB budget)`,
  );
  return gz <= budget;
}

console.log("@vysmo/flipbook bundle size check");
console.log("=================================\n");

const full = await bundle(join(pkgRoot, "src/index.ts"));
const ok = await measure("Full entry (peers external)", full, BUDGET_FULL);

if (!ok) {
  console.log("\nBudget exceeded. Reduce size or raise the cap.");
  process.exit(1);
}
console.log("\nAll within budget.");
