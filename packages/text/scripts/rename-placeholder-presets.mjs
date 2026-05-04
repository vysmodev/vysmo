// Rewrite the auto-generated placeholder names (`enter/g04znm7l-rotate-x`,
// `exit/g1vl97c7rotate`, etc.) into semantic kebab-case names matching the
// style of the hand-finished presets (`enter/extend-y-scatter`,
// `enter/tilt-in-spring`, `enter/expand-snap`, …).
//
//   node scripts/rename-placeholder-presets.mjs src/presets/generated.ts
//
// Heuristic per preset:
//   1. Find the dominant motion spec — the one whose visual change is the
//      widest (scaled by axis sensitivity).
//   2. Pick a verb based on prop + sign of motion.
//   3. Layer modifiers — `scatter` (any range), `spring`/`bounce`/`snap`
//      (ease family), `depth`/`tunnel` (3D perspective), `loose` (high
//      jitter), `word` (word-split).
//   4. Append the kind prefix and dedupe with `-2`/`-3`/… suffixes.
//
// The script rewrites both the `export const <ident>: Preset` block and
// the matching `{ name, preset }` entry in the registry array at the
// bottom of the file.

import { readFileSync, writeFileSync } from "node:fs";

// Studio placeholder names always look like `g<digit><alnum>+` (e.g.
// `g04znm7l`, `g1qdivm9`). Requiring a digit right after the `g` is the
// discriminator against real curated names that happen to start with a
// short g-word (`glide-…`, `grow-…`, `glow-…`).
const PLACEHOLDER_RE = /^(enter|exit|emphasis)\/g\d[\da-z]{4,}/;

/** Pull out every `export const NAME: Preset = { … };` block. */
function findBlocks(src) {
  const out = [];
  const headerRe = /export const ([A-Za-z_$][\w$]*): Preset = \{/g;
  let m;
  while ((m = headerRe.exec(src)) !== null) {
    const ident = m[1];
    const start = m.index;
    // Brace-count from the opening `{` to find the matching `}`.
    let i = src.indexOf("{", m.index + m[0].length - 1);
    let depth = 0;
    let end = -1;
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end === -1) throw new Error(`unterminated block for ${ident}`);
    // Block ends at the trailing `;`.
    while (end < src.length && src[end] !== ";") end++;
    end++; // include the `;`
    out.push({ ident, start, end, body: src.slice(start, end) });
  }
  return out;
}

function extractName(body) {
  const m = body.match(/name:\s*"([^"]+)"/);
  return m ? m[1] : null;
}

function extractSplit(body) {
  const m = body.match(/split:\s*"([^"]+)"/);
  return m ? m[1] : "character";
}

/** Loose parse: pull each `{ prop: "x", from: …, to: …, … }` out of `animations: [...]`. */
function extractSpecs(body) {
  const animMatch = body.match(/animations:\s*\[([\s\S]*?)\]\s*,?\s*\}/);
  if (!animMatch) return [];
  const block = animMatch[1];
  const specs = [];
  // Each spec is a top-level `{...}` inside the array.
  let depth = 0;
  let start = -1;
  for (let i = 0; i < block.length; i++) {
    const c = block[i];
    if (c === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        specs.push(block.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return specs.map(parseSpec);
}

function parseSpec(s) {
  const prop = (s.match(/prop:\s*"([^"]+)"/) || [, null])[1];
  const fromScalar = parseScalarOrRange(s, "from");
  const toScalar = parseScalarOrRange(s, "to");
  const ease = (s.match(/ease:\s*"([^"]+)"/) || [, null])[1];
  const jitter = Number((s.match(/jitterDelay:\s*([\d.]+)/) || [, "0"])[1]);
  const perspective = Number((s.match(/perspective:\s*([\d.]+)/) || [, "0"])[1]);
  const hasRange = /from:\s*\{|to:\s*\{/.test(s);
  return { prop, fromScalar, toScalar, ease, jitter, perspective, hasRange };
}

function parseScalarOrRange(s, key) {
  const scalar = s.match(new RegExp(`${key}:\\s*(-?[\\d.]+)`));
  if (scalar) return Number(scalar[1]);
  const range = s.match(new RegExp(`${key}:\\s*\\{[^}]*max:\\s*(-?[\\d.]+)`));
  if (range) return Number(range[1]); // approx as max for magnitude
  return null;
}

/** Sensitivity scaling so a 90° rotation isn't compared as equal to 90px translate. */
const SENSITIVITY = {
  opacity: 1,
  scale: 0.5, scaleX: 0.5, scaleY: 0.5,
  rotate: 1 / 90, rotateX: 1 / 90, rotateY: 1 / 90, rotateZ: 1 / 90,
  translateX: 1 / 80, translateY: 1 / 80, translateZ: 1 / 200,
  skewX: 1 / 30, skewY: 1 / 30,
  blur: 1 / 10,
  brightness: 1, contrast: 1, saturate: 1, hueRotate: 1 / 90,
};

function specMagnitude(spec) {
  const sens = SENSITIVITY[spec.prop] ?? 1;
  const from = spec.fromScalar ?? 0;
  const to = spec.toScalar ?? 0;
  return Math.abs(from - to) * sens;
}

/** Verb choice per prop + direction of travel. */
function verbFor(spec) {
  const { prop, fromScalar, toScalar } = spec;
  const from = fromScalar ?? 0;
  const to = toScalar ?? 0;
  switch (prop) {
    case "rotateX": return Math.abs(from - to) > 360 ? "tumble" : "topple";
    case "rotateY": return Math.abs(from - to) > 360 ? "spin" : "swivel";
    case "rotate":
    case "rotateZ": return Math.abs(from - to) > 720 ? "whirl" : Math.abs(from - to) > 360 ? "twirl" : "pivot";
    case "scale": return from < to ? "grow" : "shrink";
    case "scaleX": return from < to ? "stretch-x" : "compress-x";
    case "scaleY": return from < to ? "stretch-y" : "compress-y";
    case "translateX": return Math.abs(from) > 100 ? "drift" : "slide";
    case "translateY": return from > 0 ? "drop" : "rise";
    case "translateZ": return from < 0 ? "approach" : "recede";
    case "skewX": return "slant";
    case "skewY": return "tilt";
    case "blur": return from > to ? "haze" : "fog";
    case "opacity": return "fade";
    case "brightness": return "flash";
    case "contrast": return "punch";
    case "saturate": return "tint";
    case "hueRotate": return "shift";
    default: return prop;
  }
}

function modifiersFor(specs, perspective, split, kind) {
  const mods = [];
  const anyRange = specs.some((s) => s.hasRange);
  const anyHighJitter = specs.some((s) => s.jitter >= 200);
  const has3D = specs.some((s) => /^(rotateX|rotateY|translateZ)$/.test(s.prop)) || perspective > 0;
  const hasTightPerspective = perspective > 0 && perspective < 400;
  const easings = specs.map((s) => s.ease ?? "");
  const hasSpring = easings.some((e) => /elastic|spring|bounce/.test(e));
  const hasBack = easings.some((e) => /^back\./.test(e));

  if (anyRange) mods.push("scatter");
  if (hasSpring) {
    if (easings.some((e) => /bounce/.test(e))) mods.push("bounce");
    else mods.push("spring");
  } else if (hasBack) {
    mods.push("snap");
  }
  if (has3D && hasTightPerspective) mods.push("tunnel");
  else if (has3D && perspective > 700) mods.push("depth");
  if (anyHighJitter && !mods.includes("scatter")) mods.push("loose");
  if (split === "word" && kind === "enter") mods.push("word");
  return mods;
}

function makeName(kind, body) {
  const split = extractSplit(body);
  const specs = extractSpecs(body);
  if (specs.length === 0) return `${kind}/unnamed`;

  // Strip opacity from candidate-for-dominant — opacity is almost always
  // present and would crowd out the actual motion verb.
  const candidates = specs.filter((s) => s.prop !== "opacity");
  const ranked = (candidates.length > 0 ? candidates : specs)
    .map((s) => ({ s, m: specMagnitude(s) }))
    .sort((a, b) => b.m - a.m);
  const dominant = ranked[0].s;

  const perspectiveMatch = body.match(/^\s*perspective:\s*([\d.]+)/m);
  const perspective = perspectiveMatch ? Number(perspectiveMatch[1]) : 0;

  const verb = verbFor(dominant);
  const mods = modifiersFor(specs, perspective, split, kind);
  const slug = [verb, ...mods].join("-");
  return `${kind}/${slug}`;
}

function nameToIdent(slug) {
  // "enter/topple-scatter-word" → "toppleScatterWord"
  const parts = slug.replace(/^[^/]+\//, "").split("-");
  return parts
    .map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join("");
}

const file = process.argv[2];
if (!file) {
  console.error("usage: node rename-placeholder-presets.mjs <generated.ts>");
  process.exit(1);
}

const src = readFileSync(file, "utf8");
const blocks = findBlocks(src);

// Build rename plan.
const seenNames = new Set();
const usedIdents = new Set();

// Pre-seed seenNames with non-placeholder names so we don't collide with curated ones.
for (const b of blocks) {
  const name = extractName(b.body);
  if (!name) continue;
  if (!PLACEHOLDER_RE.test(name)) {
    seenNames.add(name);
    usedIdents.add(b.ident);
  }
}

const renames = []; // { oldIdent, oldName, newIdent, newName }
for (const b of blocks) {
  const oldName = extractName(b.body);
  if (!oldName || !PLACEHOLDER_RE.test(oldName)) continue;
  const kind = oldName.split("/")[0];
  let candidate = makeName(kind, b.body);
  let i = 1;
  let resolved = candidate;
  while (seenNames.has(resolved)) {
    i++;
    resolved = `${candidate}-${i}`;
  }
  seenNames.add(resolved);

  let ident = nameToIdent(resolved);
  let j = 1;
  let resolvedIdent = ident;
  while (usedIdents.has(resolvedIdent)) {
    j++;
    resolvedIdent = `${ident}${j}`;
  }
  usedIdents.add(resolvedIdent);

  renames.push({
    oldIdent: b.ident,
    oldName,
    newIdent: resolvedIdent,
    newName: resolved,
  });
}

// Apply renames. Use word-boundary identifier replacements for the const +
// registry references; literal-string replacement for the name field.
let out = src;
for (const r of renames) {
  // Replace the name string (single occurrence inside the block + inside the registry entry).
  out = out.split(`name: "${r.oldName}"`).join(`name: "${r.newName}"`);
  // Replace the identifier — must be a whole-word match (not a prefix of another).
  out = out.replace(new RegExp(`\\b${r.oldIdent}\\b`, "g"), r.newIdent);
}

writeFileSync(file, out);

console.log(`renamed ${renames.length} placeholder presets`);
const byKind = renames.reduce((acc, r) => {
  const k = r.newName.split("/")[0];
  acc[k] = (acc[k] ?? 0) + 1;
  return acc;
}, {});
for (const [k, n] of Object.entries(byKind)) console.log(`  ${k}: ${n}`);
console.log("\nFirst 10 renames:");
for (const r of renames.slice(0, 10)) {
  console.log(`  ${r.oldName.padEnd(40)} → ${r.newName}`);
}
