import { spring, type SpringParams } from "./spring.js";

/**
 * Pre-configured spring feels matching React Spring's well-known configs.
 * Import directly when you want a named spring rather than tuning by hand.
 */
export const SPRING_PRESETS = {
  gentle: { stiffness: 100, damping: 15, mass: 1, velocity: 0 },
  default: { stiffness: 170, damping: 26, mass: 1, velocity: 0 },
  wobbly: { stiffness: 180, damping: 12, mass: 1, velocity: 0 },
  stiff: { stiffness: 210, damping: 20, mass: 1, velocity: 0 },
  slow: { stiffness: 80, damping: 20, mass: 1, velocity: 0 },
  molasses: { stiffness: 280, damping: 120, mass: 1, velocity: 0 },
} as const satisfies Record<string, SpringParams>;

export const gentleSpring = spring.with(SPRING_PRESETS.gentle);
export const wobblySpring = spring.with(SPRING_PRESETS.wobbly);
export const stiffSpring = spring.with(SPRING_PRESETS.stiff);
export const slowSpring = spring.with(SPRING_PRESETS.slow);
export const molassesSpring = spring.with(SPRING_PRESETS.molasses);
