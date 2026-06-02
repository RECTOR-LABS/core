import { renderOgImage } from "@/lib/og/render";

// ---------------------------------------------------------------------------
// /og-image.png — production-parity Open Graph image endpoint.
//
// The live Rails site serves its OG image as a static file at
// https://rectorspace.com/og-image.png, and every page's og:image /
// twitter:image meta points there. Already-shared LinkedIn/Twitter/Telegram
// cards reference that exact URL, so after the DNS cutover this Next app MUST
// keep serving the image at /og-image.png (not the /opengraph-image
// file-convention path).
//
// A folder named "og-image.png" containing a route.ts maps to the literal
// path /og-image.png — the same dotted-segment pattern the Next docs use for
// app/rss.xml/route.ts (see "Non-UI Responses" in the route.js reference).
//
// Route Handlers are dynamic by default; this image is fully static (its only
// data comes from a build-time YAML read with no request input), so we opt
// into static generation to prerender it once at build time — matching the
// previous static-file behavior and avoiding per-request Satori rendering.
// ---------------------------------------------------------------------------
export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  return renderOgImage();
}
