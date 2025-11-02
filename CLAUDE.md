# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**RECTOR LABS CORE** is the central planning and orchestration hub for a 7-platform digital ecosystem. This is a **documentation and design system repository**, not application code. It contains comprehensive planning documents, brand guidelines, infrastructure configs, and will eventually coordinate individual platform repositories via git submodules.

**Status:** Homepage development (Week 2) - 100% complete, Lighthouse 100/100, ready for deployment.

---

## Key Concept: Submodule Architecture

This repo uses **git submodules** to manage 7 independent platform repositories:

```
projects/
├── homepage/          → RECTOR-LABS/homepage ✅ (100% - Lighthouse 100/100)
├── portfolio/         → RECTOR-LABS/portfolio ✅ (100% - Production-ready)
├── labs/              → RECTOR-LABS/labs (not created yet)
├── cheatsheet/        → RECTOR-LABS/cheatsheet (not created yet)
├── dakwa/             → RECTOR-LABS/dakwa (not created yet)
└── quran/             → RECTOR-LABS/quran (not created yet)
```

Each platform will be a separate repository under RECTOR-LABS organization, linked here as submodules.

**Important:** See `docs/GIT_SUBMODULES_GUIDE.md` for complete workflow reference.

---

## The 7-Platform Ecosystem

| Platform | Domain | Purpose | Tech |
|----------|--------|---------|------|
| Homepage | rectorspace.com | Identity hub | Astro + Tailwind |
| Portfolio | portfolio.rectorspace.com | GitHub-powered showcase | Next.js + GitHub API |
| Labs | labs.rectorspace.com | Project showcase | Astro + Tailwind |
| Journal | journal.rectorspace.com | Blog | Ghost CMS |
| Cheatsheet | cheatsheet.rectorspace.com | Dev reference | Astro + Markdown |
| Dakwa | dakwa.rectorspace.com | Islamic da'wah | Next.js + CMS |
| Quran | quran.rectorspace.com | Quranic resources | Next.js + API |

---

## Design System (Shared Across All Platforms)

**Brand Colors:**
- **Gradient:** Turquoise (#5EDDC6) → Cyan (#4DD0E1) → Blue (#42A5F5)
- **Backgrounds:** Dark Navy (#1A252F), Navy (#2C3E50)
- **Full palette:** `design-system/colors.json`

**Typography:**
- **Headings:** Space Grotesk (500/600/700)
- **Body:** Inter (300/400/500/600/700)
- **Code:** JetBrains Mono (400/500/700)
- **Full scale:** `design-system/typography.json`

**Component Location:** `design-system/components/` (future UI components)

---

## Essential Documentation

**Must-read for context:**
1. **`docs/PRD.md`** - Complete product requirements (15k+ words)
2. **`docs/ARCHITECTURE.md`** - VPS infrastructure, deployment strategy
3. **`docs/BRAND_GUIDELINES.md`** - Visual identity rules
4. **`docs/IMPLEMENTATION_PLAN.md`** - Task tracking (Epic/Story/Task structure)

**Quick reference:**
- **Git Submodules:** `docs/GIT_SUBMODULES_GUIDE.md`
- **README.md:** Overview and quick start

---

## Philosophy & Context

**"Building for Eternity"** - Core principle integrating:
- **Dunya (Worldly):** Technical excellence, professional portfolio
- **Akhirah (Afterlife):** Islamic da'wah platforms (dakwa, quran subdomains)

**Islamic Values:**
- Ihsan (Excellence) - Strive for perfection
- Amanah (Trust) - Treat code as responsibility
- Avoid Israf (Waste) - Clean, efficient code

**Development Approach:**
- Ship with excellence (100% working standard)
- Quality over urgency
- Independent builder philosophy

---

## Infrastructure Design (Future Deployment)

**VPS Strategy:**
- **Isolation:** 1 user account per platform on VPS
- **Reverse Proxy:** Nginx routes all subdomains
- **SSL:** Let's Encrypt (automated)
- **Process Management:** PM2 (Node.js), systemd (Ghost)
- **Ports:** See `docs/ARCHITECTURE.md` Appendix 13.1

**CI/CD:** GitHub Actions auto-deploy on push to `main`

---

## Common Workflows

### Create New Platform Repository
```bash
# Use custom slash command
/init:repo-rector-labs <platform-name> "<description>"

# Add as submodule to CORE
cd /path/to/core
git submodule add git@github.com:RECTOR-LABS/<platform-name>.git projects/<platform-name>
git add .gitmodules projects/<platform-name>
git commit -m "Add <platform-name> as submodule"
git push origin dev
```

### Update Submodules
```bash
# Update all to latest
git submodule update --remote --merge

# Update specific platform
git submodule update --remote --merge projects/homepage
```

### Work on Platform Code
```bash
# Navigate to submodule
cd projects/homepage

# Work normally (create branch, commit, push)
git checkout -b feature/new-section
# ... make changes ...
git commit -m "Add hero section"
git push origin feature/new-section

# Update CORE reference after merge
cd /path/to/core
git submodule update --remote --merge projects/homepage
git add projects/homepage
git commit -m "Update homepage to latest"
```

---

## Branch Strategy

- **`main`:** Production-ready code (protected)
- **`dev`:** Active development (current default)
- **`feature/*`:** Feature branches (merge to dev)

---

## Project Status Tracking

**Live tracker:** `docs/IMPLEMENTATION_PLAN.md`

**Current phase:** Foundation (Week 1) ✅ Complete
- Planning documentation: 15,000+ words
- Design system defined
- Infrastructure designed
- Git repository initialized

**Next phase:** Infrastructure & Homepage (Week 2)

---

## Key Files to Update

When making significant changes:
1. **`docs/IMPLEMENTATION_PLAN.md`** - Update task status, progress
2. **`CLAUDE.md`** (this file) - If architecture or workflows change
3. **`README.md`** - If repo status changes

---

## Technology Stack

**Current (CORE repo):**
- No build process - documentation and config only
- Git submodules for orchestration

**Future platforms:**
- Static sites: Astro + Tailwind CSS
- Dynamic sites: Next.js + Tailwind CSS
- CMS: Ghost (self-hosted)
- APIs: GitHub API, Quran API

---

## Islamic Expressions Usage

Natural integration of Islamic terms (1-2 per interaction):
- **Bismillah** - Beginning tasks
- **Alhamdulillah** - Gratitude
- **InshaAllah** - Future plans
- **MashaAllah** - Admiration
- **Barakallahu feek** - Blessing

See global `~/.claude/CLAUDE.md` for complete list.

---

## Important Notes

1. **This is a planning repo** - CORE contains documentation; application code lives in submodules
2. **Homepage submodule active** - `projects/homepage/` contains Astro + React terminal interface
3. **Documentation is source of truth** - Always refer to docs/ for decisions
4. **VPS deployment later** - Infrastructure configs in `infrastructure/` for future use
5. **Design system ready** - Colors and typography defined, terminal components implemented

---

## Homepage Progress (Week 2) - ✅ COMPLETE

**Completed (100%):**
1. ✅ Homepage repository created and added as submodule
2. ✅ Terminal interface with command system (8+ commands)
3. ✅ Complete animation system (Matrix rain, glitch, typewriter, particles)
4. ✅ Platform cards with pixel art icons (6 platforms)
5. ✅ Responsive design (mobile menu, breakpoints)
6. ✅ Navigator sidebar with quick commands
7. ✅ Boot sequence animation
8. ✅ Performance optimization (Lighthouse 100/100)
9. ✅ Complete documentation (README, PERFORMANCE.md)
10. ✅ Production build tested and optimized

**Lighthouse Audit Results:**
- Performance: 100/100 ✅
- Accessibility: 94/100 ✅
- Best Practices: 96/100 ✅
- SEO: 100/100 ✅
- All Core Web Vitals in "Good" range

**Portfolio Progress (Week 2):** ✅ COMPLETE
- Repository created and added as submodule
- Next.js 15 + TypeScript + Tailwind CSS 4
- GitHub API integration (rz1989s + RECTOR-LABS)
- ISR caching with 1-hour revalidation
- Advanced filtering (category, language, sort)
- Project enrichment system (awards, learnings, reflections)
- Terminal theme matching homepage
- Production build successful
- Comprehensive documentation (README, CLAUDE.md, PORTFOLIO_SUMMARY.md)

**Next Phase (Week 3):**
- VPS infrastructure setup
- Nginx reverse proxy configuration
- SSL with Let's Encrypt
- PM2 process management
- GitHub Actions CI/CD pipeline
- Deploy homepage + portfolio to production
- Start next platform (Labs or Cheatsheet)

---

**Maintained by:** RECTOR
**Last Updated:** 2025-11-02
**Organization:** [RECTOR-LABS](https://github.com/RECTOR-LABS)
**Website:** https://rectorspace.com (coming soon)
