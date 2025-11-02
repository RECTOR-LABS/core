# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**RECTOR LABS CORE** orchestrates a 7-platform digital ecosystem via git submodules. This is a **documentation and design system repository**, not application code.

**Current Status:** Reset to clean slate (commit 34fbc5e). Historical planning docs (PRD, Architecture, Brand Guidelines) available in git history (commit d716ebd). Retrieve with: `git show d716ebd:docs/<filename>.md`

**Submodule:** `projects/homepage` → [RECTOR-LABS/homepage](https://github.com/RECTOR-LABS/homepage)

---

## The 7-Platform Ecosystem

All platforms use **Next.js 15 + Tailwind v4** under `rectorspace.com` domain:

| Platform | Domain | Purpose | Status |
|----------|--------|---------|--------|
| Homepage | rectorspace.com | Identity hub | 📋 Planned |
| Portfolio | portfolio.rectorspace.com | GitHub-powered showcase | 📋 Planned |
| Labs | labs.rectorspace.com | Projects showcase | 📋 Planned |
| Journal | journal.rectorspace.com | Blog (Ghost CMS) | 📋 Planned |
| Cheatsheet | cheatsheet.rectorspace.com | Dev reference | 📋 Planned |
| Dakwa | dakwa.rectorspace.com | Islamic da'wah | 📋 Planned |
| Quran | quran.rectorspace.com | Quranic resources | 📋 Planned |

**Tech Stack Decision (2025-11-03, commit ac64d5a):**
- Standardized on Next.js 15 for developer expertise and unified tooling
- Homepage initially Astro (v1 on `frontend-v1` branch), switched to Next.js for consistency

---

## Structure & Key Files

```
core/
├── .github/workflows/claude.yml  # Claude Code GitHub Action (@claude triggers)
├── projects/homepage/            # Submodule → RECTOR-LABS/homepage
├── assets/images/                # 3 logo variants + profile image
└── docs/                         # Empty (historical docs in git history)
```

**Branches:** `main` (protected) | `dev` (default) | `feature/*`

---

## Git Submodules Quick Reference

**Why:** Independent repos, flexible visibility (CORE private, platforms public/private), separate deployments, centralized tracking.

**Common Commands:**
```bash
# Initialize after clone
git submodule update --init --recursive

# Update all platforms
git submodule update --remote --merge

# Add new platform
git submodule add git@github.com:RECTOR-LABS/<name>.git projects/<name>

# Work on platform
cd projects/homepage
git checkout -b feature/xyz
# ... commit changes ...
git push origin feature/xyz

# Update CORE reference
cd /Users/rz/local-dev/core
git submodule update --remote --merge projects/homepage
git add projects/homepage && git commit -m "Update homepage"
```

---

## Design System

**Colors:** Gradient (Turquoise `#5EDDC6` → Cyan `#4DD0E1` → Blue `#42A5F5`) | Backgrounds (Dark Navy `#1A252F`, Navy `#2C3E50`)

**Typography:** Headings (Space Grotesk 500/600/700) | Body (Inter 300-700) | Code (JetBrains Mono 400/500/700)

**Assets:** `assets/images/` - 3 logo variants + profile image

---

## Workflows

**Create New Platform:**
```bash
# Use slash command (creates repo + branches)
/init:repo-rector-labs <name> "description"

# Add as submodule
cd /Users/rz/local-dev/core
git submodule add git@github.com:RECTOR-LABS/<name>.git projects/<name>
git commit -m "Add <name> as submodule" && git push origin dev
```

**VPS Deployment (Future):**
- Strategy: 1 user per platform, Nginx reverse proxy, Let's Encrypt SSL, PM2/systemd
- SSH via `~/.ssh/config`, unique ports per platform, GitHub Actions CI/CD

**Prerequisites:** Node.js 18+, Git, RECTOR-LABS access

**Security:** Never commit `.env`, use GitHub Secrets for CI/CD

---

## Philosophy

**"Building for Eternity"** - Integrating dunya (technical excellence, portfolio) with akhirah (da'wah platforms: dakwa, quran).

**Islamic Values:**
- **Ihsan (Excellence):** 100% working standard, quality over urgency
- **Amanah (Trust):** Treat code as sacred responsibility, document thoroughly
- **Avoid Israf (Waste):** Efficient, clean code, minimal dependencies

**Islamic Expressions (1-2 per interaction):** Bismillah (beginning), Alhamdulillah (success), InshaAllah (future), MashaAllah (admiration). See `~/.claude/CLAUDE.md`.

---

## Best Practices

**For Claude Code:**
1. Read this CLAUDE.md first, check branch (`git branch`), understand platform context
2. Navigate to submodule for platform work (`cd projects/<name>`)
3. Survey docs before creating new `.md` files - propose organization first
4. Work in `dev` branch, never commit directly to `main`
5. Update this CLAUDE.md if architecture changes

**Commit Format:** `<type>: <description>` (feat/fix/docs/refactor/chore/submodule)

---

## Quick Commands

**Platform Development:**
```bash
cd projects/homepage
npm run dev          # Start dev server
npm run build        # Production build
npm run type-check   # Type checking
npm run lint         # Linting
```

**Troubleshooting:**
```bash
# Submodule empty: git submodule update --init --recursive
# Modified content: cd projects/<name> && git status
# Next.js issues: rm -rf .next node_modules && npm install && npm run dev
```

---

## Resources

**Docs:** [Next.js](https://nextjs.org/docs) | [Tailwind v4](https://tailwindcss.com/docs) | [Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

**Links:** [@rz1989s](https://github.com/rz1989s) | [RECTOR-LABS](https://github.com/RECTOR-LABS) | rectorspace.com _(coming soon)_

**Maintainer:** RECTOR | **Updated:** 2025-11-03 | **Version:** 2.1 (Compact)

---

**May Allah bless this work and make it beneficial. Aamiin.**

**RECTOR LABS** | Building for Eternity | 2025
