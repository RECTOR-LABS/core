/**
 * GitHub Contributions data layer for the Next.js port of RECTOR LABS CORE.
 *
 * Faithful port of:
 *   app/services/github_contributions_service.rb
 *
 * Uses the third-party jogruber REST API — NOT GitHub GraphQL:
 *   https://github-contributions-api.jogruber.de/v4
 *
 * Architectural constraints:
 *   - No React / no next/* imports.
 *   - ISR revalidation handled by shared `githubFetch` from ./http (no cast needed).
 *   - This module is inherently time-dependent (streaks depend on "today").
 *     calculateStreaks accepts an injectable `today: Date` param (defaulting to `new Date()`)
 *     to keep tests deterministic.
 *
 * @see app/services/github_contributions_service.rb
 */

import { githubFetch } from "./http";

// ---------------------------------------------------------------------------
// Public shapes
// ---------------------------------------------------------------------------

/** A single contribution day from the jogruber API. */
export interface ContributionDay {
  /** ISO date string "YYYY-MM-DD" */
  date: string;
  count: number;
  level: number;
}

/**
 * Parsed, enriched contribution data for a year or rolling 12-month window.
 *
 * Faithful camelCase port of the hash returned by
 * GithubContributionsService#parse_response.
 *
 * NOTE: Rails fallback_data omitted selected_year — we include it here for a
 * consistent return type. This is a deliberate, documented improvement.
 */
export interface YearContributions {
  /** Total contributions for the requested year/window. */
  total: number;
  /** The year requested, or "last" for the rolling 12-month window. */
  selectedYear: number | "last";
  /**
   * Raw `total` object from the jogruber API response.
   * Keys: "2024", "2025", "lastYear", etc. Empty on error.
   */
  yearlyTotals: Record<string, number>;
  /**
   * Contributions organised into weeks (each week = Sunday-anchored array of days).
   * Mirrors GithubContributionsService#organize_into_weeks.
   */
  weeks: ContributionDay[][];
  /** All contribution days sorted ASC by date. */
  contributions: ContributionDay[];
  currentStreak: number;
  longestStreak: number;
}

/** A year with its total contribution count. Returned by fetchAvailableYears. */
export interface AvailableYear {
  year: number;
  count: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL = "https://github-contributions-api.jogruber.de/v4";
const USERNAME = "rz1989s";

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Sum the count across all contribution days.
 * Used as a fallback total when the API's `total` object lacks the requested year key.
 */
function sumCounts(days: ContributionDay[]): number {
  return days.reduce((acc, d) => acc + d.count, 0);
}

/**
 * Organise a flat, ASC-sorted array of contribution days into weekly buckets.
 *
 * Faithful port of GithubContributionsService#organize_into_weeks.
 *
 * A new week starts when a day is a Sunday AND the current accumulating week is
 * non-empty.  The UTC weekday is used (`getUTCDay`) because the date strings
 * are YYYY-MM-DD (UTC midnight) — local `getDay()` would shift the weekday
 * depending on the runtime timezone.
 *
 * Sunday = getUTCDay() === 0  (matches Ruby Date#wday == 0)
 */
export function organizeIntoWeeks(days: ContributionDay[]): ContributionDay[][] {
  if (days.length === 0) return [];

  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];

  for (const day of days) {
    const isSunday = new Date(day.date).getUTCDay() === 0;

    // Start new week on Sunday when there is already a partial week accumulated
    if (isSunday && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(day);
  }

  // Push the final (possibly incomplete) week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Calculate current and longest contribution streaks.
 *
 * Faithful port of GithubContributionsService#calculate_streaks.
 *
 * @param days  - Contribution days sorted ASC by date.
 * @param today - Injection point for "today"; defaults to `new Date()`.
 *                Inject a fixed Date in tests for determinism.
 *
 * Current streak algorithm (mirrors Ruby exactly):
 *   - Iterate DESC (most recent first).
 *   - Normalise both today and the day to UTC midnight; compute dayDiff in whole days.
 *   - `if (dayDiff > currentStreak + 1) break;`  — allows today (0) or yesterday (1)
 *     to start the streak, then requires each subsequent day to be consecutive.
 *   - If count > 0: increment streak; else break.
 *
 * Longest streak algorithm (mirrors Ruby exactly):
 *   - Iterate ASC; increment temp on count > 0; track max; reset temp on count == 0.
 */
export function calculateStreaks(
  days: ContributionDay[],
  today: Date = new Date(),
): { current: number; longest: number } {
  if (days.length === 0) return { current: 0, longest: 0 };

  // Today normalised to UTC midnight (milliseconds)
  const todayUTC = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );

  // --- Current streak (DESC iteration) ---
  const sortedDesc = [...days].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

  let currentStreak = 0;

  for (const day of sortedDesc) {
    const dayUTC = Date.parse(day.date + "T00:00:00Z");
    const dayDiff = Math.round((todayUTC - dayUTC) / 86_400_000);

    // Faithful port: break if the gap exceeds the running tolerance
    if (dayDiff > currentStreak + 1) break;

    if (day.count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // --- Longest streak (ASC iteration) ---
  let longestStreak = 0;
  let temp = 0;

  for (const day of days) {
    if (day.count > 0) {
      temp++;
      if (temp > longestStreak) longestStreak = temp;
    } else {
      temp = 0;
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Build the type-consistent fallback result for error paths.
 *
 * Faithful port of GithubContributionsService#fallback_data, with the
 * deliberate addition of `selectedYear` for a consistent return type.
 */
function fallbackData(year: number | "last"): YearContributions {
  return {
    total: 0,
    selectedYear: year,
    yearlyTotals: {},
    weeks: [],
    contributions: [],
    currentStreak: 0,
    longestStreak: 0,
  };
}

/**
 * Parse a raw jogruber API response into a YearContributions object.
 *
 * Faithful port of GithubContributionsService#parse_response.
 *
 * jogruber v4 response shape:
 *   { total: { "2024": N, "2025": M, "lastYear": K, ... },
 *     contributions: [ { date: "YYYY-MM-DD", count: number, level: number }, ... ] }
 */
function parseResponse(
  data: {
    total?: Record<string, number>;
    contributions?: ContributionDay[];
  },
  year: number | "last",
): YearContributions {
  const days = data.contributions ?? [];

  // Sort ASC by date (API returns sorted, but ensure — string compare is valid for YYYY-MM-DD)
  const sorted = [...days].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  // Total: prefer the API's pre-calculated value; fall back to summing all days
  const total =
    year === "last"
      ? (data.total?.["lastYear"] ?? sumCounts(sorted))
      : (data.total?.[String(year)] ?? sumCounts(sorted));

  const weeks = organizeIntoWeeks(sorted);
  const { current, longest } = calculateStreaks(sorted);

  return {
    total,
    selectedYear: year,
    yearlyTotals: data.total ?? {},
    weeks,
    contributions: sorted,
    currentStreak: current,
    longestStreak: longest,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch contribution data for a specific year or the rolling 12-month window.
 *
 * Faithful port of GithubContributionsService#fetch_contributions.
 *
 * @param year - An integer year (e.g. 2025) or "last" (default) for the
 *               rolling 12-month window.  Maps to the `?y=` query param.
 *
 * Graceful degradation: non-2xx HTTP status or thrown network error both
 * log via console.error (with actionable context) and return fallbackData.
 * This function never throws.
 */
export async function fetchContributions(
  year: number | "last" = "last",
): Promise<YearContributions> {
  const url = `${API_URL}/${USERNAME}?y=${String(year)}`;

  try {
    const res = await githubFetch(url, {
      Accept: "application/json",
      "User-Agent": "RECTOR-LABS-CORE",
    });

    if (!res.ok) {
      console.error(
        `GitHub Contributions API error: HTTP ${res.status} — ${url}`,
      );
      return fallbackData(year);
    }

    const data = (await res.json()) as {
      total?: Record<string, number>;
      contributions?: ContributionDay[];
    };

    return parseResponse(data, year);
  } catch (err) {
    console.error(
      `GitHub Contributions fetch failed: ${String(err)} — ${url}`,
    );
    return fallbackData(year);
  }
}

/**
 * Fetch the list of years for which contribution data is available.
 *
 * Faithful port of GithubContributionsService#fetch_available_years.
 *
 * Calls the base endpoint (no `?y=`) to get the full `total` hash, then:
 *   - Drops the "lastYear" key.
 *   - Maps remaining entries to { year: number, count: number }.
 *   - Filters out year ≤ 2000 and count === 0.
 *   - Sorts by year DESCENDING.
 *
 * Graceful degradation: non-2xx or thrown error → console.error + return [].
 * Never throws.
 */
export async function fetchAvailableYears(): Promise<AvailableYear[]> {
  const url = `${API_URL}/${USERNAME}`;

  try {
    const res = await githubFetch(url, {
      Accept: "application/json",
      "User-Agent": "RECTOR-LABS-CORE",
    });

    if (!res.ok) {
      console.error(
        `GitHub Contributions API error fetching available years: HTTP ${res.status} — ${url}`,
      );
      return [];
    }

    const data = (await res.json()) as { total?: Record<string, number> };
    const totals = data.total ?? {};

    return (
      Object.entries(totals)
        // Drop the rolling-window key — not a real year
        .filter(([k]) => k !== "lastYear")
        .map(([k, v]) => ({ year: parseInt(k, 10), count: v }))
        .filter((y) => y.year > 2000 && y.count > 0)
        .sort((a, b) => b.year - a.year)
    );
  } catch (err) {
    console.error(
      `GitHub Contributions fetch years failed: ${String(err)} — ${url}`,
    );
    return [];
  }
}
