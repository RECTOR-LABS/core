import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "./ProjectCard";
import type { Repo } from "@/lib/github/repos";

// Fixed "now" so timeAgo assertions are deterministic
const NOW = new Date("2026-05-31T12:00:00Z");

const baseRepo: Repo = {
  fullName: "RECTOR-LABS/solis",
  name: "solis",
  description: "Solana Onchain & Landscape Intelligence Signal",
  language: "TypeScript",
  htmlUrl: "https://github.com/RECTOR-LABS/solis",
  stargazersCount: 3,
  forksCount: 1,
  pushedAt: "2026-05-26T12:00:00Z", // 5 days before NOW
  isFork: false,
  topics: [],
  account: "RECTOR-LABS",
  commitCount: 42,
  latestCommitSha: "abc1234",
};

const zeroRepo: Repo = {
  ...baseRepo,
  name: "bare-repo",
  description: null,
  language: null,
  htmlUrl: "https://github.com/RECTOR-LABS/bare-repo",
  stargazersCount: 0,
  forksCount: 0,
  commitCount: null,
  latestCommitSha: null,
};

describe("ProjectCard", () => {
  it("renders the project name as a link to htmlUrl", () => {
    render(<ProjectCard repo={baseRepo} now={NOW} />);
    const link = screen.getByRole("link", { name: "solis" });
    expect(link).toHaveAttribute("href", "https://github.com/RECTOR-LABS/solis");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("shows winner badge when winnerBadge prop is provided", () => {
    render(<ProjectCard repo={baseRepo} winnerBadge="🥇" now={NOW} />);
    expect(screen.getByText(/🥇 Winner/)).toBeInTheDocument();
    expect(screen.getByText(/🥇 Winner/)).toHaveClass("project-winner-badge");
  });

  it("does NOT render winner badge when winnerBadge is absent", () => {
    render(<ProjectCard repo={baseRepo} now={NOW} />);
    expect(screen.queryByText(/Winner/)).toBeNull();
  });

  it("renders description when present", () => {
    render(<ProjectCard repo={baseRepo} now={NOW} />);
    expect(screen.getByText("Solana Onchain & Landscape Intelligence Signal")).toBeInTheDocument();
  });

  it("does NOT render description when null", () => {
    render(<ProjectCard repo={zeroRepo} now={NOW} />);
    expect(screen.queryByText("Solana Onchain & Landscape Intelligence Signal")).toBeNull();
  });

  it("renders language dot and label when language is set", () => {
    const { container } = render(<ProjectCard repo={baseRepo} now={NOW} />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    // language dot span
    const dot = container.querySelector(".w-2.h-2.rounded-full.bg-sky-blue");
    expect(dot).toBeInTheDocument();
  });

  it("does NOT render language section when language is null", () => {
    render(<ProjectCard repo={zeroRepo} now={NOW} />);
    expect(screen.queryByText("TypeScript")).toBeNull();
  });

  it("renders stars stat when stargazersCount > 0", () => {
    render(<ProjectCard repo={baseRepo} now={NOW} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("does NOT render stars stat when stargazersCount is 0", () => {
    render(<ProjectCard repo={zeroRepo} now={NOW} />);
    // zeroRepo has 0 stars, 0 forks, null commits — those stat spans should not appear
    expect(screen.queryByText("0")).toBeNull();
  });

  it("renders forks stat when forksCount > 0", () => {
    render(<ProjectCard repo={baseRepo} now={NOW} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("does NOT render forks stat when forksCount is 0", () => {
    render(<ProjectCard repo={zeroRepo} now={NOW} />);
    expect(screen.queryByText("1")).toBeNull();
  });

  it("renders commit count when commitCount > 0", () => {
    render(<ProjectCard repo={baseRepo} now={NOW} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("does NOT render commit count when commitCount is null", () => {
    render(<ProjectCard repo={zeroRepo} now={NOW} />);
    expect(screen.queryByText("42")).toBeNull();
  });

  it("renders latestCommitSha pill when present", () => {
    render(<ProjectCard repo={baseRepo} now={NOW} />);
    expect(screen.getByText("abc1234")).toBeInTheDocument();
  });

  it("does NOT render sha pill when latestCommitSha is null", () => {
    render(<ProjectCard repo={zeroRepo} now={NOW} />);
    expect(screen.queryByText("abc1234")).toBeNull();
  });

  it("always renders timeAgo label (5 days ago for pushedAt 5d before now)", () => {
    render(<ProjectCard repo={baseRepo} now={NOW} />);
    expect(screen.getByText("5 days ago")).toBeInTheDocument();
  });

  it("wraps everything in a .project-card div", () => {
    const { container } = render(<ProjectCard repo={baseRepo} now={NOW} />);
    expect(container.firstChild).toHaveClass("project-card");
  });

  it("marks every decorative stat icon as aria-hidden", () => {
    // baseRepo has stars + forks + commits set, so all three icon SVGs render.
    const { container } = render(<ProjectCard repo={baseRepo} now={NOW} />);
    const svgs = Array.from(container.querySelectorAll("svg"));
    expect(svgs.length).toBe(3);
    for (const svg of svgs) {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    }
  });
});
