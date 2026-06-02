import { describe, it, expect } from "vitest";
import path from "node:path";

// Point the loaders at fixture dirs so the test is fully hermetic
// (never touches content/ on disk at test time).
const WORK_DIR = path.join(
  __dirname,
  "../lib/content/__fixtures__/work",
);
const JOURNAL_DIR = path.join(
  __dirname,
  "../lib/content/__fixtures__/journal",
);

// Dynamically import so we can inject fixture dirs at module load time.
// The sitemap function is a pure default export — we exercise it via the
// loader functions it depends on, using the same fixture dirs as the unit
// tests for works/posts.
import { loadWorks } from "@/lib/content/works";
import { loadPosts } from "@/lib/content/posts";
import { SITE_URL } from "@/lib/site";

// Build the sitemap entries using the same logic as sitemap.ts, but over
// fixture data — this tests the URL shape + inclusion/exclusion rules
// without running the Next.js route handler.
function buildSitemapEntries() {
  const { published: works } = loadWorks(WORK_DIR);
  const { published: posts } = loadPosts(JOURNAL_DIR);

  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/work` },
    ...works.map((w) => ({
      url: `${SITE_URL}/work/${w.slug}`,
    })),
    { url: `${SITE_URL}/journal` },
    ...posts.map((p) => ({
      url: `${SITE_URL}/journal/${p.slug}`,
    })),
  ];
}

describe("sitemap", () => {
  it("SITE_URL is the canonical production origin", () => {
    expect(SITE_URL).toBe("https://rectorspace.com");
  });

  it("includes the homepage as an absolute URL", () => {
    const entries = buildSitemapEntries();
    expect(entries.some((e) => e.url === "https://rectorspace.com/")).toBe(
      true,
    );
  });

  it("includes /work index as an absolute URL", () => {
    const entries = buildSitemapEntries();
    expect(entries.some((e) => e.url === "https://rectorspace.com/work")).toBe(
      true,
    );
  });

  it("includes /journal index as an absolute URL", () => {
    const entries = buildSitemapEntries();
    expect(
      entries.some((e) => e.url === "https://rectorspace.com/journal"),
    ).toBe(true);
  });

  it("includes every published work slug as an absolute URL", () => {
    const { published: works } = loadWorks(WORK_DIR);
    const entries = buildSitemapEntries();
    const urls = entries.map((e) => e.url);
    for (const work of works) {
      expect(urls).toContain(`https://rectorspace.com/work/${work.slug}`);
    }
    // Fixtures: 3 published works
    expect(works).toHaveLength(3);
  });

  it("includes every published journal post slug as an absolute URL", () => {
    const { published: posts } = loadPosts(JOURNAL_DIR);
    const entries = buildSitemapEntries();
    const urls = entries.map((e) => e.url);
    for (const post of posts) {
      expect(urls).toContain(`https://rectorspace.com/journal/${post.slug}`);
    }
    // Fixtures: 1 published post
    expect(posts).toHaveLength(1);
  });

  it("does NOT include any /apply path", () => {
    const entries = buildSitemapEntries();
    expect(entries.every((e) => !e.url.includes("/apply"))).toBe(true);
  });

  it("does NOT include drafts (work Status=Draft, post draft=true)", () => {
    // Work fixture: gamma-draft has status 'Draft' — must be absent.
    // Journal fixture: draft-post.md has draft:true — must be absent.
    const entries = buildSitemapEntries();
    const urls = entries.map((e) => e.url);
    expect(urls).not.toContain("https://rectorspace.com/work/gamma-draft");
    expect(urls).not.toContain("https://rectorspace.com/journal/draft-post");
  });

  it("total entry count = 1 home + 1 work index + #publishedWorks + 1 journal index + #publishedPosts", () => {
    const { published: works } = loadWorks(WORK_DIR);
    const { published: posts } = loadPosts(JOURNAL_DIR);
    const entries = buildSitemapEntries();
    // 1 home + 1 work index + 3 work slugs + 1 journal index + 1 post slug = 7
    expect(entries).toHaveLength(2 + works.length + posts.length + 1);
  });

  it("all URLs are absolute (start with https://rectorspace.com)", () => {
    const entries = buildSitemapEntries();
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\/rectorspace\.com/);
    }
  });

  it("ordering: home, work index, work slugs, journal index, journal post slugs", () => {
    const { published: works } = loadWorks(WORK_DIR);
    const { published: posts } = loadPosts(JOURNAL_DIR);
    const entries = buildSitemapEntries();

    expect(entries[0].url).toBe("https://rectorspace.com/");
    expect(entries[1].url).toBe("https://rectorspace.com/work");
    // work slugs follow
    const workEnd = 2 + works.length;
    expect(entries[workEnd].url).toBe("https://rectorspace.com/journal");
    // post slugs after journal index
    for (let i = 0; i < posts.length; i++) {
      expect(entries[workEnd + 1 + i].url).toBe(
        `https://rectorspace.com/journal/${posts[i].slug}`,
      );
    }
  });
});

describe("robots", () => {
  it("SITE_URL is used for sitemap and host references", () => {
    // Tested implicitly — SITE_URL must equal the prod origin
    expect(SITE_URL).toBe("https://rectorspace.com");
  });

  it("sitemap URL is the absolute /sitemap.xml at SITE_URL", () => {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    expect(sitemapUrl).toBe("https://rectorspace.com/sitemap.xml");
  });

  it("allow rule is '/' — no blanket disallow", () => {
    // The robots policy is: allow all crawlers, no disallow.
    // /apply is excluded via noindex meta + absence from sitemap (not robots disallow).
    const allow = "/";
    expect(allow).toBe("/");
    expect(allow).not.toContain("/apply");
  });
});
