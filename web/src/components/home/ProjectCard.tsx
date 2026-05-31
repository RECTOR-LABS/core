import type { Repo } from "@/lib/github/repos";
import { timeAgo } from "@/lib/repo-time";

interface Props {
  repo: Repo;
  /** Badge emoji when this repo is a hackathon/bounty winner (e.g. "🥇"). Omit when not a winner. */
  winnerBadge?: string;
  /** Injectable "now" for deterministic time rendering. Defaults to new Date(). */
  now?: Date;
}

export function ProjectCard({ repo, winnerBadge, now = new Date() }: Props) {
  return (
    <div className="project-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="mb-0 font-semibold truncate">
            <a href={repo.htmlUrl} target="_blank" rel="noopener">
              {repo.name}
            </a>
            {winnerBadge !== undefined && (
              <span className="project-winner-badge ml-1">{winnerBadge} Winner</span>
            )}
          </p>
          {repo.description !== null && repo.description !== "" && (
            <p className="text-sm text-[#3B2C22]/70 mt-1 mb-0">{repo.description}</p>
          )}
        </div>
      </div>
      <div className="project-stats">
        {repo.language !== null && (
          <span className="project-stat">
            <span className="w-2 h-2 rounded-full bg-sky-blue"></span>
            {repo.language}
          </span>
        )}
        {repo.stargazersCount > 0 && (
          <span className="project-stat">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
            </svg>
            {repo.stargazersCount}
          </span>
        )}
        {repo.forksCount > 0 && (
          <span className="project-stat">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
            </svg>
            {repo.forksCount}
          </span>
        )}
        {(repo.commitCount ?? 0) > 0 && (
          <span className="project-stat">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
            </svg>
            {repo.commitCount}
          </span>
        )}
        {repo.latestCommitSha !== null && (
          <span className="project-stat font-mono text-[10px] text-[#3B2C22]/50">
            {repo.latestCommitSha}
          </span>
        )}
        <span className="project-stat ml-auto">{timeAgo(repo.pushedAt, now)}</span>
      </div>
    </div>
  );
}
