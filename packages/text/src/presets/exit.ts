import type { Preset } from "../types.js";

export const fadeDown: Preset = {
  name: "exit/fade-down",
  split: "character",
  stagger: 30,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "power2.in" },
    { prop: "translateY", from: 0, to: 20, duration: 400, ease: "power2.in" },
  ],
};

export const scaleOut: Preset = {
  name: "exit/scale-out",
  split: "character",
  stagger: 30,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 300, ease: "power2.in" },
    { prop: "scale", from: 1, to: 0.3, duration: 450, ease: "back.in" },
  ],
};

export const flipAway: Preset = {
  name: "exit/flip-away",
  split: "character",
  stagger: 35,
  perspective: 800,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "power2.in", delay: 150 },
    { prop: "rotateY", from: 0, to: 90, duration: 550, ease: "back.in" },
  ],
};
