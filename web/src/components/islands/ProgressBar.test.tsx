import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

// ---------------------------------------------------------------------------
// IntersectionObserver mock (same class-style as ScrollReveal.test)
// ---------------------------------------------------------------------------

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

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

function triggerIntersection(element: Element, isIntersecting = true) {
  for (const obs of observers) {
    if (obs.targets.has(element)) {
      obs.callback([makeEntry(element, isIntersecting)]);
    }
  }
}

// setTimeout mock — captures timers for manual flushing
const timers: Array<{ id: number; fn: () => void; delay: number }> = [];
let timerIdCounter = 1;
/** Ids cleared via clearTimeout. */
const clearedTimerIds: Set<number> = new Set();

function flushTimers() {
  // Sort by delay then execute all non-cleared timers
  const toRun = [...timers]
    .filter((t) => !clearedTimerIds.has(t.id))
    .sort((a, b) => a.delay - b.delay);
  timers.length = 0;
  for (const t of toRun) t.fn();
}

beforeEach(() => {
  observers.length = 0;
  timers.length = 0;
  timerIdCounter = 1;
  clearedTimerIds.clear();

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

  vi.stubGlobal(
    "setTimeout",
    vi.fn((fn: () => void, delay = 0) => {
      const id = timerIdCounter++;
      timers.push({ id, fn, delay });
      return id;
    }),
  );

  vi.stubGlobal(
    "clearTimeout",
    vi.fn((id: number) => {
      clearedTimerIds.add(id);
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A single bar with a given target width. */
function bar(width: string, label?: string) {
  return { width, label: label ?? width };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ProgressBar island", () => {
  describe("initial state (before intersection)", () => {
    it("resets all bars to 0% on mount", () => {
      const { container } = render(
        <ProgressBar bars={[bar("75%"), bar("50%"), bar("30%")]} />,
      );
      const barEls = container.querySelectorAll<HTMLElement>("[data-bar]");
      for (const b of barEls) {
        expect(b.style.width).toBe("0%");
      }
    });

    it("stores target width as data-target-width attribute", () => {
      const { container } = render(
        <ProgressBar bars={[bar("75%"), bar("50%")]} />,
      );
      const barEls = Array.from(container.querySelectorAll<HTMLElement>("[data-bar]"));
      expect(barEls[0].dataset.targetWidth).toBe("75%");
      expect(barEls[1].dataset.targetWidth).toBe("50%");
    });

    it("observes the root container element (not each bar)", () => {
      const { container } = render(<ProgressBar bars={[bar("60%")]} />);
      const root = container.firstElementChild as HTMLElement;
      expect(observers[0].targets.has(root)).toBe(true);
    });

    it("creates observer with threshold 0.2", () => {
      render(<ProgressBar bars={[bar("60%")]} />);
      expect(observers[0].options).toEqual({ threshold: 0.2 });
    });
  });

  describe("animation on intersection (ONE-TIME)", () => {
    it("applies CSS transition and target width to each bar on trigger", () => {
      const { container } = render(
        <ProgressBar bars={[bar("75%"), bar("50%")]} duration={1000} delay={100} />,
      );
      const root = container.firstElementChild as HTMLElement;
      const barEls = Array.from(container.querySelectorAll<HTMLElement>("[data-bar]"));

      act(() => {
        triggerIntersection(root, true);
        flushTimers();
      });

      // Both bars should now have transition set and width = target
      expect(barEls[0].style.transition).toBe("width 1000ms ease-out");
      expect(barEls[0].style.width).toBe("75%");
      expect(barEls[1].style.transition).toBe("width 1000ms ease-out");
      expect(barEls[1].style.width).toBe("50%");
    });

    it("staggers bars: bar[0] at delay 0, bar[1] at delay*1, bar[2] at delay*2", () => {
      const { container } = render(
        <ProgressBar bars={[bar("80%"), bar("60%"), bar("40%")]} delay={100} />,
      );
      const root = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(root, true));

      // Three timers queued: delays 0, 100, 200
      const delays = timers.map((t) => t.delay).sort((a, b) => a - b);
      expect(delays).toEqual([0, 100, 200]);
    });

    it("uses custom delay prop for stagger", () => {
      const { container } = render(
        <ProgressBar bars={[bar("70%"), bar("50%")]} delay={80} />,
      );
      const root = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(root, true));

      const delays = timers.map((t) => t.delay).sort((a, b) => a - b);
      expect(delays).toEqual([0, 80]);
    });

    it("disconnects the observer after first trigger (ONE-TIME)", () => {
      const { container } = render(<ProgressBar bars={[bar("60%")]} />);
      const root = container.firstElementChild as HTMLElement;
      const obs = observers[0];

      expect(obs.targets.size).toBe(1); // initially observing

      act(() => triggerIntersection(root, true));

      // Observer disconnected after first fire
      expect(obs.targets.size).toBe(0);
    });

    it("does NOT animate again on second intersection (observer already disconnected)", () => {
      const { container } = render(<ProgressBar bars={[bar("60%")]} />);
      const root = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(root, true));
      const timerCountAfterFirst = timers.length;

      // Try to fire again — observer is disconnected so nothing happens
      act(() => triggerIntersection(root, true));
      expect(timers.length).toBe(timerCountAfterFirst);
    });
  });

  describe("duration prop", () => {
    it("uses default duration 1000ms in transition string", () => {
      const { container } = render(<ProgressBar bars={[bar("70%")]} />);
      const root = container.firstElementChild as HTMLElement;
      const barEl = container.querySelector<HTMLElement>("[data-bar]")!;

      act(() => {
        triggerIntersection(root, true);
        flushTimers();
      });

      expect(barEl.style.transition).toBe("width 1000ms ease-out");
    });

    it("uses custom duration in transition string", () => {
      const { container } = render(<ProgressBar bars={[bar("70%")]} duration={500} />);
      const root = container.firstElementChild as HTMLElement;
      const barEl = container.querySelector<HTMLElement>("[data-bar]")!;

      act(() => {
        triggerIntersection(root, true);
        flushTimers();
      });

      expect(barEl.style.transition).toBe("width 500ms ease-out");
    });
  });

  describe("cleanup", () => {
    it("disconnects observer on unmount", () => {
      const { unmount } = render(<ProgressBar bars={[bar("60%")]} />);
      expect(observers[0].targets.size).toBe(1);
      unmount();
      expect(observers[0].targets.size).toBe(0);
    });

    it("clears all staggered timers on unmount (no stagger leak)", () => {
      const { container, unmount } = render(
        <ProgressBar bars={[bar("80%"), bar("60%"), bar("40%")]} delay={100} />,
      );
      const root = container.firstElementChild as HTMLElement;
      const barEls = Array.from(container.querySelectorAll<HTMLElement>("[data-bar]"));

      // Trigger intersection — queues 3 staggered timers
      act(() => triggerIntersection(root, true));
      expect(timers.length).toBe(3);

      // Unmount BEFORE flushing timers (mid-stagger)
      unmount();

      // Every queued timer id should have been cleared
      expect(clearedTimerIds.size).toBeGreaterThanOrEqual(3);

      // Now flush — bars should NOT have received their target widths
      act(() => flushTimers());
      for (const barEl of barEls) {
        // Still at 0% — the timers were cleared before they could mutate the DOM
        expect(barEl.style.width).toBe("0%");
      }
    });

    it("clears staggered timers on effect re-run (prop change mid-stagger)", () => {
      const { container, rerender } = render(
        <ProgressBar bars={[bar("80%"), bar("60%")]} delay={100} />,
      );
      const root = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(root, true));
      // 2 timers queued, not yet flushed
      expect(timers.length).toBe(2);

      // Change props — triggers effect cleanup then re-run
      act(() => rerender(<ProgressBar bars={[bar("50%"), bar("30%")]} delay={100} />));

      // Cleanup should have cleared the original timers
      expect(clearedTimerIds.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe("edge cases", () => {
    it("renders with no bars without throwing", () => {
      expect(() => render(<ProgressBar bars={[]} />)).not.toThrow();
    });

    it("accepts a className prop on the wrapper", () => {
      const { container } = render(
        <ProgressBar bars={[bar("50%")]} className="stack-bars" />,
      );
      expect(container.firstElementChild?.className).toContain("stack-bars");
    });
  });

  // The arbital tech lists supply their own `.tech-item` row markup (name +
  // percent columns around each bar). In children mode the island renders that
  // markup verbatim and only animates the `[data-bar]` descendants from their
  // own `data-target-width` — faithful to the Stimulus controller, which never
  // rendered the bars (it animated pre-authored targets in the .erb).
  describe("children mode (custom row markup)", () => {
    it("renders provided children and ignores `bars`", () => {
      const { container } = render(
        <ProgressBar>
          <div className="tech-item">
            <span className="tech-name">Rust</span>
            <div className="tech-bar-container">
              <div className="tech-bar" data-bar data-target-width="85%" style={{ width: "85%" }} />
            </div>
            <span className="tech-level">85%</span>
          </div>
        </ProgressBar>,
      );
      expect(container.querySelector(".tech-name")?.textContent).toBe("Rust");
      expect(container.querySelector(".tech-level")?.textContent).toBe("85%");
    });

    it("resets each nested bar to 0% on mount", () => {
      const { container } = render(
        <ProgressBar>
          <div className="tech-item">
            <div className="tech-bar" data-bar data-target-width="85%" style={{ width: "85%" }} />
          </div>
          <div className="tech-item">
            <div className="tech-bar" data-bar data-target-width="50%" style={{ width: "50%" }} />
          </div>
        </ProgressBar>,
      );
      for (const b of container.querySelectorAll<HTMLElement>("[data-bar]")) {
        expect(b.style.width).toBe("0%");
      }
    });

    it("animates each nested bar to its own data-target-width on intersection", () => {
      const { container } = render(
        <ProgressBar delay={100} duration={1000}>
          <div className="tech-item">
            <div className="tech-bar" data-bar data-target-width="85%" style={{ width: "85%" }} />
          </div>
          <div className="tech-item">
            <div className="tech-bar" data-bar data-target-width="50%" style={{ width: "50%" }} />
          </div>
        </ProgressBar>,
      );
      const root = container.firstElementChild as HTMLElement;
      const bars = Array.from(container.querySelectorAll<HTMLElement>("[data-bar]"));

      act(() => {
        triggerIntersection(root, true);
        flushTimers();
      });

      expect(bars[0].style.width).toBe("85%");
      expect(bars[0].style.transition).toBe("width 1000ms ease-out");
      expect(bars[1].style.width).toBe("50%");
    });
  });
});
