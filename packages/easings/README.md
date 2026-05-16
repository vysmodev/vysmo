# @vysmo/easings

22 easing families (linear, power1–4, sine, circ, expo, smooth, back, elastic, bounce, steps, bezier, spring, rough, wiggle, slow, anticipate, expoScale, gravity, breathe) + composition modifiers (chain, reverse, mirror, yoyo, blend, slice). Pure math, zero deps. CSS export via `toCSSLinear` / `toCSSBezier`; reduced-motion helpers; GSAP-style string parser.

[Live curves explorer](https://vysmo.com/easings) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/easings
```

## Quick start

In JavaScript — pass any easing as the `ease` option:

```ts
import { animate } from "@vysmo/animations";
import { power2Out } from "@vysmo/easings";

animate({
  from: 0,
  to: 1,
  duration: 600,
  ease: power2Out,
  onUpdate: (v) => element.style.opacity = String(v),
});
```

In CSS — bake any easing into a `linear()` string:

```ts
import { toCSSLinear } from "@vysmo/easings/css";
import { spring } from "@vysmo/easings";

const ease = spring.with({ stiffness: 220, damping: 18 });

document.documentElement.style.setProperty(
  "--ease-pop",
  toCSSLinear(ease, 32),
);
```

Every export is just a `(t: number) => number` (an `EasingFn`). Use with `animate()`, your own rAF loop, baked to CSS, or anything that takes an easing function. Parametric easings like `spring.with({ ... })` and `bezier(0.25, 0.1, 0.25, 1)` return the same shape — see the catalog below for every option.

## Catalog

<!-- catalog:start -->

Every shipped easing with its variants and parameters. The catalog mirrors the playground at [vysmo.com/easings/docs#catalog](https://vysmo.com/easings/docs#catalog). Categorisation tracks the authoring shape — Core (constant curves), Parametric (curves with `.with({ ... })`), Builder (factory functions).

### Core

#### `linear`

No easing — constant velocity.

**Export:** `linear`

#### `power1`

Quadratic (t²). Mildest power curve.

**Variants:** `power1In` · `power1Out` · `power1InOut`

#### `power2 (cubic)`

Cubic (t³). Workhorse default — CSS's ease is close to power2.out.

**Variants:** `power2In` · `power2Out` · `power2InOut`

#### `power3 (quart)`

Quartic (t⁴). More pronounced easing.

**Variants:** `power3In` · `power3Out` · `power3InOut`

#### `power4 (quint)`

Quintic (t⁵). Dramatic acceleration.

**Variants:** `power4In` · `power4Out` · `power4InOut`

#### `sine`

Sinusoidal (cos/sin-based). Soft and natural.

**Variants:** `sineIn` · `sineOut` · `sineInOut`

#### `circ`

Circular arc. Sharp at one end, flat at the other.

**Variants:** `circIn` · `circOut` · `circInOut`

#### `expo`

Exponential (2^). Extreme — near-zero until the last moments, or vice versa.

**Variants:** `expoIn` · `expoOut` · `expoInOut`

#### `smooth`

Hermite smoothstep (3t² - 2t³). Zero velocity at both endpoints — smoother joins than power2.inOut for chained animations.

**Variants:** `smoothIn` · `smoothOut` · `smoothInOut`

### Parametric

#### `back`

Overshoots the target then returns. Classic 'pull-back' motion.

**Variants:** `backIn` · `backOut` · `backInOut`

| Prop | Type | Default | Values |
|---|---|---|---|
| `overshoot` | number | `1.70158` | 0 – 5, step 0.01 |

#### `elastic`

Spring-like oscillation. Two knobs: amplitude (peak height) and period (frequency).

**Variants:** `elasticIn` · `elasticOut` · `elasticInOut`

| Prop | Type | Default | Values |
|---|---|---|---|
| `amplitude` | number | `1` | 0.1 – 5, step 0.01 |
| `period` | number | `0.3` | 0.05 – 1, step 0.01 |

#### `bounce`

Ball-drop pattern. Four decaying bounces.

**Variants:** `bounceIn` · `bounceOut` · `bounceInOut`

#### `steps`

Discrete staircase. CSS-compatible step positions.

**Export:** `steps`

| Prop | Type | Default | Values |
|---|---|---|---|
| `count` | number | `5` | 1 – 30, step 1 |
| `position` | enum | `end` | `end` · `start` · `none` |

### Builder

#### `bezier`

CSS cubic-bezier. Paste a cubic-bezier() value from CSS or design tools.

**Export:** `bezier`

| Prop | Type | Default | Values |
|---|---|---|---|
| `p1x` | number | `0.42` | 0 – 1, step 0.01 |
| `p1y` | number | `0` | -2 – 2, step 0.01 |
| `p2x` | number | `0.58` | 0 – 1, step 0.01 |
| `p2y` | number | `1` | -2 – 2, step 0.01 |

#### `spring`

Physics-based spring. Stiffness × damping × mass = feel.

**Export:** `spring`

| Prop | Type | Default | Values |
|---|---|---|---|
| `stiffness` | number | `170` | 10 – 1000, step 5 |
| `damping` | number | `26` | 1 – 100, step 1 |
| `mass` | number | `1` | 0.1 – 10, step 0.1 |
| `velocity` | number | `0` | -20 – 20, step 0.5 |

#### `rough`

Jittery noise layered on a base curve. Great for gritty / handheld feel.

**Export:** `rough`

| Prop | Type | Default | Values |
|---|---|---|---|
| `strength` | number | `0.15` | 0 – 0.5, step 0.01 |
| `points` | number | `20` | 5 – 60, step 1 |
| `taper` | enum | `both` | `none` · `in` · `out` · `both` |
| `seed` | number | `42` | 1 – 999, step 1 |

#### `wiggle`

Oscillates between -1 and 1 across [0, 1]. For shake / vibration effects.

**Export:** `wiggle`

| Prop | Type | Default | Values |
|---|---|---|---|
| `wiggles` | number | `10` | 1 – 30, step 1 |
| `type` | enum | `easeOut` | `easeOut` · `easeInOut` · `anticipate` · `uniform` |

#### `slow`

Linear middle section flanked by power-eased edges. For slow-motion feel.

**Export:** `slow`

| Prop | Type | Default | Values |
|---|---|---|---|
| `linearRatio` | number | `0.7` | 0 – 1, step 0.01 |
| `power` | number | `0.7` | 0 – 5, step 0.1 |

#### `anticipate`

Character-animation wind-up: dips backward (in), overshoots past target (out), or both (inOut). Framer Motion style.

**Variants:** `anticipateIn` · `anticipateOut` · `anticipateInOut`

| Prop | Type | Default | Values |
|---|---|---|---|
| `overshoot` | number | `1.525` | 0 – 5, step 0.01 |

#### `expoScale`

Maps [0, 1] for scale animations crossing large ratios (e.g. 0.1→100) so motion feels even.

**Export:** `expoScale`

| Prop | Type | Default | Values |
|---|---|---|---|
| `startScale` | number | `1` | 0.01 – 100, step 0.1 |
| `endScale` | number | `100` | 0.01 – 1000, step 1 |

#### `gravity`

Continuously parameterised power-in. weight=0 floats (linear), weight=1 ≈ Earth fall (power2.in), higher = leaden. One knob instead of picking between named power curves.

**Export:** `gravity`

| Prop | Type | Default | Values |
|---|---|---|---|
| `weight` | number | `1` | 0 – 3, step 0.05 |

#### `breathe`

Continuous oscillation in [0, 1]. cycles=0.5 = single inhale (0 → 1). cycles=1 = inhale + exhale. For idle / ambient animations on opacity, scale, anything in [0, 1].

**Export:** `breathe`

| Prop | Type | Default | Values |
|---|---|---|---|
| `cycles` | number | `1` | 0.5 – 8, step 0.5 |

<!-- catalog:end -->

Spring presets shipped: `gentleSpring`, `wobblySpring`, `stiffSpring`, `slowSpring`, `molassesSpring` — all built on `spring.with(...)`. The power family also exposes GSAP-compatible aliases: `quadIn/Out/InOut`, `cubicIn/Out/InOut`, `quartIn/Out/InOut`, `quintIn/Out/InOut`.

## Composition modifiers

```ts
import {
  reverse, mirror, yoyo, chain, blend, slice,
  power2Out, sineInOut, bounceOut,
} from "@vysmo/easings";

reverse(power2Out);                  // play it backwards
mirror(power2Out);                   // half forward, half reversed
yoyo(sineInOut);                     // out then back — one full oscillation
blend(power2Out, sineInOut, 0.5);    // 50/50 mix at every t
slice(power2Out, 0.2, 0.8);          // use only the middle 60% of the curve

// chain takes an array of segments; each segment owns its own ease + duration.
chain([
  { ease: power2Out, duration: 0.4 },
  { ease: sineInOut, duration: 0.4 },
  { ease: bounceOut, duration: 0.2 },
]);
```

All modifiers return a fresh `EasingFn` — composable, side-effect-free.

## CSS export

```ts
import { toCSSLinear, toCSSBezier, toCSSKeyframes, spring } from "@vysmo/easings";

// CSS `linear()` function — sample any EasingFn into a CSS-compatible curve.
// Second arg is the sample count (positional; default 40).
const css = toCSSLinear(spring.with({ stiffness: 100, damping: 10 }), 24);
// → "linear(0, 0.0123 4.17%, …)"

// Cubic-bezier control points → CSS cubic-bezier() exactly.
toCSSBezier(0.25, 0.1, 0.25, 1);
// → "cubic-bezier(0.25, 0.1, 0.25, 1)"

// Sample as @keyframes percentages for full-fidelity CSS animations.
// Signature: (name, property, valueForProgress, ease, samples?)
toCSSKeyframes(
  "pop",
  "transform",
  (p) => `scale(${1 + p * 0.5})`,
  spring.with({ stiffness: 200 }),
);
```

## Reduced-motion helpers

```ts
import { prefersReducedMotion, respectReducedMotion, power2Out, linear } from "@vysmo/easings";

const ease = respectReducedMotion(power2Out, linear);
// → returns linear when prefers-reduced-motion is set, power2Out otherwise

if (prefersReducedMotion()) { /* skip the animation entirely */ }
```

## GSAP-style string parser

```ts
import { parseEasing } from "@vysmo/easings/parse";

parseEasing("power2.out");                       // → power2Out
parseEasing("back.out(2)");                       // → backOut.with({ overshoot: 2 })
parseEasing("elastic.out(1.2, 0.4)");             // → elasticOut.with({ amplitude, period })
parseEasing("steps(5, start)");                   // → steps(5, "start")
parseEasing("cubic-bezier(0.42, 0, 0.58, 1)");    // → bezier(0.42, 0, 0.58, 1)
```

Useful when easings come from data (presets, JSON, AI agents, etc.) rather than source code.

## Defining your own

```ts
import { defineEasing, defineParametricEasing } from "@vysmo/easings";

// Simple curve
export const easeWithDefaults = defineEasing("my-ease", (t) => 1 - Math.pow(1 - t, 5));

// Parametric (callable with defaults; .with(...) returns a tuned variant)
export const customSpring = defineParametricEasing(
  "my-spring",
  { stiffness: 100 },
  ({ stiffness }) => (t) => 1 - Math.pow(1 - t, stiffness / 50),
);
```

Endpoints are clamped exact (t ≤ 0 → 0, t ≥ 1 → 1) by default. Disable for `steps("start")`-style curves with `{ exactEndpoints: false }`.

## Subpath imports

Tree-shake what you ship by importing from subpaths:

```ts
import { parseEasing } from "@vysmo/easings/parse";
import { toCSSLinear } from "@vysmo/easings/css";
import { prefersReducedMotion } from "@vysmo/easings/reduced-motion";
```

`/parse` pulls in the registry; `/css` pulls in the CSS converters; `/reduced-motion` pulls in the media-query helper. The main entry tree-shakes cleanly when you only import a curve or two.

## Characteristics

- **Pure math.** No DOM, no rAF, no global state. Runs in Node, browser, web workers, deno, bun.
- **Zero runtime dependencies.**
- **Tree-shakable.** Importing one curve ships ~0.2 KB gzipped.
- **Endpoint-correct.** All catalog curves clear `f(0) === 0` and `f(1) === 1`. Property-tested across the catalog.

## License

MIT.
