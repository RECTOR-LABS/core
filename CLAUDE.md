# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**RECTOR LABS CORE** is the **Next.js 16** application serving the complete rectorspace.com ecosystem — the single source of truth for every platform section.

**Current Status:** Live in production on **Vercel**. Migrated from a Rails 8 monolith to Next.js 16 (App Router, SSG/ISR, no database) in **June 2026**; the Rails app remains in git history prior to that migration.

**Tech Stack:** Next.js 16.2.6 (App Router) · React 19.2 · TypeScript · Tailwind CSS v4 (CSS-first `@theme`) · Vitest · self-hosted JetBrains Mono. No database — all content is file-based (markdown + YAML), committed to git.

---

## ⚠️ This is NOT the Next.js you may know

See `AGENTS.md`: this Next version has breaking changes from older releases — APIs, conventions, and file structure may differ from training data. **Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next-specific code** (metadata, route handlers, `ImageResponse`, caching, params). Key specifics already established in this codebase:

- RSC by default; client islands need `"use client"`.
- Dynamic route `params` is an **awaited Promise** (`const { slug } = await params`).
- Metadata merges layout → page (auto-derives `og:title` from `title`).
- Tailwind v4 is **CSS-first** (`@theme` in `src/app/globals.css`), no `tailwind.config.js`.
- `process.cwd()` at build/runtime is the **repo root** (file loaders read `content/`, `data/`, `public/` from there).

---

## The 7-Section Architecture

Single domain `rectorspace.com` with route-based sections:

| Section | Route | Purpose | Status |
|---------|-------|---------|--------|
| Homepage | `/` | Identity hub & landing | ✅ Live |
| Work | `/work`, `/work/:slug` | Story-driven project showcase | ✅ Live |
| Journal | `/journal`, `/journal/:slug` | File-based markdown blog | ✅ Live |
| Apply | `/apply/*` | Targeted CVs (noindex) | ✅ Live |
| Labs | `/labs` | Experiments & learning | 📋 Planned |
| Cheatsheet | `/cheatsheet` | Dev reference | 📋 Planned |
| Dakwa / Quran | `/dakwa`, `/quran` | Da'wah & Quranic content | 📋 Planned |

New sections follow the same **file-based content + PORO-style loader** pattern (mirror `src/lib/content/posts.ts` over `content/<section>/*.md`); deploy = publish.

---

## Structure & Key Files

```
core/
├── src/
│   ├── app/                       # App Router routes
│   │   ├── layout.tsx             # root metadata (metadataBase=SITE_URL) + fonts + VersionFooter
│   │   ├── page.tsx               # Homepage (RSC + ISR, revalidate 3600)
│   │   ├── globals.css            # Tailwind v4 @theme tokens + all component CSS
│   │   ├── og-image.png/route.ts  # OG image Route Handler (Satori) → /og-image.png
│   │   ├── sitemap.ts             # sitemap.xml (indexable routes; excludes /apply)
│   │   ├── robots.ts              # robots.txt (allow all, sitemap ref)
│   │   ├── work/                  # /work index + /work/[slug] (SSG)
│   │   ├── journal/               # /journal index + /journal/[slug] (SSG)
│   │   └── apply/                 # /apply/* CVs (noindex; dark themes via apply.css)
│   ├── lib/
│   │   ├── site.ts                # SITE_URL = https://rectorspace.com (single source)
│   │   ├── seo.ts                 # pageMetadata() — shared title/canonical/og/twitter
│   │   ├── og/render.tsx          # Satori OG composition (used by the route handler)
│   │   ├── content/               # file loaders: posts, works, achievements, resume, arbital, superteam
│   │   ├── github/                # repos, contributions, tech-stack (needs GITHUB_TOKEN)
│   │   ├── version.ts             # build-time version stamp (footer)
│   │   └── format.ts, repo-time.ts, …
│   └── components/
│       ├── home/                  # AchievementCard, ProjectCard, TechStackBar, …
│       ├── islands/               # "use client" islands: ContributionGraph, FilterSort, Counter, …
│       └── VersionFooter.tsx, Markdown.tsx
├── content/
│   ├── work/*.md                  # project stories (front matter + markdown)
│   └── journal/*.md               # blog posts (front matter + markdown)
├── data/
│   ├── achievements.yml           # awards/wins (totals auto-calculated)
│   └── resume.yml                 # CV data for /apply pages + resume PDF
├── public/{fonts,images,*.svg}    # self-hosted WOFF2 fonts, profile/OG assets
├── scripts/
│   ├── gen-version.mjs            # npm prebuild → .version.json (gitignored)
│   └── generate-resume-pdf.mjs    # npm run resume:pdf
├── next.config.ts                 # experimental.inlineCss (cuts render-blocking CSS)
├── AGENTS.md                      # the "non-standard Next" warning
└── docs/                          # DESIGN_SYSTEM.md, etc. (docs/superpowers/ is gitignored)
```

---

## Data Layer (file-based, no DB)

- **Content:** `content/work/*.md` and `content/journal/*.md` — YAML front matter + markdown body, loaded by `src/lib/content/{works,posts}.ts` (`loadWorks()`/`loadPosts()` → `{ all, published, recent(), find() }`). Drafts excluded from listings + 404 on show. To publish: add a file, commit, deploy.
- **Achievements:** `data/achievements.yml` → `src/lib/content/achievements.ts` (`loadAchievements()` → `winCount`, `totalEarnings`, etc.). Drives the homepage, OG image, and `/apply` stats.
- **Resume / CVs:** `data/resume.yml` → `src/lib/content/resume.ts` + the `/apply/*` pages. `npm run resume:pdf` renders the PDF.

---

## SEO & Metadata (prod parity is load-bearing)

- **`src/lib/seo.ts` — `pageMetadata({ title?, description, path, ogType? })`** is the single source for every indexable route's `<title>` (suffix `• RECTOR • Building for Eternity`), `canonical`, `og:url`, `og:image`, and `twitter` card. Pass **relative** paths — `metadataBase` (from `SITE_URL`) absolutizes them. Do NOT hand-roll metadata in routes or re-hardcode the suffix.
- **OG image:** served at **`/og-image.png`** by a Route Handler (`src/app/og-image.png/route.ts`, `force-static`) rendering `src/lib/og/render.tsx` (Satori). The path is fixed for parity — already-shared social cards reference `https://rectorspace.com/og-image.png`; do not rename it.
- **`sitemap.ts` / `robots.ts`** enumerate indexable routes (excluding noindex `/apply/*`). `robots.ts` intentionally has **no `Disallow: /apply`** (the noindex meta + sitemap-exclusion is the right mechanism; disallowing would hide the noindex from crawlers).

---

## Design System

**Spec:** `docs/DESIGN_SYSTEM.md`. Tokens live in `src/app/globals.css` (`@theme`).

- **Palette:** Soft Cream `#FFF7E1` (bg), Deep Brown `#3B2C22` (text), Sky `#41CFFF`, Warm Yellow `#F9C846`, Clay `#E58C2E`, Leaf Green `#A8E063`, Muted Red `#C75A44`. Light/warm theme only (the `/apply` arbital pages have their own dark themes in `apply.css`).
- **WCAG AA text tokens (surface-scoped — important):** readable text on the cream/light surfaces uses darkened tokens — `--color-link #0D7390` (links, 5.07:1), `--color-green-deep #3C6A12` (green stat text), `--color-clay-deep #8A4A12` (gold/winner/bounty/streak badge text), and muted text at `brown/70+`. The **bright** `--color-sky` / `--color-green` / `--color-clay` are kept for **decorative fills** (backgrounds, borders, contribution cells, rings), the **dark `/apply` themes**, and the OG image. When adding readable text, use the `-deep`/`link` tokens to keep accessibility at 100; never darken the shared bright tokens (it would break the fills + dark themes).
- **Type:** JetBrains Mono, self-hosted WOFF2 (`display:swap`, monospace fallback). Deliberately NOT `next/font/google` (de-Googling). The OG renderer reads the `.ttf` files (Satori can't parse WOFF2) — keep both.

---

## GitHub Integration

`src/lib/github/{repos,contributions,tech-stack}.ts` fetch live repo/contribution data for the homepage (ISR, hourly `revalidate`). Requires a `GITHUB_TOKEN` env var (read-only `public_repo`); without it the calls degrade gracefully to empty (repo cards render "No projects found"). The **production Vercel project must have a valid `GITHUB_TOKEN`**.

---

## Deployment (Vercel)

- Hosted on **Vercel** (project under the `rectors-projects` team). Production deploys from `main`; PRs get preview deployments.
- **ISR:** homepage + `/work` index `revalidate = 3600` (hourly), matching the old Rails GitHub-sync cadence. Work/journal slug pages are SSG via `generateStaticParams`.
- **Env:** `GITHUB_TOKEN` (required for repo cards). `VERCEL_ENV` gates the version footer (production-only).
- `next.config.ts` enables `experimental.inlineCss` (inlines route CSS to cut render-blocking; re-verify after any Next upgrade).

---

## Development Workflow

```bash
npm install
npm run dev            # dev server (Turbopack)
npm run build          # production build  (set GITHUB_TOKEN for repo data)
npm run start          # serve the production build
npm run test           # vitest (run once)
npm run test:watch
npx tsc --noEmit       # typecheck
npm run lint           # eslint
npm run resume:pdf     # render the resume PDF
```

**Branches:** `main` (deploys to Vercel production) ← PRs from typed feature branches (`feat/`, `fix/`, `docs/`, `chore/`, `refactor/`).

**Commit format:** `<type>: <description>` (feat/fix/docs/refactor/chore/test). One focused change per commit.

---

## Philosophy

**"Building for Eternity"** — integrating dunya (technical excellence) with akhirah (the planned da'wah sections). Values: **Ihsan** (100%-working standard, edge cases + a11y + perf), **Amanah** (code as trust, documented thoroughly), avoid **Israf** (lean, minimal dependencies).

---

**Maintainer:** RECTOR | **Updated:** 2026-06-02 | **Version:** 4.0 (Next.js on Vercel)

**May Allah bless this work and make it beneficial. Aamiin.** — **RECTOR LABS** | Building for Eternity
