import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { VersionFooter } from "@/components/VersionFooter";
import { versionView } from "@/lib/version";
import { SITE_URL } from "@/lib/site";

// Self-hosted JetBrains Mono (deliberately NOT next/font/google — no build-time
// Google fetch). Served as WOFF2 (~190KB total vs ~552KB uncompressed TTF) to
// keep the text-LCP font payload small under mobile throttling.
//
// CLS guard — a MONOSPACE fallback, not next/font's default Arial-based one:
//   `adjustFontFallback: "Arial"` would emit a synthetic `local("Arial")` face
//   whose metrics are size-adjusted to match JetBrains Mono *on average*. But
//   Arial is proportional, so individual glyph advances still differ — near-full
//   lines (e.g. the "Explore: work • labs • …" quick-nav) wrap differently under
//   the fallback vs the real font, reflowing the page below (~0.21 CLS, measured).
//   A real monospace fallback shares JetBrains Mono's fixed advance width, so the
//   wrap boundary — and every block height (the body uses fixed px/unitless
//   line-heights) — is identical before and after swap (verified: 0 CLS).
//   Hence `adjustFontFallback: false` + an explicit monospace `fallback` stack
//   (matching globals.css's `ui-monospace, monospace`).
const jetbrains = localFont({
  src: [
    {
      path: "../../public/fonts/JetBrainsMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/JetBrainsMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
  variable: "--font-jetbrains",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "RECTOR",
  description: "Building for Eternity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrains.variable}>
      <body>
        {children}
        <VersionFooter {...versionView()} />
        <Analytics />
      </body>
    </html>
  );
}
