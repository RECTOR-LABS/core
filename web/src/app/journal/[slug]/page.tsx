import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { loadPosts } from "@/lib/content/posts";
import { Markdown } from "@/components/Markdown";

// Memoised per render pass at build time — dedupes the three loadPosts() calls
// without coupling the pure loader module to React.
const getPosts = cache(() => loadPosts());

// Any slug not returned by generateStaticParams (including drafts) 404s automatically.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().published.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPosts().find(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/journal/${slug}`,
    ogType: "article",
  });
}

export default async function JournalPost(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPosts().find(slug);
  if (!post) notFound();
  const iso = post.date.toISOString().slice(0, 10);
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <article>
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-sm opacity-70 mb-8">
          <time dateTime={iso}>{iso}</time> · {post.readingMinutes} min read
        </p>
        <Markdown>{post.body}</Markdown>
      </article>
    </main>
  );
}
