import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchRepos,
  latest,
  aggregateStats,
  recentlyActive,
  currentlyBuilding,
  DEFAULT_ACCOUNTS,
  type Repo,
} from "./repos";

// ---------------------------------------------------------------------------
// Helpers to build minimal GitHub API response shapes
// ---------------------------------------------------------------------------

function makeGithubRepo(overrides: Partial<{
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
  topics: string[];
  private: boolean;
}> = {}): Record<string, unknown> {
  return {
    id: 1,
    name: "my-repo",
    full_name: "rz1989s/my-repo",
    description: "A test repo",
    html_url: "https://github.com/rz1989s/my-repo",
    language: "TypeScript",
    stargazers_count: 5,
    forks_count: 2,
    pushed_at: "2026-01-15T10:00:00Z",
    fork: false,
    topics: ["solana", "web3"],
    private: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Fixture Repo[] for pure selector tests
// ---------------------------------------------------------------------------

const OLDER_DATE = "2025-06-01T00:00:00Z";
const NEWER_DATE = "2026-04-01T00:00:00Z";
const NEWEST_DATE = "2026-05-01T00:00:00Z";

function makeRepo(overrides: Partial<Repo> = {}): Repo {
  return {
    fullName: "rz1989s/repo-a",
    name: "repo-a",
    description: "desc",
    language: "TypeScript",
    htmlUrl: "https://github.com/rz1989s/repo-a",
    stargazersCount: 10,
    forksCount: 2,
    pushedAt: NEWER_DATE,
    isFork: false,
    topics: [],
    account: "rz1989s",
    commitCount: 100,
    latestCommitSha: "abc1234",
    ...overrides,
  };
}

const FIXTURE_REPOS: Repo[] = [
  makeRepo({ fullName: "rz1989s/repo-newest", name: "repo-newest", pushedAt: NEWEST_DATE, stargazersCount: 20, forksCount: 3, commitCount: 150 }),
  makeRepo({ fullName: "rz1989s/repo-newer", name: "repo-newer", pushedAt: NEWER_DATE, stargazersCount: 10, forksCount: 2, commitCount: 100 }),
  makeRepo({ fullName: "rz1989s/repo-older", name: "repo-older", pushedAt: OLDER_DATE, stargazersCount: 5, forksCount: 1, commitCount: 50 }),
  // A fork — must be excluded by all non-fork selectors
  makeRepo({ fullName: "rz1989s/forked-repo", name: "forked-repo", pushedAt: NEWEST_DATE, isFork: true, stargazersCount: 99, commitCount: 999 }),
  // A non-fork with null commitCount — aggregateStats must treat as 0
  makeRepo({ fullName: "rz1989s/no-commits", name: "no-commits", pushedAt: OLDER_DATE, commitCount: null }),
];

// ---------------------------------------------------------------------------
// Default mock setup — reset for each test
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// DEFAULT_ACCOUNTS
// ---------------------------------------------------------------------------

describe("DEFAULT_ACCOUNTS", () => {
  it("includes rz1989s and RECTOR-LABS", () => {
    expect(DEFAULT_ACCOUNTS).toContain("rz1989s");
    expect(DEFAULT_ACCOUNTS).toContain("RECTOR-LABS");
  });
});

// ---------------------------------------------------------------------------
// fetchRepos — pagination (rel="next" is followed)
// ---------------------------------------------------------------------------

describe("fetchRepos — pagination", () => {
  it("follows rel=next and concatenates both pages", async () => {
    const page1Repo = makeGithubRepo({ name: "page1-repo", full_name: "rz1989s/page1-repo" });
    const page2Repo = makeGithubRepo({ name: "page2-repo", full_name: "rz1989s/page2-repo" });

    const fetchMock = vi.fn();
    // Repos page 1 — has Link: rel="next"
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([page1Repo]),
      headers: new Headers({
        Link: '<https://api.github.com/users/rz1989s/repos?per_page=100&sort=pushed&page=2>; rel="next", <https://api.github.com/users/rz1989s/repos?per_page=100&sort=pushed&page=2>; rel="last"',
      }),
    });
    // Commit info for page1-repo
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ sha: "aabbccdd" }]),
      headers: new Headers({ Link: '<https://api.github.com/repos/rz1989s/page1-repo/commits?per_page=1&page=5>; rel="last"' }),
    });
    // Repos page 2 — no Link header (last page)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([page2Repo]),
      headers: new Headers(),
    });
    // Commit info for page2-repo
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ sha: "11223344" }]),
      headers: new Headers(),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchRepos(["rz1989s"]);

    expect(repos).toHaveLength(2);
    expect(repos.map((r) => r.name)).toContain("page1-repo");
    expect(repos.map((r) => r.name)).toContain("page2-repo");
  });
});

// ---------------------------------------------------------------------------
// fetchRepos — commit info parsing
// ---------------------------------------------------------------------------

describe("fetchRepos — commit info", () => {
  it("parses commitCount from rel=last Link header and slices sha to 7 chars", async () => {
    const repo = makeGithubRepo({ name: "my-repo", full_name: "rz1989s/my-repo" });

    const fetchMock = vi.fn();
    // Repos page
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([repo]),
      headers: new Headers(),
    });
    // Commit info — Link has rel=last at page=42
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ sha: "abcdef1234567890" }]),
      headers: new Headers({
        Link: '<https://api.github.com/repos/rz1989s/my-repo/commits?per_page=1&page=42>; rel="last"',
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchRepos(["rz1989s"]);
    expect(repos).toHaveLength(1);
    expect(repos[0].commitCount).toBe(42);
    expect(repos[0].latestCommitSha).toBe("abcdef1"); // first 7 chars
  });

  it("defaults commitCount to 1 when commits exist but no Link header", async () => {
    const repo = makeGithubRepo({ name: "my-repo", full_name: "rz1989s/my-repo" });

    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([repo]),
      headers: new Headers(),
    });
    // Commit response: one commit, no Link header
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ sha: "deadbeef" }]),
      headers: new Headers(),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchRepos(["rz1989s"]);
    expect(repos[0].commitCount).toBe(1);
    expect(repos[0].latestCommitSha).toBe("deadbee");
  });

  it("returns null commitCount and null sha when commits fetch fails (non-2xx)", async () => {
    const repo = makeGithubRepo({ name: "my-repo", full_name: "rz1989s/my-repo" });

    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([repo]),
      headers: new Headers(),
    });
    // Commit fetch fails
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: "Not Found" }),
      headers: new Headers(),
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchRepos(["rz1989s"]);
    expect(repos[0].commitCount).toBeNull();
    expect(repos[0].latestCommitSha).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// fetchRepos — Authorization header
// ---------------------------------------------------------------------------

describe("fetchRepos — Authorization header", () => {
  it("includes Authorization: Bearer when GITHUB_TOKEN is set", async () => {
    vi.stubEnv("GITHUB_TOKEN", "ghp_test_token_xyz");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchRepos(["rz1989s"]);

    // First call is the repos list
    const [, initArg] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = initArg.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer ghp_test_token_xyz");
  });

  it("omits Authorization header when GITHUB_TOKEN is not set", async () => {
    // Ensure the env var is absent
    vi.stubEnv("GITHUB_TOKEN", undefined as unknown as string);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchRepos(["rz1989s"]);

    const [, initArg] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = initArg.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// fetchRepos — ISR revalidate option
// ---------------------------------------------------------------------------

describe("fetchRepos — ISR revalidate", () => {
  it("passes next: { revalidate: 3600 } in every fetch call", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchRepos(["rz1989s"]);

    for (const [, initArg] of fetchMock.mock.calls as [string, RequestInit][]) {
      expect((initArg as { next?: { revalidate?: number } }).next?.revalidate).toBe(3600);
    }
  });
});

// ---------------------------------------------------------------------------
// fetchRepos — field mapping
// ---------------------------------------------------------------------------

describe("fetchRepos — field mapping", () => {
  it("maps fork→isFork, topics defaults to [], null description preserved", async () => {
    const forkedRepo = makeGithubRepo({
      name: "forked",
      full_name: "rz1989s/forked",
      fork: true,
      topics: undefined as unknown as string[], // simulate GitHub omitting the field
      description: null,
      language: null,
    });

    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([forkedRepo]),
      headers: new Headers(),
    });
    // Commit info
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ sha: "aabbccdd" }]),
      headers: new Headers(),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchRepos(["rz1989s"]);
    expect(repos).toHaveLength(1);
    expect(repos[0].isFork).toBe(true);
    expect(repos[0].topics).toEqual([]);
    expect(repos[0].description).toBeNull();
    expect(repos[0].language).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// fetchRepos — graceful degradation on non-2xx account response
// ---------------------------------------------------------------------------

describe("fetchRepos — graceful degradation", () => {
  it("non-2xx repos response: that account contributes nothing and console.error is called", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ message: "Forbidden" }),
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchRepos(["bad-account"]);

    expect(repos).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalled();
    // The error message must include something actionable (status + context)
    const errorMsg: string = consoleSpy.mock.calls[0][0] as string;
    expect(errorMsg).toMatch(/403/);
  });

  it("network error on repos fetch: that account contributes nothing and console.error is called", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchRepos(["bad-account"]);

    expect(repos).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("one bad account does not prevent other accounts from loading", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const goodRepo = makeGithubRepo({ name: "good-repo", full_name: "RECTOR-LABS/good-repo" });

    const fetchMock = vi.fn();
    // bad-account fails
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}), headers: new Headers() });
    // RECTOR-LABS succeeds
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([goodRepo]), headers: new Headers() });
    // Commit info for good-repo
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([{ sha: "deadbeef" }]), headers: new Headers() });

    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchRepos(["bad-account", "RECTOR-LABS"]);

    expect(repos).toHaveLength(1);
    expect(repos[0].name).toBe("good-repo");
    expect(consoleSpy).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Pure selectors — all operate on FIXTURE_REPOS
// ---------------------------------------------------------------------------

describe("latest()", () => {
  it("excludes forks", () => {
    const result = latest(FIXTURE_REPOS);
    expect(result.every((r) => !r.isFork)).toBe(true);
  });

  it("sorts by pushedAt descending (newest first)", () => {
    const result = latest(FIXTURE_REPOS);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].pushedAt >= result[i + 1].pushedAt).toBe(true);
    }
  });

  it("limits to n=6 by default", () => {
    // Expand fixture with extra non-forks to exceed default limit
    const big: Repo[] = Array.from({ length: 10 }, (_, i) =>
      makeRepo({ fullName: `rz1989s/r${i}`, name: `r${i}`, pushedAt: `2026-0${(i % 9) + 1}-01T00:00:00Z` })
    );
    expect(latest(big).length).toBeLessThanOrEqual(6);
  });

  it("respects a custom n limit", () => {
    const result = latest(FIXTURE_REPOS, 2);
    expect(result).toHaveLength(2);
    // First result must be the most recent non-fork
    expect(result[0].name).toBe("repo-newest");
  });
});

describe("aggregateStats()", () => {
  it("excludes forks from all counters", () => {
    const { totalStars } = aggregateStats(FIXTURE_REPOS);
    // Fork has stargazersCount=99 — must not appear in sum.
    // no-commits uses makeRepo() default stargazersCount=10.
    expect(totalStars).toBe(20 + 10 + 5 + 10); // repo-newest + repo-newer + repo-older + no-commits
  });

  it("treats commitCount:null as 0 (faithful to Rails sum which skips nil)", () => {
    const { totalCommits } = aggregateStats(FIXTURE_REPOS);
    // 150 + 100 + 50 + 0 (null treated as 0), fork excluded
    expect(totalCommits).toBe(300);
  });

  it("totalRepos counts only non-forks", () => {
    const { totalRepos } = aggregateStats(FIXTURE_REPOS);
    // 5 total fixtures, 1 fork → 4 non-forks
    expect(totalRepos).toBe(4);
  });

  it("totalForks sums non-fork repos' fork counts correctly", () => {
    const { totalForks } = aggregateStats(FIXTURE_REPOS);
    // 3 + 2 + 1 + 0 (no-commits has forksCount=2 from makeRepo default)
    expect(totalForks).toBe(3 + 2 + 1 + 2); // repo-newest + repo-newer + repo-older + no-commits
  });
});

describe("recentlyActive()", () => {
  it("excludes forks", () => {
    const result = recentlyActive(FIXTURE_REPOS);
    expect(result.every((r) => !r.isFork)).toBe(true);
  });

  it("returns the top n by pushedAt desc (default 3)", () => {
    const result = recentlyActive(FIXTURE_REPOS);
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("repo-newest");
    expect(result[1].name).toBe("repo-newer");
  });

  it("respects custom n", () => {
    const result = recentlyActive(FIXTURE_REPOS, 2);
    expect(result).toHaveLength(2);
  });
});

describe("currentlyBuilding()", () => {
  it("returns the single most recently pushed non-fork repo", () => {
    const result = currentlyBuilding(FIXTURE_REPOS);
    expect(result).not.toBeNull();
    expect(result!.name).toBe("repo-newest");
  });

  it("returns null when all repos are forks", () => {
    const allForks: Repo[] = [
      makeRepo({ isFork: true }),
      makeRepo({ fullName: "rz1989s/fork2", name: "fork2", isFork: true }),
    ];
    expect(currentlyBuilding(allForks)).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(currentlyBuilding([])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// fetchRepos — pagination cycle terminates (visited-URL Set guard)
// ---------------------------------------------------------------------------

describe("fetchRepos — pagination cycle guard", () => {
  it("resolves without hanging when rel=next is a self-referential URL, warns once, and fetches the page only once", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const repoData = makeGithubRepo({ name: "cycle-repo", full_name: "x/cycle-repo" });

    const pageUrl = "https://api.github.com/users/x/repos?per_page=100&sort=pushed&page=1";

    const fetchMock = vi.fn();
    // The repos response — Link rel="next" points at the SAME URL (self-reference)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([repoData]),
      headers: new Headers({
        Link: `<${pageUrl}>; rel="next"`,
      }),
    });
    // Commit info for cycle-repo
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ sha: "cafebabe" }]),
      headers: new Headers(),
    });

    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchRepos(["x"]);

    // Resolves with the one repo that was fetched
    expect(repos).toHaveLength(1);
    expect(repos[0].name).toBe("cycle-repo");

    // Visited-Set guard fired: console.warn must have been called
    expect(warnSpy).toHaveBeenCalled();
    const warnMsg: string = warnSpy.mock.calls[0][0] as string;
    expect(warnMsg).toMatch(/cycle/i);
    expect(warnMsg).toMatch(/"x"/);

    // The repos-list endpoint was fetched exactly once — cycle didn't repeat
    const reposListCalls = (fetchMock.mock.calls as [string, unknown][]).filter(
      ([url]) => (url as string).includes("/users/x/repos"),
    );
    expect(reposListCalls).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// fetchRepos — empty accounts array
// ---------------------------------------------------------------------------

describe("fetchRepos — empty accounts", () => {
  it("returns [] immediately and never calls fetch when accounts is empty", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchRepos([]);

    expect(repos).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
