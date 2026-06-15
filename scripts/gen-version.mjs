// ---------------------------------------------------------------------------
// gen-version.mjs — build-time version stamp for the deploy "version pill".
//
// Next runs this automatically via the `prebuild` script (npm runs
// `prebuild` before `build`). It computes { sha, branch, commitCount,
// buildTime } and writes web/.version.json (gitignored), which src/lib/version.ts
// reads at build time.
//
// Data sources (per the locked decisions):
//   - sha    : VERCEL_GIT_COMMIT_SHA, else `git rev-parse HEAD`
//   - branch : VERCEL_GIT_COMMIT_REF, else `git rev-parse --abbrev-ref HEAD`
//   - count  : `git rev-list --count HEAD` on a FULL clone (local builds). On
//              Vercel's shallow `--depth=10` clone that undercounts (~20 vs the
//              real total), and `git fetch --unshallow` is unreliable in Vercel's
//              build sandbox (no fetchable remote), so the true total is read
//              from the GitHub commits API instead (Link header rel="last").
//   - time   : current ISO timestamp (the build time)
//
// NULL-SAFE: any git failure (no repo / git missing / shallow checkout without
// history) writes null for just the affected field — it NEVER throws, so the
// build always proceeds. This mirrors the Rails helper returning nils when the
// REVISION file is absent in development/test.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Run a git command, returning trimmed stdout or null on any failure. */
function git(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** Non-empty trimmed string, or null. */
function clean(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Resolve the TRUE commit count for `ref` from the GitHub REST API.
 *
 * `GET /repos/{owner}/{repo}/commits?sha={ref}&per_page=1` returns a single
 * commit, but its `Link` header's rel="last" page number equals the total
 * number of commits reachable from `ref`. This is the reliable way to count on
 * Vercel, whose shallow checkout has no full local history and no fetchable
 * remote to deepen from.
 *
 * The repo slug comes from Vercel's VERCEL_GIT_REPO_OWNER / VERCEL_GIT_REPO_SLUG
 * (falling back to the known RECTOR-LABS/core). Authorization is added when
 * GITHUB_TOKEN is present; the public repo also resolves unauthenticated (one
 * request per build, well within the 60/hr anonymous limit).
 *
 * Returns the parsed count, or null on ANY failure — the caller then keeps the
 * git-derived count, so the build never breaks.
 */
async function fetchCommitCountFromApi(ref) {
  const owner = clean(process.env.VERCEL_GIT_REPO_OWNER);
  const slug = clean(process.env.VERCEL_GIT_REPO_SLUG);
  const repo = owner && slug ? `${owner}/${slug}` : "RECTOR-LABS/core";
  const url = `https://api.github.com/repos/${repo}/commits?sha=${encodeURIComponent(ref)}&per_page=1`;

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RECTOR-LABS-CORE",
  };
  if (clean(process.env.GITHUB_TOKEN)) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(
        `gen-version: GitHub commits API HTTP ${res.status} for ${repo}@${ref.slice(0, 7)} — keeping git count.`,
      );
      return null;
    }
    // The total lives in the rel="last" page number (per_page=1 ⇒ pages = commits).
    const link = res.headers.get("link");
    const match = link ? link.match(/page=(\d+)>;\s*rel="last"/) : null;
    if (match) return Number.parseInt(match[1], 10);
    // No rel="last" ⇒ history fits in one page (≤1 commit, or the header was
    // withheld); fall back to the returned array length.
    const commits = await res.json();
    return Array.isArray(commits) ? commits.length : null;
  } catch (error) {
    console.warn(
      `gen-version: GitHub commits API error for ${repo} — keeping git count: ${error.message}`,
    );
    return null;
  }
}

const sha = clean(process.env.VERCEL_GIT_COMMIT_SHA) ?? git(["rev-parse", "HEAD"]);
const branch =
  clean(process.env.VERCEL_GIT_COMMIT_REF) ?? git(["rev-parse", "--abbrev-ref", "HEAD"]);

// Base count from local git history. On a FULL clone (local builds) this is the
// true total and no network call is made.
const countRaw = git(["rev-list", "--count", "HEAD"]);
const parsedCount = countRaw === null ? NaN : Number.parseInt(countRaw, 10);
let commitCount = Number.isFinite(parsedCount) ? parsedCount : null;

// On Vercel the checkout is a SHALLOW clone (`git clone --depth=10`), so the git
// count above is an UNDERCOUNT (~20). Resolve the real total from the GitHub API
// (the deployed SHA, else the branch). Null-safe: any failure keeps the git
// count, so the build never breaks.
if (git(["rev-parse", "--is-shallow-repository"]) === "true") {
  const ref = sha ?? branch;
  if (ref) {
    const apiCount = await fetchCommitCountFromApi(ref);
    if (apiCount !== null) commitCount = apiCount;
  }
}

const version = {
  sha,
  branch,
  commitCount,
  buildTime: new Date().toISOString(),
};

// Resolve the output path relative to this script (web/.version.json) so it is
// correct regardless of the directory the build is invoked from.
const here = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(here, "..", ".version.json");

try {
  writeFileSync(outPath, JSON.stringify(version, null, 2) + "\n", "utf8");
  console.log(
    `gen-version: wrote ${outPath} (sha=${sha ? sha.slice(0, 7) : "null"}, branch=${branch ?? "null"}, commits=${commitCount ?? "null"})`,
  );
} catch (error) {
  // Even a write failure must not break the build — version.ts degrades to a
  // hidden footer when .version.json is absent/unreadable.
  console.warn(`gen-version: could not write ${outPath}:`, error.message);
}
