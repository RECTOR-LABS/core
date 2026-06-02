import type { MetadataRoute } from "next";
import { loadWorks } from "@/lib/content/works";
import { loadPosts } from "@/lib/content/posts";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const { published: works } = loadWorks();
  const { published: posts } = loadPosts();

  return [
    // Homepage
    {
      url: `${SITE_URL}/`,
      changeFrequency: "monthly",
      priority: 1.0,
    },

    // Work index
    {
      url: `${SITE_URL}/work`,
      changeFrequency: "monthly",
      priority: 0.9,
    },

    // Individual work pages — use launchedAt if available, fall back to startedAt,
    // fall back to createdAt (always present).
    ...works.map((w) => ({
      url: `${SITE_URL}/work/${w.slug}`,
      lastModified: w.launchedAt ?? w.startedAt ?? w.createdAt,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),

    // Journal index
    {
      url: `${SITE_URL}/journal`,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    // Individual journal posts — date is always present.
    ...posts.map((p) => ({
      url: `${SITE_URL}/journal/${p.slug}`,
      lastModified: p.date,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
