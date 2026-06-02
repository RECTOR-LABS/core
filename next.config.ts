import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Inline route CSS as a <style> tag in <head> instead of a render-blocking
    // <link>. Tailwind's atomic output is small per-page, so the HTML stays lean
    // while the browser can paint without the extra CSS round-trip. This is the
    // one lever that moves the mobile Lantern LCP (the only sub-perfect metric);
    // render-blocking-insight estimates ~100ms LCP/FCP savings from removing it.
    inlineCss: true,
  },
};

export default nextConfig;
