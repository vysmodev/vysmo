import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");

const BUDGET_GZIP = 2 * 1024; // 2 KB — hard cap for the full shared-plumbing bundle

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
    `${status} ${label.padEnd(20)} raw ${(raw / 1024).toFixed(2)} KB  gzip ${(gz / 1024).toFixed(2)} KB  (${pct}% of ${(budget / 1024).toFixed(0)}KB budget)`,
  );
  return gz <= budget;
}

console.log("@vysmo/gl-core bundle size check");
console.log("================================\n");

const fullOk = await measure("Full entry", join(pkgRoot, "src/index.ts"), BUDGET_GZIP);

if (!fullOk) {
  console.log("\nBudget exceeded. Reduce size or raise the cap.");
  process.exit(1);
}
console.log("\nAll within budget.");
