<div align="center">

# 🏛️ CORE

**The Next.js platform powering the complete rectorspace.com ecosystem**

[![Live](https://img.shields.io/badge/🌐_Live-rectorspace.com-41CFFF?style=for-the-badge)](https://rectorspace.com)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

✅ **Live on Vercel** | ⚡ **Next.js 16 · App Router** | 🕌 **Built with Ihsan**

[🌐 Visit Live](https://rectorspace.com) • [📖 Read Story](https://rectorspace.com/work/core) • [🏛️ RECTOR LABS](https://github.com/RECTOR-LABS)

</div>

---

## 🎯 The Vision

A single platform serving as the complete digital presence for RECTOR — combining portfolio, experiments, writings, Islamic resources, and developer tools under one unified architecture.

**Philosophy:** "Building for Eternity" — where technical excellence (dunya) meets purposeful impact (akhirah).

---

## ✨ The 7-Section Architecture

A single domain `rectorspace.com` with route-based sections:

| Section | Route | Purpose | Status |
|---------|-------|---------|--------|
| 🏠 **Homepage** | `/` | Identity hub & project showcase | ✅ Live |
| 💼 **Work** | `/work` | Story-driven project narratives | ✅ Live |
| ✍️ **Journal** | `/journal` | Native file-based markdown blog | ✅ Live |
| 📄 **Apply** | `/apply/*` | Targeted CVs (noindex) | ✅ Live |
| 🧪 **Labs** | `/labs` | Experiments & learning projects | 📋 Planned |
| 📚 **Cheatsheet** | `/cheatsheet` | Developer reference & notes | 📋 Planned |
| 🕌 **Dakwa** / 📖 **Quran** | `/dakwa`, `/quran` | Da'wah & Quranic resources | 📋 Planned |

Each new section follows the same **file-based content + loader** pattern — content lives in git, and deploy = publish.

---

## 🛠️ Tech Stack

**Framework:**
- Next.js 16 (App Router, React Server Components, SSG/ISR)
- React 19 + TypeScript
- Tailwind CSS v4 (CSS-first `@theme`)
- Self-hosted JetBrains Mono (WOFF2)

**Content & data (no database):**
- File-based markdown + YAML, committed to git
- GitHub API for live repo/contribution data, cached via **ISR** (hourly revalidate)
- Vitest test suite

**Infrastructure:**
- Deployed on **Vercel** (global CDN, automatic HTTPS, auto-deploy from `main`)
- GitHub Actions CI (lint · typecheck · test · build)

> **Note for contributors:** this is Next.js 16 — APIs and conventions differ from older releases. See [`AGENTS.md`](AGENTS.md) and read `node_modules/next/dist/docs/` before writing Next-specific code.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (22 recommended)
- A GitHub token for the homepage repo/contribution data (optional — the homepage degrades gracefully without it)

### Installation

```bash
# Clone
git clone https://github.com/RECTOR-LABS/core.git
cd core

# Install
npm install

# (optional) GitHub data for the homepage
echo "GITHUB_TOKEN=ghp_xxx" > .env.local   # read-only public_repo scope

# Develop
npm run dev          # http://localhost:3000
```

### Common Commands

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build (set GITHUB_TOKEN for live repo data)
npm run start        # serve the production build
npm test             # vitest
npx tsc --noEmit     # typecheck
npm run lint         # eslint
npm run resume:pdf   # render the resume PDF
```

---

## 📖 Architecture Highlights

### File-based content (no CMS, no DB)
Work stories and Journal posts are markdown files with YAML front matter in `content/work/*.md` and `content/journal/*.md`, loaded by framework-agnostic loaders in `src/lib/content/`. Achievements and CV data live in `data/*.yml`. To publish: add a file, commit, deploy.

### Live GitHub data via ISR
`src/lib/github/` fetches repos + contribution data; the homepage and `/work` index revalidate hourly (`revalidate: 3600`) — no cron, no background workers. Missing token → graceful degradation (unit-tested).

### SEO & social parity
A shared `src/lib/seo.ts` helper single-sources every page's title, `canonical`, Open Graph, and Twitter card. The OG image is generated with `next/og` and served at `/og-image.png`; `sitemap.ts` + `robots.ts` round it out.

### Design system
NFT-inspired warm theme via Tailwind v4 `@theme` tokens in `src/app/globals.css` — Soft Cream `#FFF7E1`, Deep Brown `#3B2C22`, Sky `#41CFFF`, plus WCAG-AA darkened text tokens for readable links/stats on light surfaces (accessibility 100). DHH.dk/Basecamp-inspired: minimal nav, letter-style narrative, generous whitespace. The `/apply` CVs ship their own dark themes. Full spec: [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

---

## 🏆 Story

CORE began as a **Rails 8 monolith**, built in one weekend (Nov 2–3, 2025) and deployed to a VPS with CI/CD. In **June 2026** it was rewritten as a **Next.js 16 app and migrated to Vercel** — a parity-first port (Journal → Homepage → Work → Apply) with full SEO, **accessibility 100**, and **Lighthouse 100 across the board**, cut over with zero downtime. The Rails implementation lives on in git history.

**Philosophy applied:**
- ✅ **Ihsan (Excellence):** edge cases, a11y, performance — 100%-working standard
- ✅ **Amanah (Responsibility):** production-ready, documented, maintainable
- ✅ **Avoid Israf (Waste):** lean, file-based, minimal dependencies

---

## 🗺️ Roadmap

- [x] Foundation — Homepage, Work, Journal, Apply (live)
- [x] Migration to Next.js 16 on Vercel (full parity, a11y 100, Lighthouse 100)
- [ ] Labs — experiments & learning projects
- [ ] Cheatsheet — developer reference notes
- [ ] Dakwa & Quran — Islamic da'wah and Quranic resources

---

## 🤝 Contributing

Built by RECTOR LABS with **Ihsan** (excellence) and **Amanah** (responsibility).

1. Fork the repository
2. Create a typed feature branch (`feat/…`, `fix/…`, `docs/…`)
3. Commit atomically (`<type>: <description>`)
4. Ensure CI is green (`npm run lint && npx tsc --noEmit && npm test && npm run build`)
5. Open a Pull Request

---

## 📄 License

Open source under the MIT License.

---

## 🔗 Links

- 🌐 **Website:** [rectorspace.com](https://rectorspace.com)
- 📖 **Project Story:** [rectorspace.com/work/core](https://rectorspace.com/work/core)
- 🐙 **Personal GitHub:** [@rz1989s](https://github.com/rz1989s)
- 🏛️ **Organization:** [RECTOR-LABS](https://github.com/RECTOR-LABS)

---

## 🙏 Acknowledgments

- **Next.js & Vercel** — for the framework and platform
- **Tailwind CSS** — for the styling system
- **Kenney.nl** — free pixel art assets
- **GitHub** — for the API and platform
- **Superteam** — inspiring the blockchain journey
- **Allah SWT** — for the ability to create and learn

---

<div align="center">

**Built with Bismillah** 🕌

*May this platform bring benefit to those who visit. Aamiin.*

---

[🏛️ RECTOR LABS](https://github.com/RECTOR-LABS) | Building for Eternity

</div>
