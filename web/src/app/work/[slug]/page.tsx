import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { loadWorks } from "@/lib/content/works";
import { Markdown } from "@/components/Markdown";

// Memoised per render pass at build time — dedupes the three loadWorks() calls
// without coupling the pure loader module to React.
const getWorks = cache(() => loadWorks());

// Any slug not returned by generateStaticParams (including drafts) 404s automatically.
export const dynamicParams = false;

export function generateStaticParams() {
  return getWorks().published.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorks().find(slug);
  if (!work) return {};
  return {
    title: `${work.title} — RECTOR`,
    description: work.summary,
    openGraph: { type: "article", title: work.title, description: work.summary },
  };
}

// Rails strftime("%B %Y") equivalent — MUST use timeZone: "UTC" because dates are
// stored as UTC midnight (e.g. 2025-12-01T00:00:00Z). Without the explicit timeZone,
// a behind-UTC locale would shift Dec 1 → Nov 30, rendering "November 2025".
// Canary: sip-protocol launched_at 2025-12-01 must render "December 2025".
function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function WorkStory(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const work = getWorks().find(slug);
  if (!work) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <Link href="/work" className="text-[#41CFFF] hover:text-[#E58C2E] transition-colors">
          ← Back to Work
        </Link>
      </div>
      <article className="max-w-none">
        <header className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b-2 border-[#3B2C22]/10">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4 text-[#3B2C22]">{work.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#3B2C22]/60 mb-4">
            <span className="px-3 py-1 bg-[#A8E063] text-[#3B2C22] font-medium rounded">
              {work.status}
            </span>
            <span>{work.category}</span>
            {work.startedAt && (
              <>
                <span>•</span>
                <span>Started {formatMonthYear(work.startedAt)}</span>
              </>
            )}
            {work.launchedAt && (
              <>
                <span>•</span>
                <span>Launched {formatMonthYear(work.launchedAt)}</span>
              </>
            )}
          </div>
          {work.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {work.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-[#3B2C22]/5 text-[#3B2C22] text-xs font-medium rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-4">
            {work.githubUrl && (
              // rel="noopener" — verbatim from Rails source (NOT noopener noreferrer)
              <a
                href={work.githubUrl}
                target="_blank"
                rel="noopener"
                className="text-[#41CFFF] hover:text-[#E58C2E] transition-colors"
              >
                GitHub →
              </a>
            )}
            {work.liveUrl && (
              // rel="noopener" — verbatim from Rails source (NOT noopener noreferrer)
              <a
                href={work.liveUrl}
                target="_blank"
                rel="noopener"
                className="text-[#41CFFF] hover:text-[#E58C2E] transition-colors"
              >
                Live Site →
              </a>
            )}
          </div>
        </header>
        <div className="story-content text-[#3B2C22]">
          <Markdown>{work.body}</Markdown>
        </div>
      </article>
    </div>
  );
}
