import { describe, it, expect } from "vitest";
import { pageMetadata } from "./seo";

// ---------------------------------------------------------------------------
// pageMetadata — the single shared SEO/metadata helper.
//
// It encapsulates the title suffix ("• RECTOR • Building for Eternity"), the
// og:title rule (drops the "• Building for Eternity" tail → "<title> • RECTOR"),
// the OG image (/og-image.png, 1200×630), the OG alt text, the site name, and
// the Twitter handle — so every indexable route returns identical SEO shape.
//
// Paths are RELATIVE: Next.js absolutises them against the root layout's
// `metadataBase` (https://rectorspace.com) at render time. These unit tests
// assert the relative shape; the HTML parity check (curl) covers absolutisation.
// ---------------------------------------------------------------------------

const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "RECTOR — Building for Eternity",
};

describe("pageMetadata — section page (title provided)", () => {
  const meta = pageMetadata({
    title: "Work",
    description: "Projects worth telling.",
    path: "/work",
    ogType: "website",
  });

  it("builds the full <title> with the • RECTOR • Building for Eternity suffix", () => {
    expect(meta.title).toBe("Work • RECTOR • Building for Eternity");
  });

  it("sets the canonical to the relative path", () => {
    expect(meta.alternates?.canonical).toBe("/work");
  });

  it("builds og:title dropping the • Building for Eternity tail", () => {
    expect(meta.openGraph?.title).toBe("Work • RECTOR");
  });

  it("sets openGraph.url to the relative path", () => {
    expect((meta.openGraph as { url?: string }).url).toBe("/work");
  });

  it("sets openGraph.type to the provided ogType", () => {
    expect((meta.openGraph as { type?: string }).type).toBe("website");
  });

  it("sets openGraph.siteName to RECTOR", () => {
    expect((meta.openGraph as { siteName?: string }).siteName).toBe("RECTOR");
  });

  it("carries the description into description and openGraph", () => {
    expect(meta.description).toBe("Projects worth telling.");
    expect(meta.openGraph?.description).toBe("Projects worth telling.");
  });

  it("sets openGraph.images[0] to the 1200×630 /og-image.png with alt", () => {
    const images = meta.openGraph?.images as Array<typeof OG_IMAGE>;
    expect(images[0]).toEqual(OG_IMAGE);
  });

  it("sets twitter.card to summary_large_image", () => {
    expect((meta.twitter as { card?: string }).card).toBe("summary_large_image");
  });

  it("sets twitter.site and twitter.creator to @RZ1989sol", () => {
    expect((meta.twitter as { site?: string }).site).toBe("@RZ1989sol");
    expect((meta.twitter as { creator?: string }).creator).toBe("@RZ1989sol");
  });

  it("sets twitter.title to the og:title and carries the description", () => {
    expect((meta.twitter as { title?: string }).title).toBe("Work • RECTOR");
    expect(meta.twitter?.description).toBe("Projects worth telling.");
  });

  it("sets twitter.images[0] to /og-image.png", () => {
    const images = (meta.twitter as { images?: string[] }).images;
    expect(images?.[0]).toBe("/og-image.png");
  });
});

describe("pageMetadata — homepage (no title)", () => {
  const meta = pageMetadata({
    description: "Full-stack builder.",
    path: "/",
    ogType: "website",
  });

  it("uses 'RECTOR • Building for Eternity' as the full <title> when no title is given", () => {
    expect(meta.title).toBe("RECTOR • Building for Eternity");
  });

  it("uses 'RECTOR • Building for Eternity' as og:title (same as the full title)", () => {
    expect(meta.openGraph?.title).toBe("RECTOR • Building for Eternity");
  });

  it("mirrors the homepage og:title in twitter.title", () => {
    expect((meta.twitter as { title?: string }).title).toBe(
      "RECTOR • Building for Eternity",
    );
  });

  it("sets canonical and openGraph.url to '/'", () => {
    expect(meta.alternates?.canonical).toBe("/");
    expect((meta.openGraph as { url?: string }).url).toBe("/");
  });
});

describe("pageMetadata — article page", () => {
  const meta = pageMetadata({
    title: "Understanding Vercel Usage",
    description: "A line-by-line tour.",
    path: "/journal/understanding-vercel-usage",
    ogType: "article",
  });

  it("builds the article full <title>", () => {
    expect(meta.title).toBe(
      "Understanding Vercel Usage • RECTOR • Building for Eternity",
    );
  });

  it("builds the article og:title", () => {
    expect(meta.openGraph?.title).toBe("Understanding Vercel Usage • RECTOR");
  });

  it("sets openGraph.type to article", () => {
    expect((meta.openGraph as { type?: string }).type).toBe("article");
  });

  it("sets canonical and openGraph.url to the article path", () => {
    expect(meta.alternates?.canonical).toBe(
      "/journal/understanding-vercel-usage",
    );
    expect((meta.openGraph as { url?: string }).url).toBe(
      "/journal/understanding-vercel-usage",
    );
  });

  it("still attaches the shared og:image and twitter:image", () => {
    const ogImages = meta.openGraph?.images as Array<typeof OG_IMAGE>;
    expect(ogImages[0]).toEqual(OG_IMAGE);
    const twImages = (meta.twitter as { images?: string[] }).images;
    expect(twImages?.[0]).toBe("/og-image.png");
  });
});

describe("pageMetadata — ogType defaulting", () => {
  it("defaults openGraph.type to 'website' when ogType is omitted", () => {
    const meta = pageMetadata({ description: "x", path: "/labs" });
    expect((meta.openGraph as { type?: string }).type).toBe("website");
  });
});
