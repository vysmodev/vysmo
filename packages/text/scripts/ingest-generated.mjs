#!/usr/bin/env node
/**
 * Ingest Studio-generated presets into the library.
 *
 * Workflow:
 *   1. Open `/text/studio?author=1`, roll combos, save the good ones.
 *      Saves persist in localStorage so the working set survives reload.
 *   2. Click `Copy TS` — it bundles every saved combo as a series of
 *      `export const NAME: Preset = { ... };` blocks.
 *   3. Paste that bundle into `packages/text/scripts/_staging.ts`.
 *   4. Run `pnpm --filter @vysmo/text ingest`.
 *
 * What this script does:
 *   - Reads `_staging.ts` (gitignored).
 *   - Parses every `export const NAME: Preset = { ... };` block via
 *     brace-counting (regex would choke on the nested object literals
 *     inside `animations: [...]`).
 *   - Groups the blocks by their `name: "kind/..."` prefix.
 *   - Collects every easing identifier mentioned in any block so the
 *     destination file's import list is correct.
 *   - Reads any blocks already in `src/presets/generated.ts` and
 *     **merges** them with the staging blocks. Duplicate names are
 *     resolved in favour of the staging entry (newer wins), so re-
 *     ingesting the same Studio export is idempotent.
 *   - Writes the merged set back to `src/presets/generated.ts` —
 *     `presets/index.ts` spreads `ALL_GENERATED` into the runtime
 *     registry alongside the handcurated entries.
 *
 * Merge-not-replace lets you author in phases: ingest a first batch
 * of 30, come back next session and ingest 50 more. Old entries
 * survive unless explicitly overwritten by a new entry sharing the
 * same `name`. To remove an entry, edit `generated.ts` directly.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const stagingPath = resolve(__dirname, "_staging.ts");
const generatedPath = resolve(__dirname, "../src/presets/generated.ts");

if (!existsSync(stagingPath)) {
  console.error(`✗ Staging file missing: ${stagingPath}`);
  console.error(`  Paste your Copy-TS output there and re-run.`);
  process.exit(1);
}

const stagingSource = readFileSync(stagingPath, "utf8");
const existingSource = existsSync(generatedPath)
  ? readFileSync(generatedPath, "utf8")
  : "";

// ─── Parse blocks ──────────────────────────────────────────────────

/**
 * Walk the source, finding every `export const X: Preset = { ... };`
 * block. Brace-counting handles the nested objects inside
 * `animations: [...]`. String-aware skipping prevents `}` inside
 * `"prop"` strings from confusing the depth counter.
 */
function parseBlocks(src) {
  const startRe = /export\s+const\s+(\w+)\s*:\s*Preset\s*=\s*\{/g;
  const blocks = [];
  let match;
  while ((match = startRe.exec(src)) !== null) {
    const ident = match[1];
    const startIdx = match.index;
    const openIdx = match.index + match[0].length - 1; // index of '{'
    let depth = 1;
    let i = openIdx + 1;
    while (i < src.length && depth > 0) {
      const c = src[i];
      if (c === '"' || c === "'" || c === "`") {
        // Skip string literal
        const quote = c;
        i++;
        while (i < src.length && src[i] !== quote) {
          if (src[i] === "\\") i += 2;
          else i++;
        }
        i++;
      } else if (c === "/" && src[i + 1] === "/") {
        // Line comment
        while (i < src.length && src[i] !== "\n") i++;
      } else if (c === "/" && src[i + 1] === "*") {
        // Block comment
        i += 2;
        while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
        i += 2;
      } else if (c === "{") {
        depth++;
        i++;
      } else if (c === "}") {
        depth--;
        i++;
      } else {
        i++;
      }
    }
    // Skip whitespace, expect ';'
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] === ";") i++;
    const block = src.slice(startIdx, i);
    blocks.push({ ident, block });
    startRe.lastIndex = i;
  }
  return blocks;
}

const stagingBlocks = parseBlocks(stagingSource);
if (stagingBlocks.length === 0) {
  console.error(`✗ No \`export const X: Preset = { ... };\` blocks found in ${stagingPath}.`);
  console.error(`  Did you paste the Copy-TS output correctly?`);
  process.exit(1);
}

const existingBlocks = parseBlocks(existingSource);

// ─── Extract names + collect easings + merge ───────────────────────

const NAME_RE = /name:\s*"([^"]+)"/;
const EASE_RE = /\bease:\s*([A-Za-z_$][\w$]*)/g;

/** Pull out a block's preset name + collect its easing identifiers. */
function annotate(parsed, source) {
  const out = [];
  const rejected = [];
  for (const { ident, block } of parsed) {
    const nameMatch = NAME_RE.exec(block);
    if (!nameMatch) {
      rejected.push({ ident, reason: "no `name:` field", source });
      continue;
    }
    const name = nameMatch[1];
    const easings = new Set();
    EASE_RE.lastIndex = 0;
    let m;
    while ((m = EASE_RE.exec(block)) !== null) easings.add(m[1]);
    out.push({ ident, name, block, easings, source });
  }
  return { entries: out, rejected };
}

const stagingAnnotated = annotate(stagingBlocks, "staging");
const existingAnnotated = annotate(existingBlocks, "existing");
const rejected = [...stagingAnnotated.rejected, ...existingAnnotated.rejected];

// Merge: existing first, then staging — staging wins on duplicate name.
// Within staging itself, last definition wins (matches the JS module
// shadowing rule, so behaviour is intuitive).
const byName = new Map();
const overwrittenByStaging = [];
for (const entry of existingAnnotated.entries) byName.set(entry.name, entry);
for (const entry of stagingAnnotated.entries) {
  if (byName.has(entry.name) && byName.get(entry.name).source === "existing") {
    overwrittenByStaging.push(entry.name);
  }
  byName.set(entry.name, entry);
}

const accepted = [...byName.values()];

if (accepted.length === 0) {
  console.error(`✗ Couldn't accept any blocks from staging or existing generated.ts.`);
  for (const r of rejected) console.error(`  - ${r.ident}: ${r.reason} (${r.source})`);
  process.exit(1);
}

// Final easing set is the union across every accepted block.
const easings = new Set();
for (const entry of accepted) {
  for (const e of entry.easings) easings.add(e);
}

// ─── Emit generated.ts ────────────────────────────────────────────

const sortedEasings = [...easings].sort();
const easingImport = sortedEasings.length > 0
  ? `import { ${sortedEasings.join(", ")} } from "@vysmo/easings";\n`
  : "";

const blocksText = accepted.map(({ block }) => block).join("\n\n");

const registryEntries = accepted
  .map(({ ident, name }) => `  { name: ${JSON.stringify(name)}, preset: ${ident} },`)
  .join("\n");

const out = `// AUTO-GENERATED — do not edit by hand.
// Written by \`scripts/ingest-generated.mjs\` from \`scripts/_staging.ts\`.
// Run \`pnpm --filter @vysmo/text ingest\` to refresh.
//
// ${accepted.length} preset${accepted.length === 1 ? "" : "s"} ingested.

import type { Preset } from "../types.js";
${easingImport}
${blocksText}

/**
 * Every Studio-generated preset, paired with its preset name. Index.ts
 * spreads this into the runtime registry alongside the handcurated
 * entries.
 */
export const ALL_GENERATED: readonly { name: string; preset: Preset }[] = [
${registryEntries}
];
`;

writeFileSync(generatedPath, out);

// ─── Report ──────────────────────────────────────────────────────

const byKind = { enter: 0, exit: 0, emphasis: 0, other: 0 };
for (const { name } of accepted) {
  const kind = name.split("/")[0];
  if (kind in byKind) byKind[kind]++;
  else byKind.other++;
}

const stagingNew = stagingAnnotated.entries.filter(
  (e) => !existingAnnotated.entries.some((x) => x.name === e.name),
).length;

console.log(`✓ Wrote ${accepted.length} preset${accepted.length === 1 ? "" : "s"} → ${generatedPath}`);
console.log(`    enter:    ${byKind.enter}`);
console.log(`    exit:     ${byKind.exit}`);
console.log(`    emphasis: ${byKind.emphasis}`);
if (byKind.other > 0) console.log(`    other:    ${byKind.other}  ← unexpected kind, check names`);

console.log(``);
console.log(`Merge summary:`);
console.log(`    + ${stagingNew} new from staging`);
console.log(`    ↻ ${overwrittenByStaging.length} overwritten (same name in both)`);
console.log(`    = ${existingAnnotated.entries.length - overwrittenByStaging.length} kept from existing generated.ts`);

if (rejected.length > 0) {
  console.log(``);
  console.log(`⚠ Rejected ${rejected.length} block${rejected.length === 1 ? "" : "s"}:`);
  for (const r of rejected) console.log(`    ${r.ident}: ${r.reason} (${r.source})`);
}

console.log(``);
console.log(`Next:`);
console.log(`  pnpm --filter @vysmo/text typecheck`);
console.log(`  pnpm --filter @vysmo/text test`);
