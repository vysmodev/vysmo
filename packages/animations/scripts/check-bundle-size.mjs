import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");

// Hard caps. Tune as the surface evolves; a regression should be a
// conscious decision, not a silent drift.
const BUDGET_FULL = 4 * 1024;   // 4 KB — full bundle (animate + spring + timeline + interpolate + scheduler)
const BUDGET_ANIMATE = 2 * 1024; // 2 KB — typical consumer (just animate())

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

console.log("@vysmo/animations bundle size check");
console.log("===================================\n");

const full = await bundle(join(pkgRoot, "src/index.ts"));
const fullOk = await measure("Full entry", full, BUDGET_FULL);

// Tree-shake test: only import animate. Mimics what most consumers do.
// Write a synthetic entry so esbuild has something concrete to tree-shake from.
const tmp = mkdtempSync(join(tmpdir(), "anim-bundle-"));
const animateEntry = join(tmp, "entry.ts");
writeFileSync(
  animateEntry,
  `import { animate } from "${join(pkgRoot, "src/index.ts")}";\nexport default animate;\n`,
);
const animateOnly = await bundle(animateEntry);
const animateOk = await measure("animate-only (tree-shaken)", animateOnly, BUDGET_ANIMATE);

if (!fullOk || !animateOk) {
  console.log("\nBudget exceeded. Reduce size or raise the cap.");
  process.exit(1);
}
console.log("\nAll within budget.");
