<!-- Satellite context file — extends the global hub (~/.claude/CLAUDE.md | ~/.pi/agent/AGENTS.md). Host-neutral; project-specific only. Do not duplicate hub standards here. -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# RECTOR LABS Core (rectorspace.com)

> The Next.js 16 application serving the complete rectorspace.com ecosystem — the single source of truth for every platform section. Live in production on Vercel. Migrated from a Rails 8 monolith to Next.js 16 (App Router, SSG/ISR, no database) in June 2026.

**Tech Stack:** Next.js 16.2.6 (App Router) · React 19.2 · TypeScript · Tailwind CSS v4 (CSS-first `@theme`) · Vitest · self-hosted JetBrains Mono. **No database** — all content is file-based (markdown + YAML), committed to git.

## ⚠️ Non-standard Next specifics (already established in this codebase)

- RSC by default; client islands need `"use client"`.
- Dynamic route `params` is an **awaited Promise** (`const { slug } = await params`).
- Metadata merges layout → page (auto-derives `og:title` from `title`).
- Tailwind v4 is **CSS-first** (`@theme` in `src/app/globals.css`), no `tailwind.config.js`.
- `process.cwd()` at build/runtime is the **repo root** (file loaders read `content/`, `data/`, `public/` from there).

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

## Structure & Key Files

```
src/
  app/                       # App Router routes
    layout.tsx               # root metadata (metadataBase=SITE_URL) + fonts + VersionFooter
    page.tsx                 # Homepage (RSC + ISR, revalidate 3600)
    globals.css              # Tailwind v4 @theme tokens + all component CSS
    og-image.png/route.ts    # OG image Route Handler (Satori) → /og-image.png
    sitemap.ts · robots.ts   # indexable routes (excludes /apply)
    work/ · journal/ · apply/
  lib/
    site.ts                  # SITE_URL = https://rectorspace.com (single source)
    seo.ts                   # pageMetadata() — shared title/canonical/og/twitter
    og/render.tsx            # Satori OG composition
    content/                 # file loaders: posts, works, achievements, resume, arbital, superteam
    github/                  # repos, contributions, tech-stack (needs GITHUB_TOKEN)
    version.ts · format.ts · repo-time.ts
  components/{home,islands,VersionFooter,Markdown}/
content/{work,journal}/*.md  # YAML front matter + markdown body
data/{achievements,resume}.yml
public/{fonts,images,*.svg}  # self-hosted WOFF2 fonts, profile/OG assets
scripts/{gen-version,generate-resume-pdf}.mjs
next.config.ts               # experimental.inlineCss (cuts render-blocking CSS)
docs/DESIGN_SYSTEM.md
```

## Data Layer (file-based, no DB)

- **Content:** `content/{work,journal}/*.md` — YAML front matter + markdown, loaded by `src/lib/content/{works,posts}.ts` (`loadWorks()`/`loadPosts()` → `{ all, published, recent(), find() }`). Drafts excluded from listings + 404 on show. To publish: add a file, commit, deploy.
- **Achievements:** `data/achievements.yml` → `loadAchievements()` (`winCount`, `totalEarnings`, etc.). Drives homepage, OG image, `/apply` stats.
- **Resume / CVs:** `data/resume.yml` → `src/lib/content/resume.ts` + `/apply/*` pages. `npm run resume:pdf` renders the PDF.

## SEO & Metadata (prod parity is load-bearing)

- **`src/lib/seo.ts` — `pageMetadata({ title?, description, path, ogType? })`** is the single source for every indexable route's `<title>` (suffix `• RECTOR • Building for Eternity`), `canonical`, `og:url`, `og:image`, `twitter` card. Pass **relative** paths — `metadataBase` absolutizes them. Do NOT hand-roll metadata or re-hardcode the suffix.
- **OG image:** served at **`/og-image.png`** by a Route Handler (`force-static`) rendering `src/lib/og/render.tsx` (Satori). Path is fixed for parity — already-shared social cards reference it; do not rename.
- **`sitemap.ts` / `robots.ts`** enumerate indexable routes (excluding noindex `/apply/*`). `robots.ts` intentionally has **no `Disallow: /apply`** (noindex meta + sitemap-exclusion is the right mechanism; disallowing would hide the noindex from crawlers).

## Design System

Spec: `docs/DESIGN_SYSTEM.md`. Tokens in `src/app/globals.css` (`@theme`).

- **Palette:** Soft Cream `#FFF7E1` (bg), Deep Brown `#3B2C22` (text), Sky `#41CFFF`, Warm Yellow `#F9C846`, Clay `#E58C2E`, Leaf Green `#A8E063`, Muted Red `#C75A44`. Light/warm theme only (`/apply` arbital pages have their own dark themes in `apply.css`).
- **WCAG AA text tokens (surface-scoped — important):** readable text on cream/light surfaces uses darkened tokens — `--color-link #0D7390` (5.07:1), `--color-green-deep #3C6A12`, `--color-clay-deep #8A4A12`, muted text at `brown/70+`. The **bright** sky/green/clay tokens are for **decorative fills** (backgrounds, borders, contribution cells, rings), the **dark `/apply` themes**, and the OG image. When adding readable text, use the `-deep`/`link` tokens to keep accessibility at 100; never darken the shared bright tokens (breaks fills + dark themes).
- **Type:** JetBrains Mono, self-hosted WOFF2 (`display:swap`, monospace fallback). Deliberately NOT `next/font/google` (de-Googling). OG renderer reads the `.ttf` files (Satori can't parse WOFF2) — keep both.

## GitHub Integration

`src/lib/github/{repos,contributions,tech-stack}.ts` fetch live repo/contribution data for the homepage (ISR, hourly `revalidate`). Requires `GITHUB_TOKEN` env var (read-only `public_repo`); without it degrades gracefully to empty ("No projects found"). **Production Vercel project must have a valid `GITHUB_TOKEN`.**

## Common Commands

```bash
npm install
npm run dev            # dev server (Turbopack)
npm run build          # production build (set GITHUB_TOKEN for repo data)
npm run start          # serve the production build
npm run test           # vitest (run once)
npm run test:watch
npx tsc --noEmit       # typecheck
npm run lint           # eslint
npm run resume:pdf     # render the resume PDF
```

## Deployment (Vercel)

- Hosted on **Vercel** (project under `rectors-projects` team). Production deploys from `main`; PRs get preview deployments.
- **ISR:** homepage + `/work` index `revalidate = 3600` (hourly). Work/journal slug pages are SSG via `generateStaticParams`.
- **Env:** `GITHUB_TOKEN` (required for repo cards). `VERCEL_ENV` gates the version footer (production-only).
- `next.config.ts` enables `experimental.inlineCss` (inlines route CSS to cut render-blocking; re-verify after any Next upgrade).

## Workflow

- Branches: `main` (deploys to Vercel production) ← PRs from typed feature branches (`feat/`, `fix/`, `docs/`, `chore/`, `refactor/`).
- Commit format: `<type>: <description>`. One focused change per commit.

## Philosophy

**"Building for Eternity"** — integrating dunya (technical excellence) with akhirah (the planned da'wah sections). Values: **Ihsan** (100%-working standard, edge cases + a11y + perf), **Amanah** (code as trust, documented thoroughly), avoid **Israf** (lean, minimal dependencies).