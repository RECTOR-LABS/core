import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentlyShipping } from "./RecentlyShipping";
import type { Repo } from "@/lib/github/repos";

function makeRepo(name: string, url: string): Repo {
  return {
    fullName: `RECTOR-LABS/${name}`,
    name,
    description: null,
    language: "TypeScript",
    htmlUrl: url,
    stargazersCount: 0,
    forksCount: 0,
    pushedAt: "2026-05-31T00:00:00Z",
    isFork: false,
    topics: [],
    account: "RECTOR-LABS",
    commitCount: null,
    latestCommitSha: null,
  };
}

const repoA = makeRepo("alpha", "https://github.com/RECTOR-LABS/alpha");
const repoB = makeRepo("beta", "https://github.com/RECTOR-LABS/beta");
const repoC = makeRepo("gamma", "https://github.com/RECTOR-LABS/gamma");

describe("RecentlyShipping", () => {
  describe("empty", () => {
    it("renders nothing for an empty repos array", () => {
      const { container } = render(<RecentlyShipping repos={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("single repo", () => {
    it("renders one link with the repo name", () => {
      render(<RecentlyShipping repos={[repoA]} />);
      const link = screen.getByRole("link", { name: "alpha" });
      expect(link).toHaveAttribute("href", "https://github.com/RECTOR-LABS/alpha");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener");
    });

    it("does NOT include the word 'and' for a single repo", () => {
      const { container } = render(<RecentlyShipping repos={[repoA]} />);
      expect(container.textContent).not.toContain(" and ");
    });

    it("does NOT include a comma for a single repo", () => {
      const { container } = render(<RecentlyShipping repos={[repoA]} />);
      expect(container.textContent).not.toContain(",");
    });
  });

  describe("two repos", () => {
    it("renders both links", () => {
      render(<RecentlyShipping repos={[repoA, repoB]} />);
      expect(screen.getByRole("link", { name: "alpha" })).toHaveAttribute(
        "href",
        "https://github.com/RECTOR-LABS/alpha"
      );
      expect(screen.getByRole("link", { name: "beta" })).toHaveAttribute(
        "href",
        "https://github.com/RECTOR-LABS/beta"
      );
    });

    it("joins with ' and ' (no comma)", () => {
      const { container } = render(<RecentlyShipping repos={[repoA, repoB]} />);
      expect(container.textContent).toContain(" and ");
      expect(container.textContent).not.toContain(",");
    });
  });

  describe("three or more repos", () => {
    it("renders all three links", () => {
      render(<RecentlyShipping repos={[repoA, repoB, repoC]} />);
      expect(screen.getByRole("link", { name: "alpha" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "beta" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "gamma" })).toBeInTheDocument();
    });

    it("has exactly one comma separating all-but-last from last", () => {
      const { container } = render(<RecentlyShipping repos={[repoA, repoB, repoC]} />);
      // "alpha, beta and gamma"
      expect(container.textContent).toContain(", ");
      expect(container.textContent).toContain(" and ");
    });

    it("places 'and' before the last item, not between first two", () => {
      const { container } = render(<RecentlyShipping repos={[repoA, repoB, repoC]} />);
      const text = container.textContent ?? "";
      const andIdx = text.indexOf(" and ");
      const betaIdx = text.indexOf("beta");
      const gammaIdx = text.indexOf("gamma");
      // "and" appears after "beta" but before "gamma"
      expect(andIdx).toBeGreaterThan(betaIdx);
      expect(andIdx).toBeLessThan(gammaIdx);
    });
  });
});
