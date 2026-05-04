# @vysmo/easings

Curated easing catalog (40+ named curves) + parametric builders (spring, bezier, wiggle, rough, anticipate) + composition modifiers (chain, reverse, mirror, yoyo, blend, slice). Pure math, zero deps. CSS export via `toCSSLinear` / `toCSSBezier`; reduced-motion helpers; GSAP-style string parser.

[Live curves explorer](https://vysmo.com/easings) · [Source](https://github.com/vysmodev)

## Install

```bash
pnpm add @vysmo/easings
```

## Quick start

```ts
import { animate } from "@vysmo/animations";
import { power2Out, spring, bezier } from "@vysmo/easings";

// Catalog curve
animate({ from: 0, to: 100, duration: 600, ease: power2Out, onUpdate });

// Parametric spring (returns an EasingFn)
animate({ from: 0, to: 100, duration: 800, ease: spring.with({ stiffness: 200, damping: 15 }), onUpdate });

// Custom cubic-bezier
animate({ from: 0, to: 100, duration: 600, ease: bezier(0.25, 0.1, 0.25, 1), onUpdate });
```

Every export is just a `(t: number) => number` (an `EasingFn`). Use it with our `animate()`, your own rAF loop, or anything that takes an easing function.

## Catalog

### Named curves (40+ functions)

**Power family** — `power1In/Out/InOut` … `power4In/Out/InOut` (with GSAP-compatible aliases `quadIn/Out/InOut`, `cubicIn/Out/InOut`, `quartIn/Out/InOut`, `quintIn/Out/InOut`).

**Trigonometric / curves** — `sineIn/Out/InOut`, `expoIn/Out/InOut`, `circIn/Out/InOut`.

**Character curves** — `backIn/Out/InOut` (parametric overshoot), `elasticIn/Out/InOut` (parametric amplitude/period), `bounceIn/Out/InOut`.

**Identity** — `linear` (and its alias `none`).

### Parametric builders

| Builder | What it does |
|---------|--------------|
| `spring({ stiffness, damping, mass, velocity })` | Damped harmonic spring evaluated as a closed-form curve over a fixed duration. |
| `bezier(p1x, p1y, p2x, p2y)` | CSS-style cubic-bezier as an `EasingFn`. Convenience wrappers: `bezierEase`, `bezierEaseIn`, `bezierEaseOut`, `bezierEaseInOut`. |
| `wiggle({ wiggles, attenuation })` | Symmetric oscillation — perfect for shake / wobble. |
| `rough({ points, strength, taper, randomize })` | Symmetric noisy curve — handpainted feel. |
| `anticipateIn/Out/InOut({ overshoot })` | Pull-back-then-go (or go-then-overshoot) curve. |
| `slow({ amount, position, easing })` | Smooth dwell at any point along the curve. |
| `expoScale(startScale, endScale, ease)` | Compensates exponential scaling so screen-space velocity feels uniform. |
| `custom(points)` | Free-form — interpolate between arbitrary `(time, value)` control points. |
| `steps(count, position)` | Step function (CSS-style). |

Spring presets shipped: `gentleSpring`, `wobblySpring`, `stiffSpring`, `slowSpring`, `molassesSpring` — all built on `spring.with(...)`.

### Composition modifiers

```ts
import { reverse, mirror, yoyo, chain, blend, slice, power2Out, sineInOut } from "@vysmo/easings";

reverse(power2Out);                    // play it backwards
mirror(power2Out);                     // half forward, half reversed
yoyo(sineInOut, { count: 3 });         // oscillate N times
chain(power2Out, sineInOut, bounceOut); // sequence three easings
blend(power2Out, sineInOut, 0.5);      // 50/50 mix at every t
slice(power2Out, 0.2, 0.8);            // use only the middle 60% of the curve
```

All modifiers return a fresh `EasingFn` — composable, side-effect-free.

### CSS export

```ts
import { toCSSLinear, toCSSBezier, toCSSKeyframes, spring } from "@vysmo/easings";

// CSS `linear()` function — sample any EasingFn into a CSS-compatible curve
const css = toCSSLinear(spring.with({ stiffness: 100, damping: 10 }), { samples: 24 });
// → "linear(0, 0.0123 4.17%, …)"

// Cubic-bezier easings export back to CSS exactly:
toCSSBezier(bezier(0.25, 0.1, 0.25, 1));
// → "cubic-bezier(0.25, 0.1, 0.25, 1)"

// Sample as @keyframes percentages for full-fidelity CSS animations
toCSSKeyframes(spring.with({ stiffness: 200 }), { property: "transform", from: "scale(1)", to: "scale(1.5)" });
```

### Reduced-motion helpers

```ts
import { prefersReducedMotion, respectReducedMotion, power2Out, linear } from "@vysmo/easings";

const ease = respectReducedMotion(power2Out, linear);
// → returns linear when prefers-reduced-motion is set, power2Out otherwise

if (prefersReducedMotion()) { /* skip the animation entirely */ }
```

### GSAP-style string parser

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
  ({ stiffness }) => (t) => /* ... */ t,
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
