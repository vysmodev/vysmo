import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");

// One realistic budget: the full bundle. Tree-shaking the preset catalog
// out is currently blocked because `animateText` imports `resolvePreset`
// unconditionally (so callers can pass `preset: "name"`). Even if you
// only pass object-form presets (`preset: fadeUp`), the registry is in
// the module graph. Documented as a known limitation; would require
// moving the string-resolver to a separate subpath export to fix
// without changing the API.
const BUDGET_FULL = 30 * 1024; // 30 KB — the whole package is essentially the budget

async function bundle(entry) {
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

console.log("@vysmo/text bundle size check");
console.log("=============================\n");

const full = await bundle(join(pkgRoot, "src/index.ts"));
const fullOk = await measure("Full entry (runtime + 300+ presets)", full, BUDGET_FULL);

if (!fullOk) {
  console.log("\nBudget exceeded. Reduce size or raise the cap.");
  process.exit(1);
}
console.log("\nAll within budget.");
console.log(
  "\nNote: catalog cannot currently be tree-shaken — `animateText`\n" +
  "imports `resolvePreset` unconditionally. Bundle = ~always full.\n" +
  "Future fix: move the string resolver to a `/resolve` subpath export.",
);
