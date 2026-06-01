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
    it("clears the text immediately and starts typing", () => {
      // Stimulus clears textTarget.textContent on connect() then starts type()
      // First char is typed synchronously (same as BootSequence pattern)
      const { container } = render(<Typing text="Hello" speed={50} delay={0} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;
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

    it("default delay is 0 (starts immediately)", () => {
      const { container } = render(<Typing text="AB" />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;
      // With delay=0, first char typed sync on mount
      expect(textEl.textContent).toBe("A");
    });
  });

  describe("typing character by character", () => {
    it("types one char per speed interval", () => {
      const { container } = render(<Typing text="ABC" speed={30} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;

      // Char A: sync at mount
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

      // A is typed sync; B after 50ms
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
      // text="AB", speed=50: A typed sync at render; B at +50ms; loop pause +2000ms;
      // reset + A typed sync → text="A" at +2050ms (B of second cycle at +2100ms)
      // Use NO act() wrapper for the advance — avoids the separate-act() fake-timer issue.
      const { container } = render(<Typing text="AB" speed={50} loop={true} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;
      expect(textEl.textContent).toBe("A");

      // Advance 2100ms (past B + loop pause + A reset, before second B)
      vi.advanceTimersByTime(2100);
      // After 2100ms: second cycle started, "A" re-typed sync, "B" not yet (needs 50ms more)
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

      // Text is mid-typed
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

    it("handles single-char text (one sync char, no timers needed)", () => {
      const { container } = render(<Typing text="X" speed={50} />);
      const textEl = container.querySelector<HTMLElement>("[data-text]")!;
      expect(textEl.textContent).toBe("X");
    });

    it("accepts className prop on wrapper", () => {
      const { container } = render(<Typing text="hi" className="typed-box" />);
      expect(container.firstElementChild?.className).toContain("typed-box");
    });
  });
});
