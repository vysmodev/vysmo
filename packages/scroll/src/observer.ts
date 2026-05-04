/**
 * Shared rAF-throttled scroll / resize observer. Every primitive in this
 * package (progress, parallax, sticky-pin, horizontal-section) registers
 * its element here; the observer keeps one passive `scroll` listener on
 * `window` for the lifetime of any subscription and tears it down once
 * the last subscriber unsubscribes.
 *
 * Safe to import at module load: no window access happens until
 * `subscribe()` is called.
 */

export interface ScrollSubscriber {
  onScroll(
    rect: DOMRect,
    viewport: { readonly width: number; readonly height: number },
  ): void;
}

export class ScrollObserver {
  private subs = new Map<HTMLElement, ScrollSubscriber>();
  private listening = false;
  private rafId: number | null = null;
  private readonly scheduler: () => void;

  constructor() {
    this.scheduler = (): void => this.scheduleUpdate();
  }

  subscribe(element: HTMLElement, subscriber: ScrollSubscriber): () => void {
    this.subs.set(element, subscriber);
    if (!this.listening) this.start();
    this.scheduleUpdate();
    return () => {
      this.subs.delete(element);
      if (this.subs.size === 0) this.stop();
    };
  }

  private start(): void {
    if (typeof window === "undefined") return;
    window.addEventListener("scroll", this.scheduler, { passive: true });
    window.addEventListener("resize", this.scheduler, { passive: true });
    this.listening = true;
  }

  private stop(): void {
    if (typeof window === "undefined") return;
    window.removeEventListener("scroll", this.scheduler);
    window.removeEventListener("resize", this.scheduler);
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.listening = false;
  }

  private scheduleUpdate(): void {
    if (this.rafId !== null) return;
    if (typeof requestAnimationFrame === "undefined") return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.flush();
    });
  }

  /**
   * Run every subscriber's callback with the current viewport + element
   * rect. Exposed for tests that need deterministic flushes without
   * waiting on rAF.
   */
  flush(): void {
    if (typeof window === "undefined") return;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    } as const;
    for (const [el, sub] of this.subs) {
      sub.onScroll(el.getBoundingClientRect(), viewport);
    }
  }
}

let _shared: ScrollObserver | null = null;

/** Lazy singleton — first call creates the observer. SSR-safe. */
export function sharedScrollObserver(): ScrollObserver {
  if (!_shared) _shared = new ScrollObserver();
  return _shared;
}
