import path from "node:path";
import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { loadPosts } from "@/lib/content/posts";
import { loadHackathons } from "@/lib/content/hackathons";
import { Markdown } from "@/components/Markdown";
import { HackathonRadar } from "@/components/islands/HackathonRadar";

// Memoised per render pass at build time — dedupes the three loadPosts() calls
// without coupling the pure loader module to React.
const getPosts = cache(() => loadPosts());
const getHackathons = cache((file: string) =>
  loadHackathons(path.join(process.cwd(), "data", file)),
);
const radarFile = (key: string | null) => (key ? `${key}.yml` : "hackathons.yml");

const RADAR_RE = /<!--RADAR(?::([a-z0-9-]+))?-->/;

/** Split a post body on the first RADAR marker (bare `<!--RADAR-->` or keyed `<!--RADAR:key-->`).
 *  Returns [intro, outro, key]; [body, null, null] when absent; key is null for the bare form. */
export function splitOnRadar(body: string): [string, string | null, string | null] {
  const m = RADAR_RE.exec(body);
  if (!m) return [body, null, null];
  return [body.slice(0, m.index), body.slice(m.index + m[0].length), m[1] ?? null];
}

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
  const [intro, outro, radarKey] = splitOnRadar(post.body);
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <article>
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-sm opacity-70 mb-8">
          <time dateTime={iso}>{iso}</time> · {post.readingMinutes} min read
        </p>
        <Markdown>{intro}</Markdown>
        {outro !== null && (() => {
          const { all, asOf, source, labels } = getHackathons(radarFile(radarKey));
          return (
            <>
              <HackathonRadar
                hackathons={all}
                asOf={asOf}
                source={source}
                correctionLabel={labels.correctionLabel}
                correctionsHeading={labels.correctionsHeading}
                correctionsStatLabel={labels.correctionsStatLabel}
              />
              <Markdown>{outro}</Markdown>
            </>
          );
        })()}
      </article>
    </main>
  );
}
