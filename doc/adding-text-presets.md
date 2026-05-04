# Adding text presets to @vysmo/text

Operational guide for growing the preset catalog. Keep this open while
authoring.

---

## The strategy

`@vysmo/text` ships split + animate as a tiny core; **the curated preset
catalog is the value**. Without the presets, the library is commodity.
With them, it becomes the Motion/Framer-Motion-for-kinetic-typography
thing nobody else in the ecosystem has.

We ship every preset in source. A dev who installs `@vysmo/text` gets the
catalog for free:

```ts
import { animateText } from "@vysmo/text";
animateText(element, { preset: "enter/fade-up" });
```

A dev who cares about bundle size can import the preset object directly
and the tree-shaker drops the rest of the catalog:

```ts
import { animateText, fadeUp } from "@vysmo/text";
animateText(element, { preset: fadeUp });
```

Same `preset` option accepts either form — string lookup for convenience,
object reference for tree-shaking.

## The two demo pages

- **`text.html`** — preset gallery. Built for **devs** exploring the
  catalog: pick a preset, tweak split/stagger, watch it loop.
- **`text-studio.html`** — random authoring tool. Built for **us**
  growing the catalog. Devs don't need it.

## Workflow for adding presets

### 1. Generate

Open `/text-studio.html`. Pick a category (enter / exit / emphasis), type
your demo text, hit **Regenerate** until a batch has something you like.
Every batch is 12 random combos seeded from `Date.now()` — they're
reproducible per session but fresh across sessions.

### 2. Save without naming

Click the ☆ on every card you like. Don't think about names yet. Build
up a pool first — `n` of good candidates, then curate.

### 3. Copy TS in bulk

When the saved count looks reasonable (say 10-20), hit **Copy TS**. You
get a blob like:

```ts
export const enter1TranslateY: Preset = {
  name: "enter/enter1-translate-y",
  split: "character",
  stagger: 40,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: power2Out },
    { prop: "translateY", from: 42, to: 0, duration: 550, ease: backOut },
  ],
};
```

Paste it in a scratch file. Don't commit the placeholder names.

### 4. Rename the batch

Now the naming pass. Placeholder names (`enter1TranslateY`) are obviously
temporary — so are the preset `name: "enter/enter1-translate-y"` strings.
Replace both per preset.

**Rules:**
- All lowercase, kebab-case: `slide-rise`, not `SlideRise` or `slideRise`.
- Namespaced by category: `enter/`, `exit/`, `emphasis/`.
- Unique across the catalog — add a modifier if needed (`fade-up-slow`).
- Short. One or two words. Three max.

**Patterns that work:**

| Pattern | Examples |
|---|---|
| Motion verb | `rise`, `drift`, `fall`, `slam`, `tilt`, `unfold`, `slip`, `dive` |
| Material metaphor | `ink`, `smoke`, `glass`, `foil`, `petal`, `ribbon`, `paper` |
| Physics metaphor | `bounce`, `spring`, `overshoot`, `recoil`, `settle`, `snap` |
| 3D metaphor | `flip-x`, `flip-y`, `door-open`, `coin-flip`, `billboard`, `cube-in` |
| Emotional | `anxious`, `confident`, `playful` — use sparingly, easy to overdo |

**Patterns to avoid:**
- Prop names as names: `translate-y`, `rotate-x` — describes the
  mechanism, not the feel.
- Numbers as names: `enter-1`, `style-7` — unmemorable.
- Long phrases: `fade-in-from-below-with-spring`.

### 5. Land each preset in source

Per preset, five edits. (Worth automating when we hit ~50+ presets — for
now, do it manually.)

**a. Paste the `Preset` literal** into the matching category file:
- `enter/*` → [packages/text/src/presets/enter.ts](../packages/text/src/presets/enter.ts)
- `exit/*` → [packages/text/src/presets/exit.ts](../packages/text/src/presets/exit.ts)
- `emphasis/*` → [packages/text/src/presets/emphasis.ts](../packages/text/src/presets/emphasis.ts)

**b. Add any new easing imports** at the top of that file. The studio
already emits named easing identifiers (e.g. `ease: backOut`) so you just
need to add them to the existing import block.

**c. Add the name string to the `PresetName` union** in
[packages/text/src/types.ts](../packages/text/src/types.ts):

```ts
export type PresetName =
  | "enter/fade-up"
  | "enter/slide-rise" // ← new
  | ...;
```

**d. Register it in** [packages/text/src/presets/index.ts](../packages/text/src/presets/index.ts):

```ts
import { slideRise } from "./enter.js";

const PRESETS: Record<PresetName, Preset> = {
  "enter/slide-rise": slideRise, // ← new
  ...
};

export { ..., slideRise }; // ← new
```

**e. Done.** The test suite and gallery pick it up automatically.

### 6. Verify

```bash
pnpm --filter @vysmo/text test      # presets.test.ts auto-covers every registered preset
pnpm typecheck                      # ensures the PresetName union matches the PRESETS map
pnpm dev                            # open /text.html to see it loop
```

The `presets.test.ts` suite enforces three invariants on every preset:

- Enter presets **start invisible** (opacity 0 at t=0).
- Exit presets **end invisible** (opacity 0 at end of timeline).
- Emphasis presets **return to rest state** at the end (mod 360° for
  rotations).

If a new preset fails one of these, either fix the preset or the preset
doesn't belong in that category.

## What makes a good preset

- **Reads clean.** Motion feels natural, not aggressive.
- **Caps quickly.** Entry under 800ms feels snappy; exits should be
  faster (150–450ms). Emphasis under 600ms.
- **Purposeful 3D.** Only set `perspective` when `rotateX/Y` or
  `translateZ` actually benefit. Flat `rotate` doesn't need it.
- **One hero axis.** 2–3 specs per preset with one dominant motion —
  more than that reads as chaotic.
- **Respects rest.** Emphasis presets must return to their exact rest
  state (the invariant enforces this).

## Script considerations

Character mode breaks contextual shaping in Arabic, Devanagari, Lao,
Khmer, etc. — each grapheme lands in its own inline-block and the font
shaper can't apply contextual forms. For presets that need to work
cross-script, set `split: "word"`. Character mode stays fine for Latin,
Greek, Cyrillic, Hebrew, CJK, Kana.

## The 300 target

The playbook from CoolText (2014): random generator → human curation →
shipped catalog. The studio exists so we can sit and hit Regenerate for
an hour and walk away with 40 keepers, not hand-tune 40 presets from
scratch.

Target distribution once full: **100 enter / 100 exit / 100 emphasis**.
The gallery splits by category so they don't all compete for attention.

When we cross ~50 total presets, revisit: automated "apply preset"
endpoint in the dev server; separate tree-shakable entry points
(`@vysmo/text/presets/enter` etc.); CI check that every preset renders
without console errors.
