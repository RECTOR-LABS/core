import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";

const Frontmatter = z.object({
  title: z.string(),
  slug: z.string().optional(),
  date: z.coerce.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export interface Post {
  title: string;
  slug: string;
  date: Date;
  summary: string;
  tags: string[];
  draft: boolean;
  body: string;
  readingMinutes: number;
}

const stripTableRows = (md: string) =>
  md
    .split("\n")
    .filter((l) => !/^\s*\|.*\|\s*$/.test(l))
    .join("\n");

const DEFAULT_DIR = path.join(process.cwd(), "content", "journal");

export function loadPosts(dir: string = DEFAULT_DIR) {
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(".md"))
    : [];

  const all: Post[] = files
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
        ...fm,
        slug: fm.slug ?? file.replace(/\.md$/, ""),
        body: content,
        readingMinutes: Math.max(
          1,
          Math.round(readingTime(stripTableRows(content)).minutes),
        ),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const published = all.filter((p) => !p.draft);

  return {
    all,
    published,
    recent: (limit = 5) => published.slice(0, limit),
    find: (slug: string) => published.find((p) => p.slug === slug),
  };
}
