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

// The hermetic tests below rebuild the sitemap entries over fixture dirs,
// because the real sitemap() reads content/ with no args and can't be pointed
// at fixtures. A separate smoke test exercises the real sitemap()/robots()
// default exports for their structural invariants.
import sitemap from "./sitemap";
import robots from "./robots";
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

  it("total entry count = static routes + #publishedWorks + #publishedPosts", () => {
    const { published: works } = loadWorks(WORK_DIR);
    const { published: posts } = loadPosts(JOURNAL_DIR);
    const entries = buildSitemapEntries();
    const STATIC_ROUTES = 3; // home + /work index + /journal index
    expect(entries).toHaveLength(STATIC_ROUTES + works.length + posts.length);
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

  it("the real sitemap() export yields absolute, /apply-free entries", () => {
    // Exercises the actual default export over real content/ (not fixtures);
    // asserts structural invariants only, so adding works/posts won't break it.
    const entries = sitemap();
    expect(entries.length).toBeGreaterThanOrEqual(3);
    for (const e of entries) {
      expect(e.url).toMatch(/^https:\/\/rectorspace\.com/);
      expect(e.url).not.toContain("/apply");
    }
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://rectorspace.com/");
    expect(urls).toContain("https://rectorspace.com/work");
    expect(urls).toContain("https://rectorspace.com/journal");
  });
});

describe("robots", () => {
  // Exercise the real robots() default export — it's pure (no content dependency),
  // so we assert its actual output rather than restating constants.
  it("allows all crawlers with no disallow", () => {
    const { rules } = robots();
    const first = Array.isArray(rules) ? rules[0] : rules;
    expect(first?.userAgent).toBe("*");
    expect(first?.allow).toBe("/");
    expect(first?.disallow).toBeUndefined();
  });

  it("does NOT disallow /apply (noindex meta handles exclusion)", () => {
    const { rules } = robots();
    const first = Array.isArray(rules) ? rules[0] : rules;
    const disallow = first?.disallow;
    const list = Array.isArray(disallow) ? disallow : disallow ? [disallow] : [];
    expect(list.some((d) => d.includes("/apply"))).toBe(false);
  });

  it("references the absolute sitemap and host at SITE_URL", () => {
    const r = robots();
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(r.host).toBe(SITE_URL);
  });
});
