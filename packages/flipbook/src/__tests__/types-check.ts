import { cubicInOut } from "@vysmo/easings";
import {
  createFlipbook,
  type FlipbookHandle,
  type PageSource,
} from "../index.js";

declare const container: HTMLElement;
declare const img: HTMLImageElement;
declare const canvas: HTMLCanvasElement;

// --- PageSource union accepts strings, images, canvases -----------------

const _a: PageSource = "https://example.com/p1.jpg";
const _b: PageSource = img;
const _c: PageSource = canvas;
void [_a, _b, _c];

// --- Minimal and maximal option shapes ----------------------------------

const minimal: FlipbookHandle = createFlipbook({
  container,
  pages: ["a.jpg", "b.jpg"],
});

const full: FlipbookHandle = createFlipbook({
  container,
  pages: [img, canvas, "c.jpg"],
  initialPage: 1,
  axis: "vertical",
  tilt: 0.1,
  backColor: [0.95, 0.95, 0.95],
  flipDuration: 1100,
  ease: cubicInOut,
  loop: false,
  clickNavigation: false,
  dragNavigation: false,
  keyboardNavigation: false,
  ariaLabel: "Magazine",
});

void [minimal, full];

// --- Handle surface -----------------------------------------------------

declare const f: FlipbookHandle;

const _current: number = f.current;
const _length: number = f.length;
const _isFlipping: boolean = f.isFlipping;
const _ready: Promise<void> = f.ready;
const _next: Promise<void> = f.next();
const _prev: Promise<void> = f.prev();
const _goA: Promise<void> = f.goTo(1);
const _goB: Promise<void> = f.goTo(1, { instant: true });
const _offChange: () => void = f.on("change", (cur, prev) => void [cur, prev]);
const _offStart: () => void = f.on(
  "flipstart",
  (from, to) => void [from, to],
);
const _offEnd: () => void = f.on("flipend", (from, to) => void [from, to]);
const _destroy: void = f.destroy();

void [
  _current,
  _length,
  _isFlipping,
  _ready,
  _next,
  _prev,
  _goA,
  _goB,
  _offChange,
  _offStart,
  _offEnd,
  _destroy,
];

// --- Negative assertions ------------------------------------------------

// @ts-expect-error — container is required
createFlipbook({ pages: ["a"] });

// @ts-expect-error — pages is required
createFlipbook({ container });

// @ts-expect-error — invalid axis literal
createFlipbook({ container, pages: ["a"], axis: "diagonal" });

// @ts-expect-error — unknown event name
f.on("nope", () => void 0);
