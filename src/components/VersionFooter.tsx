"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
// Import the runtime helper + types from the PURE module (no node:fs) so this
// client component's bundle never tries to bundle Node built-ins. The server
// wrapper lives in @/lib/version.
import { timeAgoInWords, type VersionView, type VersionHidden } from "@/lib/version-view";

// ---------------------------------------------------------------------------
// VersionFooter — Next.js port of app/views/shared/_version_footer.html.erb.
//
// The view model (gated to production + sha-present) is computed at build time
// by the Server-Component root layout via versionView(); this client component
// only RENDERS it and applies the /apply suppression.
//
// Two Rails behaviors are reproduced as Next adaptations (see the locked
// decisions in the task spec):
//   1. /apply/* suppression. In Rails the apply pages used a SEPARATE layout
//      with no footer. Next shares one root <body> across all routes, so we
//      hide the footer on any pathname under /apply via usePathname(). Because
//      cacheComponents is off and there are no rewrites/proxy, usePathname()
//      returns the prerendered path during SSG — so /apply/* static HTML is
//      emitted WITHOUT the footer, while /, /work, /journal emit it WITH it.
//   2. "deployed X ago" tooltip. Computed AFTER mount (useEffect → useState)
//      so the server render and the first client render agree (no hydration
//      mismatch); when buildTime is null the suffix is omitted.
//
// Harmless quirks reproduced verbatim from the Rails source (do NOT "fix"):
//   - a `.version-label` CSS rule with no matching element (kept in globals.css)
//   - a `.version-commits` element with no CSS rule
// ---------------------------------------------------------------------------

type VersionFooterProps = VersionView | VersionHidden;

export function VersionFooter(props: VersionFooterProps) {
  const pathname = usePathname();

  // Hydration-safe relative time for the commit tooltip: null on the server and
  // on the first client render, filled in after mount. `buildTime` may be null.
  const buildTime = props.show ? props.buildTime : null;
  const [deployedAgo, setDeployedAgo] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate after-mount sync: the relative-time string depends on the client clock and MUST stay null on the server + first client render to avoid a hydration mismatch (the only correct place to compute it is post-mount)
    setDeployedAgo(timeAgoInWords(buildTime));
  }, [buildTime]);

  // Gate: hidden by the build-time view model, OR on any /apply/* route.
  if (!props.show) return null;
  if (pathname === "/apply" || pathname.startsWith("/apply/")) return null;

  const { shortSha, branch, commitGithubUrl, branchGithubUrl, commitCount } = props;

  const commitTitle = deployedAgo
    ? `View commit on GitHub (deployed ${deployedAgo} ago)`
    : "View commit on GitHub";

  return (
    <footer className="version-footer">
      <div className="version-info">
        {/* Branch — only when a branch name is present */}
        {branch && branchGithubUrl && (
          <>
            <a
              href={branchGithubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="version-link branch-link"
              title={`View ${branch} branch on GitHub`}
            >
              <svg
                className="version-icon"
                viewBox="0 0 16 16"
                width="12"
                height="12"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"
                ></path>
              </svg>
              <code className="version-branch">{branch}</code>
            </a>
            <span className="version-separator">@</span>
          </>
        )}

        {/* Commit — always present when shown */}
        <a
          href={commitGithubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="version-link commit-link"
          title={commitTitle}
        >
          <svg
            className="version-icon"
            viewBox="0 0 16 16"
            width="12"
            height="12"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zM8 6a2 2 0 100 4 2 2 0 000-4z"
            ></path>
          </svg>
          <code className="version-sha">{shortSha}</code>
        </a>

        {/* Commit count — only when present */}
        {commitCount !== null && (
          <>
            <span className="version-separator">•</span>
            <span className="version-commits">{commitCount} Commits</span>
          </>
        )}
      </div>
    </footer>
  );
}
