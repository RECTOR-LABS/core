import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { Counter } from "./Counter";

// ---------------------------------------------------------------------------
// Browser API mocks
//
// Counter uses IntersectionObserver (ONE-TIME trigger) + requestAnimationFrame.
// We mock both to allow synchronous, deterministic testing.
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

/** rAF frames queued by the component. */
let rafCallbacks: Array<(t: number) => void> = [];
let rafTime = 0;

/** Advance time and run all queued rAF callbacks that would fire. */
function flushRaf(advanceMs = 0) {
  rafTime += advanceMs;
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  for (const cb of cbs) cb(rafTime);
}

beforeEach(() => {
  observers.length = 0;
  rafCallbacks = [];
  rafTime = 0;

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
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb as (t: number) => void);
      return rafCallbacks.length;
    }),
  );

  // performance.now() starts at 0 in tests
  vi.spyOn(performance, "now").mockReturnValue(0);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Counter island", () => {
  describe("initial render", () => {
    it("renders 0 before any intersection (no animation started)", () => {
      const { getByText } = render(<Counter number={31050} display="$31,050+" />);
      // Before intersection the element just shows whatever React renders initially
      // (implementation may show 0 or an empty text — it must NOT show the final display)
      const el = getByText(/\d/);
      expect(el).toBeTruthy();
    });

    it("does not show the display string before animation completes", () => {
      const { queryByText } = render(<Counter number={31050} display="$31,050+" />);
      // The display string must not appear before animation fires
      expect(queryByText("$31,050+")).toBeNull();
    });
  });

  describe("IntersectionObserver setup", () => {
    it("uses threshold 0.3 (matches Stimulus source)", () => {
      render(<Counter number={100} display="100" />);
      expect(observers[0].options).toEqual({ threshold: 0.3 });
    });

    it("observes the root element", () => {
      const { container } = render(<Counter number={100} display="100" />);
      expect(observers[0].targets.has(container.firstElementChild!)).toBe(true);
    });
  });

  describe("animation — one-time trigger", () => {
    it("starts counting on first intersection", () => {
      const { container } = render(<Counter number={1000} display="1,000" duration={1000} />);
      const el = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(el, true));

      // One rAF should have been queued
      expect(rafCallbacks.length).toBeGreaterThan(0);
    });

    it("does NOT start again on second intersection (one-time)", () => {
      const { container } = render(<Counter number={1000} display="1,000" duration={1000} />);
      const el = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(el, true));

      // Clear callbacks, then fire intersection again
      rafCallbacks = [];
      act(() => triggerIntersection(el, true));
      // No new rAF queued — animation already ran
      expect(rafCallbacks.length).toBe(0);
    });

    it("shows intermediate count during animation (cubic ease-out)", () => {
      const { container } = render(<Counter number={1000} display="DONE" duration={1000} />);
      const el = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(el, true));

      // At t=0 → progress=0 → eased=0 → current=0
      act(() => flushRaf(0));
      expect(el.textContent).toBe("0");

      // At t=500ms → progress=0.5 → eased=1-(0.5)^3=0.875 → current=round(875)=875
      act(() => flushRaf(500));
      expect(el.textContent).toBe("875");
    });

    it("shows localized number during counting", () => {
      const { container } = render(<Counter number={1000} display="DONE" duration={1000} />);
      const el = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(el, true));
      act(() => flushRaf(500)); // t=500, current=875
      // toLocaleString output (locale-dependent but in jsdom/node is "875")
      expect(el.textContent).toMatch(/^\d[\d,]*$/);
    });

    it("swaps to display string when animation completes (progress >= 1)", () => {
      const { container } = render(<Counter number={1000} display="$1,000+" duration={1000} />);
      const el = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(el, true));
      act(() => flushRaf(0));    // first frame
      act(() => flushRaf(1000)); // completes animation (elapsed >= duration)

      expect(el.textContent).toBe("$1,000+");
    });

    it("shows target number as localized string at completion when display is empty", () => {
      const { container } = render(<Counter number={500} display="" duration={1000} />);
      const el = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(el, true));
      act(() => flushRaf(0));
      act(() => flushRaf(1000));

      // No display value → shows localized target number at completion
      expect(el.textContent).toBe("500");
    });
  });

  describe("easing — cubic ease-out", () => {
    it("applies eased = 1 - (1 - progress)^3 at midpoint", () => {
      const { container } = render(<Counter number={1000} display="done" duration={1000} />);
      const el = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(el, true));
      act(() => flushRaf(0));
      act(() => flushRaf(250)); // t=250, progress=0.25, eased=1-(0.75)^3=1-0.421875=0.578125
      const expected = Math.round(0.578125 * 1000);
      expect(el.textContent).toBe(expected.toString());
    });
  });

  describe("defaults", () => {
    it("uses 1500ms duration by default", () => {
      const { container } = render(<Counter number={1500} />);
      const el = container.firstElementChild as HTMLElement;

      act(() => triggerIntersection(el, true));
      act(() => flushRaf(0));
      act(() => flushRaf(750)); // t=750, progress=0.5 of 1500ms
      // eased = 1-(0.5)^3 = 0.875 → current = round(0.875 * 1500) = 1313
      const expected = Math.round((1 - Math.pow(0.5, 3)) * 1500);
      expect(el.textContent).toBe(expected.toLocaleString());
    });

    it("uses number=0 by default (renders 0)", () => {
      const { container } = render(<Counter />);
      // Default number=0 → animation counts 0→0, ends at "0"
      expect(container.firstElementChild?.textContent).toBe("0");
    });
  });

  describe("cleanup", () => {
    it("disconnects observer on unmount", () => {
      const { unmount } = render(<Counter number={100} />);
      expect(observers[0].targets.size).toBe(1);
      unmount();
      expect(observers[0].targets.size).toBe(0);
    });
  });
});
