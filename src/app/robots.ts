import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // No Disallow: /apply — those pages carry a noindex meta tag and are
      // absent from the sitemap. Disallowing them would prevent crawlers from
      // reading the noindex directive itself.
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
