import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { loadWorks, type Work } from "@/lib/content/works";
import { fetchRepos, type Repo } from "@/lib/github/repos";
import { loadAchievements } from "@/lib/content/achievements";
import { numberWithDelimiter } from "@/lib/format";

import { FilterSort, type ActiveWork } from "@/components/islands/FilterSort";

// ---------------------------------------------------------------------------
// ISR — revalidate hourly, matching the homepage and the Rails Solid Queue
// GitHub-sync cadence.
// ---------------------------------------------------------------------------
export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Route-level React cache — dedupes the synchronous YAML read across
// generateMetadata and the page component within one render pass.
// (lib/* stays React-free; only the route file imports `cache`.)
// ---------------------------------------------------------------------------
const getAchievements = cache(() => loadAchievements());

// ---------------------------------------------------------------------------
// Winner badge map — ported 1:1 from the Rails `case work.title` in
// app/views/works/index.html.erb. Keyed by title, with the `else` fallback.
// ---------------------------------------------------------------------------
interface WinnerBadge {
  icon: string;
  text: string;
  prize: string;
  event: string;
}

function winnerBadge(title: string): WinnerBadge {
  switch (title) {
    case "Web3 Deal Discovery":
      return { icon: "🥇", text: "1st Place", prize: "$5,000 + NFT", event: "MonkeDAO Cypherpunk" };
    case "SIP Protocol":
      return { icon: "🏆", text: "Winner", prize: "$6,500", event: "Zypherpunk • 3 Tracks" };
    case "OpenBudget.ID":
      return { icon: "🥈", text: "2nd Place", prize: "$1,500", event: "Garuda Spark" };
    case "Saros SDK Docs":
      return { icon: "🥇", text: "1st Place", prize: "$300", event: "Saros SDK Challenge" };
    default:
      return { icon: "🏆", text: "Winner", prize: "", event: "" };
  }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata(): Promise<Metadata> {
  const title = "Work — RECTOR";
  const description =
    "Projects I've built, problems I've solved, and stories worth telling.";

  return {
    title,
    description,
    alternates: { canonical: "/work" },
    openGraph: { type: "website", url: "/work", siteName: "RECTOR", title, description },
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function WorkIndexPage() {
  // ---- Works (file-based) ----
  // loadWorks() already sorts by launchedAt desc, so the Winner/active splits
  // preserve that order without re-sorting (mirrors the Rails .order(launched_at: :desc)).
  const { published } = loadWorks();
  const winners = published.filter((w) => w.status === "Winner");
  const active = published.filter((w) => w.status !== "Winner");

  // ---- GitHub repos (graceful degradation: [] when the token is missing) ----
  const repos = await fetchRepos();
  const repoByName = new Map<string, Repo>(repos.map((r) => [r.fullName, r]));
  const repoFor = (w: Work): Repo | undefined =>
    w.repoName ? repoByName.get(w.repoName) : undefined;

  // ---- Stats banner ----
  const { winCount, totalEarnings } = getAchievements();
  const earned = numberWithDelimiter(totalEarnings);
  const projectCount = published.length;

  // ---- Build the island props from the merged active works ----
  // Rails JS-truthy `||` merge semantics (NOT ??):
  //   stars   = repo&.stargazers_count || work.github_stars || 0
  //   commits = repo&.commit_count || 0
  const activeWorks: ActiveWork[] = active.map((w) => {
    const repo = repoFor(w);
    const stars = repo?.stargazersCount || w.githubStars || 0;
    const commits = repo?.commitCount || 0;
    return {
      slug: w.slug,
      title: w.title,
      summary: w.summary,
      status: w.status,
      technologies: w.technologies,
      stars,
      commits,
      sha: repo?.latestCommitSha ?? null,
      launchedAt: w.launchedAt?.toISOString() ?? null,
    };
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="container-work">
      <div className="mb-6 sm:mb-8">
        <Link href="/" className="back-link">
          ← Home
        </Link>
      </div>

      {/* Header */}
      <div className="work-header">
        <h1>Work</h1>
        <p className="work-tagline">
          Projects I&apos;ve built, problems I&apos;ve solved, and stories worth telling.
        </p>
      </div>

      {/* Stats Banner */}
      <div className="work-stats-banner">
        <div className="work-stat">
          <span className="work-stat-value">{winCount}</span>
          <span className="work-stat-label">wins</span>
        </div>
        <span className="work-stat-divider">•</span>
        <div className="work-stat">
          <span className="work-stat-value">~${earned}</span>
          <span className="work-stat-label">earned</span>
        </div>
        <span className="work-stat-divider">•</span>
        <div className="work-stat">
          <span className="work-stat-value">{projectCount}</span>
          <span className="work-stat-label">projects</span>
        </div>
      </div>

      {/* Hackathon Wins Section — server-rendered (static). */}
      {winners.length > 0 && (
        <section className="work-section">
          <h2 className="work-section-title">
            <span className="work-section-icon">🏆</span>
            Hackathon &amp; Bounty Wins
          </h2>

          <div className="work-grid">
            {winners.map((work) => {
              const badge = winnerBadge(work.title);
              const repo = repoFor(work);
              // Winner merge semantics (Rails `||`):
              //   stars = repo&.stargazers_count || work.github_stars
              //   commits rendered when (repo&.commit_count).to_i > 0
              const stars = repo?.stargazersCount || work.githubStars;
              // `?? 0` (not `|| 0`) mirrors the ERB winner card, which reads
              // repo&.commit_count directly; the active card uses `|| 0`. Don't
              // harmonize them — commitCount is null|≥1, so they coincide anyway.
              const commits = repo?.commitCount ?? 0;
              return (
                <Link
                  key={work.slug}
                  href={`/work/${work.slug}`}
                  className="work-card work-card-winner"
                >
                  <div className="work-card-header">
                    <div className="work-card-badge badge-winner">
                      {badge.icon} {badge.text}
                    </div>
                    <span className="work-card-prize">{badge.prize}</span>
                  </div>

                  <h3 className="work-card-title">{work.title}</h3>
                  <p className="work-card-event">{badge.event}</p>
                  <p className="work-card-summary">{work.summary}</p>

                  <div className="work-card-meta">
                    {work.technologies.length > 0 && (
                      <span className="work-card-tech">
                        {work.technologies.slice(0, 3).join(" • ")}
                      </span>
                    )}
                    {/* PARITY QUIRK (do not "fix"): the Rails winner card emits the
                        inline glyph AND the .work-card-stars/.work-card-commits ::before
                        CSS also injects ⭐ / ⊙ — so once a count > 0 the icon renders
                        TWICE on winner cards. Reproduced verbatim from the ERB. */}
                    {stars > 0 && (
                      <span className="work-card-stars">⭐ {stars}</span>
                    )}
                    {commits > 0 && (
                      <span className="work-card-commits">⊙ {commits}</span>
                    )}
                    {repo?.latestCommitSha && (
                      <span className="work-card-sha font-mono text-[10px] text-brown/40">
                        {repo.latestCommitSha}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Active Projects Section — interactive island (filter + sort + show-more). */}
      {active.length > 0 && <FilterSort works={activeWorks} />}

      {published.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#3B2C22]/50">No work published yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
