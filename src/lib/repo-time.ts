/**
 * Repository time-ago helpers for the Next.js port of RECTOR LABS CORE.
 *
 * Faithful ports of these instance methods on GithubRepo (ActiveRecord model):
 *   - time_ago          → timeAgo
 *   - detailed_time_ago → detailedTimeAgo
 *   - recently_active?  → recentlyActive
 *
 * @see app/models/github_repo.rb  (GithubRepo#time_ago, #detailed_time_ago, #recently_active?)
 *
 * Architectural constraints:
 *   - No React / no next/* imports. Pure functions.
 *   - All three functions accept an injectable `now: Date` (defaulting to
 *     `new Date()`) so tests remain fully deterministic — mirrors the pattern
 *     used by calculateStreaks in ./github/contributions.ts.
 *
 * Faithfulness notes:
 *   - Ruby `.to_i` truncates toward zero; we use `Math.trunc` (not Math.floor)
 *     to match exactly. For positive diffs the two are equivalent, but trunc is
 *     the semantically faithful choice.
 *   - timeAgo: `days.zero?` → "today".  A repo pushed <24 h ago has
 *     time_diff < 86_400 s → days = Math.trunc(< 1) = 0 → "today".
 *   - recentlyActive: `pushed_at > 24.hours.ago` — strict greater-than.
 *     At exactly the 24 h boundary the condition is false.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAY = 86_400_000;   // ms in 24 hours
const HOUR = 3_600_000;   // ms in 1 hour
const MIN = 60_000;       // ms in 1 minute

// ---------------------------------------------------------------------------
// timeAgo
// ---------------------------------------------------------------------------

/**
 * Return a human-readable "time since last push" string.
 *
 * Faithful port of GithubRepo#time_ago:
 *   - days = 0          → "today"
 *   - days = 1          → "yesterday"
 *   - days < 30         → "N days ago"
 *   - days < 365        → "N months ago"  (months = Math.trunc(days / 30))
 *   - else              → "N years ago"   (years  = Math.trunc(days / 365))
 *
 * NOTE: Rails produces "1 years ago" when years === 1 — this is matched
 * faithfully (no grammatical fix applied).
 *
 * @param pushedAtIso - ISO-8601 datetime string of the last push.
 * @param now         - Injectable "current time"; defaults to `new Date()`.
 */
export function timeAgo(pushedAtIso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(pushedAtIso).getTime();
  const days = Math.trunc(diffMs / DAY);

  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30)  return `${days} days ago`;
  if (days < 365) return `${Math.trunc(days / 30)} months ago`;
  return `${Math.trunc(days / 365)} years ago`;
}

// ---------------------------------------------------------------------------
// detailedTimeAgo
// ---------------------------------------------------------------------------

/**
 * Return a sub-day-resolution "time since last push" string.
 *
 * Faithful port of GithubRepo#detailed_time_ago:
 *   - minutes < 60  → "Nm ago"
 *   - hours < 24    → "Nh ago"
 *   - else          → falls through to timeAgo(pushedAtIso, now)
 *
 * @param pushedAtIso - ISO-8601 datetime string of the last push.
 * @param now         - Injectable "current time"; defaults to `new Date()`.
 */
export function detailedTimeAgo(
  pushedAtIso: string,
  now: Date = new Date(),
): string {
  const diffMs = now.getTime() - new Date(pushedAtIso).getTime();
  const hours   = Math.trunc(diffMs / HOUR);
  const minutes = Math.trunc(diffMs / MIN);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24)   return `${hours}h ago`;
  return timeAgo(pushedAtIso, now);
}

// ---------------------------------------------------------------------------
// recentlyActive
// ---------------------------------------------------------------------------

/**
 * Return true if the repo was pushed to within the last 24 hours.
 *
 * Faithful port of GithubRepo#recently_active?:
 *   pushed_at > 24.hours.ago
 *
 * Strict greater-than mirrors Ruby: at exactly 24 h the condition is false.
 *
 * @param pushedAtIso - ISO-8601 datetime string of the last push.
 * @param now         - Injectable "current time"; defaults to `new Date()`.
 */
export function recentlyActive(
  pushedAtIso: string,
  now: Date = new Date(),
): boolean {
  return new Date(pushedAtIso).getTime() > now.getTime() - DAY;
}
