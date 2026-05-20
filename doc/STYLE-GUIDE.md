# `@vysmo/*` style guide

Naming and structural conventions for code shipped under the `@vysmo/*` scope. New packages and contributions follow these rules; existing packages migrate when touched.

This is reference material — read once, refer back as needed.

---

## Package names

| Kind | Pattern | Examples |
|---|---|---|
| Engine / primitive | single word | `@vysmo/canvas`, `@vysmo/timeline`, `@vysmo/elements`, `@vysmo/cli` |
| Compound primitive | hyphenated | `@vysmo/gl-core`, `@vysmo/transitions`, `@vysmo/animations` |
| React wrapper | `<x>-react` | `@vysmo/canvas-react`, `@vysmo/transitions-react` |
| Editor primitive | `editor-<feature>` | `@vysmo/editor-viewport`, `@vysmo/editor-timeline`, `@vysmo/editor-properties`, `@vysmo/editor-assets`, `@vysmo/editor-toolbar` |
| Pre-composed editor | `editor` | `@vysmo/editor` |
| Future framework wrappers | `<x>-<framework>` | `@vysmo/canvas-vue` (demand-driven only) |

---

## Sub-paths

| Path | Purpose | Semver |
|---|---|---|
| `@vysmo/<x>` | Public stable API | Full semver — breaking change = major |
| `@vysmo/<x>/internal` | Relaxed-contract escape hatch (same MIT) | Signatures may change between minor versions |

No per-feature sub-paths (no `@vysmo/elements/text`, no `@vysmo/transitions/cross-zoom`). Tree-shaking is handled by `"sideEffects": false` + named imports.

---

## File names

| File type | Convention | Example |
|---|---|---|
| Vanilla TS (logic, helpers) | kebab-case | `texture-cache.ts`, `paint-bleed.ts`, `validate-composition.ts` |
| React components | PascalCase | `Canvas.tsx`, `EditorViewport.tsx` |
| React hooks | camelCase, `use` prefix | `useRenderer.ts`, `usePlayback.ts` |
| Tests | mirror source + `.test.ts` | `texture-cache.test.ts` |
| Tier-3 implementation | inside `_impl/` directory | `_impl/migrations.ts` |
| Tier-2 entry | `internal.ts` at `src/` root | exposes via `@vysmo/<x>/internal` |

---

## Function names

| Pattern | Use | Example |
|---|---|---|
| `create<Noun>` | Construct a value | `createText`, `createComposition`, `createElement` |
| `define<Noun>` | Register an extension point | `defineElement`, `definePropKind`, `defineTransition`, `defineEffect` |
| `<verb><Noun>` | Operate on a noun | `validateComposition`, `parseComposition`, `serializeComposition`, `compileAnimatable`, `walkElements`, `walkKeyframes` |
| `resolve<Noun>At<Context>` | Look up a value at a context | `resolveAtTime`, `resolveAssetUrl` |
| `use<Thing>` | React hook | `useRenderer`, `usePlayback`, `useViewportSelection` |
| `is<Predicate>` | Boolean predicate (standalone function) | `isRawPixels`, `isWebGLTexture`, `isSizedTexture` |
| `on<Event>` | Event handler in props/options | `onContextLost`, `onChange`, `onComplete` |

---

## Type names

| Pattern | Use | Example |
|---|---|---|
| PascalCase | All types | `Composition`, `ElementDefinition`, `RenderOptions` |
| **No `I` prefix** for interfaces | TypeScript convention | `Composition`, not `IComposition` |
| `<Noun>Result` | Operation result (discriminated union for fallible ops) | `ValidationResult`, `ParseResult`, `RenderResult` |
| `<Noun>Options` | Options bag for a function/constructor | `RunnerOptions`, `RenderOptions` |
| `<Noun>Props` | Props for a component or element | `TextProps`, `CanvasProps` |
| `<Noun>Spec` | Specification consumed by `create*` / `define*` | `CompositionSpec`, `ElementDefinitionSpec` |
| `<Noun>Error` | Error data shape | `ValidationError`, `ParseError` |

**`type` vs `interface`**: default to `type`. Use `interface` only when consumers may augment via module augmentation (rare).

---

## Generic type parameters

| Pattern | Use | Example |
|---|---|---|
| Single letter | Meaning is obvious | `Array<T>`, `WeakMap<K, V>` |
| `T<Noun>` | Multiple type params or non-obvious context | `defineElement<TProps>`, `defineEffect<P extends UniformParams>` |

---

## Constants

| Pattern | Use | Example |
|---|---|---|
| `SCREAMING_SNAKE_CASE` | True module-level constants | `ALL_TRANSITIONS`, `ALL_EFFECTS`, `ALL_ELEMENTS`, `FULLSCREEN_VERTEX_SHADER`, `INTERNAL_FIELDS` |
| `PascalCase` | Namespace-style constant objects | `PropKind` |
| `camelCase` | Module-level vars that are mutable or non-constant | `defaultRunner`, `cachedPrograms` |

---

## Booleans

**Options / props** (consumer is setting state):

| Use | Avoid |
|---|---|
| `interactive: true` | `disabled: false` (double-negative when default is on) |
| `autoplay: true` | `noAutoplay: false` |
| `loop: true` | `shouldLoop: true` (verbose) |

**Object state** (reading / exposing a flag):

| Use | Example |
|---|---|
| `is<State>` | `isLoading`, `isPlaying`, `isContextLost` |
| `has<Thing>` | `hasError`, `hasFocus` |

---

## Errors

| Element | Convention | Example |
|---|---|---|
| Error code | `SCREAMING_SNAKE_CASE`, stable namespace | `E_INVALID_PROP`, `E_MIGRATION_FAILED`, `E_BUFFER_TOO_SMALL` |
| Error message | Sentence with actionable fix at end | `"RawPixels buffer is too small for 1920×1080 RGBA8 (need 8294400 bytes, got 1024). Pass a buffer with the full dimension."` |
| Error path (validation) | dot/bracket notation matching JSON | `"elements[3].props.text"` |

Error codes live in each package's `_impl/errors.ts` and are re-exported from `internal.ts` so programmatic consumers (cloud service, i18n layers, structured-logging consumers) can dispatch on codes without parsing message strings.

---

## GLSL conventions

| Pattern | Convention |
|---|---|
| Uniforms | `uPascalCase` matching a `camelCase` key in `defaults` (`uSoftness` ↔ `softness: 0.1`) |
| Attributes (mesh vertex shaders) | `aCamelCase` (`aPosition`, `aUv`, `aOffset`) |
| Varyings | `vCamelCase` (`vUv`) |
| Helper functions | `camelCase` (`getFromColor`, `mirrorUv`) |
| Internal coordinate frame | normalized [0,1] UV with y-up — `vUv.y=0` is canvas bottom |

---

## Schema migrations

| Pattern | Convention |
|---|---|
| Migration function name | `migrate_<from>_to_<to>` (e.g., `migrate_1_0_to_1_1`) |
| Schema version string | `"major.minor"` (e.g., `"1.0"`, `"1.2"`) |

Underscores in `migrate_1_0_to_1_1` are intentional — dots aren't valid in identifiers, and `migrate10To11` ambiguates against version `10` → `11`.

---

## Composition data field names

`camelCase` everywhere in composition JSON. No `snake_case`, no `kebab-case`.

```json
{
  "schemaVersion": "1.0",
  "width": 1920,
  "height": 1080,
  "elements": [
    {
      "type": "text",
      "props": {
        "fontSize": 48,
        "textAnimation": { "in": { ... }, "loop": { ... } }
      }
    }
  ]
}
```

---

## Tier-system reminders

Every package has three visibility tiers — see internal architecture docs for details. Quick summary:

| Tier | Path | What goes here |
|---|---|---|
| 1. Public stable | `src/index.ts` → `@vysmo/<x>` | Documented public API, semver-stable |
| 2. Escape hatch | `src/internal.ts` → `@vysmo/<x>/internal` | Plug-points for advanced consumers, monorepo, cloud service. Same MIT, relaxed semver |
| 3. Package-private | `src/_impl/*` | Unreachable from outside the package via Node's resolver |

`_impl/` is not in the `exports` field — Node won't resolve it from outside.

CI enforces: no symbol exported from both `index.ts` and `internal.ts`; no file in `_impl/` imported from outside its package; no `@internal`-marked symbols in `index.ts`.

---

## Linting

Where possible, conventions above are enforced by lint rules (`eslint-plugin-unicorn`, `eslint-plugin-react-hooks`, custom rules in `eslint-config-vysmo`). Where not, code review + JSDoc on public surfaces catch the rest.
