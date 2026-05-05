// AUTO-GENERATED — do not edit by hand.
// Written by `scripts/ingest-generated.mjs` from `scripts/_staging.ts`.
// Run `pnpm --filter @vysmo/text ingest` to refresh.
//
// 229 presets ingested.

import type { Preset } from "../types.js";

export const extendYScatter: Preset = {
  name: "enter/extend-y-scatter",
  split: "character",
  stagger: 35,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "circ.out" },
    { prop: "translateX", from: { min: -111.159, max: 111.159 }, to: 0, duration: 600, ease: "expo.out" },
    { prop: "scaleY", from: { min: 0.08, max: 1 }, to: 1, duration: 850, ease: "back.out" },
    { prop: "translateY", from: { min: -91.85, max: 91.85 }, to: 0, duration: 850, ease: "back.out" },
  ],
};

export const extendXSnap: Preset = {
  name: "enter/extend-x-snap",
  split: "word",
  stagger: 45,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "quart.out" },
    { prop: "scaleX", from: 0.7, to: 1, duration: 900, ease: "expo.out", transformOrigin: { x: 0.5, y: 0.5 } },
    { prop: "translateX", from: -60, to: 0, duration: 600, ease: "back.out" },
    { prop: "blur", from: 9, to: 0, duration: 600, ease: "bounce.out" },
  ],
};

export const tiltInSpring: Preset = {
  name: "enter/tilt-in-spring",
  split: "word",
  stagger: 30,
  staggerOrder: "random",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "elastic.out" },
    { prop: "rotate", from: 30, to: 0, duration: 800, ease: "elastic.out" },
  ],
};

export const leanInSpring: Preset = {
  name: "enter/lean-in-spring",
  split: "character",
  stagger: 40,
  staggerOrder: "end",
  perspective: 1100,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "expo.out" },
    { prop: "translateZ", from: -150, to: 0, duration: 750, ease: "quart.out" },
    { prop: "rotate", from: 30, to: 0, duration: 850, ease: "elastic.out" },
    { prop: "scaleX", from: 1.4, to: 1, duration: 800, ease: "bounce.out" },
  ],
};

export const expandSnap: Preset = {
  name: "enter/expand-snap",
  split: "character",
  stagger: 35,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "circ.out" },
    { prop: "translateX", from: 70, to: 0, duration: 600, ease: "elastic.out" },
    { prop: "scale", from: 0.75, to: 1, duration: 550, ease: "expo.out" },
  ],
};

export const flipUpSpring: Preset = {
  name: "enter/flip-up-spring",
  split: "character",
  stagger: 50,
  staggerOrder: "edges",
  perspective: 1000,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "elastic.out" },
    { prop: "rotateY", from: -30, to: 0, duration: 850, ease: "expo.out", jitterDelay: 70, transformOrigin: { x: 0, y: 0.5 }, perspective: 1050 },
    { prop: "rotateX", from: 60, to: 0, duration: 900, ease: "elastic.out" },
  ],
};

export const slideScatter: Preset = {
  name: "enter/slide-scatter",
  split: "character",
  stagger: 50,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 600, ease: "quart.out" },
    { prop: "translateX", from: 30, to: 0, duration: 800, ease: "sine.out" },
    { prop: "skewX", from: { min: -16.561, max: 16.561 }, to: 0, duration: 550, ease: "power4.out" },
  ],
};

export const soarSwarm: Preset = {
  name: "enter/soar-swarm",
  split: "character",
  stagger: 55,
  staggerOrder: "random",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "back.out" },
    { prop: "translateY", from: -60, to: 0, duration: 650, ease: "power4.out" },
    { prop: "blur", from: 10, to: 0, duration: 450, ease: "quart.out" },
  ],
};

export const tunnel: Preset = {
  name: "enter/tunnel",
  split: "word",
  stagger: 25,
  perspective: 1150,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "expo.out" },
    { prop: "translateZ", from: -250, to: 0, duration: 700, ease: "sine.out" },
    { prop: "translateY", from: 40, to: 0, duration: 550, ease: "expo.out" },
  ],
};

export const soarBounce: Preset = {
  name: "enter/soar-bounce",
  split: "word",
  stagger: 45,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "back.out" },
    { prop: "translateY", from: -50, to: 0, duration: 900, ease: "bounce.out" },
  ],
};

export const stretchXKick: Preset = {
  name: "enter/stretch-x-kick",
  split: "character",
  stagger: 50,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "cubic.out" },
    { prop: "scaleX", from: 0.4, to: 1, duration: 800, ease: "back.out", jitterDelay: 60 },
    { prop: "translateY", from: -50, to: 0, duration: 850, ease: "back.out" },
  ],
};

export const slideBounce: Preset = {
  name: "enter/slide-bounce",
  split: "character",
  stagger: 40,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "sine.out" },
    { prop: "translateX", from: 50, to: 0, duration: 800, ease: "bounce.out", jitterDelay: 40 },
  ],
};

export const stretchXScatter: Preset = {
  name: "enter/stretch-x-scatter",
  split: "character",
  stagger: 20,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "sine.out" },
    { prop: "scaleX", from: { min: 0.1, max: 1.25 }, to: 1, duration: 600, ease: "quart.out", transformOrigin: { x: 0.5, y: 1 } },
    { prop: "translateY", from: -60, to: 0, duration: 550, ease: "back.out" },
  ],
};

export const glideScatter: Preset = {
  name: "enter/glide-scatter",
  split: "word",
  stagger: 35,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "quart.out" },
    { prop: "translateX", from: { min: -101.332, max: 101.332 }, to: 0, duration: 700, ease: "elastic.out" },
  ],
};

export const growScatter: Preset = {
  name: "enter/grow-scatter",
  split: "character",
  stagger: 50,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "expo.out" },
    { prop: "blur", from: { min: 2.6, max: 32.5 }, to: 0, duration: 550, ease: "elastic.out" },
    { prop: "scale", from: 0.35, to: 1, duration: 750, ease: "back.out" },
    { prop: "skewX", from: -15, to: 0, duration: 500, ease: "elastic.out", jitterDelay: 150 },
    { prop: "translateX", from: -150, to: 0, duration: 550, ease: "circ.out" },
  ],
};

export const unfurlYScatter: Preset = {
  name: "enter/unfurl-y-scatter",
  split: "character",
  stagger: 35,
  staggerOrder: "random",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "expo.out" },
    { prop: "translateY", from: -90, to: 0, duration: 750, ease: "elastic.out" },
    { prop: "scaleY", from: { min: 0.3, max: 3.75 }, to: 1, duration: 500, ease: "quart.out", transformOrigin: { x: 1, y: 0.5, z: 100 } },
  ],
};

export const pivotCurl: Preset = {
  name: "enter/pivot-curl",
  split: "character",
  stagger: 55,
  perspective: 650,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "sine.out" },
    { prop: "scaleY", from: 0.1, to: 1, duration: 700, ease: "quart.out", transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
    { prop: "rotateY", from: -420, to: 0, duration: 750, ease: "sine.out" },
    { prop: "blur", from: 7, to: 0, duration: 750, ease: "power4.out", jitterDelay: 310 },
    { prop: "translateY", from: -180, to: 0, duration: 750, ease: "power4.out", jitterDelay: 260 },
  ],
};

export const stretchYScatter: Preset = {
  name: "enter/stretch-y-scatter",
  split: "character",
  stagger: 60,
  staggerOrder: "center",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "back.out" },
    { prop: "blur", from: { min: 3, max: 37.5 }, to: 0, duration: 750, ease: "sine.out", jitterDelay: 230 },
    { prop: "translateX", from: 90, to: 0, duration: 750, ease: "quart.out", jitterDelay: 280 },
    { prop: "scaleY", from: 0.1, to: 1, duration: 550, ease: "sine.out", jitterDelay: 80, transformOrigin: { x: 0, y: 0 } },
    { prop: "skewX", from: { min: -134.602, max: 134.602 }, to: 0, duration: 600, ease: "sine.out", transformOrigin: { x: 0.7, y: 0.3, z: 120 } },
  ],
};

export const leanInScatterCurl: Preset = {
  name: "enter/lean-in-scatter-curl",
  split: "character",
  stagger: 20,
  staggerOrder: "center",
  perspective: 700,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "power4.out" },
    { prop: "translateZ", from: -200, to: 0, duration: 650, ease: "cubic.out", jitterDelay: 110 },
    { prop: "rotate", from: { min: -2542.059, max: 2542.059 }, to: 0, duration: 500, ease: "sine.out", transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
  ],
};

export const settleScatter: Preset = {
  name: "enter/settle-scatter",
  split: "character",
  stagger: 35,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "circ.out" },
    { prop: "blur", from: 10, to: 0, duration: 550, ease: "bounce.out" },
    { prop: "translateY", from: 150, to: 0, duration: 750, ease: "elastic.out", jitterDelay: 100 },
    { prop: "scale", from: { min: 0.15, max: 1.875 }, to: 1, duration: 550, ease: "cubic.out", jitterDelay: 240, transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
  ],
};

export const expandScatter: Preset = {
  name: "enter/expand-scatter",
  split: "character",
  stagger: 20,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "expo.out" },
    { prop: "translateX", from: -150, to: 0, duration: 650, ease: "power4.out" },
    { prop: "scale", from: { min: 0.11, max: 1.375 }, to: 1, duration: 850, ease: "bounce.out", jitterDelay: 260 },
    { prop: "blur", from: { min: 2.4, max: 30 }, to: 0, duration: 400, ease: "sine.out" },
  ],
};

export const slantScatter: Preset = {
  name: "enter/slant-scatter",
  split: "character",
  stagger: 20,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "power4.out" },
    { prop: "blur", from: { min: 3.8, max: 47.5 }, to: 0, duration: 550, ease: "bounce.out", jitterDelay: 220 },
    { prop: "rotate", from: { min: -1665.671, max: 1665.671 }, to: 0, duration: 550, ease: "sine.out", jitterDelay: 120, transformOrigin: { x: 0, y: 0.5 } },
    { prop: "skewX", from: { min: -101.125, max: 101.125 }, to: 0, duration: 700, ease: "bounce.out", jitterDelay: 200, transformOrigin: { x: 1, y: 0.5 } },
  ],
};

export const extendXCurl: Preset = {
  name: "enter/extend-x-curl",
  split: "character",
  stagger: 55,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "cubic.out" },
    { prop: "scaleX", from: -1, to: 1, duration: 750, ease: "back.out" },
    { prop: "translateY", from: 190, to: 0, duration: 750, ease: "bounce.out" },
    { prop: "scaleY", from: 3, to: 1, duration: 600, ease: "back.out", jitterDelay: 280 },
    { prop: "skewX", from: 35, to: 0, duration: 550, ease: "elastic.out", jitterDelay: 50, transformOrigin: { x: 0.5, y: 0, z: -100 } },
  ],
};

export const extendYCurl: Preset = {
  name: "enter/extend-y-curl",
  split: "character",
  stagger: 60,
  perspective: 550,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "expo.out" },
    { prop: "scale", from: 0.75, to: 1, duration: 750, ease: "expo.out", jitterDelay: 220, transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "translateZ", from: -350, to: 0, duration: 600, ease: "expo.out", jitterDelay: 150 },
    { prop: "scaleY", from: 3, to: 1, duration: 550, ease: "back.out", transformOrigin: { x: 0.5, y: 1, z: 100 } },
  ],
};

export const tumbleXScatterWord: Preset = {
  name: "enter/tumble-x-scatter-word",
  split: "word",
  stagger: 20,
  staggerOrder: "end",
  perspective: 550,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "bounce.out" },
    { prop: "translateY", from: { min: -445.54, max: 445.54 }, to: 0, duration: 800, ease: "power4.out" },
    { prop: "translateX", from: -170, to: 0, duration: 600, ease: "elastic.out", jitterDelay: 90 },
    { prop: "rotateX", from: -90, to: 0, duration: 750, ease: "circ.out", jitterDelay: 150 },
  ],
};

export const flipUpScatterCurl: Preset = {
  name: "enter/flip-up-scatter-curl",
  split: "character",
  stagger: 40,
  perspective: 500,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "sine.out" },
    { prop: "scaleY", from: 3, to: 1, duration: 550, ease: "quart.out", transformOrigin: { x: 0, y: 0 } },
    { prop: "scale", from: { min: 0.14, max: 1.75 }, to: 1, duration: 800, ease: "quart.out", transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "translateX", from: 170, to: 0, duration: 750, ease: "power4.out" },
    { prop: "rotateX", from: 390, to: 0, duration: 750, ease: "quart.out", transformOrigin: { x: 1, y: 1, z: 100 } },
    { prop: "skewX", from: 30, to: 0, duration: 650, ease: "bounce.out", transformOrigin: { x: 0.5, y: 1 } },
  ],
};

export const expandScatterLoose: Preset = {
  name: "enter/expand-scatter-loose",
  split: "character",
  stagger: 30,
  staggerOrder: "end",
  perspective: 300,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "back.out" },
    { prop: "translateX", from: { min: -436.997, max: 436.997 }, to: 0, duration: 900, ease: "bounce.out" },
    { prop: "scale", from: { min: 0.09, max: 1.125 }, to: 1, duration: 850, ease: "circ.out" },
    { prop: "translateZ", from: -400, to: 0, duration: 750, ease: "elastic.out", jitterDelay: 220 },
    { prop: "translateY", from: -150, to: 0, duration: 700, ease: "power4.out" },
  ],
};

export const tiltInScatter: Preset = {
  name: "enter/tilt-in-scatter",
  split: "character",
  stagger: 20,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "power4.out" },
    { prop: "rotate", from: { min: -1692.348, max: 1692.348 }, to: 0, duration: 800, ease: "quart.out", jitterDelay: 80, transformOrigin: { x: 0, y: 1 } },
    { prop: "blur", from: { min: 1.8, max: 22.5 }, to: 0, duration: 700, ease: "power4.out" },
    { prop: "scale", from: { min: 0.11, max: 1.375 }, to: 1, duration: 750, ease: "expo.out", jitterDelay: 220, transformOrigin: { x: 1, y: 0.5, z: 100 } },
  ],
};

export const unfurlXScatter: Preset = {
  name: "enter/unfurl-x-scatter",
  split: "character",
  stagger: 25,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "bounce.out" },
    { prop: "scale", from: 0.35, to: 1, duration: 800, ease: "elastic.out" },
    { prop: "translateX", from: 200, to: 0, duration: 800, ease: "expo.out" },
    { prop: "scaleX", from: { min: 0.6, max: 7.5 }, to: 1, duration: 650, ease: "expo.out", transformOrigin: { x: 0.5, y: 0.5, z: 80 } },
  ],
};

export const bloomScatter: Preset = {
  name: "enter/bloom-scatter",
  split: "character",
  stagger: 25,
  perspective: 550,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "back.out" },
    { prop: "translateZ", from: -450, to: 0, duration: 550, ease: "sine.out", perspective: 250 },
    { prop: "scale", from: 0.6, to: 1, duration: 800, ease: "expo.out", jitterDelay: 130 },
    { prop: "blur", from: 11, to: 0, duration: 700, ease: "power4.out" },
    { prop: "translateX", from: { min: -386.162, max: 386.162 }, to: 0, duration: 850, ease: "cubic.out" },
  ],
};

export const flipUpScatterBounce: Preset = {
  name: "enter/flip-up-scatter-bounce",
  split: "character",
  stagger: 55,
  staggerOrder: "edges",
  perspective: 500,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "circ.out" },
    { prop: "rotateY", from: { min: -558.321, max: 558.321 }, to: 0, duration: 550, ease: "quart.out", jitterDelay: 190 },
    { prop: "rotateX", from: 420, to: 0, duration: 800, ease: "bounce.out", transformOrigin: { x: 0, y: 0.5, z: -100 }, perspective: 550 },
  ],
};

export const foldInScatterBounce: Preset = {
  name: "enter/fold-in-scatter-bounce",
  split: "character",
  stagger: 30,
  perspective: 200,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "cubic.out" },
    { prop: "scaleY", from: { min: 0.8, max: 10 }, to: 1, duration: 500, ease: "elastic.out", jitterDelay: 110 },
    { prop: "translateY", from: { min: -467.605, max: 467.605 }, to: 0, duration: 550, ease: "quart.out" },
    { prop: "scale", from: { min: 0.14, max: 1.75 }, to: 1, duration: 900, ease: "sine.out" },
    { prop: "skewX", from: { min: -116.824, max: 116.824 }, to: 0, duration: 600, ease: "expo.out", jitterDelay: 340, transformOrigin: { x: 0, y: 1 } },
    { prop: "rotateY", from: { min: -1011.538, max: 1011.538 }, to: 0, duration: 850, ease: "circ.out", perspective: 450 },
    { prop: "rotateX", from: { min: -380.842, max: 380.842 }, to: 0, duration: 500, ease: "bounce.out", transformOrigin: { x: 1, y: 0.5 } },
  ],
};

export const swivelScatterLoose: Preset = {
  name: "enter/swivel-scatter-loose",
  split: "character",
  stagger: 30,
  staggerOrder: "end",
  perspective: 400,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "sine.out" },
    { prop: "rotate", from: 510, to: 0, duration: 600, ease: "quart.out", jitterDelay: 50, transformOrigin: { x: 1, y: 0 } },
    { prop: "rotateY", from: -450, to: 0, duration: 800, ease: "cubic.out", jitterDelay: 260 },
    { prop: "skewX", from: { min: -112.441, max: 112.441 }, to: 0, duration: 600, ease: "elastic.out" },
  ],
};

export const swirlScatter: Preset = {
  name: "enter/swirl-scatter",
  split: "character",
  stagger: 35,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "quart.out" },
    { prop: "scale", from: { min: 0.14, max: 1.75 }, to: 1, duration: 700, ease: "back.out", jitterDelay: 270 },
    { prop: "rotate", from: 480, to: 0, duration: 700, ease: "quart.out" },
    { prop: "scaleY", from: { min: 0.6, max: 7.5 }, to: 1, duration: 600, ease: "back.out" },
  ],
};

export const twirlScatter: Preset = {
  name: "enter/twirl-scatter",
  split: "character",
  stagger: 45,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "power4.out" },
    { prop: "scaleX", from: { min: 0, max: -2.5 }, to: 1, duration: 750, ease: "cubic.out" },
    { prop: "rotate", from: -660, to: 0, duration: 700, ease: "back.out", transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "scale", from: 0.6, to: 1, duration: 900, ease: "elastic.out", jitterDelay: 90 },
  ],
};

export const extendXSnapWord: Preset = {
  name: "enter/extend-x-snap-word",
  split: "word",
  stagger: 50,
  staggerOrder: "edges",
  perspective: 350,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "bounce.out" },
    { prop: "scaleX", from: -1, to: 1, duration: 800, ease: "expo.out", jitterDelay: 340, transformOrigin: { x: 0.5, y: 0 } },
    { prop: "translateY", from: 130, to: 0, duration: 550, ease: "back.out", jitterDelay: 110 },
    { prop: "translateZ", from: -350, to: 0, duration: 850, ease: "sine.out" },
  ],
};

export const riseYScatter: Preset = {
  name: "enter/rise-y-scatter",
  split: "word",
  stagger: 40,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "circ.out" },
    { prop: "blur", from: 12, to: 0, duration: 800, ease: "cubic.out", jitterDelay: 90 },
    { prop: "skewX", from: { min: -145.334, max: 145.334 }, to: 0, duration: 500, ease: "cubic.out", jitterDelay: 250 },
    { prop: "scaleY", from: 3, to: 1, duration: 850, ease: "back.out" },
  ],
};

export const leanScatter: Preset = {
  name: "enter/lean-scatter",
  split: "character",
  stagger: 45,
  staggerOrder: "edges",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "circ.out" },
    { prop: "skewX", from: { min: -92.865, max: 92.865 }, to: 0, duration: 600, ease: "quart.out" },
    { prop: "blur", from: 17, to: 0, duration: 750, ease: "bounce.out" },
  ],
};

export const riseYScatterCurl: Preset = {
  name: "enter/rise-y-scatter-curl",
  split: "character",
  stagger: 25,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "sine.out" },
    { prop: "scale", from: 0.65, to: 1, duration: 750, ease: "power4.out", jitterDelay: 190 },
    { prop: "scaleY", from: { min: 0.04, max: 0.5 }, to: 1, duration: 700, ease: "elastic.out", jitterDelay: 220, transformOrigin: { x: 0.5, y: 0.5, z: 80 } },
    { prop: "skewX", from: { min: -193.342, max: 193.342 }, to: 0, duration: 600, ease: "sine.out", transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "translateX", from: -210, to: 0, duration: 750, ease: "expo.out", jitterDelay: 120 },
    { prop: "blur", from: { min: 3.2, max: 40 }, to: 0, duration: 750, ease: "circ.out", jitterDelay: 200 },
  ],
};

export const whirlScatter: Preset = {
  name: "enter/whirl-scatter",
  split: "character",
  stagger: 45,
  perspective: 550,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 600, ease: "expo.out" },
    { prop: "translateX", from: { min: -731.445, max: 731.445 }, to: 0, duration: 800, ease: "sine.out", jitterDelay: 170 },
    { prop: "blur", from: 17, to: 0, duration: 550, ease: "sine.out" },
    { prop: "translateZ", from: -200, to: 0, duration: 750, ease: "circ.out", jitterDelay: 280 },
    { prop: "scaleX", from: 4, to: 1, duration: 850, ease: "back.out", jitterDelay: 340, transformOrigin: { x: 1, y: 1 } },
    { prop: "rotate", from: -390, to: 0, duration: 650, ease: "sine.out", transformOrigin: { x: 0, y: 0.5 } },
  ],
};

export const pinwheelScatter: Preset = {
  name: "enter/pinwheel-scatter",
  split: "character",
  stagger: 20,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "expo.out" },
    { prop: "blur", from: { min: 3.2, max: 40 }, to: 0, duration: 700, ease: "bounce.out", jitterDelay: 300 },
    { prop: "scaleY", from: { min: 0.3, max: 3.75 }, to: 1, duration: 750, ease: "quart.out" },
    { prop: "skewX", from: { min: -169.217, max: 169.217 }, to: 0, duration: 600, ease: "back.out", transformOrigin: { x: 0, y: 0.5 } },
    { prop: "translateX", from: -100, to: 0, duration: 850, ease: "power4.out" },
    { prop: "rotate", from: 660, to: 0, duration: 900, ease: "elastic.out", transformOrigin: { x: 0, y: 0.5 } },
  ],
};

export const swivelScatterDeep: Preset = {
  name: "enter/swivel-scatter-deep",
  split: "character",
  stagger: 55,
  perspective: 450,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "circ.out" },
    { prop: "translateZ", from: -600, to: 0, duration: 700, ease: "expo.out" },
    { prop: "scale", from: 0.65, to: 1, duration: 800, ease: "back.out", jitterDelay: 220, transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
    { prop: "rotateY", from: 420, to: 0, duration: 850, ease: "quart.out", jitterDelay: 320, transformOrigin: { x: 0.5, y: 0.5 }, perspective: 500 },
    { prop: "scaleY", from: 2, to: 1, duration: 600, ease: "sine.out", transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "rotate", from: { min: -1729.634, max: 1729.634 }, to: 0, duration: 750, ease: "power4.out", jitterDelay: 150 },
  ],
};

export const foldInCurl: Preset = {
  name: "enter/fold-in-curl",
  split: "character",
  stagger: 60,
  staggerOrder: "end",
  perspective: 500,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "cubic.out" },
    { prop: "rotateX", from: -360, to: 0, duration: 850, ease: "expo.out", jitterDelay: 60, transformOrigin: { x: 0, y: 0.5, z: -100 }, perspective: 500 },
    { prop: "skewX", from: -40, to: 0, duration: 500, ease: "quart.out", jitterDelay: 80, transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
    { prop: "blur", from: 16, to: 0, duration: 600, ease: "back.out", jitterDelay: 240 },
    { prop: "scaleY", from: 4, to: 1, duration: 650, ease: "cubic.out", jitterDelay: 220, transformOrigin: { x: 0, y: 0.5 } },
    { prop: "scale", from: 0.3, to: 1, duration: 850, ease: "sine.out", jitterDelay: 130, transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "rotate", from: 270, to: 0, duration: 650, ease: "quart.out" },
  ],
};

export const turnScatterCurl: Preset = {
  name: "enter/turn-scatter-curl",
  split: "character",
  stagger: 55,
  staggerOrder: "end",
  perspective: 400,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "elastic.out" },
    { prop: "skewX", from: { min: -136.596, max: 136.596 }, to: 0, duration: 550, ease: "circ.out", transformOrigin: { x: 0.3, y: 0.7, z: -120 } },
    { prop: "rotateY", from: -270, to: 0, duration: 500, ease: "circ.out" },
    { prop: "translateY", from: { min: -617.184, max: 617.184 }, to: 0, duration: 500, ease: "quart.out" },
    { prop: "rotate", from: -120, to: 0, duration: 800, ease: "power4.out" },
    { prop: "blur", from: { min: 1.2, max: 15 }, to: 0, duration: 450, ease: "quart.out", jitterDelay: 80 },
  ],
};

export const foldInScatterCurl: Preset = {
  name: "enter/fold-in-scatter-curl",
  split: "character",
  stagger: 20,
  perspective: 550,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "circ.out" },
    { prop: "translateZ", from: -300, to: 0, duration: 850, ease: "bounce.out", jitterDelay: 130 },
    { prop: "scaleY", from: -1, to: 1, duration: 750, ease: "bounce.out" },
    { prop: "rotateX", from: 150, to: 0, duration: 900, ease: "elastic.out", jitterDelay: 190, transformOrigin: { x: 0, y: 0.5, z: -100 }, perspective: 400 },
    { prop: "translateY", from: { min: -871.977, max: 871.977 }, to: 0, duration: 600, ease: "elastic.out", jitterDelay: 240 },
    { prop: "translateX", from: { min: -502.407, max: 502.407 }, to: 0, duration: 800, ease: "power4.out", jitterDelay: 210 },
  ],
};

export const flipUpScatterWord: Preset = {
  name: "enter/flip-up-scatter-word",
  split: "word",
  stagger: 45,
  perspective: 500,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "back.out" },
    { prop: "rotateX", from: 120, to: 0, duration: 500, ease: "bounce.out", perspective: 350 },
    { prop: "rotateY", from: -120, to: 0, duration: 600, ease: "cubic.out", jitterDelay: 250 },
    { prop: "skewX", from: { min: -173.156, max: 173.156 }, to: 0, duration: 450, ease: "elastic.out", jitterDelay: 310 },
    { prop: "blur", from: { min: 3.4, max: 42.5 }, to: 0, duration: 500, ease: "sine.out", jitterDelay: 50 },
  ],
};

export const tiltInScatterWord: Preset = {
  name: "enter/tilt-in-scatter-word",
  split: "word",
  stagger: 40,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "back.out" },
    { prop: "rotate", from: { min: -2676.345, max: 2676.345 }, to: 0, duration: 700, ease: "elastic.out" },
    { prop: "translateX", from: -180, to: 0, duration: 600, ease: "sine.out" },
  ],
};

export const unfurlYCurl: Preset = {
  name: "enter/unfurl-y-curl",
  split: "character",
  stagger: 40,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "back.out" },
    { prop: "scaleY", from: 0.2, to: 1, duration: 700, ease: "quart.out", jitterDelay: 320, transformOrigin: { x: 1, y: 0.5 } },
    { prop: "scale", from: 0.75, to: 1, duration: 800, ease: "expo.out", jitterDelay: 170, transformOrigin: { x: 0.5, y: 1, z: 100 } },
    { prop: "blur", from: 19, to: 0, duration: 600, ease: "sine.out", jitterDelay: 160 },
  ],
};

export const extendYScatterWord: Preset = {
  name: "enter/extend-y-scatter-word",
  split: "word",
  stagger: 40,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "cubic.out" },
    { prop: "skewX", from: -15, to: 0, duration: 600, ease: "cubic.out" },
    { prop: "translateY", from: -50, to: 0, duration: 600, ease: "bounce.out" },
    { prop: "scaleY", from: { min: 0.24, max: 3 }, to: 1, duration: 700, ease: "sine.out" },
  ],
};

export const topple: Preset = {
  name: "enter/topple",
  split: "character",
  stagger: 50,
  perspective: 1250,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "quart.out" },
    { prop: "rotateX", from: 60, to: 0, duration: 700, ease: "cubic.out", transformOrigin: { x: 0, y: 0 } },
  ],
};

export const blurRiseSnap: Preset = {
  name: "enter/blur-rise-snap",
  split: "character",
  stagger: 25,
  staggerOrder: "center",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "bounce.out" },
    { prop: "blur", from: 7, to: 0, duration: 750, ease: "expo.out" },
  ],
};

export const loom: Preset = {
  name: "enter/loom",
  split: "character",
  stagger: 50,
  perspective: 1100,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "back.out" },
    { prop: "translateY", from: -40, to: 0, duration: 750, ease: "quart.out" },
    { prop: "translateZ", from: -150, to: 0, duration: 750, ease: "quart.out" },
  ],
};

export const glideOutward: Preset = {
  name: "enter/glide-outward",
  split: "character",
  stagger: 55,
  staggerOrder: "center",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "sine.out" },
    { prop: "translateX", from: -30, to: 0, duration: 750, ease: "sine.out" },
    { prop: "skewX", from: -15, to: 0, duration: 400, ease: "bounce.out" },
  ],
};

export const tiltInBounce: Preset = {
  name: "enter/tilt-in-bounce",
  split: "character",
  stagger: 60,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "sine.out" },
    { prop: "scaleY", from: 0.7, to: 1, duration: 600, ease: "bounce.out", transformOrigin: { x: 0.5, y: 0 } },
    { prop: "rotate", from: -60, to: 0, duration: 500, ease: "bounce.out" },
  ],
};

export const expandScatterTrail: Preset = {
  name: "enter/expand-scatter-trail",
  split: "character",
  stagger: 40,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "quart.out" },
    { prop: "translateY", from: { min: -66.362, max: 66.362 }, to: 0, duration: 550, ease: "bounce.out", jitterDelay: 70 },
    { prop: "scale", from: 0.65, to: 1, duration: 600, ease: "cubic.out" },
  ],
};

export const rotateYInDeep: Preset = {
  name: "enter/rotate-y-in-deep",
  split: "character",
  stagger: 30,
  staggerOrder: "random",
  perspective: 900,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 600, ease: "bounce.out" },
    { prop: "rotate", from: 30, to: 0, duration: 500, ease: "quart.out" },
    { prop: "rotateY", from: -60, to: 0, duration: 600, ease: "circ.out", perspective: 1500 },
  ],
};

export const swipeSpring: Preset = {
  name: "enter/swipe-spring",
  split: "character",
  stagger: 55,
  staggerOrder: "center",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "bounce.out" },
    { prop: "translateX", from: 60, to: 0, duration: 800, ease: "elastic.out" },
  ],
};

export const swipeScatter: Preset = {
  name: "enter/swipe-scatter",
  split: "character",
  stagger: 20,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "back.out" },
    { prop: "translateX", from: { min: -131.56, max: 131.56 }, to: 0, duration: 600, ease: "sine.out" },
    { prop: "blur", from: { min: 1.6, max: 20 }, to: 0, duration: 600, ease: "cubic.out" },
  ],
};

export const tiltInInward: Preset = {
  name: "enter/tilt-in-inward",
  split: "word",
  stagger: 55,
  staggerOrder: "edges",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "elastic.out" },
    { prop: "blur", from: 8, to: 0, duration: 700, ease: "back.out" },
    { prop: "rotate", from: -30, to: 0, duration: 500, ease: "quart.out" },
  ],
};

export const growSpring: Preset = {
  name: "enter/grow-spring",
  split: "character",
  stagger: 25,
  staggerOrder: "center",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "circ.out" },
    { prop: "scale", from: 0.25, to: 1, duration: 800, ease: "elastic.out" },
  ],
};

export const extendYScatterCurl: Preset = {
  name: "enter/extend-y-scatter-curl",
  split: "character",
  stagger: 45,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "power4.out" },
    { prop: "blur", from: { min: 3.2, max: 40 }, to: 0, duration: 750, ease: "elastic.out", jitterDelay: 410 },
    { prop: "translateY", from: { min: -1510.445, max: 1510.445 }, to: 0, duration: 600, ease: "cubic.out", jitterDelay: 440 },
    { prop: "scaleY", from: { min: 0.04, max: 0.5 }, to: 1, duration: 850, ease: "sine.out", jitterDelay: 220, transformOrigin: { x: 0.5, y: 1, z: 100 } },
    { prop: "scale", from: { min: 0.08, max: 1 }, to: 1, duration: 800, ease: "quart.out", jitterDelay: 250, transformOrigin: { x: 0, y: 0, z: -100 } },
  ],
};

export const rotateYInScatterCurl: Preset = {
  name: "enter/rotate-y-in-scatter-curl",
  split: "character",
  stagger: 60,
  staggerOrder: "edges",
  perspective: 150,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "cubic.out" },
    { prop: "translateZ", from: -800, to: 0, duration: 800, ease: "sine.out", jitterDelay: 320, perspective: 150 },
    { prop: "rotateY", from: { min: -1389.565, max: 1389.565 }, to: 0, duration: 800, ease: "expo.out", jitterDelay: 320, transformOrigin: { x: 1, y: 0.5 }, perspective: 350 },
    { prop: "scale", from: { min: 0.13, max: 1.625 }, to: 1, duration: 650, ease: "bounce.out", jitterDelay: 420, transformOrigin: { x: 0.7, y: 0.3, z: 120 } },
    { prop: "scaleY", from: { min: 0.3, max: 3.75 }, to: 1, duration: 600, ease: "elastic.out", jitterDelay: 260, transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "translateX", from: { min: -2706.139, max: 2706.139 }, to: 0, duration: 650, ease: "circ.out", jitterDelay: 200 },
    { prop: "rotate", from: { min: -1741.121, max: 1741.121 }, to: 0, duration: 550, ease: "back.out", transformOrigin: { x: 0.5, y: 1, z: 100 } },
  ],
};

export const foldInScatterSnap: Preset = {
  name: "enter/fold-in-scatter-snap",
  split: "character",
  stagger: 55,
  perspective: 350,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "circ.out" },
    { prop: "rotateX", from: { min: -3799.954, max: 3799.954 }, to: 0, duration: 600, ease: "expo.out", jitterDelay: 260, transformOrigin: { x: 0, y: 0.5, z: -100 }, perspective: 350 },
    { prop: "scale", from: { min: 0.1, max: 1.25 }, to: 1, duration: 550, ease: "circ.out", jitterDelay: 170, transformOrigin: { x: 0, y: 0.5, z: -100 } },
    { prop: "translateX", from: 200, to: 0, duration: 700, ease: "sine.out" },
    { prop: "scaleY", from: { min: 0.6, max: 7.5 }, to: 1, duration: 550, ease: "expo.out", jitterDelay: 380, transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "rotate", from: { min: -7028.788, max: 7028.788 }, to: 0, duration: 750, ease: "expo.out", jitterDelay: 190, transformOrigin: { x: 0, y: 0.5 } },
  ],
};

export const slantScatterSpring: Preset = {
  name: "enter/slant-scatter-spring",
  split: "character",
  stagger: 15,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "cubic.out" },
    { prop: "translateY", from: { min: -2008.854, max: 2008.854 }, to: 0, duration: 750, ease: "quart.out", jitterDelay: 230 },
    { prop: "rotate", from: { min: -4435.622, max: 4435.622 }, to: 0, duration: 600, ease: "elastic.out", jitterDelay: 110, transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "translateX", from: { min: -1781.755, max: 1781.755 }, to: 0, duration: 600, ease: "elastic.out", jitterDelay: 200 },
    { prop: "blur", from: { min: 3.6, max: 45 }, to: 0, duration: 500, ease: "power4.out", jitterDelay: 410 },
  ],
};

export const riseYScatterLoose: Preset = {
  name: "enter/rise-y-scatter-loose",
  split: "character",
  stagger: 15,
  staggerOrder: "edges",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "back.out" },
    { prop: "scaleY", from: { min: 0.5, max: 6.25 }, to: 1, duration: 600, ease: "cubic.out", jitterDelay: 450 },
    { prop: "blur", from: { min: 5.2, max: 65 }, to: 0, duration: 600, ease: "sine.out", jitterDelay: 260 },
    { prop: "skewX", from: { min: -382.518, max: 382.518 }, to: 0, duration: 600, ease: "power4.out", jitterDelay: 480, transformOrigin: { x: 0.7, y: 0.3, z: 120 } },
    { prop: "scale", from: { min: 0.12, max: 1.5 }, to: 1, duration: 900, ease: "sine.out", jitterDelay: 390 },
  ],
};

export const tiltInScatterCurl: Preset = {
  name: "enter/tilt-in-scatter-curl",
  split: "character",
  stagger: 60,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "bounce.out" },
    { prop: "blur", from: { min: 4, max: 50 }, to: 0, duration: 450, ease: "cubic.out", jitterDelay: 470 },
    { prop: "translateX", from: { min: -1326.384, max: 1326.384 }, to: 0, duration: 800, ease: "back.out", jitterDelay: 100 },
    { prop: "scaleY", from: { min: 0.06, max: 0.75 }, to: 1, duration: 750, ease: "power4.out", jitterDelay: 250, transformOrigin: { x: 0, y: 0, z: -100 } },
    { prop: "scale", from: 0.75, to: 1, duration: 650, ease: "expo.out", transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "scaleX", from: { min: 0.8, max: 10 }, to: 1, duration: 550, ease: "back.out", jitterDelay: 390, transformOrigin: { x: 0, y: 0.5, z: -100 } },
    { prop: "rotate", from: { min: -6641.335, max: 6641.335 }, to: 0, duration: 550, ease: "bounce.out", jitterDelay: 170, transformOrigin: { x: 0, y: 0, z: -100 } },
  ],
};

export const spreadXScatterCurl: Preset = {
  name: "enter/spread-x-scatter-curl",
  split: "character",
  stagger: 50,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "power4.out" },
    { prop: "scaleY", from: { min: 0, max: -2.5 }, to: 1, duration: 550, ease: "cubic.out", jitterDelay: 200, transformOrigin: { x: 1, y: 1, z: 100 } },
    { prop: "scaleX", from: { min: 0.06, max: 0.75 }, to: 1, duration: 550, ease: "expo.out", jitterDelay: 400, transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "skewX", from: { min: -209.791, max: 209.791 }, to: 0, duration: 700, ease: "expo.out", jitterDelay: 140, transformOrigin: { x: 0.3, y: 0.7, z: -120 } },
    { prop: "blur", from: 27, to: 0, duration: 500, ease: "elastic.out" },
  ],
};

export const twirlScatterCurl: Preset = {
  name: "enter/twirl-scatter-curl",
  split: "character",
  stagger: 20,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "quart.out" },
    { prop: "blur", from: { min: 3.2, max: 40 }, to: 0, duration: 650, ease: "sine.out", jitterDelay: 200 },
    { prop: "skewX", from: { min: -389.111, max: 389.111 }, to: 0, duration: 400, ease: "power4.out", jitterDelay: 210, transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "scaleX", from: { min: 0, max: 0 }, to: 1, duration: 750, ease: "elastic.out", transformOrigin: { x: 0.5, y: 0.5, z: 80 } },
    { prop: "scaleY", from: { min: 0.6, max: 7.5 }, to: 1, duration: 800, ease: "expo.out", jitterDelay: 350, transformOrigin: { x: 0.5, y: 1, z: 100 } },
    { prop: "rotate", from: 690, to: 0, duration: 600, ease: "elastic.out", jitterDelay: 220, transformOrigin: { x: 0, y: 0.5, z: -100 } },
  ],
};

export const tipInScatter: Preset = {
  name: "enter/tip-in-scatter",
  split: "character",
  stagger: 45,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 600, ease: "power4.out" },
    { prop: "rotate", from: { min: -6184.943, max: 6184.943 }, to: 0, duration: 700, ease: "quart.out", jitterDelay: 110, transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "skewX", from: { min: -252.602, max: 252.602 }, to: 0, duration: 550, ease: "quart.out", jitterDelay: 380, transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "blur", from: { min: 2.8, max: 35 }, to: 0, duration: 600, ease: "back.out", jitterDelay: 350 },
  ],
};

export const liftSpring: Preset = {
  name: "enter/lift-spring",
  split: "character",
  stagger: 55,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "sine.out" },
    { prop: "translateY", from: -60, to: 0, duration: 550, ease: "elastic.out" },
  ],
};

export const stretchXBounce: Preset = {
  name: "enter/stretch-x-bounce",
  split: "character",
  stagger: 25,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "elastic.out" },
    { prop: "scaleX", from: 0.6, to: 1, duration: 700, ease: "bounce.out", jitterDelay: 20 },
    { prop: "blur", from: 8, to: 0, duration: 650, ease: "power4.out" },
    { prop: "translateX", from: -40, to: 0, duration: 800, ease: "elastic.out" },
  ],
};

export const unfurlXKick: Preset = {
  name: "enter/unfurl-x-kick",
  split: "character",
  stagger: 20,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "power4.out" },
    { prop: "translateX", from: 60, to: 0, duration: 700, ease: "circ.out" },
    { prop: "scaleX", from: 1.4, to: 1, duration: 500, ease: "back.out", jitterDelay: 30 },
  ],
};

export const rotateYInInward: Preset = {
  name: "enter/rotate-y-in-inward",
  split: "character",
  stagger: 30,
  staggerOrder: "edges",
  perspective: 950,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 600, ease: "quart.out" },
    { prop: "blur", from: 7, to: 0, duration: 750, ease: "quart.out" },
    { prop: "rotateY", from: -30, to: 0, duration: 650, ease: "power4.out" },
  ],
};

export const hazeOutward: Preset = {
  name: "enter/haze-outward",
  split: "character",
  stagger: 50,
  staggerOrder: "center",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "circ.out" },
    { prop: "blur", from: 4, to: 0, duration: 400, ease: "sine.out" },
  ],
};

export const pivotScatter: Preset = {
  name: "enter/pivot-scatter",
  split: "character",
  stagger: 55,
  perspective: 700,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "elastic.out" },
    { prop: "rotateY", from: { min: -1223.071, max: 1223.071 }, to: 0, duration: 850, ease: "expo.out", transformOrigin: { x: 0.3, y: 0.7, z: -120 } },
    { prop: "scale", from: { min: 0.12, max: 1.5 }, to: 1, duration: 650, ease: "bounce.out" },
    { prop: "translateZ", from: -450, to: 0, duration: 750, ease: "sine.out", perspective: 350 },
    { prop: "translateY", from: 130, to: 0, duration: 900, ease: "elastic.out" },
  ],
};

export const turnSpring: Preset = {
  name: "enter/turn-spring",
  split: "word",
  stagger: 25,
  staggerOrder: "end",
  perspective: 550,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "expo.out" },
    { prop: "rotateY", from: -150, to: 0, duration: 600, ease: "elastic.out", perspective: 300 },
    { prop: "translateY", from: -190, to: 0, duration: 650, ease: "bounce.out" },
  ],
};

export const tumbleXLoose: Preset = {
  name: "enter/tumble-x-loose",
  split: "word",
  stagger: 40,
  perspective: 550,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "sine.out" },
    { prop: "blur", from: 19, to: 0, duration: 600, ease: "back.out" },
    { prop: "rotateX", from: 360, to: 0, duration: 750, ease: "power4.out", perspective: 600 },
    { prop: "translateY", from: 120, to: 0, duration: 650, ease: "elastic.out", jitterDelay: 180 },
    { prop: "translateZ", from: -300, to: 0, duration: 800, ease: "bounce.out", jitterDelay: 170 },
    { prop: "scaleX", from: 0.1, to: 1, duration: 550, ease: "elastic.out" },
  ],
};

export const leanInScatterSpring: Preset = {
  name: "enter/lean-in-scatter-spring",
  split: "character",
  stagger: 40,
  staggerOrder: "center",
  perspective: 250,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 600, ease: "cubic.out" },
    { prop: "scaleX", from: { min: 0, max: 0 }, to: 1, duration: 800, ease: "sine.out" },
    { prop: "skewX", from: { min: -107.905, max: 107.905 }, to: 0, duration: 500, ease: "back.out", jitterDelay: 150 },
    { prop: "translateZ", from: -350, to: 0, duration: 500, ease: "quart.out", perspective: 300 },
    { prop: "rotate", from: { min: -2472.335, max: 2472.335 }, to: 0, duration: 900, ease: "elastic.out", jitterDelay: 120 },
    { prop: "translateY", from: { min: -736.506, max: 736.506 }, to: 0, duration: 900, ease: "power4.out" },
  ],
};

export const toppleScatterTrail: Preset = {
  name: "enter/topple-scatter-trail",
  split: "character",
  stagger: 20,
  staggerOrder: "end",
  perspective: 250,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "circ.out" },
    { prop: "scale", from: 0.55, to: 1, duration: 650, ease: "cubic.out" },
    { prop: "rotate", from: { min: -824.412, max: 824.412 }, to: 0, duration: 850, ease: "back.out" },
    { prop: "rotateX", from: 180, to: 0, duration: 650, ease: "quart.out", jitterDelay: 320 },
    { prop: "translateX", from: -170, to: 0, duration: 550, ease: "expo.out", jitterDelay: 80 },
  ],
};

export const whirlScatterCurl: Preset = {
  name: "enter/whirl-scatter-curl",
  split: "character",
  stagger: 35,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "expo.out" },
    { prop: "skewX", from: { min: -79.759, max: 79.759 }, to: 0, duration: 550, ease: "circ.out", transformOrigin: { x: 0.3, y: 0.7, z: -120 } },
    { prop: "rotate", from: -600, to: 0, duration: 800, ease: "circ.out" },
    { prop: "scale", from: { min: 0.06, max: 0.75 }, to: 1, duration: 550, ease: "cubic.out", jitterDelay: 270 },
    { prop: "translateY", from: { min: -644.369, max: 644.369 }, to: 0, duration: 800, ease: "back.out", jitterDelay: 170 },
  ],
};

export const tipInScatterCurl: Preset = {
  name: "enter/tip-in-scatter-curl",
  split: "character",
  stagger: 50,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "expo.out" },
    { prop: "blur", from: 19, to: 0, duration: 750, ease: "elastic.out" },
    { prop: "rotate", from: 240, to: 0, duration: 550, ease: "cubic.out", jitterDelay: 270, transformOrigin: { x: 0, y: 0.5 } },
    { prop: "scaleY", from: 0.2, to: 1, duration: 550, ease: "expo.out", jitterDelay: 330, transformOrigin: { x: 1, y: 1, z: 100 } },
    { prop: "scale", from: 0.5, to: 1, duration: 900, ease: "back.out", transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "skewX", from: { min: -101.269, max: 101.269 }, to: 0, duration: 600, ease: "back.out" },
  ],
};

export const swirlLoose: Preset = {
  name: "enter/swirl-loose",
  split: "word",
  stagger: 50,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "circ.out" },
    { prop: "rotate", from: 270, to: 0, duration: 550, ease: "circ.out", jitterDelay: 80, transformOrigin: { x: 1, y: 0.5 } },
    { prop: "translateX", from: 220, to: 0, duration: 550, ease: "cubic.out" },
  ],
};

export const rotateYInScatterSpring: Preset = {
  name: "enter/rotate-y-in-scatter-spring",
  split: "character",
  stagger: 40,
  staggerOrder: "edges",
  perspective: 550,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "power4.out" },
    { prop: "rotate", from: { min: -2158.772, max: 2158.772 }, to: 0, duration: 650, ease: "sine.out" },
    { prop: "rotateY", from: -510, to: 0, duration: 850, ease: "elastic.out", jitterDelay: 60, transformOrigin: { x: 0, y: 0.5 } },
    { prop: "blur", from: 15, to: 0, duration: 750, ease: "bounce.out" },
    { prop: "translateZ", from: -250, to: 0, duration: 650, ease: "expo.out", jitterDelay: 170 },
    { prop: "scaleX", from: { min: 0.3, max: 3.75 }, to: 1, duration: 800, ease: "back.out", jitterDelay: 350, transformOrigin: { x: 1, y: 1 } },
  ],
};

export const whirlScatterLoose: Preset = {
  name: "enter/whirl-scatter-loose",
  split: "character",
  stagger: 55,
  staggerOrder: "random",
  perspective: 500,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 300, ease: "cubic.out" },
    { prop: "blur", from: { min: 3.2, max: 40 }, to: 0, duration: 550, ease: "circ.out", jitterDelay: 330 },
    { prop: "translateZ", from: -600, to: 0, duration: 550, ease: "sine.out", jitterDelay: 190, perspective: 350 },
    { prop: "rotate", from: -690, to: 0, duration: 650, ease: "quart.out", transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
    { prop: "scaleX", from: { min: 0.3, max: 3.75 }, to: 1, duration: 550, ease: "expo.out" },
    { prop: "scaleY", from: 0.2, to: 1, duration: 600, ease: "quart.out", transformOrigin: { x: 0, y: 0.5, z: -100 } },
  ],
};

export const tipInScatterSnap: Preset = {
  name: "enter/tip-in-scatter-snap",
  split: "character",
  stagger: 20,
  staggerOrder: "edges",
  perspective: 650,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "expo.out" },
    { prop: "rotate", from: { min: -689.006, max: 689.006 }, to: 0, duration: 550, ease: "expo.out", jitterDelay: 60 },
    { prop: "translateY", from: { min: -713.35, max: 713.35 }, to: 0, duration: 750, ease: "elastic.out" },
    { prop: "translateZ", from: -300, to: 0, duration: 550, ease: "quart.out", perspective: 250 },
    { prop: "skewX", from: { min: -135.569, max: 135.569 }, to: 0, duration: 650, ease: "bounce.out", transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
  ],
};

export const swivelScatterInward: Preset = {
  name: "enter/swivel-scatter-inward",
  split: "character",
  stagger: 30,
  staggerOrder: "edges",
  perspective: 500,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "back.out" },
    { prop: "translateY", from: 110, to: 0, duration: 750, ease: "elastic.out", jitterDelay: 350 },
    { prop: "rotateY", from: -450, to: 0, duration: 750, ease: "sine.out", jitterDelay: 130 },
    { prop: "blur", from: { min: 3.8, max: 47.5 }, to: 0, duration: 750, ease: "cubic.out" },
    { prop: "translateZ", from: -400, to: 0, duration: 550, ease: "sine.out" },
  ],
};

export const toppleScatterKick: Preset = {
  name: "enter/topple-scatter-kick",
  split: "character",
  stagger: 35,
  staggerOrder: "random",
  perspective: 400,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 600, ease: "quart.out" },
    { prop: "translateY", from: -90, to: 0, duration: 650, ease: "back.out", jitterDelay: 290 },
    { prop: "rotateX", from: { min: -1884.898, max: 1884.898 }, to: 0, duration: 800, ease: "back.out", jitterDelay: 200, transformOrigin: { x: 0.7, y: 0.3, z: 120 } },
    { prop: "scaleY", from: { min: 0.06, max: 0.75 }, to: 1, duration: 550, ease: "expo.out" },
    { prop: "rotate", from: { min: -2011.127, max: 2011.127 }, to: 0, duration: 850, ease: "quart.out", jitterDelay: 110, transformOrigin: { x: 1, y: 1 } },
    { prop: "scale", from: 0.45, to: 1, duration: 800, ease: "quart.out", jitterDelay: 160, transformOrigin: { x: 0.5, y: 0.5 } },
  ],
};

export const collapseSnap: Preset = {
  name: "exit/collapse-snap",
  split: "word",
  stagger: 55,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "power2.in" },
    { prop: "translateX", from: 0, to: -30, duration: 550, ease: "sine.in" },
    { prop: "translateY", from: 0, to: -30, duration: 450, ease: "back.in" },
    { prop: "scale", from: 1, to: 0.65, duration: 500, ease: "expo.in" },
  ],
};

export const leanOutSnap: Preset = {
  name: "exit/lean-out-snap",
  split: "character",
  stagger: 60,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "power2.in" },
    { prop: "rotate", from: 0, to: 60, duration: 450, ease: "expo.in" },
  ],
};

export const exitXBurst: Preset = {
  name: "exit/exit-x-burst",
  split: "character",
  stagger: 45,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "power2.in" },
    { prop: "translateX", from: 0, to: { min: -106.907, max: 106.907 }, duration: 600, ease: "power2.in" },
    { prop: "skewX", from: 0, to: -10, duration: 450, ease: "sine.in" },
  ],
};

export const mistOut: Preset = {
  name: "exit/mist-out",
  split: "character",
  stagger: 30,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "circ.in" },
    { prop: "blur", from: 0, to: 9, duration: 450, ease: "sine.in" },
  ],
};

export const shearOutBurst: Preset = {
  name: "exit/shear-out-burst",
  split: "character",
  stagger: 35,
  staggerOrder: "center",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 300, ease: "power2.in" },
    { prop: "skewX", from: 0, to: { min: -20.602, max: 20.602 }, duration: 450, ease: "expo.in" },
  ],
};

export const compressXKick: Preset = {
  name: "exit/compress-x-kick",
  split: "character",
  stagger: 30,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 300, ease: "expo.in" },
    { prop: "translateX", from: 0, to: 60, duration: 600, ease: "back.in", jitterDelay: 40 },
    { prop: "scaleY", from: 1, to: 0.5, duration: 450, ease: "circ.in" },
    { prop: "scaleX", from: 1, to: 1.2, duration: 400, ease: "back.in", transformOrigin: { x: 0, y: 1 } },
  ],
};

export const riseOutBurst: Preset = {
  name: "exit/rise-out-burst",
  split: "character",
  stagger: 60,
  staggerOrder: "edges",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "power2.in" },
    { prop: "translateY", from: 0, to: { min: -65.044, max: 65.044 }, duration: 450, ease: "sine.in", jitterDelay: 70 },
  ],
};

export const flipOutBurst: Preset = {
  name: "exit/flip-out-burst",
  split: "character",
  stagger: 20,
  staggerOrder: "end",
  perspective: 450,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "back.in" },
    { prop: "scaleY", from: 1, to: { min: 0.5, max: 6.25 }, duration: 500, ease: "circ.in", transformOrigin: { x: 1, y: 1, z: 100 } },
    { prop: "rotateX", from: 0, to: -270, duration: 450, ease: "power2.in", perspective: 300 },
    { prop: "rotate", from: 0, to: { min: -686.717, max: 686.717 }, duration: 650, ease: "back.in", transformOrigin: { x: 0.5, y: 0.5, z: 80 } },
    { prop: "scaleX", from: 1, to: 1.5, duration: 700, ease: "circ.in", jitterDelay: 330 },
  ],
};

export const pivotOutBurst: Preset = {
  name: "exit/pivot-out-burst",
  split: "character",
  stagger: 45,
  perspective: 450,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 300, ease: "back.in" },
    { prop: "translateX", from: 0, to: { min: -442.009, max: 442.009 }, duration: 450, ease: "sine.in" },
    { prop: "rotateY", from: 0, to: 150, duration: 450, ease: "power2.in", transformOrigin: { x: 0.5, y: 0.5, z: -150 }, perspective: 350 },
    { prop: "blur", from: 0, to: 16, duration: 400, ease: "back.in" },
    { prop: "rotate", from: 0, to: { min: -1390.845, max: 1390.845 }, duration: 450, ease: "circ.in", transformOrigin: { x: 1, y: 0.5 } },
  ],
};

export const flipOutCurl: Preset = {
  name: "exit/flip-out-curl",
  split: "character",
  stagger: 40,
  staggerOrder: "end",
  perspective: 300,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 500, ease: "power2.in" },
    { prop: "scaleY", from: 1, to: 2, duration: 600, ease: "expo.in" },
    { prop: "rotateX", from: 0, to: 150, duration: 600, ease: "circ.in", transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
    { prop: "translateY", from: 0, to: 140, duration: 450, ease: "sine.in", jitterDelay: 250 },
  ],
};

export const turnOutBurst: Preset = {
  name: "exit/turn-out-burst",
  split: "character",
  stagger: 30,
  staggerOrder: "center",
  perspective: 500,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "sine.in" },
    { prop: "translateY", from: 0, to: { min: -735.221, max: 735.221 }, duration: 650, ease: "expo.in", jitterDelay: 260 },
    { prop: "translateZ", from: 0, to: -500, duration: 700, ease: "sine.in", jitterDelay: 340 },
    { prop: "rotateY", from: 0, to: 330, duration: 550, ease: "back.in", jitterDelay: 210, transformOrigin: { x: 1, y: 0 }, perspective: 400 },
    { prop: "blur", from: 0, to: { min: 2.6, max: 32.5 }, duration: 550, ease: "back.in" },
  ],
};

export const squashXBurst: Preset = {
  name: "exit/squash-x-burst",
  split: "character",
  stagger: 30,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "back.in" },
    { prop: "skewX", from: 0, to: { min: -180.065, max: 180.065 }, duration: 300, ease: "circ.in", jitterDelay: 130 },
    { prop: "scale", from: 1, to: { min: 0.1, max: 1.25 }, duration: 600, ease: "expo.in" },
    { prop: "blur", from: 0, to: 18, duration: 400, ease: "circ.in", jitterDelay: 180 },
    { prop: "scaleX", from: 1, to: { min: 0.02, max: 0.25 }, duration: 450, ease: "back.in" },
  ],
};

export const swivelOutBurst: Preset = {
  name: "exit/swivel-out-burst",
  split: "character",
  stagger: 45,
  staggerOrder: "edges",
  perspective: 600,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "sine.in" },
    { prop: "blur", from: 0, to: 11, duration: 400, ease: "circ.in" },
    { prop: "translateX", from: 0, to: { min: -798.874, max: 798.874 }, duration: 700, ease: "circ.in", jitterDelay: 220 },
    { prop: "rotate", from: 0, to: 360, duration: 600, ease: "circ.in", jitterDelay: 60, transformOrigin: { x: 0, y: 0.5, z: -100 } },
    { prop: "rotateY", from: 0, to: -270, duration: 400, ease: "circ.in", jitterDelay: 120, transformOrigin: { x: 0.5, y: 0.5, z: -150 }, perspective: 300 },
  ],
};

export const toppleOutBurst: Preset = {
  name: "exit/topple-out-burst",
  split: "character",
  stagger: 40,
  staggerOrder: "edges",
  perspective: 250,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "back.in" },
    { prop: "rotateY", from: 0, to: { min: -730.346, max: 730.346 }, duration: 500, ease: "circ.in", jitterDelay: 300, transformOrigin: { x: 0, y: 1 } },
    { prop: "rotate", from: 0, to: { min: -682.323, max: 682.323 }, duration: 650, ease: "power2.in", transformOrigin: { x: 0.5, y: 1, z: 100 } },
    { prop: "scale", from: 1, to: 0.6, duration: 500, ease: "back.in", jitterDelay: 120, transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
    { prop: "rotateX", from: 0, to: { min: -379.093, max: 379.093 }, duration: 600, ease: "expo.in", jitterDelay: 220 },
    { prop: "translateZ", from: 0, to: -500, duration: 650, ease: "power2.in", perspective: 250 },
  ],
};

export const flattenY: Preset = {
  name: "exit/flatten-y",
  split: "word",
  stagger: 55,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "expo.in" },
    { prop: "scaleY", from: 1, to: 0.2, duration: 600, ease: "circ.in" },
    { prop: "translateY", from: 0, to: 140, duration: 600, ease: "back.in" },
  ],
};

export const tiltOutBurstLoose: Preset = {
  name: "exit/tilt-out-burst-loose",
  split: "character",
  stagger: 30,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "expo.in" },
    { prop: "scale", from: 1, to: 0.6, duration: 650, ease: "power2.in", jitterDelay: 110 },
    { prop: "scaleX", from: 1, to: { min: 0, max: 0 }, duration: 650, ease: "sine.in", jitterDelay: 310 },
    { prop: "rotate", from: 0, to: { min: -1702.922, max: 1702.922 }, duration: 550, ease: "power2.in" },
  ],
};

export const swirlOutCurl: Preset = {
  name: "exit/swirl-out-curl",
  split: "character",
  stagger: 60,
  staggerOrder: "center",
  perspective: 200,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "circ.in" },
    { prop: "rotate", from: 0, to: 600, duration: 450, ease: "circ.in", transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "scale", from: 1, to: 0.55, duration: 700, ease: "sine.in", transformOrigin: { x: 0.5, y: 1 } },
    { prop: "translateZ", from: 0, to: -300, duration: 400, ease: "power2.in" },
  ],
};

export const toppleOutBurstCurl: Preset = {
  name: "exit/topple-out-burst-curl",
  split: "character",
  stagger: 35,
  perspective: 400,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "expo.in" },
    { prop: "rotateX", from: 0, to: 180, duration: 650, ease: "circ.in", transformOrigin: { x: 1, y: 0.5, z: 100 }, perspective: 450 },
    { prop: "scaleX", from: 1, to: { min: 0.06, max: 0.75 }, duration: 400, ease: "sine.in", jitterDelay: 170, transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "scale", from: 1, to: { min: 0.11, max: 1.375 }, duration: 500, ease: "expo.in", transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "translateX", from: 0, to: { min: -716.595, max: 716.595 }, duration: 550, ease: "sine.in" },
  ],
};

export const squashXBurstCurl: Preset = {
  name: "exit/squash-x-burst-curl",
  split: "character",
  stagger: 45,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "power2.in" },
    { prop: "skewX", from: 0, to: { min: -87.929, max: 87.929 }, duration: 450, ease: "back.in", jitterDelay: 350 },
    { prop: "scaleY", from: 1, to: 2, duration: 500, ease: "power2.in", transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "scaleX", from: 1, to: { min: 0.04, max: 0.5 }, duration: 500, ease: "power2.in", transformOrigin: { x: 1, y: 0.5 } },
  ],
};

export const tipOutBurst: Preset = {
  name: "exit/tip-out-burst",
  split: "character",
  stagger: 35,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "circ.in" },
    { prop: "scale", from: 1, to: { min: 0.12, max: 1.5 }, duration: 650, ease: "power2.in" },
    { prop: "rotate", from: 0, to: { min: -2817.788, max: 2817.788 }, duration: 700, ease: "expo.in" },
    { prop: "scaleX", from: 1, to: 0.1, duration: 600, ease: "expo.in" },
    { prop: "skewX", from: 0, to: -25, duration: 350, ease: "power2.in" },
    { prop: "blur", from: 0, to: { min: 2.4, max: 30 }, duration: 350, ease: "power2.in", jitterDelay: 220 },
    { prop: "scaleY", from: 1, to: 0.1, duration: 450, ease: "power2.in", transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
  ],
};

export const foldOutBurst: Preset = {
  name: "exit/fold-out-burst",
  split: "character",
  stagger: 45,
  perspective: 500,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 500, ease: "expo.in" },
    { prop: "rotateX", from: 0, to: { min: -838.542, max: 838.542 }, duration: 600, ease: "expo.in", jitterDelay: 340 },
    { prop: "rotateY", from: 0, to: { min: -1504.682, max: 1504.682 }, duration: 650, ease: "circ.in", jitterDelay: 50, perspective: 200 },
    { prop: "blur", from: 0, to: { min: 1.8, max: 22.5 }, duration: 450, ease: "back.in" },
    { prop: "skewX", from: 0, to: { min: -158.202, max: 158.202 }, duration: 550, ease: "sine.in" },
  ],
};

export const foldOutBurstCurl: Preset = {
  name: "exit/fold-out-burst-curl",
  split: "character",
  stagger: 50,
  perspective: 300,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 500, ease: "power2.in" },
    { prop: "rotateX", from: 0, to: { min: -1671.432, max: 1671.432 }, duration: 500, ease: "power2.in", transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "scale", from: 1, to: 0.55, duration: 400, ease: "power2.in", jitterDelay: 210, transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "translateX", from: 0, to: { min: -842.788, max: 842.788 }, duration: 600, ease: "expo.in" },
    { prop: "scaleY", from: 1, to: { min: 0.4, max: 5 }, duration: 450, ease: "back.in", transformOrigin: { x: 0, y: 0.5 } },
  ],
};

export const flipOutLoose: Preset = {
  name: "exit/flip-out-loose",
  split: "character",
  stagger: 55,
  staggerOrder: "end",
  perspective: 650,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "sine.in" },
    { prop: "translateX", from: 0, to: 210, duration: 700, ease: "power2.in", jitterDelay: 240 },
    { prop: "translateZ", from: 0, to: -500, duration: 550, ease: "back.in", perspective: 650 },
    { prop: "rotateX", from: 0, to: 450, duration: 500, ease: "sine.in", perspective: 350 },
  ],
};

export const tipOutBurstCurl: Preset = {
  name: "exit/tip-out-burst-curl",
  split: "character",
  stagger: 30,
  perspective: 250,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 300, ease: "back.in" },
    { prop: "rotate", from: 0, to: { min: -8211.136, max: 8211.136 }, duration: 600, ease: "sine.in", transformOrigin: { x: 0.5, y: 0.5, z: 80 } },
    { prop: "translateZ", from: 0, to: -500, duration: 600, ease: "expo.in", jitterDelay: 250, perspective: 350 },
    { prop: "scaleX", from: 1, to: { min: 0.6, max: 7.5 }, duration: 500, ease: "back.in", jitterDelay: 360, transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
  ],
};

export const toppleOutBurstSnap: Preset = {
  name: "exit/topple-out-burst-snap",
  split: "character",
  stagger: 50,
  staggerOrder: "end",
  perspective: 250,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "circ.in" },
    { prop: "blur", from: 0, to: { min: 5.6, max: 70 }, duration: 550, ease: "back.in", jitterDelay: 320 },
    { prop: "translateZ", from: 0, to: -700, duration: 450, ease: "power2.in", jitterDelay: 330 },
    { prop: "rotate", from: 0, to: { min: -2756.425, max: 2756.425 }, duration: 700, ease: "back.in", jitterDelay: 100 },
    { prop: "translateY", from: 0, to: { min: -2088.237, max: 2088.237 }, duration: 650, ease: "power2.in" },
    { prop: "rotateX", from: 0, to: { min: -2681.519, max: 2681.519 }, duration: 450, ease: "expo.in", jitterDelay: 170, perspective: 100 },
  ],
};

export const foldOutBurst2: Preset = {
  name: "exit/fold-out-burst-2",
  split: "character",
  stagger: 55,
  perspective: 550,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "power2.in" },
    { prop: "translateY", from: 0, to: -150, duration: 550, ease: "back.in" },
    { prop: "translateX", from: 0, to: -200, duration: 500, ease: "back.in" },
    { prop: "rotateX", from: 0, to: { min: -1910.147, max: 1910.147 }, duration: 550, ease: "circ.in", transformOrigin: { x: 0.5, y: 1 } },
  ],
};

export const tiltOutBurstWord: Preset = {
  name: "exit/tilt-out-burst-word",
  split: "word",
  stagger: 25,
  staggerOrder: "center",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "circ.in" },
    { prop: "rotate", from: 0, to: -180, duration: 500, ease: "sine.in" },
    { prop: "skewX", from: 0, to: 25, duration: 400, ease: "back.in", jitterDelay: 250, transformOrigin: { x: 0.5, y: 0 } },
    { prop: "blur", from: 0, to: { min: 1.4, max: 17.5 }, duration: 500, ease: "sine.in" },
  ],
};

export const compressXBurst: Preset = {
  name: "exit/compress-x-burst",
  split: "character",
  stagger: 25,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "power2.in" },
    { prop: "scaleX", from: 1, to: { min: 0.4, max: 5 }, duration: 600, ease: "circ.in", transformOrigin: { x: 0, y: 0 } },
    { prop: "blur", from: 0, to: 16, duration: 500, ease: "circ.in" },
    { prop: "scaleY", from: 1, to: { min: 0.8, max: 10 }, duration: 450, ease: "back.in", transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "translateY", from: 0, to: -120, duration: 500, ease: "expo.in", jitterDelay: 240 },
  ],
};

export const liftOutBurst: Preset = {
  name: "exit/lift-out-burst",
  split: "character",
  stagger: 15,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "circ.in" },
    { prop: "blur", from: 0, to: 16, duration: 300, ease: "back.in" },
    { prop: "translateY", from: 0, to: { min: -348.088, max: 348.088 }, duration: 600, ease: "sine.in" },
    { prop: "translateX", from: 0, to: { min: -417.724, max: 417.724 }, duration: 400, ease: "sine.in" },
  ],
};

export const swivelOutCurl: Preset = {
  name: "exit/swivel-out-curl",
  split: "character",
  stagger: 45,
  perspective: 350,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "expo.in" },
    { prop: "rotateY", from: 0, to: -420, duration: 500, ease: "expo.in", transformOrigin: { x: 0, y: 0, z: -100 } },
    { prop: "blur", from: 0, to: 13, duration: 550, ease: "circ.in", jitterDelay: 210 },
  ],
};

export const flattenYBurst: Preset = {
  name: "exit/flatten-y-burst",
  split: "character",
  stagger: 55,
  perspective: 200,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "expo.in" },
    { prop: "translateZ", from: 0, to: -600, duration: 400, ease: "sine.in" },
    { prop: "scaleY", from: 1, to: { min: 0.04, max: 0.5 }, duration: 600, ease: "sine.in", transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "skewX", from: 0, to: { min: -95.481, max: 95.481 }, duration: 550, ease: "expo.in", transformOrigin: { x: 0.5, y: 0.5 } },
    { prop: "translateX", from: 0, to: { min: -994.343, max: 994.343 }, duration: 500, ease: "back.in" },
  ],
};

export const compressXBurstCurl: Preset = {
  name: "exit/compress-x-burst-curl",
  split: "character",
  stagger: 35,
  staggerOrder: "center",
  perspective: 300,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "power2.in" },
    { prop: "scaleX", from: 1, to: { min: 0.3, max: 3.75 }, duration: 500, ease: "power2.in", jitterDelay: 300, transformOrigin: { x: 0, y: 0, z: -100 } },
    { prop: "blur", from: 0, to: 19, duration: 450, ease: "sine.in", jitterDelay: 270 },
    { prop: "translateZ", from: 0, to: -300, duration: 550, ease: "back.in", jitterDelay: 200 },
    { prop: "scaleY", from: 1, to: { min: 0.6, max: 7.5 }, duration: 450, ease: "expo.in", transformOrigin: { x: 0.5, y: 1 } },
  ],
};

export const tipOutBurstLoose: Preset = {
  name: "exit/tip-out-burst-loose",
  split: "character",
  stagger: 50,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 500, ease: "power2.in" },
    { prop: "rotate", from: 0, to: { min: -1061.328, max: 1061.328 }, duration: 700, ease: "circ.in", jitterDelay: 260 },
    { prop: "skewX", from: 0, to: -30, duration: 500, ease: "sine.in" },
  ],
};

export const swivelOutBurstCurl: Preset = {
  name: "exit/swivel-out-burst-curl",
  split: "character",
  stagger: 60,
  perspective: 600,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "expo.in" },
    { prop: "rotate", from: 0, to: { min: -1383.56, max: 1383.56 }, duration: 400, ease: "circ.in", jitterDelay: 160, transformOrigin: { x: 0.5, y: 0 } },
    { prop: "translateZ", from: 0, to: -500, duration: 500, ease: "back.in", jitterDelay: 330 },
    { prop: "scale", from: 1, to: 0.6, duration: 500, ease: "expo.in", transformOrigin: { x: 1, y: 0 } },
    { prop: "rotateY", from: 0, to: 180, duration: 700, ease: "expo.in", jitterDelay: 310, transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
  ],
};

export const leanOutBurst: Preset = {
  name: "exit/lean-out-burst",
  split: "character",
  stagger: 55,
  perspective: 400,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "back.in" },
    { prop: "scale", from: 1, to: { min: 0.07, max: 0.875 }, duration: 550, ease: "circ.in", jitterDelay: 500, transformOrigin: { x: 1, y: 0.5 } },
    { prop: "translateZ", from: 0, to: -550, duration: 450, ease: "back.in", jitterDelay: 320, perspective: 250 },
    { prop: "skewX", from: 0, to: { min: -426.352, max: 426.352 }, duration: 350, ease: "circ.in", jitterDelay: 120, transformOrigin: { x: 1, y: 0.5 } },
    { prop: "rotate", from: 0, to: { min: -4167.85, max: 4167.85 }, duration: 600, ease: "sine.in", jitterDelay: 260 },
    { prop: "scaleY", from: 1, to: { min: 0.6, max: 7.5 }, duration: 650, ease: "back.in", jitterDelay: 490, transformOrigin: { x: 0.5, y: 0.5, z: 80 } },
    { prop: "scaleX", from: 1, to: { min: 0.6, max: 7.5 }, duration: 600, ease: "sine.in", jitterDelay: 380, transformOrigin: { x: 0.5, y: 0 } },
    { prop: "blur", from: 0, to: { min: 2.6, max: 32.5 }, duration: 300, ease: "expo.in", jitterDelay: 410 },
  ],
};

export const leanOutBurstWord: Preset = {
  name: "exit/lean-out-burst-word",
  split: "word",
  stagger: 35,
  staggerOrder: "edges",
  perspective: 250,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "back.in" },
    { prop: "scale", from: 1, to: 0.4, duration: 650, ease: "sine.in", transformOrigin: { x: 0, y: 0.5, z: -100 } },
    { prop: "rotate", from: 0, to: { min: -3398.606, max: 3398.606 }, duration: 650, ease: "expo.in", transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "translateX", from: 0, to: { min: -3183.365, max: 3183.365 }, duration: 500, ease: "expo.in", jitterDelay: 300 },
    { prop: "translateZ", from: 0, to: -850, duration: 400, ease: "expo.in", perspective: 100 },
    { prop: "translateY", from: 0, to: { min: -1398.153, max: 1398.153 }, duration: 700, ease: "circ.in" },
  ],
};

export const leanOutBurstCurl: Preset = {
  name: "exit/lean-out-burst-curl",
  split: "character",
  stagger: 20,
  perspective: 150,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 300, ease: "expo.in" },
    { prop: "blur", from: 0, to: { min: 5.6, max: 70 }, duration: 350, ease: "power2.in", jitterDelay: 130 },
    { prop: "rotate", from: 0, to: { min: -9227.372, max: 9227.372 }, duration: 550, ease: "power2.in", jitterDelay: 120, transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "scale", from: 1, to: { min: 0.09, max: 1.125 }, duration: 600, ease: "sine.in" },
    { prop: "scaleY", from: 1, to: 0, duration: 450, ease: "circ.in", jitterDelay: 370 },
    { prop: "translateZ", from: 0, to: -950, duration: 550, ease: "sine.in", jitterDelay: 150, perspective: 200 },
  ],
};

export const swivelOut: Preset = {
  name: "exit/swivel-out",
  split: "word",
  stagger: 25,
  perspective: 1250,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "back.in" },
    { prop: "rotateY", from: 0, to: -30, duration: 650, ease: "sine.in" },
    { prop: "translateY", from: 0, to: -70, duration: 400, ease: "back.in" },
    { prop: "scaleX", from: 1, to: 0.7, duration: 550, ease: "circ.in" },
  ],
};

export const dissolveKick: Preset = {
  name: "exit/dissolve-kick",
  split: "character",
  stagger: 55,
  staggerOrder: "edges",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "expo.in" },
    { prop: "blur", from: 0, to: 4, duration: 400, ease: "back.in" },
  ],
};

export const riseOutKick: Preset = {
  name: "exit/rise-out-kick",
  split: "character",
  stagger: 50,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 500, ease: "circ.in" },
    { prop: "translateY", from: 0, to: -50, duration: 450, ease: "back.in" },
  ],
};

export const swivelOutKick: Preset = {
  name: "exit/swivel-out-kick",
  split: "character",
  stagger: 40,
  staggerOrder: "random",
  perspective: 1300,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 300, ease: "sine.in" },
    { prop: "scale", from: 1, to: 0.25, duration: 700, ease: "power2.in", jitterDelay: 50 },
    { prop: "rotateY", from: 0, to: 30, duration: 550, ease: "back.in" },
  ],
};

export const twirlOutBurst: Preset = {
  name: "exit/twirl-out-burst",
  split: "character",
  stagger: 20,
  staggerOrder: "center",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "circ.in" },
    { prop: "skewX", from: 0, to: { min: -73.053, max: 73.053 }, duration: 350, ease: "sine.in", jitterDelay: 200 },
    { prop: "scaleY", from: 1, to: 0.2, duration: 500, ease: "circ.in", transformOrigin: { x: 1, y: 0.5 } },
    { prop: "rotate", from: 0, to: -540, duration: 700, ease: "sine.in" },
  ],
};

export const pinwheelOut: Preset = {
  name: "exit/pinwheel-out",
  split: "character",
  stagger: 35,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "power2.in" },
    { prop: "scaleX", from: 1, to: 0.3, duration: 700, ease: "circ.in" },
    { prop: "rotate", from: 0, to: 600, duration: 450, ease: "circ.in", transformOrigin: { x: 1, y: 1 } },
    { prop: "blur", from: 0, to: 16, duration: 350, ease: "power2.in" },
  ],
};

export const turnOutBurstSnap: Preset = {
  name: "exit/turn-out-burst-snap",
  split: "character",
  stagger: 60,
  staggerOrder: "end",
  perspective: 300,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "circ.in" },
    { prop: "translateZ", from: 0, to: -550, duration: 550, ease: "power2.in" },
    { prop: "rotateY", from: 0, to: 180, duration: 500, ease: "expo.in", jitterDelay: 250, transformOrigin: { x: 1, y: 1 } },
    { prop: "scaleY", from: 1, to: { min: 0, max: -2.5 }, duration: 650, ease: "circ.in", jitterDelay: 130, transformOrigin: { x: 0.5, y: 0 } },
    { prop: "rotate", from: 0, to: 330, duration: 500, ease: "sine.in", transformOrigin: { x: 0.5, y: 0 } },
  ],
};

export const swirlOutBurst: Preset = {
  name: "exit/swirl-out-burst",
  split: "character",
  stagger: 50,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "sine.in" },
    { prop: "scaleY", from: 1, to: { min: 0.4, max: 5 }, duration: 500, ease: "back.in", jitterDelay: 220 },
    { prop: "blur", from: 0, to: { min: 5.2, max: 65 }, duration: 500, ease: "sine.in", jitterDelay: 180 },
    { prop: "skewX", from: 0, to: { min: -156.995, max: 156.995 }, duration: 450, ease: "power2.in", transformOrigin: { x: 0.3, y: 0.7, z: -120 } },
    { prop: "translateY", from: 0, to: { min: -1468.315, max: 1468.315 }, duration: 650, ease: "back.in", jitterDelay: 220 },
    { prop: "scale", from: 1, to: 0.8, duration: 450, ease: "expo.in", jitterDelay: 460 },
    { prop: "rotate", from: 0, to: -360, duration: 600, ease: "expo.in", jitterDelay: 130, transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
  ],
};

export const compressXBurstKick: Preset = {
  name: "exit/compress-x-burst-kick",
  split: "character",
  stagger: 50,
  perspective: 600,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 500, ease: "power2.in" },
    { prop: "translateZ", from: 0, to: -400, duration: 400, ease: "power2.in" },
    { prop: "translateY", from: 0, to: -110, duration: 650, ease: "sine.in" },
    { prop: "blur", from: 0, to: 20, duration: 350, ease: "back.in" },
    { prop: "scaleX", from: 1, to: { min: 0.04, max: 0.5 }, duration: 650, ease: "back.in" },
  ],
};

export const turnOutBurst2: Preset = {
  name: "exit/turn-out-burst-2",
  split: "character",
  stagger: 35,
  perspective: 300,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "circ.in" },
    { prop: "rotate", from: 0, to: 270, duration: 650, ease: "expo.in", transformOrigin: { x: 0, y: 1 } },
    { prop: "rotateY", from: 0, to: -510, duration: 600, ease: "expo.in", jitterDelay: 340 },
    { prop: "scaleX", from: 1, to: 0.1, duration: 500, ease: "power2.in", transformOrigin: { x: 0.5, y: 0 } },
    { prop: "translateZ", from: 0, to: -350, duration: 600, ease: "expo.in", jitterDelay: 120 },
    { prop: "scaleY", from: 1, to: { min: 0.3, max: 3.75 }, duration: 400, ease: "back.in", jitterDelay: 140 },
  ],
};

export const flattenXLoose: Preset = {
  name: "exit/flatten-x-loose",
  split: "character",
  stagger: 25,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "sine.in" },
    { prop: "scaleX", from: 1, to: 2, duration: 650, ease: "circ.in" },
    { prop: "translateY", from: 0, to: 120, duration: 500, ease: "circ.in", jitterDelay: 100 },
  ],
};

export const pivotOutBurstLoose: Preset = {
  name: "exit/pivot-out-burst-loose",
  split: "character",
  stagger: 45,
  staggerOrder: "center",
  perspective: 550,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "power2.in" },
    { prop: "rotateY", from: 0, to: { min: -1634.263, max: 1634.263 }, duration: 600, ease: "power2.in", jitterDelay: 300, transformOrigin: { x: 0.5, y: 1 } },
    { prop: "translateZ", from: 0, to: -400, duration: 500, ease: "sine.in" },
  ],
};

export const flattenXBurstLoose: Preset = {
  name: "exit/flatten-x-burst-loose",
  split: "character",
  stagger: 15,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "circ.in" },
    { prop: "skewX", from: 0, to: { min: -98.309, max: 98.309 }, duration: 500, ease: "back.in" },
    { prop: "blur", from: 0, to: { min: 2, max: 25 }, duration: 500, ease: "power2.in" },
    { prop: "scaleX", from: 1, to: 0.1, duration: 600, ease: "power2.in", jitterDelay: 160, transformOrigin: { x: 1, y: 0 } },
  ],
};

export const turnOutBurstDeep: Preset = {
  name: "exit/turn-out-burst-deep",
  split: "character",
  stagger: 35,
  perspective: 550,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "power2.in" },
    { prop: "rotate", from: 0, to: 420, duration: 400, ease: "back.in", jitterDelay: 220, transformOrigin: { x: 0, y: 0.5 } },
    { prop: "scaleX", from: 1, to: { min: 0.3, max: 3.75 }, duration: 600, ease: "power2.in", jitterDelay: 270, transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "translateZ", from: 0, to: -300, duration: 550, ease: "power2.in", perspective: 500 },
    { prop: "rotateY", from: 0, to: { min: -1514.115, max: 1514.115 }, duration: 650, ease: "sine.in", transformOrigin: { x: 1, y: 1 }, perspective: 400 },
    { prop: "skewX", from: 0, to: 30, duration: 400, ease: "circ.in", jitterDelay: 130 },
  ],
};

export const leanOutBurstSwarm: Preset = {
  name: "exit/lean-out-burst-swarm",
  split: "character",
  stagger: 20,
  staggerOrder: "random",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 300, ease: "circ.in" },
    { prop: "rotate", from: 0, to: { min: -708.308, max: 708.308 }, duration: 400, ease: "power2.in", transformOrigin: { x: 0.5, y: 0.5 } },
    { prop: "blur", from: 0, to: 15, duration: 550, ease: "circ.in" },
  ],
};

export const toppleOutBurstKick: Preset = {
  name: "exit/topple-out-burst-kick",
  split: "character",
  stagger: 30,
  staggerOrder: "end",
  perspective: 350,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 250, ease: "circ.in" },
    { prop: "skewX", from: 0, to: { min: -103.077, max: 103.077 }, duration: 600, ease: "back.in", jitterDelay: 200 },
    { prop: "scale", from: 1, to: { min: 0.1, max: 1.25 }, duration: 650, ease: "sine.in", jitterDelay: 300, transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "rotateX", from: 0, to: -540, duration: 450, ease: "back.in", perspective: 650 },
    { prop: "rotate", from: 0, to: -120, duration: 600, ease: "circ.in", transformOrigin: { x: 1, y: 1 } },
    { prop: "rotateY", from: 0, to: { min: -513.409, max: 513.409 }, duration: 500, ease: "back.in", jitterDelay: 340, perspective: 600 },
    { prop: "translateZ", from: 0, to: -250, duration: 500, ease: "back.in", jitterDelay: 90, perspective: 500 },
  ],
};

export const turnOutBurstSwarm: Preset = {
  name: "exit/turn-out-burst-swarm",
  split: "character",
  stagger: 40,
  staggerOrder: "random",
  perspective: 200,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "expo.in" },
    { prop: "scale", from: 1, to: { min: 0.04, max: 0.5 }, duration: 600, ease: "expo.in" },
    { prop: "rotateY", from: 0, to: 420, duration: 600, ease: "sine.in", jitterDelay: 130, perspective: 300 },
    { prop: "translateZ", from: 0, to: -400, duration: 550, ease: "circ.in" },
    { prop: "translateY", from: 0, to: { min: -531.079, max: 531.079 }, duration: 550, ease: "expo.in" },
  ],
};

export const tiltOutBurst2: Preset = {
  name: "exit/tilt-out-burst",
  split: "word",
  stagger: 45,
  perspective: 200,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "back.in" },
    { prop: "rotate", from: 0, to: { min: -1463.134, max: 1463.134 }, duration: 600, ease: "circ.in", transformOrigin: { x: 1, y: 0.5 } },
    { prop: "scaleX", from: 1, to: 2, duration: 450, ease: "back.in" },
    { prop: "skewX", from: 0, to: { min: -93.8, max: 93.8 }, duration: 550, ease: "sine.in", jitterDelay: 210 },
    { prop: "scale", from: 1, to: 0.3, duration: 550, ease: "back.in" },
    { prop: "translateX", from: 0, to: -130, duration: 500, ease: "back.in", jitterDelay: 290 },
    { prop: "translateZ", from: 0, to: -550, duration: 400, ease: "back.in" },
  ],
};

export const swivelOutBurstLoose: Preset = {
  name: "exit/swivel-out-burst-loose",
  split: "character",
  stagger: 35,
  staggerOrder: "edges",
  perspective: 550,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "sine.in" },
    { prop: "scaleY", from: 1, to: 1.5, duration: 400, ease: "power2.in", jitterDelay: 260, transformOrigin: { x: 0.5, y: 1 } },
    { prop: "translateZ", from: 0, to: -400, duration: 500, ease: "expo.in", jitterDelay: 70, perspective: 550 },
    { prop: "translateX", from: 0, to: { min: -499.568, max: 499.568 }, duration: 600, ease: "circ.in" },
    { prop: "rotateY", from: 0, to: 360, duration: 650, ease: "power2.in", perspective: 650 },
  ],
};

export const implodeBurst: Preset = {
  name: "exit/implode-burst",
  split: "word",
  stagger: 55,
  staggerOrder: "end",
  perspective: 250,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "sine.in" },
    { prop: "skewX", from: 0, to: -30, duration: 450, ease: "expo.in", jitterDelay: 150 },
    { prop: "translateX", from: 0, to: -100, duration: 400, ease: "expo.in", jitterDelay: 60 },
    { prop: "scale", from: 1, to: { min: 0.1, max: 1.25 }, duration: 500, ease: "back.in" },
    { prop: "translateZ", from: 0, to: -450, duration: 500, ease: "back.in" },
  ],
};

export const swivelOutLoose: Preset = {
  name: "exit/swivel-out-loose",
  split: "character",
  stagger: 35,
  staggerOrder: "end",
  perspective: 600,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "circ.in" },
    { prop: "scale", from: 1, to: 0.7, duration: 550, ease: "back.in" },
    { prop: "rotateY", from: 0, to: 210, duration: 450, ease: "circ.in", jitterDelay: 170 },
    { prop: "translateZ", from: 0, to: -400, duration: 500, ease: "back.in", jitterDelay: 150 },
  ],
};

export const compressXBurstLoose: Preset = {
  name: "exit/compress-x-burst-loose",
  split: "character",
  stagger: 35,
  perspective: 550,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "power2.in" },
    { prop: "scaleY", from: 1, to: { min: 0.4, max: 5 }, duration: 550, ease: "sine.in", transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
    { prop: "translateZ", from: 0, to: -300, duration: 450, ease: "circ.in", jitterDelay: 300, perspective: 550 },
    { prop: "scale", from: 1, to: { min: 0.14, max: 1.75 }, duration: 500, ease: "sine.in", jitterDelay: 190, transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
    { prop: "scaleX", from: 1, to: -1, duration: 500, ease: "circ.in", jitterDelay: 330 },
  ],
};

export const foldOutBurstLoose: Preset = {
  name: "exit/fold-out-burst-loose",
  split: "character",
  stagger: 25,
  staggerOrder: "center",
  perspective: 250,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "back.in" },
    { prop: "translateX", from: 0, to: -190, duration: 450, ease: "circ.in" },
    { prop: "rotate", from: 0, to: -420, duration: 650, ease: "back.in", jitterDelay: 280 },
    { prop: "scaleX", from: 1, to: 1.5, duration: 550, ease: "expo.in", transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
    { prop: "scale", from: 1, to: 0.65, duration: 500, ease: "sine.in", jitterDelay: 170, transformOrigin: { x: 1, y: 0 } },
    { prop: "rotateX", from: 0, to: { min: -1328.366, max: 1328.366 }, duration: 450, ease: "sine.in", transformOrigin: { x: 0.5, y: 0.5 } },
  ],
};

export const collapseBurst: Preset = {
  name: "exit/collapse-burst",
  split: "word",
  stagger: 30,
  staggerOrder: "random",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "sine.in" },
    { prop: "translateX", from: 0, to: { min: -470.244, max: 470.244 }, duration: 600, ease: "expo.in", jitterDelay: 190 },
    { prop: "scale", from: 1, to: { min: 0.06, max: 0.75 }, duration: 500, ease: "circ.in", jitterDelay: 310 },
    { prop: "translateY", from: 0, to: -130, duration: 600, ease: "back.in" },
  ],
};

export const compressYBurstCurl: Preset = {
  name: "exit/compress-y-burst-curl",
  split: "character",
  stagger: 45,
  perspective: 500,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "power2.in" },
    { prop: "skewX", from: 0, to: -20, duration: 450, ease: "expo.in", transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
    { prop: "translateX", from: 0, to: { min: -498.7, max: 498.7 }, duration: 700, ease: "expo.in" },
    { prop: "scaleY", from: 1, to: { min: 0, max: 0 }, duration: 600, ease: "sine.in", transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "translateZ", from: 0, to: -450, duration: 450, ease: "power2.in", jitterDelay: 270, perspective: 450 },
  ],
};

export const twirlOutBurstLoose: Preset = {
  name: "exit/twirl-out-burst-loose",
  split: "character",
  stagger: 55,
  staggerOrder: "end",
  perspective: 450,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "expo.in" },
    { prop: "scaleY", from: 1, to: { min: 0.5, max: 6.25 }, duration: 600, ease: "back.in", transformOrigin: { x: 0.5, y: 0 } },
    { prop: "rotate", from: 0, to: 420, duration: 450, ease: "circ.in" },
    { prop: "translateZ", from: 0, to: -600, duration: 650, ease: "sine.in" },
    { prop: "skewX", from: 0, to: 40, duration: 450, ease: "back.in" },
    { prop: "translateX", from: 0, to: 110, duration: 500, ease: "expo.in", jitterDelay: 320 },
  ],
};

export const flattenYCurl: Preset = {
  name: "exit/flatten-y-curl",
  split: "character",
  stagger: 55,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "back.in" },
    { prop: "scaleY", from: 1, to: -1, duration: 400, ease: "sine.in", jitterDelay: 280, transformOrigin: { x: 0.5, y: 0.5, z: 80 } },
    { prop: "translateX", from: 0, to: -110, duration: 450, ease: "back.in" },
  ],
};

export const tipOutBurstInward: Preset = {
  name: "exit/tip-out-burst-inward",
  split: "character",
  stagger: 60,
  staggerOrder: "edges",
  perspective: 550,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "back.in" },
    { prop: "translateY", from: 0, to: 90, duration: 400, ease: "back.in" },
    { prop: "blur", from: 0, to: 19, duration: 400, ease: "back.in" },
    { prop: "rotate", from: 0, to: { min: -1208.194, max: 1208.194 }, duration: 650, ease: "sine.in", jitterDelay: 100 },
    { prop: "scale", from: 1, to: { min: 0.15, max: 1.875 }, duration: 600, ease: "power2.in" },
    { prop: "translateZ", from: 0, to: -200, duration: 450, ease: "sine.in", jitterDelay: 170 },
  ],
};

export const flattenXBurstDeep: Preset = {
  name: "exit/flatten-x-burst-deep",
  split: "character",
  stagger: 50,
  staggerOrder: "random",
  perspective: 500,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "power2.in" },
    { prop: "blur", from: 0, to: { min: 3.8, max: 47.5 }, duration: 600, ease: "expo.in" },
    { prop: "translateZ", from: 0, to: -600, duration: 700, ease: "back.in", jitterDelay: 100, perspective: 200 },
    { prop: "scaleX", from: 1, to: 0.2, duration: 650, ease: "sine.in", transformOrigin: { x: 0, y: 0 } },
  ],
};

export const swivelOutBurstSnap: Preset = {
  name: "exit/swivel-out-burst-snap",
  split: "character",
  stagger: 40,
  perspective: 200,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "power2.in" },
    { prop: "scaleY", from: 1, to: { min: 0.8, max: 10 }, duration: 700, ease: "expo.in", jitterDelay: 120, transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
    { prop: "translateZ", from: 0, to: -450, duration: 600, ease: "sine.in", jitterDelay: 200, perspective: 100 },
    { prop: "skewX", from: 0, to: { min: -303.217, max: 303.217 }, duration: 500, ease: "power2.in", jitterDelay: 210, transformOrigin: { x: 1, y: 1, z: 100 } },
    { prop: "scale", from: 1, to: { min: 0.15, max: 1.875 }, duration: 500, ease: "power2.in", jitterDelay: 410, transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "translateX", from: 0, to: -290, duration: 500, ease: "sine.in", jitterDelay: 410 },
    { prop: "rotate", from: 0, to: { min: -4120.645, max: 4120.645 }, duration: 650, ease: "back.in", jitterDelay: 280 },
    { prop: "rotateY", from: 0, to: { min: -4286.904, max: 4286.904 }, duration: 650, ease: "expo.in", jitterDelay: 400, transformOrigin: { x: 0.5, y: 0.5, z: 80 } },
  ],
};

export const tiltOutBurstDeep: Preset = {
  name: "exit/tilt-out-burst-deep",
  split: "character",
  stagger: 45,
  perspective: 250,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 350, ease: "back.in" },
    { prop: "rotate", from: 0, to: { min: -1677.161, max: 1677.161 }, duration: 550, ease: "power2.in", jitterDelay: 380, transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "skewX", from: 0, to: { min: -285.686, max: 285.686 }, duration: 350, ease: "power2.in", jitterDelay: 180 },
    { prop: "scaleY", from: 1, to: { min: 0, max: -2.5 }, duration: 600, ease: "expo.in", jitterDelay: 480 },
    { prop: "translateZ", from: 0, to: -850, duration: 600, ease: "back.in", jitterDelay: 330, perspective: 100 },
    { prop: "blur", from: 0, to: { min: 5.2, max: 65 }, duration: 550, ease: "expo.in", jitterDelay: 300 },
  ],
};

export const swipeOutSnap: Preset = {
  name: "exit/swipe-out-snap",
  split: "character",
  stagger: 45,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "sine.in" },
    { prop: "translateX", from: 0, to: 30, duration: 450, ease: "expo.in" },
  ],
};

export const turnOutBurstTrail: Preset = {
  name: "exit/turn-out-burst-trail",
  split: "character",
  stagger: 60,
  staggerOrder: "end",
  perspective: 350,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "expo.in" },
    { prop: "rotateY", from: 0, to: { min: -1766.601, max: 1766.601 }, duration: 600, ease: "sine.in" },
    { prop: "scale", from: 1, to: 0.65, duration: 650, ease: "sine.in", jitterDelay: 100, transformOrigin: { x: 0.5, y: 0.5 } },
    { prop: "scaleY", from: 1, to: { min: 0.5, max: 6.25 }, duration: 650, ease: "expo.in", jitterDelay: 240 },
    { prop: "translateZ", from: 0, to: -500, duration: 500, ease: "expo.in", jitterDelay: 110 },
    { prop: "translateY", from: 0, to: 210, duration: 500, ease: "power2.in" },
    { prop: "translateX", from: 0, to: -220, duration: 600, ease: "power2.in" },
  ],
};

export const toppleOutBurst2: Preset = {
  name: "exit/topple-out-burst-2",
  split: "character",
  stagger: 55,
  perspective: 250,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400, ease: "sine.in" },
    { prop: "scaleY", from: 1, to: { min: 0.3, max: 3.75 }, duration: 450, ease: "expo.in", jitterDelay: 80 },
    { prop: "rotateX", from: 0, to: { min: -1574.842, max: 1574.842 }, duration: 450, ease: "sine.in" },
    { prop: "translateY", from: 0, to: 180, duration: 550, ease: "power2.in", jitterDelay: 270 },
    { prop: "translateZ", from: 0, to: -400, duration: 450, ease: "power2.in", jitterDelay: 200, perspective: 600 },
    { prop: "rotateY", from: 0, to: -510, duration: 450, ease: "expo.in", perspective: 450 },
  ],
};

export const flattenXCurl: Preset = {
  name: "exit/flatten-x-curl",
  split: "character",
  stagger: 55,
  staggerOrder: "center",
  perspective: 300,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450, ease: "back.in" },
    { prop: "skewX", from: 0, to: 40, duration: 550, ease: "circ.in", transformOrigin: { x: 0.5, y: 0.5, z: 80 } },
    { prop: "translateZ", from: 0, to: -450, duration: 550, ease: "back.in", perspective: 200 },
    { prop: "scaleX", from: 1, to: 2.5, duration: 600, ease: "back.in", jitterDelay: 280, transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "translateX", from: 0, to: 140, duration: 600, ease: "back.in" },
  ],
};

export const tiltOutBurstKick: Preset = {
  name: "exit/tilt-out-burst-kick",
  split: "character",
  stagger: 60,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 300, ease: "expo.in" },
    { prop: "blur", from: 0, to: { min: 2, max: 25 }, duration: 550, ease: "expo.in" },
    { prop: "scale", from: 1, to: 0.5, duration: 600, ease: "circ.in", jitterDelay: 50 },
    { prop: "rotate", from: 0, to: { min: -1954.387, max: 1954.387 }, duration: 600, ease: "back.in", transformOrigin: { x: 1, y: 1 } },
    { prop: "scaleY", from: 1, to: { min: 0.02, max: 0.25 }, duration: 450, ease: "sine.in" },
  ],
};

export const wiggleOutward: Preset = {
  name: "emphasis/wiggle-outward",
  split: "character",
  stagger: 30,
  staggerOrder: "center",
  animations: [
    { prop: "translateX", from: 0, to: -2.5, duration: 175, ease: "cubic.out" },
    { prop: "translateX", from: -2.5, to: 0, duration: 225, delay: 175, ease: "cubic.out" },
  ],
};

export const leanLoose: Preset = {
  name: "emphasis/lean-loose",
  split: "character",
  stagger: 55,
  animations: [
    { prop: "rotate", from: 0, to: 15, duration: 175, ease: "cubic.out", jitterDelay: 130 },
    { prop: "rotate", from: 15, to: 0, duration: 225, delay: 175, ease: "cubic.out", jitterDelay: 180 },
  ],
};

export const pinwheelCurl: Preset = {
  name: "emphasis/pinwheel-curl",
  split: "word",
  stagger: 30,
  staggerOrder: "end",
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 800, ease: "sine.inOut", transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
  ],
};

export const bob: Preset = {
  name: "emphasis/bob",
  split: "character",
  stagger: 50,
  animations: [
    { prop: "translateY", from: 0, to: -8, duration: 175, ease: "cubic.out" },
    { prop: "translateY", from: -8, to: 0, duration: 350, delay: 175, ease: "cubic.out" },
  ],
};

export const whirlLoose: Preset = {
  name: "emphasis/whirl-loose",
  split: "character",
  stagger: 20,
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 800, ease: "sine.inOut", jitterDelay: 250, transformOrigin: { x: 1, y: 0 } },
  ],
};

export const whirlLoose2: Preset = {
  name: "emphasis/whirl-loose-2",
  split: "character",
  stagger: 45,
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 800, ease: "cubic.out", jitterDelay: 310, transformOrigin: { x: 1, y: 0 } },
  ],
};

export const foldTapCurl: Preset = {
  name: "emphasis/fold-tap-curl",
  split: "word",
  stagger: 60,
  perspective: 700,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "rotateX", from: 0, to: 25, duration: 175, ease: "cubic.out", transformOrigin: { x: 0.5, y: 0.5, z: -80 }, perspective: 550 },
    { prop: "rotateX", from: 25, to: 0, duration: 225, delay: 175, ease: "cubic.out", perspective: 400 },
  ],
};

export const turnDeep: Preset = {
  name: "emphasis/turn-deep",
  split: "character",
  stagger: 15,
  perspective: 650,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "rotateY", from: 0, to: 360, duration: 650, ease: "sine.inOut", transformOrigin: { x: 0, y: 0.5 }, perspective: 250 },
  ],
};

export const tipCurl: Preset = {
  name: "emphasis/tip-curl",
  split: "character",
  stagger: 35,
  staggerOrder: "end",
  perspective: 700,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "rotateX", from: 0, to: 25, duration: 200, ease: "sine.inOut", transformOrigin: { x: 0.5, y: 0.5, z: 150 }, perspective: 300 },
    { prop: "rotateX", from: 25, to: 0, duration: 350, delay: 200, ease: "sine.inOut" },
  ],
};

export const swivelCurl: Preset = {
  name: "emphasis/swivel-curl",
  split: "character",
  stagger: 50,
  staggerOrder: "end",
  perspective: 550,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "rotateY", from: 0, to: 360, duration: 600, ease: "sine.inOut", transformOrigin: { x: 0, y: 0.5, z: -100 }, perspective: 350 },
  ],
};

export const pumpTrail: Preset = {
  name: "emphasis/pump-trail",
  split: "character",
  stagger: 25,
  staggerOrder: "end",
  animations: [
    { prop: "scale", from: 1, to: 0.82, duration: 200, ease: "sine.inOut" },
    { prop: "scale", from: 0.82, to: 1, duration: 225, delay: 200, ease: "sine.inOut" },
  ],
};

export const twirlCurl: Preset = {
  name: "emphasis/twirl-curl",
  split: "character",
  stagger: 50,
  staggerOrder: "random",
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 550, ease: "sine.inOut", jitterDelay: 170, transformOrigin: { x: 0.7, y: 0.3, z: 120 } },
  ],
};

export const joltYTrail: Preset = {
  name: "emphasis/jolt-y-trail",
  split: "character",
  stagger: 15,
  staggerOrder: "end",
  animations: [
    { prop: "translateY", from: 0, to: 14, duration: 200, ease: "sine.inOut" },
    { prop: "translateY", from: 14, to: 0, duration: 325, delay: 200, ease: "sine.inOut" },
  ],
};

export const swayCurl: Preset = {
  name: "emphasis/sway-curl",
  split: "character",
  stagger: 50,
  animations: [
    { prop: "rotate", from: 0, to: 26.25, duration: 175, ease: "cubic.out", jitterDelay: 200, transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "rotate", from: 26.25, to: 0, duration: 325, delay: 175, ease: "cubic.out", jitterDelay: 110 },
  ],
};

export const twirlCurlInward: Preset = {
  name: "emphasis/twirl-curl-inward",
  split: "character",
  stagger: 30,
  staggerOrder: "edges",
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 750, ease: "cubic.out", transformOrigin: { x: 0, y: 0, z: -100 } },
  ],
};

export const carouselInward: Preset = {
  name: "emphasis/carousel-inward",
  split: "character",
  stagger: 20,
  staggerOrder: "edges",
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 650, ease: "cubic.out", transformOrigin: { x: 1, y: 1 } },
  ],
};

export const joltYTrail2: Preset = {
  name: "emphasis/jolt-y-trail-2",
  split: "character",
  stagger: 55,
  staggerOrder: "end",
  animations: [
    { prop: "translateY", from: 0, to: -8, duration: 200, ease: "sine.inOut" },
    { prop: "translateY", from: -8, to: 0, duration: 225, delay: 200, ease: "sine.inOut" },
  ],
};

export const tipDeep: Preset = {
  name: "emphasis/tip-deep",
  split: "character",
  stagger: 40,
  staggerOrder: "edges",
  perspective: 650,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "rotateX", from: 0, to: -25, duration: 200, ease: "sine.inOut", transformOrigin: { x: 1, y: 1 } },
    { prop: "rotateX", from: -25, to: 0, duration: 225, delay: 200, ease: "sine.inOut", perspective: 450 },
  ],
};

export const tapXLoose: Preset = {
  name: "emphasis/tap-x-loose",
  split: "character",
  stagger: 30,
  staggerOrder: "center",
  animations: [
    { prop: "translateX", from: 0, to: 8, duration: 275, ease: "sine.inOut" },
    { prop: "translateX", from: 8, to: 0, duration: 225, delay: 275, ease: "sine.inOut", jitterDelay: 100 },
  ],
};

export const rockInward: Preset = {
  name: "emphasis/rock-inward",
  split: "word",
  stagger: 25,
  staggerOrder: "edges",
  animations: [
    { prop: "rotate", from: 0, to: -15, duration: 175, ease: "cubic.out" },
    { prop: "rotate", from: -15, to: 0, duration: 250, delay: 175, ease: "cubic.out" },
  ],
};

export const tumbleScatterTunnelWord: Preset = {
  name: "enter/tumble-scatter-tunnel-word",
  split: "word",
  stagger: 50,
  staggerOrder: "end",
  perspective: 250,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450 },
    { prop: "rotateX", from: -450, to: 0, duration: 650, jitterDelay: 150, transformOrigin: { x: 0.5, y: 0.5 } },
    { prop: "skewX", from: { min: -130.479, max: 130.479 }, to: 0, duration: 650, jitterDelay: 290 },
    { prop: "blur", from: 17, to: 0, duration: 450 },
  ],
};

export const twirlScatter2: Preset = {
  name: "enter/twirl-scatter-2",
  split: "character",
  stagger: 20,
  perspective: 600,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500 },
    { prop: "scale", from: 0.4, to: 1, duration: 650, transformOrigin: { x: 0, y: 0.5 } },
    { prop: "scaleY", from: { min: 0.04, max: 0.5 }, to: 1, duration: 900, jitterDelay: 90 },
    { prop: "rotate", from: -720, to: 0, duration: 750, jitterDelay: 90 },
    { prop: "rotateX", from: { min: -702.872, max: 702.872 }, to: 0, duration: 800, perspective: 500 },
  ],
};

export const pivotScatter2: Preset = {
  name: "enter/pivot-scatter-2",
  split: "character",
  stagger: 40,
  perspective: 550,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350 },
    { prop: "translateZ", from: -350, to: 0, duration: 500, jitterDelay: 240, perspective: 600 },
    { prop: "rotate", from: -330, to: 0, duration: 550, transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
    { prop: "scaleX", from: { min: 0.5, max: 6.25 }, to: 1, duration: 650, jitterDelay: 200 },
    { prop: "blur", from: 7, to: 0, duration: 550 },
    { prop: "translateY", from: 160, to: 0, duration: 750 },
  ],
};

export const tumbleScatter: Preset = {
  name: "enter/tumble-scatter",
  split: "character",
  stagger: 50,
  staggerOrder: "end",
  perspective: 600,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350 },
    { prop: "scaleY", from: 0.2, to: 1, duration: 650, jitterDelay: 180, transformOrigin: { x: 0.3, y: 0.7, z: -120 } },
    { prop: "scale", from: 0.5, to: 1, duration: 850, jitterDelay: 210 },
    { prop: "translateY", from: 140, to: 0, duration: 650 },
    { prop: "rotateX", from: { min: -1048.298, max: 1048.298 }, to: 0, duration: 850, transformOrigin: { x: 0.5, y: 0 }, perspective: 200 },
    { prop: "blur", from: 15, to: 0, duration: 650, jitterDelay: 180 },
  ],
};

export const whirlScatter2: Preset = {
  name: "enter/whirl-scatter-2",
  split: "character",
  stagger: 15,
  perspective: 650,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350 },
    { prop: "translateZ", from: -400, to: 0, duration: 850 },
    { prop: "rotate", from: { min: -2796.689, max: 2796.689 }, to: 0, duration: 800, transformOrigin: { x: 0.5, y: 1 } },
  ],
};

export const whirlScatter3: Preset = {
  name: "enter/whirl-scatter-3",
  split: "character",
  stagger: 60,
  staggerOrder: "center",
  perspective: 550,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 600 },
    { prop: "rotateY", from: 510, to: 0, duration: 800, transformOrigin: { x: 0.5, y: 0.5, z: -80 }, perspective: 250 },
    { prop: "blur", from: { min: 4, max: 50 }, to: 0, duration: 600 },
    { prop: "rotate", from: { min: -2112.647, max: 2112.647 }, to: 0, duration: 900 },
  ],
};

export const spinScatter: Preset = {
  name: "enter/spin-scatter",
  split: "character",
  stagger: 40,
  perspective: 650,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550 },
    { prop: "scaleY", from: { min: 0.04, max: 0.5 }, to: 1, duration: 750, jitterDelay: 260, transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "rotateY", from: { min: -1256.514, max: 1256.514 }, to: 0, duration: 850, transformOrigin: { x: 0.3, y: 0.7, z: -120 } },
    { prop: "translateY", from: 220, to: 0, duration: 800 },
  ],
};

export const whirlScatter4: Preset = {
  name: "enter/whirl-scatter-4",
  split: "character",
  stagger: 35,
  perspective: 600,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450 },
    { prop: "rotateY", from: 480, to: 0, duration: 650, jitterDelay: 150, perspective: 500 },
    { prop: "rotate", from: { min: -3302.464, max: 3302.464 }, to: 0, duration: 650, jitterDelay: 90 },
    { prop: "blur", from: { min: 3.4, max: 42.5 }, to: 0, duration: 700 },
  ],
};

export const hazeScatter: Preset = {
  name: "enter/haze-scatter",
  split: "character",
  stagger: 20,
  perspective: 550,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350 },
    { prop: "rotateY", from: 210, to: 0, duration: 750, transformOrigin: { x: 0.5, y: 0.5 } },
    { prop: "blur", from: { min: 2.4, max: 30 }, to: 0, duration: 700 },
    { prop: "scaleY", from: 2.5, to: 1, duration: 850 },
  ],
};

export const twirlScatter3: Preset = {
  name: "enter/twirl-scatter-3",
  split: "character",
  stagger: 60,
  perspective: 450,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550 },
    { prop: "rotateY", from: 240, to: 0, duration: 750, jitterDelay: 330, perspective: 600 },
    { prop: "rotate", from: 480, to: 0, duration: 600 },
    { prop: "scale", from: 0.45, to: 1, duration: 800 },
    { prop: "blur", from: { min: 3, max: 37.5 }, to: 0, duration: 700 },
    { prop: "skewX", from: 35, to: 0, duration: 450, transformOrigin: { x: 0.5, y: 1 } },
  ],
};

export const twirlScatter4: Preset = {
  name: "enter/twirl-scatter-4",
  split: "character",
  stagger: 55,
  staggerOrder: "edges",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350 },
    { prop: "rotate", from: 690, to: 0, duration: 700 },
    { prop: "translateY", from: { min: -394.808, max: 394.808 }, to: 0, duration: 550, jitterDelay: 150 },
    { prop: "blur", from: { min: 1.4, max: 17.5 }, to: 0, duration: 400, jitterDelay: 130 },
  ],
};

export const whirlScatter5: Preset = {
  name: "enter/whirl-scatter-5",
  split: "character",
  stagger: 35,
  staggerOrder: "end",
  perspective: 650,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500 },
    { prop: "rotateY", from: { min: -1327.958, max: 1327.958 }, to: 0, duration: 550, transformOrigin: { x: 1, y: 0.5 } },
    { prop: "scaleY", from: { min: 0.6, max: 7.5 }, to: 1, duration: 850, jitterDelay: 70, transformOrigin: { x: 0, y: 0.5, z: -100 } },
    { prop: "blur", from: { min: 2.2, max: 27.5 }, to: 0, duration: 700, jitterDelay: 250 },
    { prop: "rotate", from: { min: -1942.975, max: 1942.975 }, to: 0, duration: 550 },
  ],
};

export const tumbleScatter2: Preset = {
  name: "enter/tumble-scatter-2",
  split: "character",
  stagger: 50,
  perspective: 400,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350 },
    { prop: "blur", from: 11, to: 0, duration: 750 },
    { prop: "scale", from: { min: 0.15, max: 1.875 }, to: 1, duration: 800, jitterDelay: 180, transformOrigin: { x: 0.3, y: 0.7, z: -120 } },
    { prop: "translateZ", from: -400, to: 0, duration: 650, jitterDelay: 90 },
    { prop: "rotateX", from: -540, to: 0, duration: 650, perspective: 300 },
  ],
};

export const compressYScatter: Preset = {
  name: "enter/compress-y-scatter",
  split: "character",
  stagger: 60,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550 },
    { prop: "scaleY", from: { min: 0.28, max: 3.5 }, to: 1, duration: 900 },
  ],
};

export const toppleSnapLooseWord: Preset = {
  name: "enter/topple-snap-loose-word",
  split: "word",
  stagger: 45,
  staggerOrder: "end",
  perspective: 450,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "anticipate.out" },
    { prop: "scale", from: 0.3, to: 1, duration: 800, ease: "back.out", transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
    { prop: "skewX", from: 45, to: 0, duration: 650, ease: "power3.out" },
    { prop: "rotateX", from: 300, to: 0, duration: 700, ease: "back.out" },
    { prop: "blur", from: 15, to: 0, duration: 700, ease: "sine.out", jitterDelay: 200 },
    { prop: "translateZ", from: -450, to: 0, duration: 800, ease: "expo.out", jitterDelay: 320, perspective: 250 },
  ],
};

export const dropScatterBounceWord: Preset = {
  name: "enter/drop-scatter-bounce-word",
  split: "word",
  stagger: 45,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "anticipate.out" },
    { prop: "skewX", from: 25, to: 0, duration: 700, ease: "bounce.out", transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "blur", from: { min: 2, max: 25 }, to: 0, duration: 800, ease: "expo.out", jitterDelay: 290 },
    { prop: "scaleY", from: 0.1, to: 1, duration: 850, ease: "power4.out", jitterDelay: 240 },
    { prop: "translateY", from: { min: -990.632, max: 990.632 }, to: 0, duration: 600, ease: "elastic.out", jitterDelay: 90 },
  ],
};

export const slantScatterBounce: Preset = {
  name: "enter/slant-scatter-bounce",
  split: "character",
  stagger: 15,
  perspective: 500,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "power3.out" },
    { prop: "translateX", from: 190, to: 0, duration: 900, ease: "sine.out" },
    { prop: "blur", from: 8, to: 0, duration: 750, ease: "back.out", jitterDelay: 60 },
    { prop: "skewX", from: { min: -168.273, max: 168.273 }, to: 0, duration: 400, ease: "expo.out", transformOrigin: { x: 1, y: 1 } },
    { prop: "scaleY", from: { min: 0, max: 0 }, to: 1, duration: 850, ease: "bounce.out", jitterDelay: 250 },
    { prop: "rotateX", from: -270, to: 0, duration: 750, ease: "power4.out", perspective: 250 },
    { prop: "scaleX", from: 2, to: 1, duration: 900, ease: "anticipate.out", transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
  ],
};

export const slantScatterSpringWord: Preset = {
  name: "enter/slant-scatter-spring-word",
  split: "word",
  stagger: 15,
  staggerOrder: "end",
  perspective: 700,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 550, ease: "expo.out" },
    { prop: "scaleX", from: { min: 0.4, max: 5 }, to: 1, duration: 600, ease: "elastic.out", jitterDelay: 230 },
    { prop: "translateZ", from: -400, to: 0, duration: 750, ease: "elastic.out", perspective: 500 },
    { prop: "blur", from: { min: 3.2, max: 40 }, to: 0, duration: 750, ease: "expo.out" },
    { prop: "skewX", from: { min: -167.292, max: 167.292 }, to: 0, duration: 500, ease: "elastic.out", jitterDelay: 120 },
  ],
};

export const whirlScatter6: Preset = {
  name: "enter/whirl-scatter-6",
  split: "character",
  stagger: 15,
  perspective: 500,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "anticipate.out" },
    { prop: "scale", from: 0.65, to: 1, duration: 650, ease: "sine.out", transformOrigin: { x: 0.5, y: 0 } },
    { prop: "rotate", from: { min: -1460.019, max: 1460.019 }, to: 0, duration: 800, ease: "power3.out", jitterDelay: 250, transformOrigin: { x: 0, y: 0, z: -100 } },
    { prop: "rotateY", from: -510, to: 0, duration: 800, ease: "circ.out", transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "scaleX", from: 0.1, to: 1, duration: 700, ease: "expo.out", jitterDelay: 330 },
  ],
};

export const hazeScatter2: Preset = {
  name: "enter/haze-scatter-2",
  split: "character",
  stagger: 55,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 450, ease: "power3.out" },
    { prop: "blur", from: { min: 1.6, max: 20 }, to: 0, duration: 750, ease: "power3.out" },
    { prop: "translateX", from: 80, to: 0, duration: 650, ease: "sine.out" },
    { prop: "scaleX", from: 0.1, to: 1, duration: 850, ease: "circ.out" },
    { prop: "scaleY", from: 0, to: 1, duration: 900, ease: "anticipate.out" },
  ],
};

export const whirlScatterSnap: Preset = {
  name: "enter/whirl-scatter-snap",
  split: "character",
  stagger: 55,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "back.out" },
    { prop: "scaleY", from: 0, to: 1, duration: 550, ease: "power4.out", transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "scaleX", from: { min: 0.02, max: 0.25 }, to: 1, duration: 700, ease: "power1.out", jitterDelay: 250 },
    { prop: "translateX", from: { min: -1177.436, max: 1177.436 }, to: 0, duration: 500, ease: "power3.out", jitterDelay: 220 },
    { prop: "rotate", from: { min: -3226.015, max: 3226.015 }, to: 0, duration: 700, ease: "power2.out", jitterDelay: 440 },
  ],
};

export const whirlScatterSnapTunnel: Preset = {
  name: "enter/whirl-scatter-snap-tunnel",
  split: "character",
  stagger: 35,
  perspective: 150,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "power3.out" },
    { prop: "translateY", from: { min: -1863.057, max: 1863.057 }, to: 0, duration: 600, ease: "back.out" },
    { prop: "scaleX", from: 0.3, to: 1, duration: 650, ease: "power2.out", jitterDelay: 180, transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
    { prop: "translateZ", from: -600, to: 0, duration: 650, ease: "sine.out", jitterDelay: 410, perspective: 200 },
    { prop: "translateX", from: 180, to: 0, duration: 900, ease: "expo.out", jitterDelay: 470 },
    { prop: "rotate", from: { min: -3721.458, max: 3721.458 }, to: 0, duration: 900, ease: "circ.out", jitterDelay: 220, transformOrigin: { x: 0.5, y: 1 } },
  ],
};

export const hazeScatter3: Preset = {
  name: "enter/haze-scatter-3",
  split: "character",
  stagger: 60,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "expo.out" },
    { prop: "blur", from: 9, to: 0, duration: 500, ease: "sine.out", jitterDelay: 340 },
    { prop: "scale", from: { min: 0.13, max: 1.625 }, to: 1, duration: 750, ease: "expo.out" },
    { prop: "scaleY", from: 0.1, to: 1, duration: 600, ease: "anticipate.out", transformOrigin: { x: 1, y: 0 } },
  ],
};

export const hazeSnap: Preset = {
  name: "enter/haze-snap",
  split: "character",
  stagger: 60,
  staggerOrder: "center",
  perspective: 500,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 400, ease: "back.out" },
    { prop: "blur", from: 17, to: 0, duration: 650, ease: "expo.out" },
    { prop: "translateZ", from: -300, to: 0, duration: 550, ease: "back.out", jitterDelay: 60 },
  ],
};

export const hazeScatterSpring: Preset = {
  name: "enter/haze-scatter-spring",
  split: "character",
  stagger: 20,
  staggerOrder: "end",
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "power1.out" },
    { prop: "translateY", from: 140, to: 0, duration: 650, ease: "elastic.out" },
    { prop: "blur", from: { min: 3.4, max: 42.5 }, to: 0, duration: 550, ease: "expo.out" },
  ],
};

export const whirlScatterWord2: Preset = {
  name: "enter/whirl-scatter-word",
  split: "word",
  stagger: 40,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 350, ease: "power1.out" },
    { prop: "blur", from: { min: 2.2, max: 27.5 }, to: 0, duration: 500, ease: "power1.out" },
    { prop: "skewX", from: 30, to: 0, duration: 450, ease: "sine.out" },
    { prop: "rotate", from: { min: -3431.959, max: 3431.959 }, to: 0, duration: 750, ease: "power2.out", transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
    { prop: "scaleY", from: { min: 0.5, max: 6.25 }, to: 1, duration: 600, ease: "power1.out", transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
  ],
};

export const slantScatterWord: Preset = {
  name: "enter/slant-scatter-word",
  split: "word",
  stagger: 20,
  animations: [
    { prop: "opacity", from: 0, to: 1, duration: 500, ease: "sine.out" },
    { prop: "scale", from: 0.2, to: 1, duration: 800, ease: "anticipate.out", transformOrigin: { x: 0, y: 0, z: -100 } },
    { prop: "translateX", from: 180, to: 0, duration: 700, ease: "anticipate.out" },
    { prop: "skewX", from: { min: -175.197, max: 175.197 }, to: 0, duration: 550, ease: "power1.out", transformOrigin: { x: 1, y: 0.5, z: 100 } },
    { prop: "blur", from: 8, to: 0, duration: 650, ease: "power1.out" },
  ],
};

export const twirlLoose: Preset = {
  name: "exit/twirl-loose",
  split: "character",
  stagger: 45,
  perspective: 550,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400 },
    { prop: "rotate", from: 0, to: 480, duration: 450, jitterDelay: 90 },
    { prop: "scale", from: 1, to: 0.75, duration: 450, jitterDelay: 220 },
    { prop: "rotateY", from: 0, to: -120, duration: 600, perspective: 300 },
  ],
};

export const twirlScatterTunnel: Preset = {
  name: "exit/twirl-scatter-tunnel",
  split: "character",
  stagger: 45,
  perspective: 250,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450 },
    { prop: "rotate", from: 0, to: 690, duration: 600 },
    { prop: "translateZ", from: 0, to: -550, duration: 450, perspective: 600 },
    { prop: "scale", from: 1, to: { min: 0.07, max: 0.875 }, duration: 650, jitterDelay: 220, transformOrigin: { x: 0.5, y: 1 } },
  ],
};

export const whirlScatterTunnel: Preset = {
  name: "exit/whirl-scatter-tunnel",
  split: "character",
  stagger: 50,
  perspective: 300,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400 },
    { prop: "rotateY", from: 0, to: { min: -1938.928, max: 1938.928 }, duration: 700, jitterDelay: 310, transformOrigin: { x: 0.3, y: 0.7, z: -120 }, perspective: 100 },
    { prop: "translateZ", from: 0, to: -800, duration: 450, perspective: 150 },
    { prop: "rotate", from: 0, to: { min: -3440.352, max: 3440.352 }, duration: 600, jitterDelay: 210 },
    { prop: "blur", from: 0, to: { min: 2.6, max: 32.5 }, duration: 550, jitterDelay: 340 },
    { prop: "skewX", from: 0, to: { min: -372.022, max: 372.022 }, duration: 300, jitterDelay: 400 },
  ],
};

export const slideScatter2: Preset = {
  name: "exit/slide-scatter",
  split: "character",
  stagger: 45,
  staggerOrder: "random",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450 },
    { prop: "rotate", from: 0, to: 480, duration: 600, jitterDelay: 430, transformOrigin: { x: 0.5, y: 1, z: 100 } },
    { prop: "skewX", from: 0, to: { min: -256.058, max: 256.058 }, duration: 350, jitterDelay: 450, transformOrigin: { x: 0, y: 0.5, z: -100 } },
    { prop: "scaleX", from: 1, to: { min: 0.6, max: 7.5 }, duration: 700, jitterDelay: 450 },
    { prop: "scaleY", from: 1, to: { min: 0.06, max: 0.75 }, duration: 650, transformOrigin: { x: 0.3, y: 0.7, z: -120 } },
    { prop: "blur", from: 0, to: { min: 4.4, max: 55 }, duration: 500, jitterDelay: 410 },
    { prop: "translateX", from: 0, to: { min: -1217.019, max: 1217.019 }, duration: 600, jitterDelay: 410 },
  ],
};

export const whirlScatterTunnel3: Preset = {
  name: "exit/whirl-scatter-tunnel-2",
  split: "character",
  stagger: 35,
  staggerOrder: "edges",
  perspective: 100,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450 },
    { prop: "translateZ", from: 0, to: -700, duration: 600, jitterDelay: 460, perspective: 300 },
    { prop: "rotate", from: 0, to: { min: -7084.676, max: 7084.676 }, duration: 600, transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
    { prop: "scale", from: 1, to: { min: 0.08, max: 1 }, duration: 550 },
    { prop: "skewX", from: 0, to: { min: -246.666, max: 246.666 }, duration: 350, jitterDelay: 120, transformOrigin: { x: 1, y: 0.5, z: 100 } },
  ],
};

export const pivotScatterTunnel: Preset = {
  name: "exit/pivot-scatter-tunnel",
  split: "word",
  stagger: 45,
  perspective: 300,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400 },
    { prop: "rotate", from: 0, to: 270, duration: 500 },
    { prop: "scaleX", from: 1, to: { min: 0, max: -2.5 }, duration: 450 },
    { prop: "translateZ", from: 0, to: -300, duration: 650 },
  ],
};

export const fogScatter: Preset = {
  name: "exit/fog-scatter",
  split: "character",
  stagger: 45,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400 },
    { prop: "blur", from: 0, to: 17, duration: 350 },
    { prop: "scaleX", from: 1, to: { min: 0.3, max: 3.75 }, duration: 400, transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
    { prop: "rotate", from: 0, to: 90, duration: 450 },
    { prop: "translateX", from: 0, to: -130, duration: 550 },
  ],
};

export const fogScatter2: Preset = {
  name: "exit/fog-scatter-2",
  split: "character",
  stagger: 20,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450 },
    { prop: "translateY", from: 0, to: 150, duration: 550 },
    { prop: "scaleY", from: 1, to: 2.5, duration: 550, transformOrigin: { x: 0.7, y: 0.3, z: 120 } },
    { prop: "blur", from: 0, to: { min: 2.6, max: 32.5 }, duration: 450, jitterDelay: 100 },
  ],
};

export const riseScatter2: Preset = {
  name: "exit/rise-scatter",
  split: "word",
  stagger: 15,
  staggerOrder: "end",
  perspective: 500,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450 },
    { prop: "translateY", from: 0, to: -160, duration: 650 },
    { prop: "rotateY", from: 0, to: -120, duration: 550, transformOrigin: { x: 0, y: 0.5, z: -100 } },
    { prop: "scale", from: 1, to: { min: 0.11, max: 1.375 }, duration: 550 },
  ],
};

export const riseScatter3: Preset = {
  name: "exit/rise-scatter-2",
  split: "character",
  stagger: 50,
  staggerOrder: "end",
  perspective: 650,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450 },
    { prop: "translateY", from: 0, to: { min: -528.301, max: 528.301 }, duration: 550 },
    { prop: "blur", from: 0, to: { min: 3.6, max: 45 }, duration: 500 },
    { prop: "scaleX", from: 1, to: { min: 0.04, max: 0.5 }, duration: 600, transformOrigin: { x: 0.7, y: 0.3, z: 120 } },
    { prop: "scaleY", from: 1, to: 0, duration: 550, transformOrigin: { x: 0.5, y: 0, z: -100 } },
    { prop: "rotateX", from: 0, to: -450, duration: 550, perspective: 200 },
    { prop: "translateX", from: 0, to: -210, duration: 600 },
  ],
};

export const twirl: Preset = {
  name: "exit/twirl",
  split: "character",
  stagger: 45,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450 },
    { prop: "rotate", from: 0, to: 720, duration: 450, transformOrigin: { x: 0, y: 0.5, z: -100 } },
    { prop: "scale", from: 1, to: 0.65, duration: 600 },
  ],
};

export const topple2: Preset = {
  name: "exit/topple",
  split: "character",
  stagger: 40,
  staggerOrder: "end",
  perspective: 600,
  transformOrigin: { x: 0.5, y: 1 },
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 300 },
    { prop: "scale", from: 1, to: 0.55, duration: 600 },
    { prop: "rotateX", from: 0, to: 180, duration: 500, transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
  ],
};

export const whirlScatter32: Preset = {
  name: "exit/whirl-scatter",
  split: "character",
  stagger: 45,
  staggerOrder: "edges",
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 500 },
    { prop: "scaleX", from: 1, to: { min: 0.6, max: 7.5 }, duration: 550, jitterDelay: 330, transformOrigin: { x: 0, y: 0.5, z: -100 } },
    { prop: "rotate", from: 0, to: { min: -1871.995, max: 1871.995 }, duration: 550, jitterDelay: 320 },
    { prop: "translateY", from: 0, to: 180, duration: 450, jitterDelay: 120 },
    { prop: "blur", from: 0, to: 11, duration: 550 },
  ],
};

export const slideLoose: Preset = {
  name: "exit/slide-loose",
  split: "character",
  stagger: 55,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 400 },
    { prop: "translateY", from: 0, to: 120, duration: 400, jitterDelay: 250 },
    { prop: "translateX", from: 0, to: -170, duration: 450 },
    { prop: "scale", from: 1, to: 0.45, duration: 500 },
    { prop: "scaleX", from: 1, to: 2, duration: 450, jitterDelay: 220, transformOrigin: { x: 0.5, y: 0.5, z: -150 } },
  ],
};

export const slideScatter22: Preset = {
  name: "exit/slide-scatter-2",
  split: "character",
  stagger: 45,
  perspective: 650,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450 },
    { prop: "translateY", from: 0, to: { min: -654.094, max: 654.094 }, duration: 650 },
    { prop: "scale", from: 1, to: { min: 0.13, max: 1.625 }, duration: 400 },
    { prop: "skewX", from: 0, to: -20, duration: 500, transformOrigin: { x: 0.5, y: 0 } },
    { prop: "translateZ", from: 0, to: -500, duration: 500, jitterDelay: 230, perspective: 600 },
    { prop: "translateX", from: 0, to: { min: -839.498, max: 839.498 }, duration: 550 },
  ],
};

export const twirl2: Preset = {
  name: "exit/twirl-2",
  split: "character",
  stagger: 40,
  animations: [
    { prop: "opacity", from: 1, to: 0, duration: 450 },
    { prop: "scaleY", from: 1, to: 0, duration: 450 },
    { prop: "scaleX", from: 1, to: 0, duration: 550, jitterDelay: 80, transformOrigin: { x: 0.5, y: 0.5, z: 150 } },
    { prop: "rotate", from: 0, to: -690, duration: 650, transformOrigin: { x: 0.5, y: 0.5, z: -80 } },
  ],
};

export const pivot: Preset = {
  name: "emphasis/pivot",
  split: "character",
  stagger: 50,
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 700, ease: "expo.out", transformOrigin: { x: 0.5, y: 1 } },
  ],
};

export const pivot2: Preset = {
  name: "emphasis/pivot-2",
  split: "word",
  stagger: 40,
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 700, ease: "anticipate.inOut", jitterDelay: 170 },
  ],
};

export const pivotBounce: Preset = {
  name: "emphasis/pivot-bounce",
  split: "character",
  stagger: 50,
  staggerOrder: "edges",
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 650, ease: "bounce.out", jitterDelay: 40, transformOrigin: { x: 1, y: 1 } },
  ],
};

export const pivotSnap: Preset = {
  name: "emphasis/pivot-snap",
  split: "character",
  stagger: 30,
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 650, ease: "back.inOut", jitterDelay: 60, transformOrigin: { x: 1, y: 0 } },
  ],
};

export const swivelSnapDepth: Preset = {
  name: "emphasis/swivel-snap-depth",
  split: "character",
  stagger: 20,
  staggerOrder: "end",
  perspective: 1050,
  transformOrigin: { x: 0.5, y: 0.5 },
  animations: [
    { prop: "rotateY", from: 0, to: 360, duration: 600, ease: "back.out" },
  ],
};

export const pivot4: Preset = {
  name: "emphasis/pivot-3",
  split: "character",
  stagger: 50,
  animations: [
    { prop: "rotate", from: 0, to: 360, duration: 600, ease: "power2.inOut", transformOrigin: { x: 0.5, y: 0 } },
  ],
};

/**
 * Every Studio-generated preset, paired with its preset name. Index.ts
 * spreads this into the runtime registry alongside the handcurated
 * entries.
 */
export const ALL_GENERATED: readonly { name: string; preset: Preset }[] = [
  { name: "enter/extend-y-scatter", preset: extendYScatter },
  { name: "enter/extend-x-snap", preset: extendXSnap },
  { name: "enter/tilt-in-spring", preset: tiltInSpring },
  { name: "enter/lean-in-spring", preset: leanInSpring },
  { name: "enter/expand-snap", preset: expandSnap },
  { name: "enter/flip-up-spring", preset: flipUpSpring },
  { name: "enter/slide-scatter", preset: slideScatter },
  { name: "enter/soar-swarm", preset: soarSwarm },
  { name: "enter/tunnel", preset: tunnel },
  { name: "enter/soar-bounce", preset: soarBounce },
  { name: "enter/stretch-x-kick", preset: stretchXKick },
  { name: "enter/slide-bounce", preset: slideBounce },
  { name: "enter/stretch-x-scatter", preset: stretchXScatter },
  { name: "enter/glide-scatter", preset: glideScatter },
  { name: "enter/grow-scatter", preset: growScatter },
  { name: "enter/unfurl-y-scatter", preset: unfurlYScatter },
  { name: "enter/pivot-curl", preset: pivotCurl },
  { name: "enter/stretch-y-scatter", preset: stretchYScatter },
  { name: "enter/lean-in-scatter-curl", preset: leanInScatterCurl },
  { name: "enter/settle-scatter", preset: settleScatter },
  { name: "enter/expand-scatter", preset: expandScatter },
  { name: "enter/slant-scatter", preset: slantScatter },
  { name: "enter/extend-x-curl", preset: extendXCurl },
  { name: "enter/extend-y-curl", preset: extendYCurl },
  { name: "enter/tumble-x-scatter-word", preset: tumbleXScatterWord },
  { name: "enter/flip-up-scatter-curl", preset: flipUpScatterCurl },
  { name: "enter/expand-scatter-loose", preset: expandScatterLoose },
  { name: "enter/tilt-in-scatter", preset: tiltInScatter },
  { name: "enter/unfurl-x-scatter", preset: unfurlXScatter },
  { name: "enter/bloom-scatter", preset: bloomScatter },
  { name: "enter/flip-up-scatter-bounce", preset: flipUpScatterBounce },
  { name: "enter/fold-in-scatter-bounce", preset: foldInScatterBounce },
  { name: "enter/swivel-scatter-loose", preset: swivelScatterLoose },
  { name: "enter/swirl-scatter", preset: swirlScatter },
  { name: "enter/twirl-scatter", preset: twirlScatter },
  { name: "enter/extend-x-snap-word", preset: extendXSnapWord },
  { name: "enter/rise-y-scatter", preset: riseYScatter },
  { name: "enter/lean-scatter", preset: leanScatter },
  { name: "enter/rise-y-scatter-curl", preset: riseYScatterCurl },
  { name: "enter/whirl-scatter", preset: whirlScatter },
  { name: "enter/pinwheel-scatter", preset: pinwheelScatter },
  { name: "enter/swivel-scatter-deep", preset: swivelScatterDeep },
  { name: "enter/fold-in-curl", preset: foldInCurl },
  { name: "enter/turn-scatter-curl", preset: turnScatterCurl },
  { name: "enter/fold-in-scatter-curl", preset: foldInScatterCurl },
  { name: "enter/flip-up-scatter-word", preset: flipUpScatterWord },
  { name: "enter/tilt-in-scatter-word", preset: tiltInScatterWord },
  { name: "enter/unfurl-y-curl", preset: unfurlYCurl },
  { name: "enter/extend-y-scatter-word", preset: extendYScatterWord },
  { name: "enter/topple", preset: topple },
  { name: "enter/blur-rise-snap", preset: blurRiseSnap },
  { name: "enter/loom", preset: loom },
  { name: "enter/glide-outward", preset: glideOutward },
  { name: "enter/tilt-in-bounce", preset: tiltInBounce },
  { name: "enter/expand-scatter-trail", preset: expandScatterTrail },
  { name: "enter/rotate-y-in-deep", preset: rotateYInDeep },
  { name: "enter/swipe-spring", preset: swipeSpring },
  { name: "enter/swipe-scatter", preset: swipeScatter },
  { name: "enter/tilt-in-inward", preset: tiltInInward },
  { name: "enter/grow-spring", preset: growSpring },
  { name: "enter/extend-y-scatter-curl", preset: extendYScatterCurl },
  { name: "enter/rotate-y-in-scatter-curl", preset: rotateYInScatterCurl },
  { name: "enter/fold-in-scatter-snap", preset: foldInScatterSnap },
  { name: "enter/slant-scatter-spring", preset: slantScatterSpring },
  { name: "enter/rise-y-scatter-loose", preset: riseYScatterLoose },
  { name: "enter/tilt-in-scatter-curl", preset: tiltInScatterCurl },
  { name: "enter/spread-x-scatter-curl", preset: spreadXScatterCurl },
  { name: "enter/twirl-scatter-curl", preset: twirlScatterCurl },
  { name: "enter/tip-in-scatter", preset: tipInScatter },
  { name: "enter/lift-spring", preset: liftSpring },
  { name: "enter/stretch-x-bounce", preset: stretchXBounce },
  { name: "enter/unfurl-x-kick", preset: unfurlXKick },
  { name: "enter/rotate-y-in-inward", preset: rotateYInInward },
  { name: "enter/haze-outward", preset: hazeOutward },
  { name: "enter/pivot-scatter", preset: pivotScatter },
  { name: "enter/turn-spring", preset: turnSpring },
  { name: "enter/tumble-x-loose", preset: tumbleXLoose },
  { name: "enter/lean-in-scatter-spring", preset: leanInScatterSpring },
  { name: "enter/topple-scatter-trail", preset: toppleScatterTrail },
  { name: "enter/whirl-scatter-curl", preset: whirlScatterCurl },
  { name: "enter/tip-in-scatter-curl", preset: tipInScatterCurl },
  { name: "enter/swirl-loose", preset: swirlLoose },
  { name: "enter/rotate-y-in-scatter-spring", preset: rotateYInScatterSpring },
  { name: "enter/whirl-scatter-loose", preset: whirlScatterLoose },
  { name: "enter/tip-in-scatter-snap", preset: tipInScatterSnap },
  { name: "enter/swivel-scatter-inward", preset: swivelScatterInward },
  { name: "enter/topple-scatter-kick", preset: toppleScatterKick },
  { name: "exit/collapse-snap", preset: collapseSnap },
  { name: "exit/lean-out-snap", preset: leanOutSnap },
  { name: "exit/exit-x-burst", preset: exitXBurst },
  { name: "exit/mist-out", preset: mistOut },
  { name: "exit/shear-out-burst", preset: shearOutBurst },
  { name: "exit/compress-x-kick", preset: compressXKick },
  { name: "exit/rise-out-burst", preset: riseOutBurst },
  { name: "exit/flip-out-burst", preset: flipOutBurst },
  { name: "exit/pivot-out-burst", preset: pivotOutBurst },
  { name: "exit/flip-out-curl", preset: flipOutCurl },
  { name: "exit/turn-out-burst", preset: turnOutBurst },
  { name: "exit/squash-x-burst", preset: squashXBurst },
  { name: "exit/swivel-out-burst", preset: swivelOutBurst },
  { name: "exit/topple-out-burst", preset: toppleOutBurst },
  { name: "exit/flatten-y", preset: flattenY },
  { name: "exit/tilt-out-burst-loose", preset: tiltOutBurstLoose },
  { name: "exit/swirl-out-curl", preset: swirlOutCurl },
  { name: "exit/topple-out-burst-curl", preset: toppleOutBurstCurl },
  { name: "exit/squash-x-burst-curl", preset: squashXBurstCurl },
  { name: "exit/tip-out-burst", preset: tipOutBurst },
  { name: "exit/fold-out-burst", preset: foldOutBurst },
  { name: "exit/fold-out-burst-curl", preset: foldOutBurstCurl },
  { name: "exit/flip-out-loose", preset: flipOutLoose },
  { name: "exit/tip-out-burst-curl", preset: tipOutBurstCurl },
  { name: "exit/topple-out-burst-snap", preset: toppleOutBurstSnap },
  { name: "exit/fold-out-burst-2", preset: foldOutBurst2 },
  { name: "exit/tilt-out-burst-word", preset: tiltOutBurstWord },
  { name: "exit/compress-x-burst", preset: compressXBurst },
  { name: "exit/lift-out-burst", preset: liftOutBurst },
  { name: "exit/swivel-out-curl", preset: swivelOutCurl },
  { name: "exit/flatten-y-burst", preset: flattenYBurst },
  { name: "exit/compress-x-burst-curl", preset: compressXBurstCurl },
  { name: "exit/tip-out-burst-loose", preset: tipOutBurstLoose },
  { name: "exit/swivel-out-burst-curl", preset: swivelOutBurstCurl },
  { name: "exit/lean-out-burst", preset: leanOutBurst },
  { name: "exit/lean-out-burst-word", preset: leanOutBurstWord },
  { name: "exit/lean-out-burst-curl", preset: leanOutBurstCurl },
  { name: "exit/swivel-out", preset: swivelOut },
  { name: "exit/dissolve-kick", preset: dissolveKick },
  { name: "exit/rise-out-kick", preset: riseOutKick },
  { name: "exit/swivel-out-kick", preset: swivelOutKick },
  { name: "exit/twirl-out-burst", preset: twirlOutBurst },
  { name: "exit/pinwheel-out", preset: pinwheelOut },
  { name: "exit/turn-out-burst-snap", preset: turnOutBurstSnap },
  { name: "exit/swirl-out-burst", preset: swirlOutBurst },
  { name: "exit/compress-x-burst-kick", preset: compressXBurstKick },
  { name: "exit/turn-out-burst-2", preset: turnOutBurst2 },
  { name: "exit/flatten-x-loose", preset: flattenXLoose },
  { name: "exit/pivot-out-burst-loose", preset: pivotOutBurstLoose },
  { name: "exit/flatten-x-burst-loose", preset: flattenXBurstLoose },
  { name: "exit/turn-out-burst-deep", preset: turnOutBurstDeep },
  { name: "exit/lean-out-burst-swarm", preset: leanOutBurstSwarm },
  { name: "exit/topple-out-burst-kick", preset: toppleOutBurstKick },
  { name: "exit/turn-out-burst-swarm", preset: turnOutBurstSwarm },
  { name: "exit/tilt-out-burst", preset: tiltOutBurst2 },
  { name: "exit/swivel-out-burst-loose", preset: swivelOutBurstLoose },
  { name: "exit/implode-burst", preset: implodeBurst },
  { name: "exit/swivel-out-loose", preset: swivelOutLoose },
  { name: "exit/compress-x-burst-loose", preset: compressXBurstLoose },
  { name: "exit/fold-out-burst-loose", preset: foldOutBurstLoose },
  { name: "exit/collapse-burst", preset: collapseBurst },
  { name: "exit/compress-y-burst-curl", preset: compressYBurstCurl },
  { name: "exit/twirl-out-burst-loose", preset: twirlOutBurstLoose },
  { name: "exit/flatten-y-curl", preset: flattenYCurl },
  { name: "exit/tip-out-burst-inward", preset: tipOutBurstInward },
  { name: "exit/flatten-x-burst-deep", preset: flattenXBurstDeep },
  { name: "exit/swivel-out-burst-snap", preset: swivelOutBurstSnap },
  { name: "exit/tilt-out-burst-deep", preset: tiltOutBurstDeep },
  { name: "exit/swipe-out-snap", preset: swipeOutSnap },
  { name: "exit/turn-out-burst-trail", preset: turnOutBurstTrail },
  { name: "exit/topple-out-burst-2", preset: toppleOutBurst2 },
  { name: "exit/flatten-x-curl", preset: flattenXCurl },
  { name: "exit/tilt-out-burst-kick", preset: tiltOutBurstKick },
  { name: "emphasis/wiggle-outward", preset: wiggleOutward },
  { name: "emphasis/lean-loose", preset: leanLoose },
  { name: "emphasis/pinwheel-curl", preset: pinwheelCurl },
  { name: "emphasis/bob", preset: bob },
  { name: "emphasis/whirl-loose", preset: whirlLoose },
  { name: "emphasis/whirl-loose-2", preset: whirlLoose2 },
  { name: "emphasis/fold-tap-curl", preset: foldTapCurl },
  { name: "emphasis/turn-deep", preset: turnDeep },
  { name: "emphasis/tip-curl", preset: tipCurl },
  { name: "emphasis/swivel-curl", preset: swivelCurl },
  { name: "emphasis/pump-trail", preset: pumpTrail },
  { name: "emphasis/twirl-curl", preset: twirlCurl },
  { name: "emphasis/jolt-y-trail", preset: joltYTrail },
  { name: "emphasis/sway-curl", preset: swayCurl },
  { name: "emphasis/twirl-curl-inward", preset: twirlCurlInward },
  { name: "emphasis/carousel-inward", preset: carouselInward },
  { name: "emphasis/jolt-y-trail-2", preset: joltYTrail2 },
  { name: "emphasis/tip-deep", preset: tipDeep },
  { name: "emphasis/tap-x-loose", preset: tapXLoose },
  { name: "emphasis/rock-inward", preset: rockInward },
  { name: "enter/tumble-scatter-tunnel-word", preset: tumbleScatterTunnelWord },
  { name: "enter/twirl-scatter-2", preset: twirlScatter2 },
  { name: "enter/pivot-scatter-2", preset: pivotScatter2 },
  { name: "enter/tumble-scatter", preset: tumbleScatter },
  { name: "enter/whirl-scatter-2", preset: whirlScatter2 },
  { name: "enter/whirl-scatter-3", preset: whirlScatter3 },
  { name: "enter/spin-scatter", preset: spinScatter },
  { name: "enter/whirl-scatter-4", preset: whirlScatter4 },
  { name: "enter/haze-scatter", preset: hazeScatter },
  { name: "enter/twirl-scatter-3", preset: twirlScatter3 },
  { name: "enter/twirl-scatter-4", preset: twirlScatter4 },
  { name: "enter/whirl-scatter-5", preset: whirlScatter5 },
  { name: "enter/tumble-scatter-2", preset: tumbleScatter2 },
  { name: "enter/compress-y-scatter", preset: compressYScatter },
  { name: "enter/topple-snap-loose-word", preset: toppleSnapLooseWord },
  { name: "enter/drop-scatter-bounce-word", preset: dropScatterBounceWord },
  { name: "enter/slant-scatter-bounce", preset: slantScatterBounce },
  { name: "enter/slant-scatter-spring-word", preset: slantScatterSpringWord },
  { name: "enter/whirl-scatter-6", preset: whirlScatter6 },
  { name: "enter/haze-scatter-2", preset: hazeScatter2 },
  { name: "enter/whirl-scatter-snap", preset: whirlScatterSnap },
  { name: "enter/whirl-scatter-snap-tunnel", preset: whirlScatterSnapTunnel },
  { name: "enter/haze-scatter-3", preset: hazeScatter3 },
  { name: "enter/haze-snap", preset: hazeSnap },
  { name: "enter/haze-scatter-spring", preset: hazeScatterSpring },
  { name: "enter/whirl-scatter-word", preset: whirlScatterWord2 },
  { name: "enter/slant-scatter-word", preset: slantScatterWord },
  { name: "exit/twirl-loose", preset: twirlLoose },
  { name: "exit/twirl-scatter-tunnel", preset: twirlScatterTunnel },
  { name: "exit/whirl-scatter-tunnel", preset: whirlScatterTunnel },
  { name: "exit/slide-scatter", preset: slideScatter2 },
  { name: "exit/whirl-scatter-tunnel-2", preset: whirlScatterTunnel3 },
  { name: "exit/pivot-scatter-tunnel", preset: pivotScatterTunnel },
  { name: "exit/fog-scatter", preset: fogScatter },
  { name: "exit/fog-scatter-2", preset: fogScatter2 },
  { name: "exit/rise-scatter", preset: riseScatter2 },
  { name: "exit/rise-scatter-2", preset: riseScatter3 },
  { name: "exit/twirl", preset: twirl },
  { name: "exit/topple", preset: topple2 },
  { name: "exit/whirl-scatter", preset: whirlScatter32 },
  { name: "exit/slide-loose", preset: slideLoose },
  { name: "exit/slide-scatter-2", preset: slideScatter22 },
  { name: "exit/twirl-2", preset: twirl2 },
  { name: "emphasis/pivot", preset: pivot },
  { name: "emphasis/pivot-2", preset: pivot2 },
  { name: "emphasis/pivot-bounce", preset: pivotBounce },
  { name: "emphasis/pivot-snap", preset: pivotSnap },
  { name: "emphasis/swivel-snap-depth", preset: swivelSnapDepth },
  { name: "emphasis/pivot-3", preset: pivot4 },
];
