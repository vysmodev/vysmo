#!/usr/bin/env node
/**
 * CJS smoke test: walk every published @vysmo/* package, require its
 * built dist/*.cjs entry points (the ones the publishConfig.exports
 * `require` condition points at), and verify each one loads without
 * throwing and exposes the expected named exports.
 *
 * Catches regressions like:
 *   - esbuild step missing from a package's build script
 *   - exports.require pointing at a non-existent file
 *   - top-level await or other ESM-only feature sneaking in and breaking
 *     CJS compilation
 *
 * Run after `pnpm build`.
 */

const path = require("node:path");
const fs = require("node:fs");

const ROOT = path.resolve(__dirname, "..");
const PACKAGES_DIR = path.join(ROOT, "packages");

// (package directory name, list of named exports we expect to find).
// The named exports are sampled — not exhaustive — just enough to
// catch a totally-broken bundle.
const PACKAGES = [
  ["gl-core", ["TextureCache", "FramebufferPool", "buildProgram", "flipRgba8RowsInPlace"]],
  ["easings", ["bezier", "anticipate", "backInOut"]],
  ["animations", ["animate", "timeline"]],
  ["transitions", ["Runner", "ALL_TRANSITIONS", "paintBleed"]],
  ["effects", ["Runner", "ALL_EFFECTS", "blur"]],
  ["text", ["splitText", "animateText"]],
  ["scroll", ["createScrollTransition", "ScrollObserver"]],
  ["flipbook", ["createFlipbook"]],
  ["slideshow", ["createSlideshow"]],
  ["transitions-react", ["Transition"]],
  ["flipbook-react", ["Flipbook"]],
  ["slideshow-react", ["Slideshow"]],
  ["text-react", ["AnimateText"]],
];

// Multi-entry packages: subpath → expected named exports.
const SUBPATH_ENTRIES = {
  easings: {
    css: ["toCSSLinear"],
    parse: ["parseEasing"],
    "reduced-motion": ["prefersReducedMotion"],
  },
};

let failures = 0;

function check(pkgDir, entryRel, expectedNames, label) {
  const fullPath = path.join(PACKAGES_DIR, pkgDir, entryRel);
  if (!fs.existsSync(fullPath)) {
    console.log(`  ✗ ${label}: file not found at ${fullPath}`);
    failures++;
    return;
  }

  let mod;
  try {
    mod = require(fullPath);
  } catch (err) {
    console.log(`  ✗ ${label}: require() threw — ${err.message}`);
    failures++;
    return;
  }

  const missing = expectedNames.filter((name) => !(name in mod));
  if (missing.length > 0) {
    console.log(`  ✗ ${label}: missing exports — ${missing.join(", ")}`);
    failures++;
    return;
  }
  console.log(`  ✓ ${label}`);
}

console.log("CJS smoke test — requiring built dist/*.cjs for every @vysmo/* package");
console.log("=".repeat(72));

for (const [pkgDir, expected] of PACKAGES) {
  console.log(`\n@vysmo/${pkgDir}`);
  check(pkgDir, "dist/index.cjs", expected, "dist/index.cjs");

  const subpaths = SUBPATH_ENTRIES[pkgDir];
  if (subpaths) {
    for (const [subpath, names] of Object.entries(subpaths)) {
      check(pkgDir, `dist/${subpath}.cjs`, names, `dist/${subpath}.cjs`);
    }
  }
}

console.log("\n" + "=".repeat(72));
if (failures > 0) {
  console.log(`✗ ${failures} failure(s).`);
  process.exit(1);
}
console.log("✓ All packages load cleanly via require().");
