# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**RECTOR LABS CORE** is the central planning and orchestration hub for a 7-platform digital ecosystem. This is a **documentation and design system repository**, not application code. It contains comprehensive planning documents, brand guidelines, infrastructure configs, and will eventually coordinate individual platform repositories via git submodules.

**Status:** Foundation phase (Week 1) - Planning complete, platform development not yet started.

---

## Key Concept: Submodule Architecture

This repo uses **git submodules** to manage 7 independent platform repositories:

```
projects/
├── homepage/          → RECTOR-LABS/homepage (not created yet)
├── portfolio/         → RECTOR-LABS/portfolio (not created yet)
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

1. **This is a planning repo** - No application code exists yet in CORE
2. **Submodules not yet created** - `projects/` is empty (planned Week 2+)
3. **Documentation is source of truth** - Always refer to docs/ for decisions
4. **VPS deployment later** - Infrastructure configs in `infrastructure/` for future use
5. **Design system ready** - Colors and typography defined, components TBD

---

## Next Actions (Week 2)

1. Create homepage repository
2. Add homepage as first submodule
3. Build design system components (Button, Card, Header, Footer)
4. Document VPS infrastructure setup
5. Create homepage prototype

---

**Maintained by:** RECTOR
**Last Updated:** 2025-11-02
**Organization:** [RECTOR-LABS](https://github.com/RECTOR-LABS)
**Website:** https://rectorspace.com (coming soon)
