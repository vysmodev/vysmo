import {
  backIn,
  backInOut,
  backOut,
  bounceIn,
  bounceInOut,
  bounceOut,
  circIn,
  circInOut,
  circOut,
  cubicIn,
  cubicInOut,
  cubicOut,
  elasticIn,
  elasticInOut,
  elasticOut,
  expoIn,
  expoInOut,
  expoOut,
  linear,
  none,
  power1In,
  power1InOut,
  power1Out,
  power2In,
  power2InOut,
  power2Out,
  power3In,
  power3InOut,
  power3Out,
  power4In,
  power4InOut,
  power4Out,
  quadIn,
  quadInOut,
  quadOut,
  quartIn,
  quartInOut,
  quartOut,
  quintIn,
  quintInOut,
  quintOut,
  sineIn,
  sineInOut,
  sineOut,
  steps,
} from "./easings/index.js";
import {
  anticipate,
  anticipateIn,
  anticipateInOut,
  anticipateOut,
  bezier,
  spring,
  wiggle,
} from "./builders/index.js";
import type { EasingFn, ParametricEasing } from "./types.js";

type Buildable = EasingFn | ParametricEasing<Record<string, number | string>>;

const REGISTRY: Record<string, Buildable> = {
  linear,
  none,
  "power1.in": power1In,
  "power1.out": power1Out,
  "power1.inOut": power1InOut,
  "power2.in": power2In,
  "power2.out": power2Out,
  "power2.inOut": power2InOut,
  "power3.in": power3In,
  "power3.out": power3Out,
  "power3.inOut": power3InOut,
  "power4.in": power4In,
  "power4.out": power4Out,
  "power4.inOut": power4InOut,
  "quad.in": quadIn,
  "quad.out": quadOut,
  "quad.inOut": quadInOut,
  "cubic.in": cubicIn,
  "cubic.out": cubicOut,
  "cubic.inOut": cubicInOut,
  "quart.in": quartIn,
  "quart.out": quartOut,
  "quart.inOut": quartInOut,
  "quint.in": quintIn,
  "quint.out": quintOut,
  "quint.inOut": quintInOut,
  "sine.in": sineIn,
  "sine.out": sineOut,
  "sine.inOut": sineInOut,
  "circ.in": circIn,
  "circ.out": circOut,
  "circ.inOut": circInOut,
  "expo.in": expoIn,
  "expo.out": expoOut,
  "expo.inOut": expoInOut,
  "back.in": backIn as Buildable,
  "back.out": backOut as Buildable,
  "back.inOut": backInOut as Buildable,
  "elastic.in": elasticIn as Buildable,
  "elastic.out": elasticOut as Buildable,
  "elastic.inOut": elasticInOut as Buildable,
  "bounce.in": bounceIn,
  "bounce.out": bounceOut,
  "bounce.inOut": bounceInOut,
  steps: steps as Buildable,
  spring: spring as Buildable,
  wiggle: wiggle as Buildable,
  anticipate: anticipate as Buildable,
  "anticipate.in": anticipateIn as Buildable,
  "anticipate.out": anticipateOut as Buildable,
  "anticipate.inOut": anticipateInOut as Buildable,
};

const PARSE_RE = /^([a-zA-Z][\w]*(?:\.[a-zA-Z][\w]*)?)(?:\((.*)\))?$/;
const CUBIC_BEZIER_RE = /^cubic-bezier\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)$/;

function isParametric(x: unknown): x is ParametricEasing<Record<string, number | string>> {
  return (
    typeof x === "function" &&
    "defaults" in (x as object) &&
    "with" in (x as object)
  );
}

function coerceArg(raw: string): number | string {
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : trimmed;
}

/**
 * Parse a GSAP-style string reference into an EasingFn. Examples:
 *
 * - `"linear"`, `"power2.out"`, `"sine.inOut"` — core + variant
 * - `"back.out(2)"` — parametric with positional arg
 * - `"elastic.out(1.2, 0.4)"` — multiple positional args (amplitude, period)
 * - `"steps(5, start)"` — mix of numeric and string args
 * - `"cubic-bezier(0.42, 0, 0.58, 1)"` — CSS-style, exact bezier
 *
 * Throws a RangeError for unknown names or malformed input.
 */
export function parseEasing(spec: string): EasingFn {
  const input = spec.trim();
  const cb = CUBIC_BEZIER_RE.exec(input);
  if (cb) {
    const [, a, b, c, d] = cb;
    return bezier(Number(a), Number(b), Number(c), Number(d));
  }
  const match = PARSE_RE.exec(input);
  if (!match) throw new RangeError(`parseEasing: cannot parse '${spec}'`);
  const [, name, argsStr] = match;
  const entry = REGISTRY[name!];
  if (!entry) throw new RangeError(`parseEasing: unknown easing '${name}'`);
  const args = argsStr !== undefined && argsStr.length > 0 ? argsStr.split(",").map(coerceArg) : [];
  if (args.length === 0) return entry as EasingFn;
  if (!isParametric(entry)) {
    throw new RangeError(`parseEasing: '${name}' is not parametric but received arguments`);
  }
  const keys = Object.keys(entry.defaults);
  const params: Record<string, number | string> = {};
  args.forEach((value, i) => {
    const key = keys[i];
    if (key !== undefined) params[key] = value;
  });
  return entry.with(params);
}
