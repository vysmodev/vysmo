#!/usr/bin/env node
// Prep every @vysmo/* package for first npm publish.
//
// Per-package mutations:
//   - delete `"private": true`
//   - set `"version": "0.1.0"`
//   - add `publishConfig` block whose main/types/exports point at dist/,
//     derived from the existing top-level exports (which keep pointing
//     at src/ so local Vite/Astro workspace dev keeps using src).
//
// Also copies the repo-root LICENSE into every package dir.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PACKAGES_DIR = join(ROOT, "packages");
const ROOT_LICENSE = join(ROOT, "LICENSE");

if (!existsSync(ROOT_LICENSE)) {
  console.error("Missing root LICENSE at", ROOT_LICENSE);
  process.exit(1);
}

const TARGET_VERSION = "0.1.0";

const PACKAGES = [
  "easings",
  "gl-core",
  "animations",
  "transitions",
  "effects",
  "text",
  "scroll",
  "flipbook",
  "slideshow",
  "transitions-react",
  "effects-react",
  "text-react",
  "flipbook-react",
  "slideshow-react",
].filter((name) => existsSync(join(PACKAGES_DIR, name)));

function distifyExports(srcExports) {
  // Walk the exports map and replace ./src/<X>.ts:
  //   - in "import" → ./dist/<X>.js
  //   - in "types"  → ./dist/<X>.d.ts
  const out = {};
  for (const [subpath, value] of Object.entries(srcExports)) {
    if (typeof value === "string") {
      // Sugar form: "./X": "./src/X.ts"
      out[subpath] = value
        .replace(/^\.\/src\//, "./dist/")
        .replace(/\.ts$/, ".js");
      continue;
    }
    const conditions = {};
    if (value.types) {
      conditions.types = value.types
        .replace(/^\.\/src\//, "./dist/")
        .replace(/\.ts$/, ".d.ts");
    }
    if (value.import) {
      conditions.import = value.import
        .replace(/^\.\/src\//, "./dist/")
        .replace(/\.ts$/, ".js");
    }
    out[subpath] = conditions;
  }
  return out;
}

for (const pkg of PACKAGES) {
  const pkgDir = join(PACKAGES_DIR, pkg);
  const pkgJsonPath = join(pkgDir, "package.json");
  const json = JSON.parse(readFileSync(pkgJsonPath, "utf8"));

  delete json.private;
  json.version = TARGET_VERSION;

  const publishConfig = {
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
  };
  if (json.exports) {
    publishConfig.exports = distifyExports(json.exports);
  }
  json.publishConfig = publishConfig;

  writeFileSync(pkgJsonPath, JSON.stringify(json, null, 2) + "\n");

  // Copy LICENSE.
  copyFileSync(ROOT_LICENSE, join(pkgDir, "LICENSE"));

  console.log(`  ✓ ${pkg}`);
}

console.log(`\nPrepped ${PACKAGES.length} package(s) for publish at v${TARGET_VERSION}.`);
