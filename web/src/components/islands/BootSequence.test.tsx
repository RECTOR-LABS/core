import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { BootSequence } from "./BootSequence";

// ---------------------------------------------------------------------------
// setTimeout mock strategy
//
// BootSequence uses setTimeout for character typing + line delays.
// We only fake setTimeout/clearTimeout (not microtasks) to avoid interfering
// with React Testing Library's internal scheduler.
//
// Key insight: vi.advanceTimersByTime() in SEPARATE act() calls causes issues
// because nested setTimeout callbacks queue new timers DURING the advance; the
// outer act() then flushes React effects again, which can reset cancelled=false.
// Solution: use vi.runAllTimers() to drain all pending timers at once when
// we want to see the "fully complete" state; use a single large advanceTimersByTime
// inside one act() for mid-sequence observations.
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Only fake setTimeout/clearTimeout — leave microtasks alone for React
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLines(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-line]"));
}

function getContent(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>("[data-content]");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BootSequence island", () => {
  describe("initial state on mount", () => {
    it("shows line[0] with opacity 1 immediately (typing starts synchronously)", () => {
      // showNextLine() is called in useEffect → line[0] made visible immediately.
      // Line[1+] remain hidden until their lineDelay fires.
      const { container } = render(
        <BootSequence lines={["BIOS v1.0", "Loading...", "OK"]} />,
      );
      const lines = getLines(container);
      expect(lines[0].style.opacity).toBe("1");
      expect(lines[1].style.opacity).toBe("0");
      expect(lines[2].style.opacity).toBe("0");
    });

    it("hides content immediately (opacity 0)", () => {
      const { container } = render(
        <BootSequence lines={["Hello"]} content={<div>MAIN CONTENT</div>} />,
      );
      const content = getContent(container);
      expect(content).not.toBeNull();
      expect(content!.style.opacity).toBe("0");
    });

    it("begins typing the first line immediately (first char added synchronously)", () => {
      // type() runs the first character without a setTimeout — matches Stimulus source.
      const { container } = render(
        <BootSequence lines={["SYSTEM BOOT", "OK"]} />,
      );
      const lines = getLines(container);
      expect(lines[0].textContent).toBe("S");
      expect(lines[1].textContent).toBe("");
    });

    it("renders without content element when content prop omitted", () => {
      const { container } = render(<BootSequence lines={["Hello"]} />);
      expect(getContent(container)).toBeNull();
    });
  });

  describe("typing — per charSpeed", () => {
    it("types characters at charSpeed interval (first char sync, rest via setTimeout)", () => {
      // "AB" with charSpeed=20: char A typed sync, char B after 20ms
      const { container } = render(
        <BootSequence lines={["AB"]} charSpeed={20} lineDelay={400} />,
      );
      const [line] = getLines(container);

      // At render: "A" is already typed (first char sync)
      expect(line.textContent).toBe("A");
      expect(line.style.opacity).toBe("1");

      // Advance 20ms → "AB" fully typed
      act(() => vi.advanceTimersByTime(20));
      expect(line.textContent).toBe("AB");
    });

    it("makes the current line visible (opacity 1) before typing starts", () => {
      const { container } = render(<BootSequence lines={["Test"]} charSpeed={20} />);
      const [line] = getLines(container);
      expect(line.style.opacity).toBe("1");
    });
  });

  describe("line sequencing", () => {
    it("types line[0] fully, then advances to line[1] after lineDelay", () => {
      // charSpeed=20, lineDelay=100
      // line[0] "AB": A sync, B at 20ms → done; lineDelay 100ms → line[1] starts
      const { container } = render(
        <BootSequence lines={["AB", "CD"]} charSpeed={20} lineDelay={100} />,
      );
      const lines = getLines(container);

      // At render: typing in progress (A typed), line[1] hidden
      expect(lines[1].style.opacity).toBe("0");

      // After 20ms: "AB" fully typed, lineDelay not yet elapsed
      act(() => vi.advanceTimersByTime(20));
      expect(lines[0].textContent).toBe("AB");
      expect(lines[1].style.opacity).toBe("0");

      // After lineDelay (100ms): line[1] starts — advance 100ms more in same act
      // use runAllTimers to chain nested timers
      act(() => vi.runAllTimers());
      expect(lines[1].style.opacity).toBe("1");
      expect(lines[1].textContent).toBe("CD");
    });

    it("types all lines fully in sequence via runAllTimers", () => {
      const { container } = render(
        <BootSequence lines={["ABC", "XY", "Z"]} charSpeed={10} lineDelay={50} />,
      );
      const lines = getLines(container);

      act(() => vi.runAllTimers());

      expect(lines[0].textContent).toBe("ABC");
      expect(lines[1].textContent).toBe("XY");
      expect(lines[2].textContent).toBe("Z");
    });
  });

  describe("content fade-in after all lines", () => {
    it("fades in content after all lines complete", () => {
      const { container } = render(
        <BootSequence
          lines={["A", "B"]}
          charSpeed={10}
          lineDelay={50}
          content={<p>DONE</p>}
        />,
      );
      const content = getContent(container);
      expect(content!.style.opacity).toBe("0");

      act(() => vi.runAllTimers());

      expect(content!.style.opacity).toBe("1");
    });

    it("applies opacity 0.5s ease transition to content element", () => {
      const { container } = render(
        <BootSequence lines={["X"]} charSpeed={10} lineDelay={50} content={<p>OK</p>} />,
      );
      const content = getContent(container);

      act(() => vi.runAllTimers());

      expect(content!.style.transition).toBe("opacity 0.5s ease");
    });

    it("does not error if no content prop provided at completion", () => {
      expect(() => {
        render(<BootSequence lines={["Hi"]} charSpeed={10} lineDelay={50} />);
        act(() => vi.runAllTimers());
      }).not.toThrow();
    });
  });

  describe("defaults", () => {
    it("uses charSpeed 20ms by default (second char after 20ms)", () => {
      const { container } = render(<BootSequence lines={["AB"]} />);
      const [line] = getLines(container);

      // At render: "A" already present (synchronous first char)
      expect(line.textContent).toBe("A");

      // After 20ms → "AB" (second char)
      act(() => vi.advanceTimersByTime(20));
      expect(line.textContent).toBe("AB");
    });

    it("uses lineDelay 400ms by default (second line visible after runAllTimers)", () => {
      // line[0] "A": 1 char typed sync → done immediately
      // lineDelay default 400ms → line[1] starts (verified by running all timers)
      const { container } = render(<BootSequence lines={["A", "B"]} charSpeed={20} />);
      const lines = getLines(container);

      // After render: line[0] visible + typed, line[1] hidden
      expect(lines[1].style.opacity).toBe("0");

      // Run all timers (including the 400ms lineDelay + line[1] single char)
      act(() => vi.runAllTimers());
      expect(lines[1].style.opacity).toBe("1");
      // "B" typed synchronously when line[1] starts → full text "B"
      expect(lines[1].textContent).toBe("B");
    });
  });

  describe("edge cases", () => {
    it("renders with empty lines array without throwing", () => {
      expect(() =>
        render(<BootSequence lines={[]} content={<p>OK</p>} />),
      ).not.toThrow();
    });

    it("immediately fades in content when lines array is empty", () => {
      // With 0 lines, showNextLine(0) immediately calls showContent
      const { container } = render(
        <BootSequence lines={[]} content={<p>READY</p>} />,
      );
      const content = getContent(container);
      expect(content!.style.opacity).toBe("1");
    });
  });

  // The arbital retro page needs the lines wrapped in a `.boot-header` element
  // (whose border/opacity must NOT bleed onto the revealed content) and each
  // line tagged `.bios-line`. These opt-in props enable that without disturbing
  // the typing/observer logic (which queries `[data-line]`/`[data-content]`
  // descendants, so the extra nesting is transparent to it).
  describe("headerClassName + lineClassName (arbital boot-header)", () => {
    it("wraps the lines in a single header element, with content OUTSIDE it", () => {
      const { container } = render(
        <BootSequence
          lines={["A", "B"]}
          headerClassName="boot-header"
          content={<p>BODY</p>}
        />,
      );
      const header = container.querySelector(".boot-header")!;
      expect(header).not.toBeNull();
      // both lines live inside the header
      expect(header.querySelectorAll("[data-line]")).toHaveLength(2);
      // the content lives OUTSIDE the header (so .boot-header styles can't bleed)
      const content = getContent(container)!;
      expect(header.contains(content)).toBe(false);
    });

    it("applies lineClassName to every line", () => {
      const { container } = render(
        <BootSequence lines={["A", "B"]} lineClassName="bios-line" />,
      );
      const lines = getLines(container);
      expect(lines).toHaveLength(2);
      for (const line of lines) {
        expect(line.classList.contains("bios-line")).toBe(true);
      }
    });

    it("still types and reveals normally with the header wrapper present", () => {
      const { container } = render(
        <BootSequence
          lines={["A"]}
          headerClassName="boot-header"
          lineClassName="bios-line"
          charSpeed={10}
          lineDelay={50}
          content={<p>BODY</p>}
        />,
      );
      act(() => vi.runAllTimers());
      // line typed, content revealed
      expect(getLines(container)[0].textContent).toBe("A");
      expect(getContent(container)!.style.opacity).toBe("1");
    });

    it("keeps lines as direct children when headerClassName is omitted (default)", () => {
      const { container } = render(<BootSequence lines={["A"]} />);
      expect(container.querySelector(".boot-header")).toBeNull();
      // line is a direct child of the outer wrapper
      const wrapper = container.firstElementChild!;
      expect(wrapper.querySelector(":scope > [data-line]")).not.toBeNull();
    });
  });
});
