import { describe, it, expect } from "vitest";
import { buildVersionView, timeAgoInWords } from "./version-view";

// ---------------------------------------------------------------------------
// buildVersionView — the PURE view-model builder.
//
// Faithful port of the gating + accessor logic in app/helpers/version_helper.rb
// and the `Rails.env.production? && short_commit_sha.present?` gate in
// app/views/shared/_version_footer.html.erb, but driven entirely by injected
// input (no process.env / no fs) so it is fully unit-testable.
//
// The Vercel equivalent of `Rails.env.production?` is VERCEL_ENV === "production"
// (locked by the project owner). The equivalent of `short_commit_sha.present?`
// is a non-empty `sha`.
// ---------------------------------------------------------------------------

/** A production input with every field present. */
function prodInput() {
  return {
    vercelEnv: "production",
    sha: "abc123def456789",
    branch: "main",
    commitCount: 57,
    buildTime: "2026-06-01T12:00:00.000Z",
  };
}

describe("buildVersionView (pure)", () => {
  describe("gating", () => {
    it("returns { show: false } when vercelEnv is not production (preview)", () => {
      const view = buildVersionView({ ...prodInput(), vercelEnv: "preview" });
      expect(view).toEqual({ show: false });
    });

    it("returns { show: false } when vercelEnv is development", () => {
      const view = buildVersionView({ ...prodInput(), vercelEnv: "development" });
      expect(view).toEqual({ show: false });
    });

    it("returns { show: false } when vercelEnv is undefined (local/test)", () => {
      const view = buildVersionView({ ...prodInput(), vercelEnv: undefined });
      expect(view).toEqual({ show: false });
    });

    it("returns { show: false } when sha is null even in production", () => {
      const view = buildVersionView({ ...prodInput(), sha: null });
      expect(view).toEqual({ show: false });
    });

    it("returns { show: false } when sha is an empty string in production", () => {
      const view = buildVersionView({ ...prodInput(), sha: "" });
      expect(view).toEqual({ show: false });
    });

    it("returns show:true in production with a sha present", () => {
      const view = buildVersionView(prodInput());
      expect(view.show).toBe(true);
    });
  });

  describe("accessors (production + sha present)", () => {
    it("derives shortSha as the first 7 chars of the full sha", () => {
      const view = buildVersionView({ ...prodInput(), sha: "abc123def456789" });
      // sha[0..6] in Rails === slice(0, 7) here
      expect(view.show && view.shortSha).toBe("abc123d");
    });

    it("builds the commit GitHub URL from the FULL sha (not the short one)", () => {
      const view = buildVersionView({ ...prodInput(), sha: "abc123def456789" });
      expect(view.show && view.commitGithubUrl).toBe(
        "https://github.com/RECTOR-LABS/core/commit/abc123def456789",
      );
    });

    it("builds the branch GitHub URL from the branch name", () => {
      const view = buildVersionView({ ...prodInput(), branch: "feat/x" });
      expect(view.show && view.branchGithubUrl).toBe(
        "https://github.com/RECTOR-LABS/core/tree/feat/x",
      );
    });

    it("passes commitCount through unchanged", () => {
      const view = buildVersionView({ ...prodInput(), commitCount: 123 });
      expect(view.show && view.commitCount).toBe(123);
    });

    it("passes buildTime through unchanged", () => {
      const view = buildVersionView({ ...prodInput(), buildTime: "2026-01-02T03:04:05.000Z" });
      expect(view.show && view.buildTime).toBe("2026-01-02T03:04:05.000Z");
    });

    it("keeps the full branch name available on the view", () => {
      const view = buildVersionView({ ...prodInput(), branch: "main" });
      expect(view.show && view.branch).toBe("main");
    });
  });

  describe("null-safe degradation (production + sha present, partial data)", () => {
    it("sets branch to null and branchGithubUrl to null when branch is missing", () => {
      const view = buildVersionView({ ...prodInput(), branch: null });
      expect(view.show && view.branch).toBeNull();
      expect(view.show && view.branchGithubUrl).toBeNull();
    });

    it("treats an empty-string branch as absent (null branch + null branch url)", () => {
      const view = buildVersionView({ ...prodInput(), branch: "" });
      expect(view.show && view.branch).toBeNull();
      expect(view.show && view.branchGithubUrl).toBeNull();
    });

    it("sets commitCount to null when the count is missing", () => {
      const view = buildVersionView({ ...prodInput(), commitCount: null });
      expect(view.show && view.commitCount).toBeNull();
    });

    it("sets buildTime to null when the timestamp is missing", () => {
      const view = buildVersionView({ ...prodInput(), buildTime: null });
      expect(view.show && view.buildTime).toBeNull();
    });

    it("still shows (commit-only) when branch, count and time are all null", () => {
      const view = buildVersionView({
        vercelEnv: "production",
        sha: "deadbeefcafef00d",
        branch: null,
        commitCount: null,
        buildTime: null,
      });
      expect(view.show).toBe(true);
      expect(view.show && view.shortSha).toBe("deadbee");
      expect(view.show && view.branch).toBeNull();
      expect(view.show && view.commitCount).toBeNull();
      expect(view.show && view.buildTime).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// timeAgoInWords — faithful port of ActionView's time_ago_in_words, used ONLY
// for the commit link's "(deployed X ago)" tooltip in _version_footer.html.erb.
//
// Rails distance_of_time_in_words boundaries (the subset reachable for a deploy
// timestamp), with `now` injected for determinism:
//   0..1 min        → "less than a minute"
//   2..44 min       → "N minutes"
//   45..89 min      → "about 1 hour"
//   90 min..23h59m  → "about N hours"
//   24h..41h        → "1 day"
//   42h..29d23h59m  → "N days"
// ---------------------------------------------------------------------------

describe("timeAgoInWords (ActionView parity)", () => {
  const NOW = new Date("2026-06-01T12:00:00.000Z");

  /** Build an ISO string `mins` minutes before NOW. */
  function minsAgo(mins: number): string {
    return new Date(NOW.getTime() - mins * 60_000).toISOString();
  }

  it("returns 'less than a minute' for under a minute", () => {
    expect(timeAgoInWords(minsAgo(0), NOW)).toBe("less than a minute");
    // 1 min 29 s still rounds to 1 minute → "less than a minute" band (<= 1 min)
    expect(timeAgoInWords(minsAgo(1), NOW)).toBe("less than a minute");
  });

  it("returns 'N minutes' for 2..44 minutes", () => {
    expect(timeAgoInWords(minsAgo(2), NOW)).toBe("2 minutes");
    expect(timeAgoInWords(minsAgo(30), NOW)).toBe("30 minutes");
    expect(timeAgoInWords(minsAgo(44), NOW)).toBe("44 minutes");
  });

  it("returns 'about 1 hour' for 45..89 minutes", () => {
    expect(timeAgoInWords(minsAgo(45), NOW)).toBe("about 1 hour");
    expect(timeAgoInWords(minsAgo(89), NOW)).toBe("about 1 hour");
  });

  it("returns 'about N hours' for 90 minutes up to ~24 hours", () => {
    expect(timeAgoInWords(minsAgo(90), NOW)).toBe("about 2 hours");
    expect(timeAgoInWords(minsAgo(60 * 5), NOW)).toBe("about 5 hours");
    expect(timeAgoInWords(minsAgo(60 * 23), NOW)).toBe("about 23 hours");
  });

  it("returns '1 day' for 24..41 hours", () => {
    expect(timeAgoInWords(minsAgo(60 * 24), NOW)).toBe("1 day");
    expect(timeAgoInWords(minsAgo(60 * 41), NOW)).toBe("1 day");
  });

  it("returns 'N days' for ~2 days and beyond", () => {
    expect(timeAgoInWords(minsAgo(60 * 48), NOW)).toBe("2 days");
    expect(timeAgoInWords(minsAgo(60 * 24 * 5), NOW)).toBe("5 days");
  });

  it("returns null for a null / empty input", () => {
    expect(timeAgoInWords(null, NOW)).toBeNull();
    expect(timeAgoInWords("", NOW)).toBeNull();
  });

  it("returns null for an unparseable timestamp", () => {
    expect(timeAgoInWords("not-a-date", NOW)).toBeNull();
  });
});
