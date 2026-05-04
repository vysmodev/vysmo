import { crossZoom, dissolve } from "@vysmo/transitions";
import {
  createSlideshow,
  type SlideshowHandle,
  type SlideSource,
} from "../index.js";

declare const container: HTMLElement;
declare const img: HTMLImageElement;
declare const canvas: HTMLCanvasElement;

// --- SlideSource union accepts strings, images, canvases ----------------

const _a: SlideSource = "https://example.com/a.jpg";
const _b: SlideSource = img;
const _c: SlideSource = canvas;
void [_a, _b, _c];

// --- Minimal and maximal option shapes ----------------------------------

const minimal: SlideshowHandle = createSlideshow({
  container,
  slides: ["a.jpg", "b.jpg"],
});

const full: SlideshowHandle = createSlideshow({
  container,
  slides: [img, canvas, "c.jpg"],
  initial: 1,
  transition: crossZoom,
  transitionDuration: 1200,
  autoplayDelay: 3500,
  autoplay: true,
  loop: false,
  clickNavigation: false,
  keyboardNavigation: false,
  pauseOnHidden: false,
  ariaLabel: "Portfolio",
});

const withSelector: SlideshowHandle = createSlideshow({
  container,
  slides: ["a.jpg", "b.jpg"],
  transition: (from, to) => (from < to ? crossZoom : dissolve),
});

void [minimal, full, withSelector];

// --- Handle surface -----------------------------------------------------

declare const s: SlideshowHandle;

const _current: number = s.current;
const _length: number = s.length;
const _isPlaying: boolean = s.isPlaying;
const _isTransitioning: boolean = s.isTransitioning;
const _ready: Promise<void> = s.ready;
const _next: Promise<void> = s.next();
const _prev: Promise<void> = s.prev();
const _goA: Promise<void> = s.go(1);
const _goB: Promise<void> = s.go(1, { instant: true });
const _play: void = s.play();
const _pause: void = s.pause();
const _offChange: () => void = s.on("change", (cur, prev) => void [cur, prev]);
const _offStart: () => void = s.on(
  "transitionstart",
  (from, to) => void [from, to],
);
const _offEnd: () => void = s.on("transitionend", (from, to) => void [from, to]);
const _destroy: void = s.destroy();

void [
  _current,
  _length,
  _isPlaying,
  _isTransitioning,
  _ready,
  _next,
  _prev,
  _goA,
  _goB,
  _play,
  _pause,
  _offChange,
  _offStart,
  _offEnd,
  _destroy,
];

// --- Negative assertions ------------------------------------------------

// @ts-expect-error — container is required
createSlideshow({ slides: ["a"] });

// @ts-expect-error — slides is required
createSlideshow({ container });

createSlideshow({
  container,
  slides: ["a", "b"],
  // @ts-expect-error — unknown event
  on: s.on("nope" as "change", () => void 0),
});
