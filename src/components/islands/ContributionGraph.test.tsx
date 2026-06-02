import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContributionGraph } from "./ContributionGraph";
import type { YearContributions } from "@/lib/github/contributions";

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------
//
// 2026: 3 weeks, clear busiest day (2026-01-05 = 15 contributions),
//       currentStreak=3, longestStreak=5, total=1234
//
// Week 0: Sun 2026-01-04 (4), Mon 2026-01-05 (15 ← BUSIEST), Tue 2026-01-06 (3) → 3 days
// Week 1: Wed 2026-01-07 (0), Thu 2026-01-08 (2), Fri 2026-01-09 (1), Sat 2026-01-10 (4) → 4 days (partial week, no Sunday)
// Week 2: Sun 2026-01-11 (0), Mon 2026-01-12 (1), Tue 2026-01-13 (0) → 3 days (partial)
//
// Padding check: week0 has 3 days → 4 pad cells; week1 has 4 days → 3 pad; week2 has 3 days → 4 pad
// Total cells: (3+4) + (4+3) + (3+4) = 21

const data2026: YearContributions = {
  total: 1234,
  selectedYear: 2026,
  yearlyTotals: { "2026": 1234, "2025": 567 },
  weeks: [
    [
      { date: "2026-01-04", count: 4, level: 1 },
      { date: "2026-01-05", count: 15, level: 4 },
      { date: "2026-01-06", count: 3, level: 1 },
    ],
    [
      { date: "2026-01-07", count: 0, level: 0 },
      { date: "2026-01-08", count: 2, level: 1 },
      { date: "2026-01-09", count: 1, level: 1 },
      { date: "2026-01-10", count: 4, level: 1 },
    ],
    [
      { date: "2026-01-11", count: 0, level: 0 },
      { date: "2026-01-12", count: 1, level: 1 },
      { date: "2026-01-13", count: 0, level: 0 },
    ],
  ],
  contributions: [],
  currentStreak: 3,
  longestStreak: 5,
};

// 2025: 2 full weeks, no streak, total=567
// Week 0: Sun 2025-12-28 through Sat 2026-01-03 → 7 days (0 pad)
// Week 1: Sun 2025-12-21 through Sat 2025-12-27 → 7 days (0 pad)
// Total cells: 14

const data2025: YearContributions = {
  total: 567,
  selectedYear: 2025,
  yearlyTotals: { "2026": 1234, "2025": 567 },
  weeks: [
    [
      { date: "2025-12-21", count: 1, level: 1 },
      { date: "2025-12-22", count: 2, level: 1 },
      { date: "2025-12-23", count: 0, level: 0 },
      { date: "2025-12-24", count: 3, level: 1 },
      { date: "2025-12-25", count: 0, level: 0 },
      { date: "2025-12-26", count: 5, level: 2 },
      { date: "2025-12-27", count: 1, level: 1 },
    ],
    [
      { date: "2025-12-28", count: 2, level: 1 },
      { date: "2025-12-29", count: 0, level: 0 },
      { date: "2025-12-30", count: 4, level: 1 },
      { date: "2025-12-31", count: 1, level: 1 },
      { date: "2026-01-01", count: 0, level: 0 },
      { date: "2026-01-02", count: 3, level: 1 },
      { date: "2026-01-03", count: 6, level: 2 },
    ],
  ],
  contributions: [],
  currentStreak: 0,
  longestStreak: 0,
};

// All-zero year: non-empty weeks but every day has count 0 → busiest is undefined,
// no streak segments. Only reachable in theory (a real tab year always has total>0),
// but proves the streak-best omission AND that the grid still renders.
const dataAllZero: YearContributions = {
  total: 0,
  selectedYear: 2024,
  yearlyTotals: {},
  weeks: [
    [
      { date: "2024-06-02", count: 0, level: 0 },
      { date: "2024-06-03", count: 0, level: 0 },
      { date: "2024-06-04", count: 0, level: 0 },
    ],
  ],
  contributions: [],
  currentStreak: 0,
  longestStreak: 0,
};

const defaultProps = {
  years: [
    { year: 2026, data: data2026 },
    { year: 2025, data: data2025 },
  ],
  defaultYear: 2026,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ContributionGraph", () => {
  describe("year tabs", () => {
    it("renders a button tab for each year", () => {
      render(<ContributionGraph {...defaultProps} />);
      const buttons = screen.getAllByRole("button");
      const yearLabels = buttons.map((b) => b.textContent?.trim());
      expect(yearLabels).toContain("2026");
      expect(yearLabels).toContain("2025");
    });

    it("marks the defaultYear tab as year-tab-active", () => {
      render(<ContributionGraph {...defaultProps} />);
      const btn2026 = screen.getByRole("button", { name: "2026" });
      const btn2025 = screen.getByRole("button", { name: "2025" });
      expect(btn2026.className).toContain("year-tab-active");
      expect(btn2025.className).not.toContain("year-tab-active");
    });
  });

  describe("grid cells", () => {
    it("renders the correct total number of .contribution-day cells (real + padding)", () => {
      render(<ContributionGraph {...defaultProps} />);
      // 2026 fixture: week0 (3 real + 4 pad) + week1 (4 real + 3 pad) + week2 (3 real + 4 pad) = 21
      const days = document.querySelectorAll(".contribution-day");
      expect(days.length).toBe(21);
    });

    it("marks the busiest day cell with class busiest-day", () => {
      render(<ContributionGraph {...defaultProps} />);
      const busiestCells = document.querySelectorAll(".busiest-day");
      expect(busiestCells.length).toBe(1);
    });

    it("does not mark non-busiest cells with busiest-day", () => {
      render(<ContributionGraph {...defaultProps} />);
      // 2026-01-04 has count=4 and is NOT the busiest
      const allDays = document.querySelectorAll(".contribution-day");
      const nonBusiestWithClass = Array.from(allDays).filter(
        (el) =>
          el.getAttribute("data-date") !== "Jan 5, 2026" &&
          el.classList.contains("busiest-day"),
      );
      expect(nonBusiestWithClass.length).toBe(0);
    });

    it("exposes correct data-date in UTC format on a real day cell", () => {
      render(<ContributionGraph {...defaultProps} />);
      const busiestCell = document.querySelector(".busiest-day");
      // 2026-01-05 in UTC → "Jan 5, 2026"
      expect(busiestCell?.getAttribute("data-date")).toBe("Jan 5, 2026");
    });

    it("exposes correct data-count on a real day cell", () => {
      render(<ContributionGraph {...defaultProps} />);
      const busiestCell = document.querySelector(".busiest-day");
      expect(busiestCell?.getAttribute("data-count")).toBe("15");
    });

    it("applies correct animation-delay based on week index", () => {
      render(<ContributionGraph {...defaultProps} />);
      // busiest day is in week 0 → animationDelay should be "0ms"
      const busiestCell = document.querySelector<HTMLElement>(".busiest-day");
      expect(busiestCell?.style.animationDelay).toBe("0ms");
      // A cell from week 1 should have 15ms delay — use data-date to find one
      const week1Cell = document.querySelector<HTMLElement>(
        '[data-date="Jan 7, 2026"]',
      );
      expect(week1Cell?.style.animationDelay).toBe("15ms");
    });
  });

  describe("streak badge", () => {
    it("shows fire + current streak when currentStreak > 0", () => {
      render(<ContributionGraph {...defaultProps} />);
      // 🔥 emoji lives in .streak-fire span
      expect(document.querySelector(".streak-fire")).toBeInTheDocument();
      expect(document.querySelector(".streak-current")?.textContent).toBe(
        "3-day streak",
      );
    });

    it("shows longest streak when longestStreak > 0", () => {
      render(<ContributionGraph {...defaultProps} />);
      expect(document.querySelector(".streak-longest")?.textContent).toBe(
        "Longest: 5 days",
      );
    });

    it("shows best day when busiest.count > 0", () => {
      render(<ContributionGraph {...defaultProps} />);
      // 2026-01-05 → "Jan 5" (%-d = no zero-pad)
      expect(document.querySelector(".streak-best")?.textContent).toBe(
        "Best: 15 on Jan 5",
      );
    });

    it("shows separators between streak segments", () => {
      render(<ContributionGraph {...defaultProps} />);
      const seps = document.querySelectorAll(".streak-separator");
      // currentStreak > 0, longestStreak > 0, busiest > 0 → 2 separators
      expect(seps.length).toBe(2);
    });

    it("omits fire+streak and separator when currentStreak is 0", () => {
      render(
        <ContributionGraph
          years={[{ year: 2025, data: data2025 }]}
          defaultYear={2025}
        />,
      );
      expect(document.querySelector(".streak-fire")).not.toBeInTheDocument();
      expect(document.querySelector(".streak-current")).not.toBeInTheDocument();
    });

    it("omits longest streak section when longestStreak is 0", () => {
      render(
        <ContributionGraph
          years={[{ year: 2025, data: data2025 }]}
          defaultYear={2025}
        />,
      );
      expect(document.querySelector(".streak-longest")).not.toBeInTheDocument();
    });

    it("omits the best-day segment when every count is 0 (busiest undefined) yet still renders the grid", () => {
      render(
        <ContributionGraph
          years={[{ year: 2024, data: dataAllZero }]}
          defaultYear={2024}
        />,
      );
      // busiest is nullified (max count 0) → no Best segment, no highlighted cell
      expect(document.querySelector(".streak-best")).not.toBeInTheDocument();
      expect(document.querySelector(".busiest-day")).not.toBeInTheDocument();
      // weeks are non-empty → the graph still renders (3 real + 4 pad = 7 cells)
      expect(document.querySelector(".contribution-grid")).toBeInTheDocument();
      expect(document.querySelectorAll(".contribution-day").length).toBe(7);
    });
  });

  describe("stats footer", () => {
    it("renders the delimited total with correct year label", () => {
      render(<ContributionGraph {...defaultProps} />);
      const totalNum = document.querySelector(".contribution-total-number");
      // 1234 → "1,234"
      expect(totalNum?.textContent).toBe("1,234");
      const totalSpan = document.querySelector(".contribution-total");
      expect(totalSpan?.textContent).toContain("in 2026");
    });

    it("renders the legend with 5 level boxes", () => {
      render(<ContributionGraph {...defaultProps} />);
      const legendBoxes = document.querySelectorAll(".contribution-legend-box");
      expect(legendBoxes.length).toBe(5);
    });

    it("renders Less and More labels in the legend", () => {
      render(<ContributionGraph {...defaultProps} />);
      const legend = document.querySelector(".contribution-legend");
      expect(legend?.textContent).toContain("Less");
      expect(legend?.textContent).toContain("More");
    });
  });

  describe("month labels", () => {
    it("renders a .month-label span for each distinct month in the weeks", () => {
      render(<ContributionGraph {...defaultProps} />);
      // 2026 fixture: all weeks start in January → only 1 distinct month "Jan"
      const monthLabels = document.querySelectorAll(".month-label");
      expect(monthLabels.length).toBeGreaterThan(0);
      expect(monthLabels[0].textContent).toBe("Jan");
    });
  });

  describe("year switching (client state)", () => {
    it("switches active tab and updates the displayed total on click", () => {
      render(<ContributionGraph {...defaultProps} />);

      // Before click: 2026 active, total = 1,234
      const btn2025 = screen.getByRole("button", { name: "2025" });
      expect(
        document.querySelector(".contribution-total-number")?.textContent,
      ).toBe("1,234");

      // Click 2025 tab
      fireEvent.click(btn2025);

      // After click: 2025 active, total = 567
      expect(btn2025.className).toContain("year-tab-active");
      const btn2026 = screen.getByRole("button", { name: "2026" });
      expect(btn2026.className).not.toContain("year-tab-active");
      expect(
        document.querySelector(".contribution-total-number")?.textContent,
      ).toBe("567");
    });

    it("switches the grid cell count when changing year", () => {
      render(<ContributionGraph {...defaultProps} />);
      // 2026: 21 cells
      expect(document.querySelectorAll(".contribution-day").length).toBe(21);

      fireEvent.click(screen.getByRole("button", { name: "2025" }));
      // 2025: 2 full weeks × 7 = 14 cells, no padding
      expect(document.querySelectorAll(".contribution-day").length).toBe(14);
    });
  });

  describe("guard: empty years", () => {
    it("renders null when years array is empty", () => {
      const { container } = render(
        <ContributionGraph years={[]} defaultYear={2026} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders null when the selected year has no weeks", () => {
      const emptyYear: YearContributions = {
        total: 0,
        selectedYear: 2026,
        yearlyTotals: {},
        weeks: [],
        contributions: [],
        currentStreak: 0,
        longestStreak: 0,
      };
      const { container } = render(
        <ContributionGraph
          years={[{ year: 2026, data: emptyYear }]}
          defaultYear={2026}
        />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // Forces a negative-offset runtime timezone so the component's explicit
  // `timeZone: "UTC"` is LOAD-BEARING: a UTC-midnight date ("2026-01-01") is the
  // previous calendar day in New York, so a non-UTC formatter would render
  // "Dec 31, 2025". This test would catch a regression that dropped the override.
  describe("UTC date formatting (timezone-independent)", () => {
    const originalTZ = process.env.TZ;
    beforeAll(() => {
      process.env.TZ = "America/New_York";
    });
    afterAll(() => {
      // Restore precisely — assigning `undefined` would coerce to the string
      // "undefined", so delete the key when there was no TZ originally.
      if (originalTZ === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTZ;
      }
    });

    it("formats data-date in UTC even under a negative-offset timezone (year boundary)", () => {
      const boundary: YearContributions = {
        total: 5,
        selectedYear: 2026,
        yearlyTotals: {},
        weeks: [[{ date: "2026-01-01", count: 5, level: 2 }]],
        contributions: [],
        currentStreak: 0,
        longestStreak: 0,
      };
      render(
        <ContributionGraph
          years={[{ year: 2026, data: boundary }]}
          defaultYear={2026}
        />,
      );
      // The single count>0 day is the busiest → easy to locate
      const cell = document.querySelector(".busiest-day");
      expect(cell?.getAttribute("data-date")).toBe("Jan 1, 2026");
    });
  });
});
