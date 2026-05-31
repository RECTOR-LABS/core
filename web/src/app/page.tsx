import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { fetchRepos, latest, aggregateStats, recentlyActive, currentlyBuilding } from "@/lib/github/repos";
import { currentStack } from "@/lib/github/tech-stack";
import { fetchContributions, fetchAvailableYears } from "@/lib/github/contributions";
import { loadAchievements } from "@/lib/content/achievements";
import { loadPosts } from "@/lib/content/posts";
import { numberWithDelimiter } from "@/lib/format";
import { detailedTimeAgo } from "@/lib/repo-time";

import { AchievementCard } from "@/components/home/AchievementCard";
import { ProjectCard } from "@/components/home/ProjectCard";
import { ActivityBar } from "@/components/home/ActivityBar";
import { TechStackBar } from "@/components/home/TechStackBar";
import { RecentlyShipping } from "@/components/home/RecentlyShipping";
import { ContributionGraph } from "@/components/islands/ContributionGraph";

// ---------------------------------------------------------------------------
// ISR — revalidate the page every hour, matching the Rails hourly Solid Queue
// sync cadence.
// ---------------------------------------------------------------------------
export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Route-level React cache — dedupes network calls across generateMetadata and
// the page component within the same render pass.
// lib/* is kept React-free; only the route file imports `cache`.
// ---------------------------------------------------------------------------
const getRepos = cache(() => fetchRepos());
const getAvailableYears = cache(() => fetchAvailableYears());
// loadAchievements is synchronous (fs + YAML) — cache() still dedupes the FS
// read so generateMetadata and the page component share the same result.
const getAchievements = cache(() => loadAchievements());

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata(): Promise<Metadata> {
  const { winCount, totalEarnings } = getAchievements();
  const summary = `${winCount} wins, ~$${numberWithDelimiter(totalEarnings)} earned`;
  const description = `Full-stack builder. Hackathon hunter. ${summary}. Building for eternity.`;
  const title = "RECTOR • Building for Eternity";

  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: { type: "website", url: "/", siteName: "RECTOR", title, description },
    twitter: {
      card: "summary_large_image",
      site: "@RZ1989sol",
      creator: "@RZ1989sol",
      title,
      description,
    },
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function HomePage() {
  const now = new Date();

  // ---- GitHub repos ----
  const repos = await getRepos();
  const latestProjects = latest(repos, 6);
  const stats = aggregateStats(repos);
  const recentlyActiveRepos = recentlyActive(repos, 3);
  const building = currentlyBuilding(repos);
  const techStack = currentStack(repos);

  // ---- Contribution graph ----
  const availableYears = await getAvailableYears();
  const allTimeContributions = availableYears.reduce((s, y) => s + y.count, 0);

  // The 5 most recent tab years feed the year-switch island.
  const tabYearNums = availableYears.slice(0, 5).map((y) => y.year);
  const currentYear = now.getUTCFullYear();
  const defaultYear = tabYearNums.includes(currentYear)
    ? currentYear
    : (tabYearNums[0] ?? currentYear);

  // Fan out every contribution fetch concurrently: the tab years, the rolling
  // 12-month window (intro "this past year" total), and — only when the current
  // year isn't already a tab — a current-year fetch for the intro streak.
  const needsCurrentYearFetch = !tabYearNums.includes(currentYear);
  const [tabYears, rolling, currentYearExtra] = await Promise.all([
    Promise.all(
      tabYearNums.map(async (year) => ({ year, data: await fetchContributions(year) })),
    ),
    fetchContributions("last"),
    needsCurrentYearFetch ? fetchContributions(currentYear) : Promise.resolve(null),
  ]);

  // Current-year contributions drive the intro streak (Rails @contributions = current year);
  // `rolling` (the "last" window) drives the "this past year" total. `?? rolling` is an
  // unreachable type-level fallback (if find() misses, currentYearExtra is always populated).
  const currentYearContrib =
    tabYears.find((t) => t.year === currentYear)?.data ?? currentYearExtra ?? rolling;

  // ---- Content ----
  const achievements = getAchievements();
  const latestPost = loadPosts().recent(1)[0];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <main className="container mx-auto mt-16 sm:mt-28 px-4 sm:px-5">
      <div className="container-homepage">

        {/* 1. Profile */}
        {/* eslint-disable-next-line @next/next/no-img-element -- NFT avatar: size/border-radius/shadow are driven by the .profile-picture class; next/image's wrapper complicates that composition for no LCP benefit on a 150px same-origin image */}
        <img
          src="/images/rector_profile_image.png"
          alt="RECTOR"
          className="profile-picture"
          width={150}
          height={150}
        />

        {/* 2. Intro */}
        <div className="intro-section">
          <h1 className="intro-greeting">Assalamu&apos;alaikum! I&apos;m RECTOR.</h1>
          <p className="intro-tagline">
            Full-stack builder{" "}
            {currentYearContrib.currentStreak > 0 ? (
              <>
                on a <strong>{currentYearContrib.currentStreak}-day streak</strong>.
              </>
            ) : (
              "building for eternity."
            )}{" "}
            <strong>{numberWithDelimiter(rolling.total)}</strong> contributions this past year{" "}
            •{" "}
            <strong>{numberWithDelimiter(allTimeContributions)}</strong> all-time across{" "}
            <strong>{stats.totalRepos}</strong> repositories.
          </p>

          {recentlyActiveRepos.length > 0 && (
            <p className="intro-tagline mt-2">
              Recently shipping{" "}
              <RecentlyShipping repos={recentlyActiveRepos} />{" "}
              (latest: {detailedTimeAgo(recentlyActiveRepos[0].pushedAt, now)}).
            </p>
          )}
        </div>

        {/* 3. Quick nav */}
        <div className="quick-nav">
          Explore:{" "}
          <Link href="/work">work</Link>
          {" • "}
          <a href="#">labs</a>
          {" • "}
          <Link href="/journal">journal</Link>
          {" • "}
          <a href="#">cheatsheet</a>
        </div>

        {/* 4. Divider */}
        <hr className="section-divider" />

        {/* 5. Achievements */}
        <section>
          <h2>Achievements</h2>
          <p className="mt-4 mb-6 text-[#3B2C22]/70">
            {achievements.winCount} wins across grants, bounties and hackathons in{" "}
            {achievements.yearRange}.
          </p>

          <div className="space-y-4">
            {achievements.all.map((a) => (
              <AchievementCard key={a.slug} achievement={a} />
            ))}
          </div>

          <div className="mt-6 p-4 bg-[#F9C846]/10 border-l-4 border-[#F9C846] rounded">
            <p className="font-mono text-sm font-semibold text-[#3B2C22]">
              Total Earned: ~${numberWithDelimiter(achievements.totalEarnings)} USDC + Gen3 Monke NFT
            </p>
          </div>
        </section>

        {/* 6. Divider */}
        <hr className="section-divider" />

        {/* 7. Building in Public */}
        <section>
          <h2>Building in Public</h2>

          <ContributionGraph years={tabYears} defaultYear={defaultYear} />

          {building !== null && (
            <ActivityBar repo={building} stats={stats} now={now} />
          )}

          {latestProjects.length > 0 ? (
            <div className="mt-6 space-y-3">
              {latestProjects.map((p) => (
                <ProjectCard
                  key={p.fullName}
                  repo={p}
                  winnerBadge={achievements.winnerProjects[p.name]}
                  now={now}
                />
              ))}
            </div>
          ) : (
            <p className="mt-6">No projects found. Check back later!</p>
          )}

          <TechStackBar techStack={techStack} />
        </section>

        {/* 8. Divider */}
        <hr className="section-divider" />

        {/* 9. Writing */}
        <section>
          <h2>Writing</h2>
          {latestPost !== undefined && (
            <p className="mt-4 mb-2">
              <strong>Latest article:</strong>{" "}
              <Link href={`/journal/${latestPost.slug}`}>{latestPost.title}</Link>
            </p>
          )}
          <p>Articles about code, faith, and building for eternity.</p>
        </section>

        {/* 10. Divider */}
        <hr className="section-divider" />

        {/* 11. Get in Touch */}
        <section>
          <h2>Get in Touch</h2>
          <p className="mt-4">
            <a href="https://github.com/rz1989s" target="_blank" rel="noopener">
              GitHub
            </a>
            {" • "}
            <a href="https://x.com/RZ1989sol" target="_blank" rel="noopener">
              X
            </a>
            {" • "}
            <a href="mailto:rheza10@gmail.com">Email</a>
          </p>
        </section>

      </div>
    </main>
  );
}
