import { defineEffect, blur, type Effect } from "../index.js";

// --- blur is an Effect with radius param --------------------------------

const _blurCheck: Effect<{ radius: number }> = blur;
void _blurCheck;

// --- defineEffect preserves literal types in defaults then widens them --

const custom = defineEffect({
  name: "custom",
  defaults: {
    strength: 0.5,
    centre: [0.5, 0.5] as const,
    enabled: true,
  },
  glsl: "vec4 effect(vec2 uv) { return getSource(uv); }",
});

// Widened back to general uniform types so callers can override:
const _s: number = custom.defaults.strength;
const _c: readonly [number, number] = custom.defaults.centre;
const _e: boolean = custom.defaults.enabled;
void [_s, _c, _e];

// --- defineEffect rejects malformed params ------------------------------

// @ts-expect-error — name is required
defineEffect({
  defaults: {},
  glsl: "vec4 effect(vec2 uv) { return getSource(uv); }",
});

// @ts-expect-error — glsl is required
defineEffect({
  name: "no-glsl",
  defaults: {},
});

defineEffect({
  name: "bad-defaults",
  // @ts-expect-error — defaults must be UniformParams (no function values)
  defaults: { fn: () => 1 },
  glsl: "vec4 effect(vec2 uv) { return getSource(uv); }",
});

// --- Effect.passes and .hdr are optional --------------------------------

const withPasses = defineEffect({
  name: "multipass",
  defaults: {},
  glsl: "vec4 effect(vec2 uv) { return getSource(uv); }",
  passes: 3,
  hdr: true,
});
const _p: number | undefined = withPasses.passes;
const _h: boolean | undefined = withPasses.hdr;
void [_p, _h];
