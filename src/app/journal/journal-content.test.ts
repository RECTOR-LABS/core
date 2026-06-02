import { describe, it, expect } from "vitest";
import { loadPosts } from "@/lib/content/posts";

describe("journal content", () => {
  it("loads at least one published post from the real content dir", () => {
    const { published } = loadPosts(); // default dir = process.cwd()/content/journal
    expect(published.length).toBeGreaterThanOrEqual(1);
    expect(published.every((p) => p.body.length > 0)).toBe(true);
  });
});
