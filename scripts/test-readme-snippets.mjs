#!/usr/bin/env node
/**
 * README doctest — type-checks every `ts` and `tsx` code block in every
 * public package README (plus the root README) against the actual
 * workspace TypeScript APIs.
 *
 * Why: README copy-paste examples are the highest-stakes documentation
 * surface — broken examples make us look unserious. They also rot
 * silently as APIs change. This script makes that rot a build failure.
 *
 * How:
 *   1. Find every packages/<x>/README.md (plus the repo root README).
 *   2. Extract every fenced ```ts``` or ```tsx``` code block. Skip
 *      blocks whose first content line is `// @no-check` — escape hatch
 *      for snippets that are illustrative pseudocode (e.g. shader GLSL
 *      inside a template literal, hypothetical future APIs).
 *   3. Write each snippet to a temp directory as a real .ts/.tsx file.
 *      Imports are lifted to module scope; the rest of the snippet is
 *      wrapped in `async function _doctest()` so top-level await works
 *      and the inner scope can shadow ambient identifiers like
 *      `canvas` / `image` / `element` without conflict.
 *   4. Run `tsc --noEmit` on the temp directory. The tsconfig points
 *      `@vysmo/*` at this monorepo's source via path mapping, so
 *      cross-package imports type-check live without needing a build.
 *   5. Exit with tsc's status. Failures point back at the source file +
 *      line because the wrapper preserves a `// Source:` header.
 *
 * Trade-offs:
 * - Type-checks API surface only — doesn't execute snippets. A snippet
 *   that compiles but throws at runtime still passes (acceptable: the
 *   common failure mode is renamed/removed exports, which tsc catches).
 * - Common ambient identifiers (canvas, image, element, runner, etc.)
 *   are declared as `any` or the appropriate DOM type in
 *   _ambient.d.ts. If a README introduces a new ambient name, add it
 *   there.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, basename, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TMP = join(ROOT, ".tmp-readme-doctest");

// ---------------------------------------------------------------------
// Discover READMEs
// ---------------------------------------------------------------------

function findReadmes() {
  const out = [];
  const pkgs = join(ROOT, "packages");
  if (existsSync(pkgs)) {
    for (const ent of readdirSync(pkgs, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const p = join(pkgs, ent.name, "README.md");
      if (existsSync(p)) out.push(p);
    }
  }
  const rootReadme = join(ROOT, "README.md");
  if (existsSync(rootReadme)) out.push(rootReadme);
  return out;
}

// ---------------------------------------------------------------------
// Extract fenced ```ts / ```tsx blocks with source line numbers.
// ---------------------------------------------------------------------

function extractSnippets(path) {
  const src = readFileSync(path, "utf8");
  const lines = src.split("\n");
  const snippets = [];

  let inBlock = false;
  let lang = null;
  let firstContentLine = 0; // 1-based line in the README where snippet content starts
  let buf = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = line.match(/^```(ts|tsx|typescript)\s*$/);
    if (open && !inBlock) {
      inBlock = true;
      lang = open[1] === "typescript" ? "ts" : open[1];
      firstContentLine = i + 2; // next line, 1-based
      buf = [];
      continue;
    }
    if (inBlock && line.match(/^```\s*$/)) {
      const firstNonEmpty = buf.find((l) => l.trim().length > 0) ?? "";
      if (firstNonEmpty.trim() !== "// @no-check") {
        snippets.push({ lang, lineInReadme: firstContentLine, code: buf.join("\n") });
      }
      inBlock = false;
      lang = null;
      buf = [];
      continue;
    }
    if (inBlock) buf.push(line);
  }
  return snippets;
}

// ---------------------------------------------------------------------
// Wrap a snippet into a self-contained TS file.
// Lifts import statements to module top; wraps the rest in an async
// function so top-level await works and inner declarations can shadow
// ambient identifiers without "duplicate identifier" errors.
// ---------------------------------------------------------------------

// Substitute common docs-only pseudocode patterns with valid-but-trivial
// expressions so the surrounding snippet still type-checks. We're not
// trying to make the snippets *runnable* — we just want broken @vysmo
// API references (renamed exports, wrong option names) to surface as
// real tsc errors instead of being masked by syntax noise from
// illustrative placeholders.
function preprocessSnippet(code) {
  return code
    // `/* ... */` or `/* … */` as a placeholder body → empty block.
    // Handles both ASCII three-dot and U+2026 ellipsis. Snippets like
    // `(value) => /* ... */` become `(value) => {}` (legal void return).
    .replace(/\/\*\s*(?:\.\.\.|…)\s*\*\//g, "{}")
    // `[...]` as an illustrative array (just an ellipsis, no
    // identifier) → empty array. Real spread syntax `[...arr]` keeps
    // working because the identifier requirement excludes it.
    .replace(/\[\s*(?:\.\.\.|…)\s*\]/g, "[]");
}

function wrapSnippet(snippet, sourcePath, sourceLine) {
  // Match import statements, including multi-line `import { a, b, c } from "..."`.
  // Conservative: only matches well-formed imports terminated by `from "..."` (`;` optional).
  const importRe = /^\s*import\s+(?:type\s+)?(?:[^"';\n{]+|\{[\s\S]*?\})\s+from\s+["'][^"']+["'];?/gm;
  const imports = [];
  let m;
  const code = preprocessSnippet(snippet.code);
  while ((m = importRe.exec(code)) !== null) imports.push(m[0]);
  const body = code.replace(importRe, "").trimEnd();

  const rel = relative(ROOT, sourcePath);
  const header = `// Source: ${rel} (line ${sourceLine})\n/* eslint-disable */\n`;

  // If the snippet contains a top-level `export`, treat it as a
  // standalone module — wrapping `export const X = ...` inside a
  // function is a syntax error, and these "here's a complete file"
  // examples rarely use unbound globals anyway.
  if (/^\s*export\s/m.test(body)) {
    return `${header}${imports.join("\n")}\n\n${body}\n`;
  }

  // Otherwise wrap in an async function so top-level await is legal
  // and inner declarations can shadow ambient identifiers like
  // \`canvas\` / \`image\` without colliding with the .d.ts.
  const indentedBody = body
    .split("\n")
    .map((l) => (l.length === 0 ? "" : "  " + l))
    .join("\n");

  return `${header}${imports.join("\n")}

async function _doctestExample(): Promise<void> {
${indentedBody}
}

export { _doctestExample };
`;
}

// ---------------------------------------------------------------------
// Ambient declarations for identifiers READMEs reference without
// declaring (e.g. `canvas`, `image`). Real DOM types where known;
// `any` otherwise. Add new names here when a snippet legitimately uses
// one. Snippets that declare their OWN canvas/image (`const canvas = ...`)
// inside the wrapper's async function scope will shadow these.
// ---------------------------------------------------------------------

const AMBIENT = `// Ambient declarations for README code blocks.
// Generated by scripts/test-readme-snippets.mjs — do not edit by hand.

declare const canvas: HTMLCanvasElement;
declare const image: HTMLImageElement;
declare const img: HTMLImageElement;
declare const element: HTMLElement;
declare const section: HTMLElement;
declare const container: HTMLElement;
declare const fromImg: HTMLImageElement;
declare const toImg: HTMLImageElement;
declare const imageA: HTMLImageElement;
declare const imageB: HTMLImageElement;
declare const video: HTMLVideoElement;
declare const existingImageElement: HTMLImageElement;

// Common runtime identifiers that snippets assume exist. \`any\` is
// intentional — we want to catch API drift on the @vysmo surface,
// not type errors on caller-provided values.
declare const runner: any;
declare const onUpdate: any;
declare const flip: any;
declare const flipbook: any;
declare const show: any;
declare const slides: any;
declare const pages: any;
declare const obs: any;
declare const from: any;
declare const to: any;
declare const progress: number;
declare const el: HTMLElement;
declare const spec: any;
declare const replayCount: number;

// React-component shorthand identifiers — snippets show JSX fragments
// without restating the import line each time. Declaring as \`any\`
// keeps the JSX type-checking quiet without coupling to the wrapper's
// actual props type.
declare const AnimateText: any;
declare const Slideshow: any;
declare const Flipbook: any;
declare const Transition: any;

// Package-level identifiers that fragment-style snippets reference
// without restating the import. Same rationale: README chapters
// after the Quick start often show only the relevant API call,
// assuming the reader knows where it came from.
declare const animateText: any;
declare const createSlideshow: any;
declare const createFlipbook: any;
declare const createScrollProgress: any;
declare const createScrollTransition: any;
declare const createScrollEffect: any;
declare const bezier: any;
declare const pageCurl: any;
declare const dissolve: any;
declare const crossZoom: any;
declare const paintBleed: any;
declare const blur: any;
declare const bloom: any;
declare const splitText: any;
`;

// ---------------------------------------------------------------------
// tsconfig that resolves @vysmo/* to the workspace sources.
// ---------------------------------------------------------------------

const TSCONFIG = {
  compilerOptions: {
    strict: true,
    // noImplicitAny intentionally OFF: README snippets are illustrative
    // and routinely omit param types on callbacks (e.g.
    // `(from, to) => ...`). We're checking @vysmo API surface — caller
    // type discipline isn't this tool's concern.
    noImplicitAny: false,
    noEmit: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    target: "ES2022",
    module: "ESNext",
    moduleResolution: "Bundler",
    esModuleInterop: true,
    skipLibCheck: true,
    jsx: "react-jsx",
    lib: ["DOM", "DOM.Iterable", "ES2022"],
    baseUrl: ".",
    paths: {
      // Default to each package's src entry, then enumerate every
      // subpath export the @vysmo/* packages actually expose so README
      // imports of `@vysmo/easings/css` etc. resolve to the right file.
      "@vysmo/easings/css": ["../packages/easings/src/css"],
      "@vysmo/easings/parse": ["../packages/easings/src/parse"],
      "@vysmo/easings/reduced-motion": ["../packages/easings/src/reduced-motion"],
      "@vysmo/*": ["../packages/*/src"],
    },
  },
  include: ["./*.ts", "./*.tsx", "./_ambient.d.ts"],
};

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

const readmes = findReadmes();
console.log(`Found ${readmes.length} READMEs`);

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
writeFileSync(join(TMP, "_ambient.d.ts"), AMBIENT);
writeFileSync(join(TMP, "tsconfig.json"), JSON.stringify(TSCONFIG, null, 2));

let total = 0;
for (const readme of readmes) {
  const tag = readme === join(ROOT, "README.md") ? "root" : basename(dirname(readme));
  const snippets = extractSnippets(readme);
  snippets.forEach((s, i) => {
    const ext = s.lang === "tsx" ? "tsx" : "ts";
    const fname = `${tag}-${String(i).padStart(2, "0")}-line${s.lineInReadme}.${ext}`;
    writeFileSync(join(TMP, fname), wrapSnippet(s, readme, s.lineInReadme));
    total++;
  });
}
console.log(`Extracted ${total} code snippets to ${relative(ROOT, TMP)}`);

const tscBin = join(ROOT, "node_modules", ".bin", "tsc");
if (!existsSync(tscBin)) {
  console.error(`tsc binary not found at ${tscBin}. Run \`pnpm install\` first.`);
  process.exit(2);
}
const result = spawnSync(tscBin, ["-p", TMP], { stdio: "inherit" });
process.exit(result.status ?? 1);
