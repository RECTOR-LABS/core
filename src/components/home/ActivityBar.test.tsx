import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityBar } from "./ActivityBar";
import type { Repo } from "@/lib/github/repos";

const NOW = new Date("2026-05-31T12:00:00Z");

const baseRepo: Repo = {
  fullName: "RECTOR-LABS/solis",
  name: "solis",
  description: "Solana signal aggregator",
  language: "TypeScript",
  htmlUrl: "https://github.com/RECTOR-LABS/solis",
  stargazersCount: 5,
  forksCount: 2,
  pushedAt: "2026-05-31T06:00:00Z", // 6 hours before NOW → recently active
  isFork: false,
  topics: [],
  account: "RECTOR-LABS",
  commitCount: 200,
  latestCommitSha: "abc1234",
};

const oldRepo: Repo = {
  ...baseRepo,
  pushedAt: "2026-05-26T12:00:00Z", // 5 days before NOW → NOT recently active
};

const stats = {
  totalStars: 1500,
  totalForks: 10,
  totalCommits: 350,
  totalRepos: 18,
};

describe("ActivityBar", () => {
  it("renders live-pulse span when pushed within last 24h", () => {
    const { container } = render(<ActivityBar repo={baseRepo} stats={stats} now={NOW} />);
    expect(container.querySelector(".live-pulse")).toBeInTheDocument();
    expect(container.querySelector(".idle-pulse")).toBeNull();
  });

  it("renders idle-pulse span when pushed more than 24h ago", () => {
    const { container } = render(<ActivityBar repo={oldRepo} stats={stats} now={NOW} />);
    expect(container.querySelector(".idle-pulse")).toBeInTheDocument();
    expect(container.querySelector(".live-pulse")).toBeNull();
  });

  it("renders repo name as an activity-link with correct href", () => {
    render(<ActivityBar repo={baseRepo} stats={stats} now={NOW} />);
    const link = screen.getByRole("link", { name: "solis" });
    expect(link).toHaveAttribute("href", "https://github.com/RECTOR-LABS/solis");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
    expect(link).toHaveClass("activity-link");
  });

  it("renders repo language in activity text", () => {
    const { container } = render(<ActivityBar repo={baseRepo} stats={stats} now={NOW} />);
    // Language is inline text in .activity-text — check textContent includes it
    const activityText = container.querySelector(".activity-text");
    expect(activityText?.textContent).toContain("TypeScript");
  });

  it("applies humanizeCount to totalStars (1500 → '1.5k')", () => {
    render(<ActivityBar repo={baseRepo} stats={stats} now={NOW} />);
    expect(screen.getByText(/⭐ 1.5k/)).toBeInTheDocument();
  });

  it("applies humanizeCount to totalCommits (350 → '350')", () => {
    render(<ActivityBar repo={baseRepo} stats={stats} now={NOW} />);
    expect(screen.getByText(/⊙ 350/)).toBeInTheDocument();
  });

  it("renders raw totalRepos count with 📦 emoji", () => {
    render(<ActivityBar repo={baseRepo} stats={stats} now={NOW} />);
    expect(screen.getByText(/📦 18/)).toBeInTheDocument();
  });

  it("renders detailedTimeAgo for a repo pushed 6h ago as '6h ago'", () => {
    render(<ActivityBar repo={baseRepo} stats={stats} now={NOW} />);
    expect(screen.getByText("6h ago")).toBeInTheDocument();
  });

  it("renders exactly 5 activity-separator dots between the 6 items", () => {
    const { container } = render(<ActivityBar repo={baseRepo} stats={stats} now={NOW} />);
    const separators = container.querySelectorAll(".activity-separator");
    expect(separators.length).toBe(5);
  });

  it("renders unconditionally with null language, preserving parity with Rails (5 separators, no crash)", () => {
    // The Rails activity bar (home.html.erb:86) renders language WITHOUT a present? guard,
    // unlike the project card. A null language must therefore render as nothing while the
    // layout (link + 5 separators) stays intact — NOT be suppressed.
    const noLang: Repo = { ...baseRepo, language: null };
    const { container } = render(<ActivityBar repo={noLang} stats={stats} now={NOW} />);
    expect(container.querySelectorAll(".activity-separator").length).toBe(5);
    expect(screen.getByRole("link", { name: "solis" })).toBeInTheDocument();
  });
});
