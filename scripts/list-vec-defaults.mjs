// One-shot: list every transition param whose default is an array
// (vec2 / vec3 / vec4) so we can decide which need real controls.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "..", "packages", "transitions", "src", "transitions");
const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "define.ts");

for (const file of files) {
  const src = readFileSync(join(dir, file), "utf8");
  const m = src.match(/defaults:\s*\{([\s\S]*?)\n\s*\},/);
  if (!m) continue;
  const body = m[1];
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /\[[^\]]*\]/.test(l));
  if (lines.length === 0) continue;
  console.log(file.replace(".ts", ""));
  for (const l of lines) console.log("  " + l);
}
