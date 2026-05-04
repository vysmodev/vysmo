import type { Preset } from "../types.js";

/**
 * Emphasis presets chain multiple specs on the same prop — later specs
 * (with later delays) overwrite earlier ones once their window opens.
 */

export const pulse: Preset = {
  name: "emphasis/pulse",
  split: "character",
  stagger: 20,
  repeat: 3,
  repeatDelay: 400,
  animations: [
    { prop: "scale", from: 1, to: 1.25, duration: 200, ease: "sine.out" },
    { prop: "scale", from: 1.25, to: 1, duration: 250, ease: "sine.in", delay: 200 },
  ],
};

export const shake: Preset = {
  name: "emphasis/shake",
  split: "character",
  stagger: 15,
  repeat: 2,
  repeatDelay: 300,
  animations: [
    { prop: "translateX", from: 0, to: -6, duration: 80, ease: "sine.inOut" },
    { prop: "translateX", from: -6, to: 6, duration: 120, ease: "sine.inOut", delay: 80 },
    { prop: "translateX", from: 6, to: 0, duration: 100, ease: "sine.inOut", delay: 200 },
  ],
};

export const wobble: Preset = {
  name: "emphasis/wobble",
  split: "character",
  stagger: 25,
  repeat: 2,
  repeatDelay: 400,
  animations: [
    { prop: "rotate", from: 0, to: -10, duration: 150, ease: "sine.inOut" },
    { prop: "rotate", from: -10, to: 10, duration: 200, ease: "sine.inOut", delay: 150 },
    { prop: "rotate", from: 10, to: 0, duration: 150, ease: "sine.inOut", delay: 350 },
  ],
};

export const coinFlip: Preset = {
  name: "emphasis/coin-flip",
  split: "character",
  stagger: 30,
  perspective: 800,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [{ prop: "rotateY", from: 0, to: 360, duration: 700, ease: "power2.inOut" }],
};

export const spin: Preset = {
  name: "emphasis/spin",
  split: "character",
  stagger: 20,
  animations: [{ prop: "rotate", from: 0, to: 360, duration: 600, ease: "power2.inOut" }],
};
