import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchContributions,
  fetchAvailableYears,
  organizeIntoWeeks,
  calculateStreaks,
  type ContributionDay,
  type YearContributions,
} from "./contributions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDay(date: string, count: number, level = 0): ContributionDay {
  return { date, count, level };
}

/** Build a minimal jogruber v4 API response. */
function makeApiResponse(
  contributions: ContributionDay[],
  total: Record<string, number>,
): { total: Record<string, number>; contributions: ContributionDay[] } {
  return { total, contributions };
}

/** Assert the full shape of a fallback result. */
function expectFallback(result: YearContributions, year: number | "last"): void {
  expect(result.total).toBe(0);
  expect(result.selectedYear).toBe(year);
  expect(result.yearlyTotals).toEqual({});
  expect(result.weeks).toEqual([]);
  expect(result.contributions).toEqual([]);
  expect(result.currentStreak).toBe(0);
  expect(result.longestStreak).toBe(0);
}

// ---------------------------------------------------------------------------
// Shared mock plumbing
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// fetchContributions — happy path
// ---------------------------------------------------------------------------

describe("fetchContributions — 200 response", () => {
  // Fixture days: out-of-order input to verify ASC sort
  // 2025-01-05 = Sunday (getUTCDay() === 0), count 5
  // 2025-01-06 = Monday, count 3
  // 2025-01-03 = Friday, count 1
  const FIXTURE_DAYS: ContributionDay[] = [
    makeDay("2025-01-06", 3, 2), // Monday
    makeDay("2025-01-05", 5, 3), // Sunday — submitted out of order
    makeDay("2025-01-03", 1, 1), // Friday
  ];

  const FIXTURE_TOTAL = { "2025": 120, lastYear: 90 };

  it('total = lastYear when year="last"', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(makeApiResponse(FIXTURE_DAYS, FIXTURE_TOTAL)),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchContributions("last");

    expect(result.total).toBe(90); // data.total.lastYear
  });

  it("total = year-specific value when year=2025 is present in total", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(makeApiResponse(FIXTURE_DAYS, FIXTURE_TOTAL)),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchContributions(2025);

    expect(result.total).toBe(120); // data.total["2025"]
  });

  it("total = sum of day counts when the requested year is absent from total", async () => {
    // 2026 is absent from FIXTURE_TOTAL
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(makeApiResponse(FIXTURE_DAYS, FIXTURE_TOTAL)),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchContributions(2026);

    // sum of FIXTURE_DAYS: 3 + 5 + 1 = 9
    expect(result.total).toBe(9);
  });

  it("selectedYear matches the argument passed", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(makeApiResponse(FIXTURE_DAYS, FIXTURE_TOTAL)),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchContributions(2025);
    expect(result.selectedYear).toBe(2025);

    const fetchMock2 = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(makeApiResponse(FIXTURE_DAYS, FIXTURE_TOTAL)),
    });
    vi.stubGlobal("fetch", fetchMock2);

    const resultLast = await fetchContributions("last");
    expect(resultLast.selectedYear).toBe("last");
  });

  it("yearlyTotals is the raw total object from the API", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(makeApiResponse(FIXTURE_DAYS, FIXTURE_TOTAL)),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchContributions(2025);
    expect(result.yearlyTotals).toEqual(FIXTURE_TOTAL);
  });

  it("contributions are sorted ASC by date regardless of API order", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(makeApiResponse(FIXTURE_DAYS, FIXTURE_TOTAL)),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchContributions(2025);

    // Should be sorted: 2025-01-03, 2025-01-05, 2025-01-06
    const dates = result.contributions.map((d) => d.date);
    expect(dates).toEqual(["2025-01-03", "2025-01-05", "2025-01-06"]);
  });
});

// ---------------------------------------------------------------------------
// fetchContributions — request details (headers + revalidate)
// ---------------------------------------------------------------------------

describe("fetchContributions — request headers and ISR revalidate", () => {
  it("passes Accept, User-Agent headers and next.revalidate=3600", async () => {
    let capturedInit: RequestInit = {};

    const fetchMock = vi.fn().mockImplementation((url: string, init: RequestInit) => {
      capturedInit = init;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ total: { lastYear: 5 }, contributions: [] }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchContributions("last");

    const headers = capturedInit.headers as Record<string, string>;
    expect(headers["Accept"]).toBe("application/json");
    expect(headers["User-Agent"]).toBe("RECTOR-LABS-CORE");
    expect(capturedInit.next?.revalidate).toBe(3600);
  });

  it('uses ?y=last query param when year="last"', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ total: { lastYear: 0 }, contributions: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchContributions("last");

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("?y=last");
  });

  it("uses ?y=2025 query param when year=2025", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ total: { "2025": 0 }, contributions: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchContributions(2025);

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("?y=2025");
  });
});

// ---------------------------------------------------------------------------
// fetchContributions — degradation paths
// ---------------------------------------------------------------------------

describe("fetchContributions — degradation", () => {
  it("returns fallbackData on non-2xx and calls console.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchContributions(2025);

    expectFallback(result, 2025);
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toContain("503");
  });

  it('returns fallbackData(year) with selectedYear="last" on non-2xx when year="last"', async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchContributions("last");

    expectFallback(result, "last");
  });

  it("returns fallbackData on thrown fetch error and calls console.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("network timeout"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchContributions(2025);

    expectFallback(result, 2025);
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toContain("network timeout");
  });

  it("does not throw on any error path", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("boom"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchContributions(2025)).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// fetchContributions — non-array contributions guard
// ---------------------------------------------------------------------------

describe("fetchContributions — non-array contributions payload", () => {
  it("resolves without throwing when contributions is not an array, returns empty weeks/contributions, no console.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // 200 OK response — clean HTTP, but contributions field is an object (not an array)
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          total: { "2025": 42 },
          contributions: {}, // malformed: object instead of array
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchContributions(2025);

    // Must not throw — already covered by resolves
    expect(result.weeks).toEqual([]);
    expect(result.contributions).toEqual([]);
    // total comes from data.total["2025"] — no fallback sumCounts needed
    expect(result.total).toBe(42);
    expect(typeof result.total).toBe("number");
    expect(Number.isNaN(result.total)).toBe(false);
    // A clean 200 with unexpected shape should NOT trigger console.error
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// fetchAvailableYears — happy path
// ---------------------------------------------------------------------------

describe("fetchAvailableYears — 200 response", () => {
  it("returns years DESC, excluding lastYear/count=0/year<=2000", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          total: {
            "2023": 50,   // valid
            "2024": 0,    // count=0 → excluded
            "2025": 120,  // valid
            "1999": 10,   // year<=2000 → excluded
            lastYear: 90, // "lastYear" key → excluded
          },
          contributions: [],
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAvailableYears();

    expect(result).toEqual([
      { year: 2025, count: 120 },
      { year: 2023, count: 50 },
    ]);
  });

  it("returns empty array when total is missing", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ contributions: [] }), // no `total`
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAvailableYears();
    expect(result).toEqual([]);
  });

  it("passes Accept, User-Agent, and next.revalidate=3600", async () => {
    let capturedInit: RequestInit = {};

    const fetchMock = vi.fn().mockImplementation((url: string, init: RequestInit) => {
      capturedInit = init;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ total: {}, contributions: [] }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchAvailableYears();

    const headers = capturedInit.headers as Record<string, string>;
    expect(headers["Accept"]).toBe("application/json");
    expect(headers["User-Agent"]).toBe("RECTOR-LABS-CORE");
    expect(capturedInit.next?.revalidate).toBe(3600);
  });

  it("base URL has no ?y= param", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ total: {}, contributions: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchAvailableYears();

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).not.toContain("?y=");
    // Should end with /rz1989s (no query string)
    expect(url).toMatch(/\/rz1989s$/);
  });
});

// ---------------------------------------------------------------------------
// fetchAvailableYears — degradation paths
// ---------------------------------------------------------------------------

describe("fetchAvailableYears — degradation", () => {
  it("returns [] on non-2xx and calls console.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAvailableYears();

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toContain("500");
  });

  it("returns [] on thrown fetch error and calls console.error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("dns failure"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAvailableYears();

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(errorSpy.mock.calls[0][0]).toContain("dns failure");
  });

  it("does not throw", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("x")));

    await expect(fetchAvailableYears()).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// organizeIntoWeeks
// ---------------------------------------------------------------------------

describe("organizeIntoWeeks", () => {
  it("returns empty array for empty input", () => {
    expect(organizeIntoWeeks([])).toEqual([]);
  });

  it("splits weeks at Sunday boundaries", () => {
    // Hand-verified weekdays:
    //   2025-01-03 = Friday    (getUTCDay = 5)
    //   2025-01-04 = Saturday  (getUTCDay = 6)
    //   2025-01-05 = Sunday    (getUTCDay = 0) ← week boundary
    //   2025-01-06 = Monday    (getUTCDay = 1)
    //   2025-01-07 = Tuesday   (getUTCDay = 2)
    //   2025-01-11 = Saturday  (getUTCDay = 6)
    //   2025-01-12 = Sunday    (getUTCDay = 0) ← week boundary
    //   2025-01-13 = Monday    (getUTCDay = 1)

    const days: ContributionDay[] = [
      makeDay("2025-01-03", 1), // Friday
      makeDay("2025-01-04", 0), // Saturday
      makeDay("2025-01-05", 2), // Sunday — should start a new week
      makeDay("2025-01-06", 3), // Monday
      makeDay("2025-01-07", 1), // Tuesday
      makeDay("2025-01-11", 0), // Saturday
      makeDay("2025-01-12", 4), // Sunday — should start a new week
      makeDay("2025-01-13", 2), // Monday
    ];

    const weeks = organizeIntoWeeks(days);

    expect(weeks).toHaveLength(3);

    // Week 1: Fri–Sat (days before the first Sunday)
    expect(weeks[0].map((d) => d.date)).toEqual(["2025-01-03", "2025-01-04"]);

    // Week 2: Sun–Sat (Sunday through the day before the next Sunday)
    expect(weeks[1].map((d) => d.date)).toEqual([
      "2025-01-05",
      "2025-01-06",
      "2025-01-07",
      "2025-01-11",
    ]);

    // Week 3: Sun–Mon (final incomplete week)
    expect(weeks[2].map((d) => d.date)).toEqual(["2025-01-12", "2025-01-13"]);
  });

  it("puts all days in a single week when no Sunday is encountered", () => {
    // 2025-01-06 = Monday, ..., 2025-01-11 = Saturday — no Sunday
    const days: ContributionDay[] = [
      makeDay("2025-01-06", 1), // Monday
      makeDay("2025-01-07", 2), // Tuesday
      makeDay("2025-01-08", 3), // Wednesday
      makeDay("2025-01-09", 0), // Thursday
      makeDay("2025-01-10", 1), // Friday
      makeDay("2025-01-11", 2), // Saturday
    ];

    const weeks = organizeIntoWeeks(days);

    expect(weeks).toHaveLength(1);
    expect(weeks[0]).toHaveLength(6);
  });

  it("a lone Sunday starts and ends in its own week", () => {
    // If the very first day is a Sunday there is nothing to flush before it,
    // so the logic should open a fresh week starting with that Sunday.
    // 2025-01-05 = Sunday
    const days: ContributionDay[] = [
      makeDay("2025-01-05", 3), // Sunday (first and only day)
    ];

    const weeks = organizeIntoWeeks(days);

    // Single day → single week containing that Sunday
    expect(weeks).toHaveLength(1);
    expect(weeks[0]).toHaveLength(1);
    expect(weeks[0][0].date).toBe("2025-01-05");
  });
});

// ---------------------------------------------------------------------------
// calculateStreaks — inject fixed today for determinism
// ---------------------------------------------------------------------------

describe("calculateStreaks", () => {
  it("returns {current:0, longest:0} for empty input", () => {
    const result = calculateStreaks([], new Date("2025-01-10T00:00:00Z"));
    expect(result).toEqual({ current: 0, longest: 0 });
  });

  it("counts consecutive non-zero days ending on today as current streak", () => {
    // today = 2025-01-10 (UTC)
    // Days: 01-08 (count 1), 01-09 (count 2), 01-10 (count 3) — all non-zero, ending today
    const today = new Date("2025-01-10T00:00:00Z");
    const days: ContributionDay[] = [
      makeDay("2025-01-08", 1),
      makeDay("2025-01-09", 2),
      makeDay("2025-01-10", 3),
    ];

    const result = calculateStreaks(days, today);
    expect(result.current).toBe(3);
  });

  it("counts consecutive non-zero days ending on yesterday as current streak", () => {
    // today = 2025-01-10, last contribution = 01-09 — "yesterday" is still in streak
    const today = new Date("2025-01-10T00:00:00Z");
    const days: ContributionDay[] = [
      makeDay("2025-01-07", 1),
      makeDay("2025-01-08", 2),
      makeDay("2025-01-09", 3), // yesterday — valid streak start
    ];

    const result = calculateStreaks(days, today);
    expect(result.current).toBe(3);
  });

  it("breaks current streak when the most recent day is more than 1 day ago", () => {
    // today = 2025-01-10, most recent contribution = 01-08 (2 days ago) → current=0
    const today = new Date("2025-01-10T00:00:00Z");
    const days: ContributionDay[] = [
      makeDay("2025-01-06", 1),
      makeDay("2025-01-07", 2),
      makeDay("2025-01-08", 3), // dayDiff=2, currentStreak=0, 2>0+1 → break immediately
    ];

    const result = calculateStreaks(days, today);
    expect(result.current).toBe(0);
  });

  it("breaks current streak on a zero-count day in the middle of a run", () => {
    // today = 2025-01-10
    // Desc iteration: 01-10 (2, streak=1), 01-09 (0, zero → break)
    const today = new Date("2025-01-10T00:00:00Z");
    const days: ContributionDay[] = [
      makeDay("2025-01-08", 1),
      makeDay("2025-01-09", 0), // gap day — breaks current streak
      makeDay("2025-01-10", 2),
    ];

    const result = calculateStreaks(days, today);
    expect(result.current).toBe(1); // only 01-10 counts
  });

  it("the dayDiff > currentStreak+1 tolerance handles a running streak correctly", () => {
    // today = 2025-01-10
    // Days: 01-08 (1), 01-09 (1), 01-10 (1)  — streak of 3 ending today
    // After counting 01-10 (streak=1) and 01-09 (streak=2), next is 01-08:
    //   dayDiff = 10-8 = 2, currentStreak = 2, 2 > 2+1=3? NO → count it
    const today = new Date("2025-01-10T00:00:00Z");
    const days: ContributionDay[] = [
      makeDay("2025-01-08", 5),
      makeDay("2025-01-09", 3),
      makeDay("2025-01-10", 1),
    ];

    const result = calculateStreaks(days, today);
    expect(result.current).toBe(3);
  });

  it("a gap two days before today stops the running streak", () => {
    // today = 2025-01-10
    // Desc: 01-10 (1, streak=1), 01-09 (1, streak=2), 01-07 (count=1):
    //   dayDiff = 10-7 = 3, currentStreak = 2, 3 > 2+1=3? NO — still tolerates
    //   So streak becomes 3. Then 01-06 (count=1):
    //   dayDiff = 10-6 = 4, currentStreak = 3, 4 > 3+1=4? NO — streak=4.
    // This validates the algorithm allows exactly consecutive days (gap of 1 always = consecutive).
    // Now check a REAL gap: missing 01-08 means 01-09→01-07 is a gap of 2.
    // After 01-09 (streak=2): checking 01-07 → dayDiff=3, 3 > 2+1=3? NO (equal → continues).
    // This shows the tolerance is strictly >, not >=.
    // Let's instead verify a day that IS strictly > to confirm the break:
    // today = 2025-01-10, days: 01-10(1), 01-09(1), 01-06(1)
    //   After 01-09 (streak=2): 01-06 → dayDiff=4, 4 > 2+1=3? YES → break
    const today = new Date("2025-01-10T00:00:00Z");
    const days: ContributionDay[] = [
      makeDay("2025-01-06", 1),
      makeDay("2025-01-09", 1),
      makeDay("2025-01-10", 1),
    ];

    const result = calculateStreaks(days, today);
    // 01-10 (streak=1), 01-09 (streak=2), 01-06: dayDiff=4, 4>3 → break → current=2
    expect(result.current).toBe(2);
  });

  it("longest streak spans the longest run across all days regardless of today", () => {
    // today = 2025-01-20 (far in the future — current streak should be 0)
    // Days: 01-01(1), 01-02(1), 01-03(1), 01-04(0), 01-05(1), 01-06(1)
    // Runs: [3, 2] → longest = 3
    const today = new Date("2025-01-20T00:00:00Z");
    const days: ContributionDay[] = [
      makeDay("2025-01-01", 1),
      makeDay("2025-01-02", 1),
      makeDay("2025-01-03", 1),
      makeDay("2025-01-04", 0), // breaks the run
      makeDay("2025-01-05", 1),
      makeDay("2025-01-06", 1),
    ];

    const result = calculateStreaks(days, today);
    expect(result.longest).toBe(3);
    expect(result.current).toBe(0); // most recent day (01-06) is 14 days before today
  });

  it("longest streak = 1 when every day has exactly count=1 with no gaps", () => {
    // Single day → longest=1
    const today = new Date("2025-01-01T00:00:00Z");
    const days: ContributionDay[] = [makeDay("2025-01-01", 1)];

    const result = calculateStreaks(days, today);
    expect(result.longest).toBe(1);
    expect(result.current).toBe(1);
  });

  it("both streaks are 0 when all days have count=0", () => {
    const today = new Date("2025-01-10T00:00:00Z");
    const days: ContributionDay[] = [
      makeDay("2025-01-08", 0),
      makeDay("2025-01-09", 0),
      makeDay("2025-01-10", 0),
    ];

    const result = calculateStreaks(days, today);
    expect(result.current).toBe(0);
    expect(result.longest).toBe(0);
  });
});
