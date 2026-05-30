import { describe, it, expect } from "vitest";
import path from "node:path";
import { loadPosts } from "./posts";

const DIR = path.join(__dirname, "__fixtures__/journal");

describe("posts", () => {
  it("excludes drafts from published and includes them in all", () => {
    const { all, published } = loadPosts(DIR);
    expect(all.map((p) => p.slug).sort()).toEqual(["draft-post", "live-post"]);
    expect(published.map((p) => p.slug)).toEqual(["live-post"]);
  });

  it("defaults slug to filename and sorts published newest-first", () => {
    const { published } = loadPosts(DIR);
    expect(published[0].slug).toBe("live-post");
  });

  it("excludes table rows from reading time (fails if stripping is removed)", () => {
    const dir = path.join(__dirname, "__fixtures__/reading-time");
    const { published } = loadPosts(dir);
    // Prose alone ≈ 0 min → clamped to 1. If table rows were counted, this would be ≥ 2.
    expect(published[0].readingMinutes).toBe(1);
  });

  it("finds a published post by slug and ignores drafts", () => {
    const { find } = loadPosts(DIR);
    expect(find("live-post")?.title).toBe("Live Post");
    expect(find("draft-post")).toBeUndefined();
  });
});
