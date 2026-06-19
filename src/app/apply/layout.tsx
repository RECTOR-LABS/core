/* eslint-disable @next/next/no-page-custom-font -- App Router layout: React 19
   hoists <link> to <head> for all /apply/* routes. This is correct per Next 16
   docs (01-app/getting-started/11-css.md). The Pages Router heuristic does not
   apply here. */
import type { Metadata } from "next";
import "./apply.css";

// Apply pages are private candidate pages — exclude from search engines.
// Mirrors: <meta name="robots" content="noindex, nofollow"> in apply.html.erb
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// Font strategy: raw <link> tags (hoisted to <head> in React 19 / Next 16).
// The Superteam CV CSS references the literal family name 'JetBrains Mono',
// which must be resolvable by the browser.
//
// JetBrains Mono is already self-hosted via the root layout (next/font/local),
// but only weights 400 and 700 are bundled locally. The Google Fonts link adds
// weights 500 and 600 (used by the .superteam-page CSS).
//
// (The retro "arbital" theme's VT323 font was removed with that CV surface.)
//
// Approach confirmed by docs (01-app/getting-started/11-css.md):
//   "In React 19, <link rel="stylesheet" href="..." /> can also be used."

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
      />
      {children}
    </>
  );
}
