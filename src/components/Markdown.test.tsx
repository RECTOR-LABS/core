import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Markdown } from "./Markdown";

describe("Markdown", () => {
  it("renders GFM tables and links", () => {
    render(<Markdown>{"[x](https://e.com)\n\n| a | b |\n|---|---|\n| 1 | 2 |"}</Markdown>);
    expect(screen.getByRole("link", { name: "x" })).toHaveAttribute("href", "https://e.com");
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("opens links in a new tab with rel=noopener (mirrors the Rails markdown() helper)", () => {
    render(<Markdown>{"[x](https://e.com)"}</Markdown>);
    const link = screen.getByRole("link", { name: "x" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("defaults the prose wrapper to .prose-journal", () => {
    const { container } = render(<Markdown>{"hi"}</Markdown>);
    expect(container.querySelector(".prose-journal")).toBeInTheDocument();
  });

  it("uses a custom wrapper className when provided (Work story uses .story-content)", () => {
    const { container } = render(<Markdown className="story-content">{"hi"}</Markdown>);
    expect(container.querySelector(".story-content")).toBeInTheDocument();
    expect(container.querySelector(".prose-journal")).toBeNull();
  });
});
