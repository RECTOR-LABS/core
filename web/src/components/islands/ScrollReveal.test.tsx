import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { ScrollReveal } from "./ScrollReveal";

// ---------------------------------------------------------------------------
// IntersectionObserver mock
//
// jsdom doesn't ship IntersectionObserver.  We install a controllable mock so
// tests can trigger intersection events synchronously.
// ---------------------------------------------------------------------------

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

/** Registry of all active observers so tests can fire entries. */
const observers: Array<{ callback: IOCallback; options?: IntersectionObserverInit; targets: Set<Element> }> = [];

function makeEntry(target: Element, isIntersecting: boolean): IntersectionObserverEntry {
  return {
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: target.getBoundingClientRect(),
    intersectionRect: target.getBoundingClientRect(),
    rootBounds: null,
    time: performance.now(),
  } as IntersectionObserverEntry;
}

/** Trigger intersection for every observed target on all observers. */
function triggerIntersection(element: Element, isIntersecting = true) {
  for (const obs of observers) {
    if (obs.targets.has(element)) {
      obs.callback([makeEntry(element, isIntersecting)]);
    }
  }
}

beforeEach(() => {
  observers.length = 0;

  class MockIntersectionObserver {
    callback: IOCallback;
    options?: IntersectionObserverInit;
    targets = new Set<Element>();

    constructor(cb: IOCallback, options?: IntersectionObserverInit) {
      this.callback = cb;
      this.options = options;
      observers.push(this);
    }

    observe(el: Element) { this.targets.add(el); }
    unobserve(el: Element) { this.targets.delete(el); }
    disconnect() { this.targets.clear(); }
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ScrollReveal island", () => {
  describe("initial state (before intersection)", () => {
    it("sets opacity:0 and translateY(20px) on every child item", () => {
      const { container } = render(
        <ScrollReveal>
          <div>A</div>
          <div>B</div>
          <div>C</div>
        </ScrollReveal>,
      );
      const items = Array.from(container.firstElementChild!.children) as HTMLElement[];
      for (const item of items) {
        expect(item.style.opacity).toBe("0");
        expect(item.style.transform).toBe("translateY(20px)");
      }
    });

    it("applies staggered transitionDelay with default 100ms gap", () => {
      const { container } = render(
        <ScrollReveal>
          <div>A</div>
          <div>B</div>
          <div>C</div>
        </ScrollReveal>,
      );
      const items = Array.from(container.firstElementChild!.children) as HTMLElement[];
      expect(items[0].style.transitionDelay).toBe("0ms");
      expect(items[1].style.transitionDelay).toBe("100ms");
      expect(items[2].style.transitionDelay).toBe("200ms");
    });

    it("applies custom delay prop", () => {
      const { container } = render(
        <ScrollReveal delay={80}>
          <div>A</div>
          <div>B</div>
        </ScrollReveal>,
      );
      const items = Array.from(container.firstElementChild!.children) as HTMLElement[];
      expect(items[0].style.transitionDelay).toBe("0ms");
      expect(items[1].style.transitionDelay).toBe("80ms");
    });

    it("applies 0.6s ease transition", () => {
      const { container } = render(
        <ScrollReveal>
          <div>A</div>
        </ScrollReveal>,
      );
      const item = container.firstElementChild!.children[0] as HTMLElement;
      expect(item.style.transition).toBe("opacity 0.6s ease, transform 0.6s ease");
    });

    it("creates IntersectionObserver with default threshold 0.1", () => {
      render(
        <ScrollReveal>
          <div>A</div>
        </ScrollReveal>,
      );
      expect(observers[0].options).toEqual({ threshold: 0.1 });
    });

    it("creates IntersectionObserver with custom threshold prop", () => {
      render(
        <ScrollReveal threshold={0.5}>
          <div>A</div>
        </ScrollReveal>,
      );
      expect(observers[0].options).toEqual({ threshold: 0.5 });
    });

    it("observes each child item individually", () => {
      const { container } = render(
        <ScrollReveal>
          <div>A</div>
          <div>B</div>
        </ScrollReveal>,
      );
      const items = Array.from(container.firstElementChild!.children) as HTMLElement[];
      const obs = observers[0];
      expect(obs.targets.size).toBe(2);
      for (const item of items) {
        expect(obs.targets.has(item)).toBe(true);
      }
    });
  });

  describe("on intersection", () => {
    it("reveals an item when it intersects (opacity 1, translateY 0)", () => {
      const { container } = render(
        <ScrollReveal>
          <div>A</div>
          <div>B</div>
        </ScrollReveal>,
      );
      const items = Array.from(container.firstElementChild!.children) as HTMLElement[];

      act(() => {
        triggerIntersection(items[0], true);
      });

      expect(items[0].style.opacity).toBe("1");
      expect(items[0].style.transform).toBe("translateY(0)");
      // Second item not yet revealed
      expect(items[1].style.opacity).toBe("0");
    });

    it("reveals items independently (each re-intersects)", () => {
      const { container } = render(
        <ScrollReveal>
          <div>A</div>
          <div>B</div>
          <div>C</div>
        </ScrollReveal>,
      );
      const items = Array.from(container.firstElementChild!.children) as HTMLElement[];

      act(() => {
        triggerIntersection(items[1], true);
      });

      expect(items[0].style.opacity).toBe("0");
      expect(items[1].style.opacity).toBe("1");
      expect(items[1].style.transform).toBe("translateY(0)");
      expect(items[2].style.opacity).toBe("0");
    });

    it("does NOT un-reveal when leaving viewport (continuous-but-one-way: exits don't reset)", () => {
      // The Stimulus controller sets opacity/transform only on isIntersecting=true;
      // it does NOT reset on exit. Items remain revealed after leaving viewport.
      const { container } = render(
        <ScrollReveal>
          <div>A</div>
        </ScrollReveal>,
      );
      const item = container.firstElementChild!.children[0] as HTMLElement;

      act(() => triggerIntersection(item, true));
      expect(item.style.opacity).toBe("1");

      act(() => triggerIntersection(item, false));
      // Still revealed — the Stimulus source only acts on isIntersecting===true
      expect(item.style.opacity).toBe("1");
    });
  });

  describe("cleanup", () => {
    it("disconnects the observer on unmount (targets cleared)", () => {
      const { unmount } = render(
        <ScrollReveal>
          <div>A</div>
        </ScrollReveal>,
      );
      const obs = observers[0];
      // Before unmount the item is being observed
      expect(obs.targets.size).toBe(1);
      unmount();
      // disconnect() clears targets
      expect(obs.targets.size).toBe(0);
    });
  });

  describe("prefers-reduced-motion", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("reveals every child immediately (opacity 1, no hidden transform, no transition) and never observes", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      } as MediaQueryList);

      const { container } = render(
        <ScrollReveal>
          <div>A</div>
          <div>B</div>
          <div>C</div>
        </ScrollReveal>,
      );
      const items = Array.from(container.firstElementChild!.children) as HTMLElement[];

      for (const item of items) {
        expect(item.style.opacity).toBe("1");
        // Must NOT be left in the hidden start-state.
        expect(item.style.transform).not.toBe("translateY(20px)");
        expect(item.style.transform).toBe("none");
        // The 0.6s reveal transition must NOT be applied.
        expect(item.style.transition).toBe("none");
      }

      // No IntersectionObserver was created — nothing to reveal-on-scroll.
      expect(observers.length).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("renders with no children without throwing", () => {
      expect(() => render(<ScrollReveal />)).not.toThrow();
    });

    it("wraps children in a containing div", () => {
      const { container } = render(
        <ScrollReveal>
          <span>child</span>
        </ScrollReveal>,
      );
      // Root is a div wrapping the children
      expect(container.firstElementChild?.tagName).toBe("DIV");
    });

    it("forwards className to the wrapper div", () => {
      const { container } = render(
        <ScrollReveal className="my-wrapper">
          <div>A</div>
        </ScrollReveal>,
      );
      expect(container.firstElementChild?.className).toContain("my-wrapper");
    });
  });
});
