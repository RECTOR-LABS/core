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
      <ul className="journal-list">
        {published.map((post) => {
          const iso = post.date.toISOString().slice(0, 10);
          return (
            <li key={post.slug} className="journal-list-item">
              <Link href={`/journal/${post.slug}`} className="journal-list-link">
                <h2 className="journal-list-title">{post.title}</h2>
              </Link>
              <div className="journal-list-meta">
                <time dateTime={iso}>{iso}</time> · {post.readingMinutes} min read
              </div>
              <p className="journal-list-summary">{post.summary}</p>
              {post.tags.length > 0 && (
                <div className="journal-tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="journal-tag">{tag}</span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
