"use client";

import { useState } from "react";
import type { YearContributions } from "@/lib/github/contributions";
import { numberWithDelimiter } from "@/lib/format";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ContributionGraphProps {
  /** Tab years with their embedded data, newest-first, max 5. Mirrors available_years.first(5). */
  years: Array<{ year: number; data: YearContributions }>;
  /** Initially-selected year (the page passes the current calendar year). */
  defaultYear: number;
}

// ---------------------------------------------------------------------------
// UTC date formatting helper
//
// REQUIRED: day strings are UTC midnight; local formatting shifts the date
// by a day in negative-offset timezones.  All formatting uses timeZone:"UTC".
// ---------------------------------------------------------------------------

function formatUTC(dateStr: string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
    timeZone: "UTC",
    ...opts,
  });
}

// Helpers for the three formats used in the Rails partial
const fmtFull = (d: string) =>
  formatUTC(d, { month: "short", day: "numeric", year: "numeric" }); // "Jan 5, 2026"
const fmtMonthDay = (d: string) =>
  formatUTC(d, { month: "short", day: "numeric" }); // "Jan 5"
const fmtMonth = (d: string) => formatUTC(d, { month: "short" }); // "Jan"

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContributionGraph({ years, defaultYear }: ContributionGraphProps) {
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

  // Guard: no years at all
  if (years.length === 0) return null;

  // Find selected year's data; fall back to first entry
  const selected = years.find((y) => y.year === selectedYear) ?? years[0];

  // Guard: no contribution weeks
  if (selected.data.weeks.length === 0) return null;

  const { data } = selected;

  // -------------------------------------------------------------------------
  // 1. Busiest day — first element with the maximum count (Ruby max_by
  //    returns the FIRST max on ties → strict `>` fold keeps the first).
  // -------------------------------------------------------------------------
  const allDays = data.weeks.flat();
  let busiest: (typeof allDays)[number] | undefined;
  for (const d of allDays) {
    if (busiest === undefined || d.count > busiest.count) {
      busiest = d;
    }
  }
  // If the max count is 0, no "busiest" to highlight
  if (busiest && busiest.count === 0) busiest = undefined;

  // -------------------------------------------------------------------------
  // 2. Month labels — first day of each week, deduplicated consecutively
  // -------------------------------------------------------------------------
  const monthsInOrder: string[] = [];
  for (const week of data.weeks) {
    const firstDay = week[0];
    if (!firstDay) continue;
    const monthKey = fmtMonth(firstDay.date);
    if (monthsInOrder[monthsInOrder.length - 1] !== monthKey) {
      monthsInOrder.push(monthKey);
    }
  }

  // -------------------------------------------------------------------------
  // 3. Year label (mirrors Rails selected_year == "last" conditional)
  // -------------------------------------------------------------------------
  // Use selected.year (always in sync with `data`) rather than the raw
  // selectedYear state, which can be stale if the find() above fell back.
  const yearLabel =
    data.selectedYear === "last" ? "in the last year" : `in ${selected.year}`;

  // -------------------------------------------------------------------------
  // 4. Streak badge — has_previous separator logic from Rails
  // -------------------------------------------------------------------------
  let hasPrevious = false;
  const streakSegments: React.ReactNode[] = [];

  if (data.currentStreak > 0) {
    streakSegments.push(
      <span key="fire" className="streak-fire">🔥</span>,
      <span key="current" className="streak-current">{data.currentStreak}-day streak</span>,
    );
    hasPrevious = true;
  }

  if (data.longestStreak > 0) {
    if (hasPrevious) {
      streakSegments.push(<span key="sep1" className="streak-separator">•</span>);
    }
    streakSegments.push(
      <span key="longest" className="streak-longest">Longest: {data.longestStreak} days</span>,
    );
    hasPrevious = true;
  }

  if (busiest && busiest.count > 0) {
    if (hasPrevious) {
      streakSegments.push(<span key="sep2" className="streak-separator">•</span>);
    }
    streakSegments.push(
      <span key="best" className="streak-best">
        Best: {busiest.count} on {fmtMonthDay(busiest.date)}
      </span>,
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="contribution-container">
      {/* Year tabs */}
      <div className="year-tabs">
        {years.slice(0, 5).map((y) => (
          <button
            key={y.year}
            type="button"
            aria-pressed={selectedYear === y.year}
            className={
              "year-tab" + (selectedYear === y.year ? " year-tab-active" : "")
            }
            onClick={() => setSelectedYear(y.year)}
          >
            {y.year}
          </button>
        ))}
      </div>

      {/* Streak badge */}
      <div className="streak-badge">{streakSegments}</div>

      {/* Month labels — key by position: a 12-month "last" window can legitimately
          repeat a month (e.g. Jan at both ends), so the month string alone collides. */}
      <div className="contribution-months">
        {monthsInOrder.map((month, i) => (
          <span key={`${month}-${i}`} className="month-label">{month}</span>
        ))}
      </div>

      {/* Grid */}
      <div className="contribution-graph">
        <div className="contribution-grid">
          {data.weeks.map((week, weekIdx) => {
            const realCells = week.map((day, dayIdx) => {
              const isBusiest =
                !!busiest &&
                day.date === busiest.date &&
                day.count === busiest.count;
              return (
                <div
                  key={`week-${weekIdx}-day-${dayIdx}`}
                  className={
                    "contribution-day contribution-level-" +
                    day.level +
                    (isBusiest ? " busiest-day" : "")
                  }
                  data-date={fmtFull(day.date)}
                  data-count={day.count}
                  style={{ animationDelay: `${weekIdx * 15}ms` }}
                />
              );
            });

            const padCount = 7 - week.length;
            const padCells = Array.from({ length: padCount }, (_, i) => (
              <div
                key={`week-${weekIdx}-pad-${i}`}
                className="contribution-day contribution-level-0"
                style={{ animationDelay: `${weekIdx * 15}ms` }}
              />
            ));

            return [...realCells, ...padCells];
          })}
        </div>
      </div>

      {/* Stats footer */}
      <div className="contribution-stats">
        <span className="contribution-total">
          <span className="contribution-total-number">
            {numberWithDelimiter(data.total)}
          </span>
          {" "}contributions {yearLabel}
        </span>
        <div className="contribution-legend">
          <span>Less</span>
          <div className="contribution-legend-box contribution-level-0" />
          <div className="contribution-legend-box contribution-level-1" />
          <div className="contribution-legend-box contribution-level-2" />
          <div className="contribution-legend-box contribution-level-3" />
          <div className="contribution-legend-box contribution-level-4" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
