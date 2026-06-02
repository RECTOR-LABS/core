/**
 * Version footer — PURE, client-safe logic for the Rails deploy "version pill".
 *
 * This module has ZERO Node imports (no node:fs / node:path), so it is safe to
 * import from the client `<VersionFooter />` component without Turbopack trying
 * to bundle `node:fs` into the browser chunk. The server-only wrapper that
 * reads process.env + `.version.json` lives in ./version.ts and re-exports
 * everything here.
 *
 * Ports, faithfully:
 *   - app/helpers/version_helper.rb  (SHA / branch / commit-count accessors +
 *     GitHub URL builders, and the ActionView time_ago_in_words used by the
 *     commit tooltip)
 *   - app/views/shared/_version_footer.html.erb gate
 *     (`Rails.env.production? && short_commit_sha.present?`)
 *
 * Gating note (locked by the project owner): the Vercel equivalent of Rails'
 * `Rails.env.production?` is `VERCEL_ENV === "production"`. This hides the pill
 * in local `next dev`, in vitest, and on git-triggered PREVIEW deployments;
 * it shows ONLY on a production deployment.
 *
 * GitHub repo for the URLs: RECTOR-LABS/core (verbatim from version_helper.rb).
 */

const GITHUB_REPO = "RECTOR-LABS/core";

// ---------------------------------------------------------------------------
// View model
// ---------------------------------------------------------------------------

export interface VersionView {
  show: true;
  /** First 7 chars of the full commit SHA (Rails `sha[0..6]`). */
  shortSha: string;
  /** Branch name, or null when unavailable (Rails defaults to "unknown"; here
   *  an absent branch omits the branch link entirely, matching the ERB guard). */
  branch: string | null;
  /** `…/commit/<full-sha>` — built from the FULL sha, like Rails. */
  commitGithubUrl: string;
  /** `…/tree/<branch>`, or null when branch is absent. */
  branchGithubUrl: string | null;
  /** Total commit count, or null when unavailable (omits the "• N Commits"). */
  commitCount: number | null;
  /** ISO build timestamp, or null (omits the "(deployed X ago)" tooltip). */
  buildTime: string | null;
}

/** The footer is hidden — render nothing. */
export interface VersionHidden {
  show: false;
}

export interface VersionInput {
  /** `process.env.VERCEL_ENV` — "production" | "preview" | "development" | undefined. */
  vercelEnv: string | undefined;
  /** Full commit SHA (`process.env.VERCEL_GIT_COMMIT_SHA` / local git), or null. */
  sha: string | null;
  /** Branch name (`process.env.VERCEL_GIT_COMMIT_REF` / local git), or null. */
  branch: string | null;
  /** Total commit count (git rev-list --count HEAD), or null. */
  commitCount: number | null;
  /** ISO build timestamp, or null. */
  buildTime: string | null;
}

// ---------------------------------------------------------------------------
// buildVersionView — pure gating + accessor logic
// ---------------------------------------------------------------------------

/**
 * Build the version-footer view model from injected build data.
 *
 * Gate (port of the ERB `if`): show ONLY when running on a Vercel production
 * deployment AND a non-empty commit SHA is present. Otherwise `{ show: false }`.
 *
 * When shown, every field is null-safe: an absent branch / commit-count /
 * build-time degrades to null so the component can omit just that piece (the
 * branch link, the "• N Commits" span, or the "(deployed X ago)" tooltip)
 * without hiding the whole pill.
 */
export function buildVersionView(input: VersionInput): VersionView | VersionHidden {
  const sha = input.sha?.trim() || null;

  // Equivalent of `Rails.env.production? && short_commit_sha.present?`.
  if (input.vercelEnv !== "production" || !sha) {
    return { show: false };
  }

  const branch = input.branch?.trim() || null;

  return {
    show: true,
    shortSha: sha.slice(0, 7),
    branch,
    commitGithubUrl: `https://github.com/${GITHUB_REPO}/commit/${sha}`,
    branchGithubUrl: branch
      ? `https://github.com/${GITHUB_REPO}/tree/${branch}`
      : null,
    commitCount:
      typeof input.commitCount === "number" && Number.isFinite(input.commitCount)
        ? input.commitCount
        : null,
    buildTime: input.buildTime?.trim() || null,
  };
}

// ---------------------------------------------------------------------------
// timeAgoInWords — faithful port of ActionView::Helpers::DateHelper
//   time_ago_in_words / distance_of_time_in_words (default include_seconds: false).
//
// Used ONLY for the commit link's "(deployed X ago)" tooltip — mirrors the
// Rails `title: "View commit on GitHub (deployed #{deployment_time_ago} ago)"`.
//
// Boundaries (the subset reachable for a deploy timestamp):
//   0..1 min        → "less than a minute"
//   2..44 min       → "N minutes"
//   45..89 min      → "about 1 hour"
//   90 min..~24h    → "about N hours"   (N = round(minutes / 60))
//   ~24h..~41h      → "1 day"
//   ~42h..~30d      → "N days"          (N = round(minutes / 1440))
// ---------------------------------------------------------------------------

/**
 * Return a human-readable "time ago" phrase matching ActionView's
 * `time_ago_in_words`, or null when the input is missing / unparseable.
 *
 * @param fromIso - ISO-8601 timestamp the distance is measured from.
 * @param now     - Injectable "current time"; defaults to `new Date()`.
 */
export function timeAgoInWords(
  fromIso: string | null,
  now: Date = new Date(),
): string | null {
  if (!fromIso) return null;
  const fromMs = new Date(fromIso).getTime();
  if (Number.isNaN(fromMs)) return null;

  const seconds = Math.abs(now.getTime() - fromMs) / 1000;
  // Rails: distance_in_minutes = (distance_in_seconds / 60).round
  const minutes = Math.round(seconds / 60);

  if (minutes <= 1) return "less than a minute";
  if (minutes <= 44) return `${minutes} minutes`;
  if (minutes <= 89) return "about 1 hour";
  if (minutes <= 1439) return `about ${Math.round(minutes / 60)} hours`;
  if (minutes <= 2519) return "1 day";
  return `${Math.round(minutes / 1440)} days`;
}
