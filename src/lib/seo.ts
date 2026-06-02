import type { Metadata } from "next";

// ---------------------------------------------------------------------------
// Shared SEO / metadata helper — the single source of truth for every
// indexable route's <title>, canonical, Open Graph, and Twitter card.
//
// Why this exists: the Rails layout emitted the same canonical + og:url +
// og:image + twitter block on every page via one shared template. In the
// Next port that shape was copy-pasted across five route files, and the title
// suffix in particular had already drifted once (the Journal route). This
// helper encapsulates it ONCE so the routes can't diverge again, and restores
// the og:image / twitter:image that the move off the opengraph-image file
// convention dropped.
//
// Paths are RELATIVE on purpose. The root layout sets
// `metadataBase: new URL(SITE_URL)` (lib/site.ts → https://rectorspace.com);
// Next.js resolves these relative paths against it at render time to emit
// absolute URLs. Never hardcode the domain here — that's metadataBase's job.
// ---------------------------------------------------------------------------

const SITE_NAME = "RECTOR";
const TITLE_SUFFIX = "Building for Eternity";

// Served by the /og-image.png Route Handler (src/app/og-image.png/route.ts).
// Already-shared social cards reference https://rectorspace.com/og-image.png,
// so this path must stay stable across the DNS cutover.
const OG_IMAGE_PATH = "/og-image.png";
const OG_IMAGE_ALT = "RECTOR — Building for Eternity";
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

const TWITTER_HANDLE = "@RZ1989sol";

export interface PageMetaInput {
  /**
   * The page-title segment, e.g. "Work" → "Work • RECTOR • Building for
   * Eternity". Omit for the homepage, whose title is just
   * "RECTOR • Building for Eternity".
   */
  title?: string;
  /** Meta description (also used for og:description and twitter:description). */
  description: string;
  /** Relative path for canonical + og:url, e.g. "/", "/work", "/work/core". */
  path: string;
  /** Open Graph type. Defaults to "website"; story/article pages pass "article". */
  ogType?: "website" | "article";
}

/**
 * Build the per-page {@link Metadata} object shared by every indexable route.
 *
 * - Full `<title>`:  `"<title> • RECTOR • Building for Eternity"`
 *   (homepage, no title segment: `"RECTOR • Building for Eternity"`).
 * - `og:title`:      drops the `• Building for Eternity` tail →
 *   `"<title> • RECTOR"` (homepage: same as the full title).
 * - `alternates.canonical` and `openGraph.url`: the relative `path`.
 * - `openGraph.images` / `twitter.images`: the shared `/og-image.png`.
 */
export function pageMetadata({
  title,
  description,
  path,
  ogType = "website",
}: PageMetaInput): Metadata {
  const fullTitle = title
    ? `${title} • ${SITE_NAME} • ${TITLE_SUFFIX}`
    : `${SITE_NAME} • ${TITLE_SUFFIX}`;
  const ogTitle = title ? `${title} • ${SITE_NAME}` : `${SITE_NAME} • ${TITLE_SUFFIX}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: ogType,
      url: path,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      images: [
        {
          url: OG_IMAGE_PATH,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title: ogTitle,
      description,
      images: [OG_IMAGE_PATH],
    },
  };
}
