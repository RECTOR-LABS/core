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
//   - count  : `git rev-list --count HEAD`
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

const sha = clean(process.env.VERCEL_GIT_COMMIT_SHA) ?? git(["rev-parse", "HEAD"]);
const branch =
  clean(process.env.VERCEL_GIT_COMMIT_REF) ?? git(["rev-parse", "--abbrev-ref", "HEAD"]);

const countRaw = git(["rev-list", "--count", "HEAD"]);
const parsedCount = countRaw === null ? NaN : Number.parseInt(countRaw, 10);
const commitCount = Number.isFinite(parsedCount) ? parsedCount : null;

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
