import Link from "next/link";
import { loadPosts } from "@/lib/content/posts";

export const metadata = {
  title: "Journal — RECTOR",
  description: "Writings on building, security, and the craft.",
};

export default function JournalIndex() {
  const { published } = loadPosts();
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Journal</h1>
      <ul className="space-y-8">
        {published.map((post) => {
          const iso = post.date.toISOString().slice(0, 10);
          return (
            <li key={post.slug}>
              <Link href={`/journal/${post.slug}`} className="text-sky text-xl">
                {post.title}
              </Link>
              <p className="text-sm opacity-70">
                <time dateTime={iso}>{iso}</time> · {post.readingMinutes} min read
              </p>
              <p className="mt-1">{post.summary}</p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
