import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");

// Hard caps. Tune as the surface evolves; a regression should be a
// conscious decision, not silent drift. The tree-shaken budgets are the
// realistic case — most consumers import 1–3 transitions, not all 65.
// At ~0.4 KB/transition the full bundle is mostly catalog mass; the
// Runner itself stays small and tree-shakes cleanly.
const BUDGET_FULL = 30 * 1024;     // 30 KB — full bundle (Runner + 65 transitions)
const BUDGET_RUNNER = 6 * 1024;    // 6 KB — Runner alone (no transitions imported)
const BUDGET_THREE = 8 * 1024;     // 8 KB — Runner + 3 typical transitions

async function bundle(entry, external = ["@vysmo/gl-core"]) {
  // gl-core is a sibling workspace package — bundle it inline so we
  // measure what consumers actually ship. Override `external` for
  // peer-style measurements if that ever changes.
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    minify: true,
    write: false,
    target: "es2022",
    platform: "neutral",
    external: external.filter((dep) => dep !== "@vysmo/gl-core"),
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

console.log("@vysmo/transitions bundle size check");
console.log("====================================\n");

const full = await bundle(join(pkgRoot, "src/index.ts"));
const fullOk = await measure("Full entry (Runner + 65)", full, BUDGET_FULL);

// Tree-shake test 1: only Runner, no transitions. Realistic when consumers
// bring `defineTransition()`-built shaders of their own.
const tmp = mkdtempSync(join(tmpdir(), "tx-bundle-"));
const runnerEntry = join(tmp, "runner.ts");
writeFileSync(
  runnerEntry,
  `import { Runner } from "${join(pkgRoot, "src/index.ts")}";\nexport default Runner;\n`,
);
const runnerOnly = await bundle(runnerEntry);
const runnerOk = await measure("Runner-only (tree-shaken)", runnerOnly, BUDGET_RUNNER);

// Tree-shake test 2: Runner + 3 typical transitions.
const threeEntry = join(tmp, "three.ts");
writeFileSync(
  threeEntry,
  `import { Runner, dissolve, crossZoom, pageCurl } from "${join(pkgRoot, "src/index.ts")}";\nexport default { Runner, dissolve, crossZoom, pageCurl };\n`,
);
const three = await bundle(threeEntry);
const threeOk = await measure("Runner + 3 transitions", three, BUDGET_THREE);

if (!fullOk || !runnerOk || !threeOk) {
  console.log("\nBudget exceeded. Reduce size or raise the cap.");
  process.exit(1);
}
console.log("\nAll within budget.");
