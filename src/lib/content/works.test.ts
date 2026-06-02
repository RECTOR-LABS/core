import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { loadWorks } from "./works";

const DIR = path.join(__dirname, "__fixtures__/work");

describe("works", () => {
  it("loads all files, including drafts, into all[]", () => {
    const { all } = loadWorks(DIR);
    // 4 fixture files: alpha.md (slug: alpha-project), beta-project, gamma-draft, delta-no-dates
    expect(all).toHaveLength(4);
  });

  it("excludes drafts (status === 'Draft') from published", () => {
    const { all, published } = loadWorks(DIR);
    expect(all.some((w) => w.status === "Draft")).toBe(true);
    expect(published.every((w) => w.status !== "Draft")).toBe(true);
    expect(published).toHaveLength(3);
  });

  it("featured returns only published works with featured === true", () => {
    const { featured } = loadWorks(DIR);
    // gamma-draft has featured:true but is a Draft — must be excluded
    expect(featured.every((w) => w.featured && w.status !== "Draft")).toBe(true);
    expect(featured.map((w) => w.slug)).toEqual(["alpha-project"]);
  });

  it("byCategory filters published works and excludes drafts", () => {
    const { byCategory } = loadWorks(DIR);
    const blockchain = byCategory("Blockchain");
    expect(blockchain.every((w) => w.category === "Blockchain")).toBe(true);
    expect(blockchain.every((w) => w.status !== "Draft")).toBe(true);
    // gamma-draft is Blockchain but Draft — only alpha-project remains
    expect(blockchain.map((w) => w.slug)).toEqual(["alpha-project"]);

    const infra = byCategory("Infrastructure");
    expect(infra.map((w) => w.slug).sort()).toEqual(["beta-project", "delta-no-dates"]);
  });

  it("recent() respects the limit over published works only", () => {
    const { recent, published } = loadWorks(DIR);
    expect(recent(1)).toHaveLength(1);
    expect(recent(2)).toHaveLength(2);
    // default limit = 5, we only have 3 published
    expect(recent()).toHaveLength(3);
    expect(recent().every((w) => w.status !== "Draft")).toBe(true);
    // recent() is a prefix of published
    expect(recent(3)).toEqual(published.slice(0, 3));
  });

  it("find returns a published work by slug and returns undefined for drafts and unknowns", () => {
    const { find } = loadWorks(DIR);
    expect(find("alpha-project")?.title).toBe("Alpha Project");
    // draft slug — must NOT be findable
    expect(find("gamma-draft")).toBeUndefined();
    // completely unknown slug
    expect(find("does-not-exist")).toBeUndefined();
  });

  it("defaults slug to filename without .md when slug is absent from front matter", () => {
    const { all } = loadWorks(DIR);
    const beta = all.find((w) => w.title === "Beta Project");
    expect(beta?.slug).toBe("beta-project");
  });

  it("explicit slug in front matter overrides filename", () => {
    const { all } = loadWorks(DIR);
    // alpha.md (filename stem "alpha") declares slug: alpha-project in front
    // matter — the front-matter slug must win over the filename-derived one.
    const alpha = all.find((w) => w.title === "Alpha Project");
    expect(alpha?.slug).toBe("alpha-project");
    // nothing is keyed off the filename stem
    expect(all.some((w) => w.slug === "alpha")).toBe(false);
  });

  it("sorts all[] by createdAt descending (mirrors Rails .recent), independent of launchedAt", () => {
    const { all, published } = loadWorks(DIR);
    // all[] is monotonically descending by createdAt
    const created = all.map((w) => w.createdAt.getTime());
    for (let i = 0; i < created.length - 1; i++) {
      expect(created[i]).toBeGreaterThanOrEqual(created[i + 1]);
    }
    // Fixtures are crafted so createdAt order is the REVERSE of launchedAt order,
    // proving the sort key is createdAt (Rails `recent`), not launchedAt:
    // delta (newest created, no launch date) → beta → alpha (oldest created,
    // but the newest launched).
    expect(published.map((w) => w.slug)).toEqual([
      "delta-no-dates",
      "beta-project",
      "alpha-project",
    ]);
  });

  it("maps optional fields correctly — omitted live_url becomes undefined", () => {
    const { all } = loadWorks(DIR);
    const beta = all.find((w) => w.slug === "beta-project");
    expect(beta?.liveUrl).toBeUndefined();
    expect(beta?.githubUrl).toBeUndefined();
    const alpha = all.find((w) => w.slug === "alpha-project");
    expect(alpha?.liveUrl).toBe("https://alpha.rectorspace.com");
    expect(alpha?.githubStars).toBe(5);
    expect(alpha?.githubForks).toBe(1);
  });

  it("returns empty collections gracefully when dir does not exist", () => {
    const { all, published, featured, recent } = loadWorks("/no/such/dir");
    expect(all).toHaveLength(0);
    expect(published).toHaveLength(0);
    expect(featured).toHaveLength(0);
    expect(recent()).toHaveLength(0);
  });

  it("throws on invalid front matter with a descriptive message", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "works-test-"));
    fs.writeFileSync(
      path.join(tmp, "bad.md"),
      `---\nsummary: Missing required title and category\nstatus: Live\n---\nBody.\n`,
    );
    expect(() => loadWorks(tmp)).toThrow(/Invalid front matter in "bad\.md"/);
    fs.rmSync(tmp, { recursive: true });
  });
});
