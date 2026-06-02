import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechStackBar } from "./TechStackBar";
import type { TechStack } from "@/lib/github/tech-stack";

const filledStack: TechStack = {
  allLanguages: { TypeScript: 8, Rust: 3, Python: 2, Shell: 2, JavaScript: 1 },
  categorized: {},
  primary: [
    { name: "TypeScript", count: 8, percentage: 44.4 },
    { name: "Rust", count: 3, percentage: 16.7 },
    { name: "Python", count: 2, percentage: 11.1 },
    { name: "Shell", count: 2, percentage: 11.1 },
    { name: "JavaScript", count: 1, percentage: 5.6 },
  ],
  totalRepos: 18,
};

const emptyStack: TechStack = {
  allLanguages: {},
  categorized: {},
  primary: [],
  totalRepos: 0,
};

describe("TechStackBar", () => {
  it("renders null (nothing) when primary is empty", () => {
    const { container } = render(<TechStackBar techStack={emptyStack} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the totalRepos count in the label", () => {
    render(<TechStackBar techStack={filledStack} />);
    expect(screen.getByText(/BUILDING ACROSS 18 REPOSITORIES/)).toBeInTheDocument();
  });

  it("renders all primary language names joined by ' • '", () => {
    render(<TechStackBar techStack={filledStack} />);
    expect(
      screen.getByText("TypeScript • Rust • Python • Shell • JavaScript")
    ).toBeInTheDocument();
  });

  it("renders the left-border accent container with correct classes", () => {
    const { container } = render(<TechStackBar techStack={filledStack} />);
    const bar = container.firstChild as HTMLElement;
    expect(bar).toHaveClass("mt-6");
    expect(bar).toHaveClass("border-l-4");
    expect(bar).toHaveClass("rounded");
  });
});
