/**
 * GitHub repos data layer for the Next.js port of RECTOR LABS CORE.
 *
 * Faithful port of two Rails files:
 *   - app/services/github_api_service.rb  (fetch logic, pagination, commit info)
 *   - app/models/github_repo.rb           (class-method selectors: aggregate_stats,
 *                                          currently_building, recently_active_repos)
 *
 * Architectural constraints:
 *   - No React / no next/* imports.
 *   - ISR revalidation handled by shared `githubFetch` from ./http (no cast needed).
 *   - Pure selectors are deterministic; they do NOT call Date.now() / new Date().
 *   - time_ago / detailed_time_ago / recently_active? are deliberately out of scope (Phase 3 UI).
 *
 * @see app/services/github_api_service.rb
 * @see app/models/github_repo.rb
 */

import { githubFetch } from "./http";

// ---------------------------------------------------------------------------
// Public shape
// ---------------------------------------------------------------------------

/**
 * Camelcase public representation of a GitHub repository.
 * Mirrors the github_repos columns the homepage actually renders.
 */
export interface Repo {
  fullName: string;
  name: string;
  /** null when GitHub returns null */
  description: string | null;
  /** null when GitHub returns null */
  language: string | null;
  htmlUrl: string;
  stargazersCount: number;
  forksCount: number;
  /** ISO 8601 string as returned by GitHub, e.g. "2026-01-15T10:00:00Z" */
  pushedAt: string;
  isFork: boolean;
  topics: string[];
  account: string;
  /** Total commit count parsed from GitHub pagination Link header, or null on failure */
  commitCount: number | null;
  /** Latest commit SHA sliced to 7 chars, or null on failure */
  latestCommitSha: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default accounts to fetch — port of GithubApiService::PERSONAL_ACCOUNT + RECTOR-LABS org */
export const DEFAULT_ACCOUNTS = ["rz1989s", "RECTOR-LABS"] as const;

const API_BASE = "https://api.github.com";

/**
 * Hard cap on pages fetched per account.
 * 50 × 100 = 5,000 repos — far beyond any real account.
 * Backstop against a misbehaving proxy that keeps serving distinct next-page URLs.
 */
const MAX_PAGES_PER_ACCOUNT = 50;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build the common request headers.
 * Authorization header is included ONLY when GITHUB_TOKEN env var is set.
 * Faithful port of GithubApiService#initialize — token conditional.
 */
function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RECTOR-LABS-CORE",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

/**
 * Parse total commit count from a GitHub Link header.
 *
 * Faithful port of GithubApiService#parse_commit_count_from_link.
 *
 * Link header format: `<url?page=N>; rel="last"`
 * Returns the page number of rel="last" (= total page count = commit count
 * when per_page=1), or null when the header is absent/unparseable, or 1
 * when the header is absent but we already have a commit (caller decides).
 */
function parseCommitCountFromLink(linkHeader: string | null): number | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Fetch commit info for a single repo.
 * Faithful port of GithubApiService#fetch_commit_info.
 *
 * Degrades gracefully: on any failure logs an actionable error and returns
 * { commitCount: null, latestCommitSha: null } — never throws.
 */
async function fetchCommitInfo(
  fullName: string,
  headers: Record<string, string>,
): Promise<Pick<Repo, "commitCount" | "latestCommitSha">> {
  const url = `${API_BASE}/repos/${fullName}/commits?per_page=1`;
  try {
    const res = await githubFetch(url, headers);

    if (!res.ok) {
      console.error(
        `GitHub API error fetching commit info for ${fullName}: HTTP ${res.status} — ${url}`,
      );
      return { commitCount: null, latestCommitSha: null };
    }

    const commits = (await res.json()) as Array<{ sha: string }>;
    if (!Array.isArray(commits) || commits.length === 0) {
      return { commitCount: null, latestCommitSha: null };
    }

    const latestCommitSha = commits[0].sha.slice(0, 7);

    // Parse from Link header; fallback to 1 when commits exist but no header present
    const linkHeader = res.headers.get("Link");
    const parsed = parseCommitCountFromLink(linkHeader);
    const commitCount = parsed ?? 1;

    return { commitCount, latestCommitSha };
  } catch (err) {
    console.error(
      `GitHub API exception fetching commit info for ${fullName}: ${String(err)}`,
    );
    return { commitCount: null, latestCommitSha: null };
  }
}

// ---------------------------------------------------------------------------
// Main fetcher
// ---------------------------------------------------------------------------

/**
 * Fetch all public repositories for the given accounts from the GitHub API.
 *
 * Faithful port of GithubApiService#fetch_repos_for_account (unauthenticated
 * public path — github_api_service.rb line 104).  We always use the public
 * `/users/{account}/repos` endpoint regardless of whether a token is set,
 * because:
 *   (a) the Rails authenticated paths use private scopes irrelevant to the
 *       Next.js site (which only ever renders public repo data), and
 *   (b) the homepage is public — no session context is available.
 *
 * Pagination: follows `Link: rel="next"` headers until exhausted.
 * For each repo, commit info is fetched individually (per Rails behaviour).
 *
 * Graceful degradation: a non-2xx response or network error for any single
 * account is logged via console.error with actionable context and skipped;
 * other accounts continue unaffected.
 *
 * @param accounts - GitHub user/org login names to fetch (default: DEFAULT_ACCOUNTS)
 */
export async function fetchRepos(
  accounts: string[] = [...DEFAULT_ACCOUNTS],
): Promise<Repo[]> {
  const headers = buildHeaders();
  const allRepos: Repo[] = [];

  for (const account of accounts) {
    try {
      const accountRepos = await fetchAccountRepos(account, headers);
      allRepos.push(...accountRepos);
    } catch (err) {
      // fetchAccountRepos is designed to not throw, but as a safety net:
      console.error(
        `GitHub API unexpected exception for account "${account}": ${String(err)}`,
      );
    }
  }

  return allRepos;
}

/**
 * Fetch all repos for a single account, following pagination.
 * Degrades gracefully on non-2xx: logs + returns empty array.
 */
async function fetchAccountRepos(
  account: string,
  headers: Record<string, string>,
): Promise<Repo[]> {
  const repos: Repo[] = [];
  // Start on page 1; subsequent pages are discovered from Link rel="next"
  let nextUrl: string | null =
    `${API_BASE}/users/${account}/repos?per_page=100&sort=pushed&page=1`;

  // Guard 1: visited-URL Set — stops self-referential or cycling rel="next"
  const visitedUrls = new Set<string>();
  // Guard 2: page counter — hard backstop against infinite distinct URLs
  let pagesFetched = 0;

  while (nextUrl) {
    // Cycle detection: abort if we've seen this URL before
    if (visitedUrls.has(nextUrl)) {
      console.warn(
        `GitHub API pagination cycle detected for account "${account}" — aborting pagination at ${nextUrl}`,
      );
      break;
    }
    visitedUrls.add(nextUrl);

    // Hard page cap: abort if we've exceeded the maximum allowed pages
    if (pagesFetched >= MAX_PAGES_PER_ACCOUNT) {
      console.warn(
        `GitHub API pagination hard cap (${MAX_PAGES_PER_ACCOUNT} pages) reached for account "${account}" — aborting to prevent runaway`,
      );
      break;
    }
    pagesFetched++;

    let res: Response;
    try {
      res = await githubFetch(nextUrl, headers);
    } catch (err) {
      console.error(
        `GitHub API network error for account "${account}" at ${nextUrl}: ${String(err)}`,
      );
      return repos; // return whatever we've accumulated so far
    }

    if (!res.ok) {
      console.error(
        `GitHub API error for account "${account}": HTTP ${res.status} — ${nextUrl}`,
      );
      return repos;
    }

    const raw = (await res.json()) as Array<{
      name: string;
      full_name: string;
      description: string | null;
      html_url: string;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      pushed_at: string;
      fork: boolean;
      topics?: string[];
    }>;

    // Resolve commit info for each repo on this page (faithful to Rails parse_repos)
    const pageRepos = await Promise.all(
      raw.map(async (r) => {
        const commitInfo = await fetchCommitInfo(r.full_name, headers);
        return {
          fullName: r.full_name,
          name: r.name,
          description: r.description ?? null,
          language: r.language ?? null,
          htmlUrl: r.html_url,
          stargazersCount: r.stargazers_count,
          forksCount: r.forks_count,
          pushedAt: r.pushed_at,
          isFork: r.fork,
          topics: r.topics ?? [],
          account,
          commitCount: commitInfo.commitCount,
          latestCommitSha: commitInfo.latestCommitSha,
        } satisfies Repo;
      }),
    );

    repos.push(...pageRepos);

    // Advance to next page if Link header has rel="next"
    const linkHeader = res.headers.get("Link");
    nextUrl = parseNextLink(linkHeader);
  }

  return repos;
}

/**
 * Extract the URL for rel="next" from a GitHub Link header, or null.
 * Example: `<https://api.github.com/...?page=2>; rel="next"`
 */
function parseNextLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Pure selectors — faithful ports of github_repo.rb class methods
// All operate on NON-FORK repos only (mirroring the `not_forks` scope).
// ---------------------------------------------------------------------------

/**
 * Filter to non-fork repos only.
 * Mirrors Rails: public_only.not_forks (we only fetch public repos, so
 * public_only is satisfied by construction).
 */
function nonForks(repos: Repo[]): Repo[] {
  return repos.filter((r) => !r.isFork);
}

/**
 * Sort repos by pushedAt descending (newest first).
 * Mirrors Rails: latest_first scope → `order(pushed_at: :desc)`.
 * ISO 8601 strings sort correctly lexicographically.
 */
function sortByPushedAtDesc(repos: Repo[]): Repo[] {
  return [...repos].sort((a, b) => (a.pushedAt > b.pushedAt ? -1 : a.pushedAt < b.pushedAt ? 1 : 0));
}

/**
 * Return the `n` most recently pushed non-fork repos.
 *
 * Faithful port of:
 *   `GithubRepo.public_only.not_forks.latest_first.limit(6)` (pages_controller.rb:4)
 *
 * @param repos - Full repo list to filter/sort
 * @param n     - Max results (default 6, matching Rails controller default)
 */
export function latest(repos: Repo[], n = 6): Repo[] {
  return sortByPushedAtDesc(nonForks(repos)).slice(0, n);
}

/**
 * Aggregate stats across all non-fork repos.
 *
 * Faithful port of GithubRepo.aggregate_stats:
 *   total_stars:   non_forks.sum(:stargazers_count)
 *   total_forks:   non_forks.sum(:forks_count)
 *   total_commits: non_forks.sum(:commit_count)  [nil treated as 0 by SQL SUM]
 *   total_repos:   non_forks.count
 */
export function aggregateStats(repos: Repo[]): {
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  totalRepos: number;
} {
  const nf = nonForks(repos);
  return {
    totalStars: nf.reduce((sum, r) => sum + r.stargazersCount, 0),
    totalForks: nf.reduce((sum, r) => sum + r.forksCount, 0),
    totalCommits: nf.reduce((sum, r) => sum + (r.commitCount ?? 0), 0),
    totalRepos: nf.length,
  };
}

/**
 * Return the `n` most recently pushed non-fork repos.
 *
 * Faithful port of GithubRepo.recently_active_repos(limit = 3):
 *   `public_only.not_forks.latest_first.limit(limit)`
 *
 * Note: despite the name, the Rails implementation does NOT actually filter
 * by recency — it simply returns the latest n. We are faithful to that.
 *
 * @param repos - Full repo list
 * @param n     - Limit (default 3, matching Rails default)
 */
export function recentlyActive(repos: Repo[], n = 3): Repo[] {
  return sortByPushedAtDesc(nonForks(repos)).slice(0, n);
}

/**
 * Return the single most recently pushed non-fork repo, or null.
 *
 * Faithful port of GithubRepo.currently_building:
 *   `public_only.not_forks.latest_first.first`
 */
export function currentlyBuilding(repos: Repo[]): Repo | null {
  const sorted = sortByPushedAtDesc(nonForks(repos));
  return sorted[0] ?? null;
}
