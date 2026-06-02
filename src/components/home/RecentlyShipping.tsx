import type { Repo } from "@/lib/github/repos";
import { Fragment } from "react";

interface Props {
  repos: Repo[];
}

/**
 * Renders a comma-and-"and" joined list of repo links inline.
 *
 * Faithful port of ApplicationHelper#recently_shipping_list:
 *   1 repo  → link
 *   2 repos → link and link
 *   3+ repos → link, link and link
 */
export function RecentlyShipping({ repos }: Props) {
  if (repos.length === 0) {
    return null;
  }

  if (repos.length === 1) {
    const repo = repos[0];
    return (
      <strong>
        <a href={repo.htmlUrl} target="_blank" rel="noopener">
          {repo.name}
        </a>
      </strong>
    );
  }

  if (repos.length === 2) {
    return (
      <>
        <strong>
          <a href={repos[0].htmlUrl} target="_blank" rel="noopener">
            {repos[0].name}
          </a>
        </strong>
        {" and "}
        <strong>
          <a href={repos[1].htmlUrl} target="_blank" rel="noopener">
            {repos[1].name}
          </a>
        </strong>
      </>
    );
  }

  // 3+ repos: all-but-last joined by ", ", then " and ", then last
  const init = repos.slice(0, -1);
  const last = repos[repos.length - 1];

  return (
    <>
      {init.map((repo, i) => (
        <Fragment key={repo.htmlUrl}>
          <strong>
            <a href={repo.htmlUrl} target="_blank" rel="noopener">
              {repo.name}
            </a>
          </strong>
          {i < init.length - 1 ? ", " : ""}
        </Fragment>
      ))}
      {" and "}
      <strong>
        <a href={last.htmlUrl} target="_blank" rel="noopener">
          {last.name}
        </a>
      </strong>
    </>
  );
}
