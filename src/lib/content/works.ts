import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const Frontmatter = z.object({
  title: z.string(),
  slug: z.string().optional(),
  summary: z.string(),
  category: z.string(),
  status: z.string(),
  github_url: z.string().optional(),
  live_url: z.string().optional(),
  repo_name: z.string().optional(),
  started_at: z.coerce.date().optional(),
  launched_at: z.coerce.date().optional(),
  created_at: z.coerce.date(),
  featured: z.boolean().default(false),
  technologies: z.array(z.string()).default([]),
  github_stars: z.number().default(0),
  github_forks: z.number().default(0),
});

export interface Work {
  title: string;
  slug: string;
  summary: string;
  category: string;
  status: string;
  githubUrl?: string;
  liveUrl?: string;
  repoName?: string;
  startedAt?: Date;
  launchedAt?: Date;
  createdAt: Date;
  featured: boolean;
  technologies: string[];
  githubStars: number;
  githubForks: number;
  body: string;
}

const DEFAULT_DIR = path.join(process.cwd(), "content", "work");

export function loadWorks(dir: string = DEFAULT_DIR) {
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".md"))
    : [];

  const all: Work[] = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      let fm: z.infer<typeof Frontmatter>;
      try {
        fm = Frontmatter.parse(data);
      } catch (e) {
        throw new Error(`Invalid front matter in "${file}": ${String(e)}`);
      }
      return {
        title: fm.title,
        slug: fm.slug ?? file.replace(/\.md$/, ""),
        summary: fm.summary,
        category: fm.category,
        status: fm.status,
        githubUrl: fm.github_url,
        liveUrl: fm.live_url,
        repoName: fm.repo_name,
        startedAt: fm.started_at,
        launchedAt: fm.launched_at,
        createdAt: fm.created_at,
        featured: fm.featured,
        technologies: fm.technologies,
        githubStars: fm.github_stars,
        githubForks: fm.github_forks,
        body: content,
      };
    })
    .sort((a, b) => {
      // Mirror Rails `scope :recent, -> { order(created_at: :desc) }` — the base
      // order of the /work listing (@works = Work.published.recent). The view's
      // secondary `.order(launched_at: :desc)` is a no-op given created_at is
      // unique per row, so created_at DESC alone reproduces prod's order exactly.
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const published = all.filter((w) => w.status !== "Draft");

  return {
    all,
    published,
    featured: published.filter((w) => w.featured),
    recent: (limit = 5) => published.slice(0, limit),
    byCategory: (category: string) =>
      published.filter((w) => w.category === category),
    // drafts return undefined (404) — intentional, mirrors the journal section
    find: (slug: string) => published.find((w) => w.slug === slug),
  };
}
