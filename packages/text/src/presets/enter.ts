import type { Preset } from "../types.js";

export const fadeUp: Preset = {
  name: "enter/fade-up",
  split: "character",
  stagger: 30,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "power2.out" },
    { prop: "translateY", from: 20, to: 0, duration: 500, ease: "power2.out" },
  ],
};

export const elasticRise: Preset = {
  name: "enter/elastic-rise",
  split: "character",
  stagger: 40,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "power2.out" },
    { prop: "translateY", from: 40, to: 0, duration: 800, ease: "elastic.out" },
  ],
};

export const blurIn: Preset = {
  name: "enter/blur-in",
  split: "word",
  stagger: 60,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "sine.out" },
    { prop: "blur", from: 8, to: 0, duration: 500, ease: "sine.out" },
  ],
};

export const scaleIn: Preset = {
  name: "enter/scale-in",
  split: "character",
  stagger: 35,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "power2.out" },
    { prop: "scale", from: 0.3, to: 1, duration: 600, ease: "back.out" },
  ],
};

export const flipX: Preset = {
  name: "enter/flip-x",
  split: "character",
  stagger: 40,
  perspective: 800,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "power2.out" },
    { prop: "rotateX", from: -90, to: 0, duration: 700, ease: "back.out" },
  ],
};

export const depthZoom: Preset = {
  name: "enter/depth-zoom",
  split: "character",
  stagger: 35,
  perspective: 900,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "power2.out" },
    { prop: "translateZ", from: -400, to: 0, duration: 700, ease: "power3.out" },
  ],
};
