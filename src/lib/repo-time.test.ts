import { describe, it, expect } from "vitest";
import { timeAgo, detailedTimeAgo, recentlyActive } from "./repo-time";

// Fixed "now" for all deterministic tests.
// 2026-05-31T12:00:00Z  (a Sunday at noon UTC)
const NOW = new Date("2026-05-31T12:00:00Z");

// ---------------------------------------------------------------------------
// Helpers — build an ISO string relative to NOW
// ---------------------------------------------------------------------------

function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3_600_000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(NOW.getTime() - d * 86_400_000).toISOString();
}

// ---------------------------------------------------------------------------
// timeAgo — port of GithubRepo#time_ago
// ---------------------------------------------------------------------------

describe("timeAgo", () => {
  it("returns 'today' when pushed < 24h ago (same-day, days diff = 0)", () => {
    // 3 hours ago → time_diff/1.day < 1 → days = 0 → "today"
    expect(timeAgo(hoursAgo(3), NOW)).toBe("today");
  });

  it("returns 'yesterday' when exactly ~26h ago (days diff = 1)", () => {
    // 26 hours → Math.trunc(26*3600 / 86400) = Math.trunc(1.08…) = 1
    expect(timeAgo(hoursAgo(26), NOW)).toBe("yesterday");
  });

  it("returns 'N days ago' for a diff in the 2–29 day range", () => {
    // 5 full days
    expect(timeAgo(daysAgo(5), NOW)).toBe("5 days ago");
  });

  it("returns 'N months ago' for 30 ≤ days < 365", () => {
    // 75 days → Math.trunc(75/30) = 2 → "2 months ago"
    expect(timeAgo(daysAgo(75), NOW)).toBe("2 months ago");
  });

  it("returns '1 months ago' at exactly 30 days (strict days < 30 boundary)", () => {
    // days === 30 fails `days < 30` → months branch → Math.trunc(30/30) = 1
    expect(timeAgo(daysAgo(30), NOW)).toBe("1 months ago");
  });

  it("returns '1 years ago' for just over a year (mirrors Ruby grammar exactly)", () => {
    // 400 days → Math.trunc(400/365) = 1 → "1 years ago"
    // NOTE: Rails literally produces "1 years ago" — we match the source faithfully
    expect(timeAgo(daysAgo(400), NOW)).toBe("1 years ago");
  });

  it("returns '2 years ago' for ~730 days", () => {
    expect(timeAgo(daysAgo(730), NOW)).toBe("2 years ago");
  });
});

// ---------------------------------------------------------------------------
// detailedTimeAgo — port of GithubRepo#detailed_time_ago
// ---------------------------------------------------------------------------

describe("detailedTimeAgo", () => {
  it("returns 'Nm ago' when diff < 60 minutes", () => {
    // 5 minutes ago → minutes = 5 < 60 → "5m ago"
    const fiveMinAgo = new Date(NOW.getTime() - 5 * 60_000).toISOString();
    expect(detailedTimeAgo(fiveMinAgo, NOW)).toBe("5m ago");
  });

  it("returns '1h ago' at exactly 60 minutes (strict minutes < 60 boundary)", () => {
    // minutes === 60 fails `minutes < 60` → hours branch → "1h ago" (not "60m ago")
    const sixtyMinAgo = new Date(NOW.getTime() - 60 * 60_000).toISOString();
    expect(detailedTimeAgo(sixtyMinAgo, NOW)).toBe("1h ago");
  });

  it("returns 'Nh ago' when 60 min ≤ diff < 24h", () => {
    // 3 hours ago → minutes = 180 ≥ 60, hours = 3 < 24 → "3h ago"
    expect(detailedTimeAgo(hoursAgo(3), NOW)).toBe("3h ago");
  });

  it("falls through to timeAgo for diff ≥ 24h — returns '2 days ago'", () => {
    // 48 hours (2 full days) → falls through to timeAgo → "2 days ago"
    expect(detailedTimeAgo(hoursAgo(48), NOW)).toBe("2 days ago");
  });

  it("returns '0m ago' for a pushedAt identical to now (0-minute diff, minutes < 60 branch)", () => {
    // A pushedAt of exactly NOW → 0 minutes → "0m ago" (caught by minutes<60, NOT a timeAgo fallthrough)
    expect(detailedTimeAgo(NOW.toISOString(), NOW)).toBe("0m ago");
  });
});

// ---------------------------------------------------------------------------
// recentlyActive — port of GithubRepo#recently_active?
// ---------------------------------------------------------------------------

describe("recentlyActive", () => {
  it("returns true when pushed 2 hours ago (well within 24h)", () => {
    expect(recentlyActive(hoursAgo(2), NOW)).toBe(true);
  });

  it("returns false when pushed 30 hours ago (beyond 24h window)", () => {
    expect(recentlyActive(hoursAgo(30), NOW)).toBe(false);
  });

  it("returns true at the exact 24h boundary minus 1ms (strictly inside)", () => {
    const justInside = new Date(NOW.getTime() - 24 * 3_600_000 + 1).toISOString();
    expect(recentlyActive(justInside, NOW)).toBe(true);
  });

  it("returns false at exactly the 24h boundary (strict greater-than)", () => {
    // Ruby: pushed_at > 24.hours.ago → strict inequality
    // At exactly -24h, pushed_at === 24.hours.ago → NOT strictly greater → false
    const exactBoundary = new Date(NOW.getTime() - 24 * 3_600_000).toISOString();
    expect(recentlyActive(exactBoundary, NOW)).toBe(false);
  });
});
