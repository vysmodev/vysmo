// One-shot migration from `ease: <identifier>` (function reference) to
// `ease: "<gsap-style>"` (parseable string). After running, the file's
// `import { ... } from "@vysmo/easings"` line is no longer needed; the
// script strips that import too. `import type { ... }` lines are left
// alone.
//
//   node scripts/migrate-ease-format.mjs src/presets/generated.ts
//
// The mapping mirrors `packages/easings/src/parse.ts` REGISTRY exactly:
// `power2Out` → `"power2.out"`, `cubicOut` → `"cubic.out"`,
// `backOut` → `"back.out"`, `sineInOut` → `"sine.inOut"`, etc.

import { readFileSync, writeFileSync } from "node:fs";

const NO_SUFFIX = new Set([
  "linear", "none", "spring", "wiggle", "steps", "anticipate",
]);

function identToGsap(id) {
  if (NO_SUFFIX.has(id)) return id;
  let suffix;
  let family;
  if (id.endsWith("InOut")) {
    suffix = "inOut";
    family = id.slice(0, -"InOut".length);
  } else if (id.endsWith("Out")) {
    suffix = "out";
    family = id.slice(0, -"Out".length);
  } else if (id.endsWith("In")) {
    suffix = "in";
    family = id.slice(0, -"In".length);
  } else {
    return null; // unknown shape — caller handles
  }
  return `${family}.${suffix}`;
}

const EASE_REF_RE = /(\bease:\s*)([A-Za-z_$][\w$]*)/g;

function convert(src) {
  const seen = new Set();
  const out = src.replace(EASE_REF_RE, (whole, prefix, ident) => {
    const gsap = identToGsap(ident);
    if (gsap === null) return whole; // not a recognized easing identifier
    seen.add(ident);
    return `${prefix}"${gsap}"`;
  });
  return { out, seen };
}

/**
 * Strip the easings value-import line if every named import in it is one
 * we just converted to a string. Type-only imports (`import type`) are
 * left alone.
 */
function stripEasingsImport(src, converted) {
  const importRe = /^import\s*\{\s*([^}]+)\s*\}\s*from\s*["']@libs\/easings["'];?\s*\n/gm;
  return src.replace(importRe, (whole, body) => {
    const names = body
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^type\s+/, ""));
    if (names.every((n) => converted.has(n))) return "";
    return whole;
  });
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node migrate-ease-format.mjs <file>...");
  process.exit(1);
}

let totalRefs = 0;
let totalImportsStripped = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const { out: converted, seen } = convert(src);
  const refCount = (src.match(EASE_REF_RE) || []).length - (converted.match(EASE_REF_RE) || []).length;
  const stripped = stripEasingsImport(converted, seen);
  const importsStripped = stripped !== converted ? 1 : 0;
  if (refCount > 0 || importsStripped > 0) {
    writeFileSync(f, stripped);
    console.log(`${f}: rewrote ${refCount} ease ref${refCount === 1 ? "" : "s"}, stripped ${importsStripped} easings import${importsStripped === 1 ? "" : "s"}`);
  } else {
    console.log(`${f}: no function-form ease found`);
  }
  totalRefs += refCount;
  totalImportsStripped += importsStripped;
}
console.log(`done: ${totalRefs} refs across ${files.length} file${files.length === 1 ? "" : "s"}, ${totalImportsStripped} import${totalImportsStripped === 1 ? "" : "s"} stripped`);
