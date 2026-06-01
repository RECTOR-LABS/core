import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { Typing } from "./Typing";

// ---------------------------------------------------------------------------
// Timer mock — only fake setTimeout/clearTimeout
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Typing island", () => {
  describe("initial state on mount", () => {
    it("clears the text immediately and starts typing on the next tick", () => {
      // Stimulus clears textTarget.textContent on connect() then schedules the
      // initial type() via setTimeout(fn, delay) — so at render the text is
      // cleared ("") and the first char appears one tick later (even at delay=0).
      const { container } = render(<Typing text="Hello" speed={50} delay={0} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;
      expect(textEl.textContent).toBe("");
      act(() => vi.advanceTimersByTime(0));
      expect(textEl.textContent).toBe("H");
    });

    it("respects initial delay before starting (delay > 0)", () => {
      const { container } = render(<Typing text="Hi" speed={50} delay={200} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;
      // delay=200ms means typing hasn't started yet (no chars)
      expect(textEl.textContent).toBe("");
    });

    it("starts typing after delay has elapsed", () => {
      const { container } = render(<Typing text="Hi" speed={50} delay={200} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;

      act(() => vi.advanceTimersByTime(200));
      // After delay, "H" typed synchronously
      expect(textEl.textContent).toBe("H");
    });

    it("default delay is 0 (first char on the next tick)", () => {
      const { container } = render(<Typing text="AB" />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;
      // delay defaults to 0, but the initial type() is still setTimeout-scheduled
      expect(textEl.textContent).toBe("");
      act(() => vi.advanceTimersByTime(0));
      expect(textEl.textContent).toBe("A");
    });
  });

  describe("typing character by character", () => {
    it("types one char per speed interval", () => {
      const { container } = render(<Typing text="ABC" speed={30} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;

      // Char A: after the initial setTimeout(0) tick
      act(() => vi.advanceTimersByTime(0));
      expect(textEl.textContent).toBe("A");

      // Char B: after 30ms
      act(() => vi.advanceTimersByTime(30));
      expect(textEl.textContent).toBe("AB");

      // Char C: after another 30ms
      act(() => vi.advanceTimersByTime(30));
      expect(textEl.textContent).toBe("ABC");
    });

    it("types full text after runAllTimers", () => {
      const { container } = render(<Typing text="Hello World" speed={20} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;

      act(() => vi.runAllTimers());
      expect(textEl.textContent).toBe("Hello World");
    });

    it("uses default speed of 50ms", () => {
      const { container } = render(<Typing text="AB" />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;

      // advancing 50ms fires the initial 0-tick (A) and the 50ms tick (B)
      act(() => vi.advanceTimersByTime(50));
      expect(textEl.textContent).toBe("AB");
    });
  });

  describe("cursor", () => {
    it("renders cursor element when cursor prop is provided", () => {
      const { container } = render(<Typing text="Hi" cursor="|" />);
      const cursorEl = container.querySelector<HTMLElement>("[data-cursor]");
      expect(cursorEl).not.toBeNull();
      expect(cursorEl!.textContent).toBe("|");
    });

    it("does not render cursor element when cursor prop is omitted", () => {
      const { container } = render(<Typing text="Hi" />);
      const cursorEl = container.querySelector<HTMLElement>("[data-cursor]");
      expect(cursorEl).toBeNull();
    });
  });

  describe("loop mode", () => {
    it("loop=false: text does not reset after completing (stays as final text)", () => {
      const { container } = render(<Typing text="AB" speed={10} loop={false} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;

      // Complete typing (A sync + B at 10ms)
      act(() => vi.advanceTimersByTime(10));
      expect(textEl.textContent).toBe("AB");

      // Wait another 5000ms — no loop, text stays "AB"
      act(() => vi.advanceTimersByTime(5000));
      expect(textEl.textContent).toBe("AB");
    });

    it("loop=true: text resets and begins retyping after 2000ms pause", () => {
      // speed=50, initial type() is setTimeout(0): A@t=0, B@t=50. The loop check runs
      // on the NEXT type() call (t=100), which schedules the 2000ms pause → reset +
      // retype begins at t=2100. Bare advanceTimersByTime (no act) chains the queued
      // timers reliably for this ref-mutating island.
      const { container } = render(<Typing text="AB" speed={50} loop={true} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;

      vi.advanceTimersByTime(50); // t=50: first full pass complete
      expect(textEl.textContent).toBe("AB");

      vi.advanceTimersByTime(2070); // t=2120: reset fired (@2100) → first char of retype, before its 2nd char (@2150)
      expect(textEl.textContent).toBe("A");
    });

    it("loop=false (default): text stays after completion, no reset", () => {
      const { container } = render(<Typing text="AB" speed={10} loop={false} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;

      act(() => vi.advanceTimersByTime(10));
      expect(textEl.textContent).toBe("AB");

      act(() => vi.advanceTimersByTime(5000));
      expect(textEl.textContent).toBe("AB");
    });
  });

  describe("cleanup on unmount", () => {
    it("restores original text on unmount (matches Stimulus disconnect())", () => {
      const { container, unmount } = render(<Typing text="Hello" speed={50} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;

      // Text is mid-typed (first char after the initial tick)
      act(() => vi.advanceTimersByTime(0));
      expect(textEl.textContent).toBe("H");

      unmount();
      // After unmount, original text is restored
      expect(textEl.textContent).toBe("Hello");
    });
  });

  describe("edge cases", () => {
    it("handles empty text without throwing", () => {
      expect(() => render(<Typing text="" />)).not.toThrow();
    });

    it("handles single-char text (one char after the initial tick)", () => {
      const { container } = render(<Typing text="X" speed={50} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;
      act(() => vi.advanceTimersByTime(0));
      expect(textEl.textContent).toBe("X");
    });

    it("accepts className prop on wrapper", () => {
      const { container } = render(<Typing text="hi" className="typed-box" />);
      expect(container.firstElementChild?.className).toContain("typed-box");
    });
  });
});
