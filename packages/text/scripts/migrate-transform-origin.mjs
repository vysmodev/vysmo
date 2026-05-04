// One-shot migration from `transformOrigin: "X% Y%"` (or "X% Y% Zpx")
// to `transformOrigin: { x: 0.X, y: 0.Y, z?: Z }`. Run once over
// generated.ts (and any *.ts file passed on argv).
//
//   node scripts/migrate-transform-origin.mjs src/presets/generated.ts
//
// Idempotent: a string already converted to object form is left alone.

import { readFileSync, writeFileSync } from "node:fs";

const RE_3D = /transformOrigin:\s*"(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)px"/g;
const RE_2D = /transformOrigin:\s*"(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%"/g;

function pct(s) {
  // "50" → "0.5", "100" → "1", "0" → "0", "-50" → "-0.5"
  const n = Number(s) / 100;
  // Trim trailing zeros while keeping it a valid number literal
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(6)));
}

function convert(src) {
  let out = src;
  let count = 0;
  out = out.replace(RE_3D, (_m, x, y, z) => {
    count++;
    return `transformOrigin: { x: ${pct(x)}, y: ${pct(y)}, z: ${z} }`;
  });
  out = out.replace(RE_2D, (_m, x, y) => {
    count++;
    return `transformOrigin: { x: ${pct(x)}, y: ${pct(y)} }`;
  });
  return { out, count };
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node migrate-transform-origin.mjs <file>...");
  process.exit(1);
}

let total = 0;
for (const f of files) {
  const src = readFileSync(f, "utf8");
  const { out, count } = convert(src);
  if (count > 0) {
    writeFileSync(f, out);
    console.log(`${f}: rewrote ${count} occurrences`);
  } else {
    console.log(`${f}: no string-form transformOrigin found`);
  }
  total += count;
}
console.log(`done: ${total} total`);
