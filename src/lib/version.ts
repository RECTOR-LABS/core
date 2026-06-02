/**
 * Version footer — SERVER-ONLY wrapper for the Rails deploy "version pill".
 *
 * This module reads the live environment (process.env + the build-time
 * `.version.json`) and therefore imports `node:fs`. It must NOT be imported by
 * any client component — the pure, client-safe logic lives in ./version-view.ts
 * and is re-exported below so existing call sites importing from "@/lib/version"
 * keep working.
 *
 * Architecture:
 *   - buildVersionView / timeAgoInWords / the view-model types → ./version-view
 *     (pure, no Node imports; safe in the browser bundle).
 *   - versionView() (here) → the non-pure resolver the root layout calls at
 *     build time, passing serializable props to the client <VersionFooter />.
 *
 * Data sources (per the locked decisions):
 *   - sha    : VERCEL_GIT_COMMIT_SHA, else the `.version.json` local-git fallback
 *   - branch : VERCEL_GIT_COMMIT_REF, else the `.version.json` local-git fallback
 *   - count  : `.version.json` (git rev-list --count HEAD at build)
 *   - time   : `.version.json` (build timestamp)
 *
 * A missing / malformed `.version.json` degrades to nulls — it never throws,
 * faithful to the Rails helper returning nils when REVISION is absent in
 * development/test.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { buildVersionView, type VersionView, type VersionHidden } from "./version-view";

export {
  buildVersionView,
  timeAgoInWords,
} from "./version-view";
export type { VersionView, VersionHidden, VersionInput } from "./version-view";

export interface VersionFile {
  sha?: string | null;
  branch?: string | null;
  commitCount?: number | null;
  buildTime?: string | null;
}

/**
 * Parse raw `.version.json` contents into a VersionFile.
 *
 * Pure + total: `JSON.parse` accepts more than objects (the literal `null`, a
 * number, a string, an array all parse successfully), so guard the result to a
 * plain object and fall back to `{}` on any non-object value or parse error.
 * This is what lets readVersionFile honor its "never throws" contract — a torn
 * write or a hand-corrupted file degrades to nulls instead of throwing
 * `Cannot read properties of null` during the layout's build-time render.
 */
export function parseVersionFile(raw: string | null | undefined): VersionFile {
  if (raw == null) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  return parsed != null && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as VersionFile)
    : {};
}

/**
 * Read the build-time `.version.json` written by scripts/gen-version.mjs.
 * A missing / malformed file degrades to an empty object so a fresh checkout
 * (or any environment where the prebuild script did not run) never breaks the
 * build.
 */
function readVersionFile(): VersionFile {
  try {
    const file = path.join(process.cwd(), ".version.json");
    return parseVersionFile(readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

/**
 * Resolve the version-footer view model from the live environment.
 *
 * Called from the root layout (a Server Component) at build time; it passes
 * serializable props to the client `<VersionFooter />`.
 */
export function versionView(): VersionView | VersionHidden {
  const file = readVersionFile();

  return buildVersionView({
    vercelEnv: process.env.VERCEL_ENV,
    sha: process.env.VERCEL_GIT_COMMIT_SHA ?? file.sha ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? file.branch ?? null,
    commitCount: file.commitCount ?? null,
    buildTime: file.buildTime ?? null,
  });
}
