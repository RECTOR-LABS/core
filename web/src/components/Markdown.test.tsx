import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Markdown } from "./Markdown";

describe("Markdown", () => {
  it("renders GFM tables and links", () => {
    render(<Markdown>{"[x](https://e.com)\n\n| a | b |\n|---|---|\n| 1 | 2 |"}</Markdown>);
    expect(screen.getByRole("link", { name: "x" })).toHaveAttribute("href", "https://e.com");
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
