import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadPosts } from "@/lib/content/posts";
import { Markdown } from "@/components/Markdown";

// Any slug not returned by generateStaticParams (including drafts) 404s automatically.
export const dynamicParams = false;

export function generateStaticParams() {
  return loadPosts().published.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = loadPosts().find(slug);
  if (!post) return {};
  return {
    title: `${post.title} — RECTOR`,
    description: post.summary,
    openGraph: { type: "article", title: post.title, description: post.summary },
  };
}

export default async function JournalPost(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = loadPosts().find(slug);
  if (!post) notFound();
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="text-sm opacity-70 mb-8">
        {post.date.toISOString().slice(0, 10)} · {post.readingMinutes} min read
      </p>
      <Markdown>{post.body}</Markdown>
    </main>
  );
}
