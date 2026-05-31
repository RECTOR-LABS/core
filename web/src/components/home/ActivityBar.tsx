import type { Repo } from "@/lib/github/repos";
import { recentlyActive, detailedTimeAgo } from "@/lib/repo-time";
import { humanizeCount } from "@/lib/format";

interface Props {
  repo: Repo;
  /**
   * The full aggregate-stats shape (the page passes aggregateStats(repos) directly).
   * `totalForks` is part of the contract but — like the Rails activity bar — is not rendered here.
   */
  stats: {
    totalStars: number;
    totalForks: number;
    totalCommits: number;
    totalRepos: number;
  };
  /** Injectable "now" for deterministic time rendering. Defaults to new Date(). */
  now?: Date;
}

export function ActivityBar({ repo, stats, now = new Date() }: Props) {
  return (
    <div className="activity-bar">
      {recentlyActive(repo.pushedAt, now) ? (
        <span className="live-pulse"></span>
      ) : (
        <span className="idle-pulse"></span>
      )}
      <span className="activity-text">
        <a
          className="activity-link"
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener"
        >
          {repo.name}
        </a>
        <span className="activity-separator">•</span>
        {/* Rendered unconditionally to match the Rails activity bar (home.html.erb:86),
            which — unlike the project card — does NOT guard language. null renders as
            nothing, preserving the 5-separator layout exactly as Rails does. */}
        {repo.language}
        <span className="activity-separator">•</span>
        ⭐ {humanizeCount(stats.totalStars)}
        <span className="activity-separator">•</span>
        ⊙ {humanizeCount(stats.totalCommits)}
        <span className="activity-separator">•</span>
        📦 {stats.totalRepos}
        <span className="activity-separator">•</span>
        <span className="activity-time">{detailedTimeAgo(repo.pushedAt, now)}</span>
      </span>
    </div>
  );
}
