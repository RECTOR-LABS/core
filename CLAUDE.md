# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**RECTOR LABS CORE** is a Rails 8 monolithic application serving the complete rectorspace.com ecosystem. This is the single source of truth for all platform sections.

**Current Status:** Architecture pivot from Next.js microservices to Rails monolith (2025-11-03). Clean slate for Rails implementation.

**Tech Stack:** Ruby on Rails 8 (fullstack, hybrid) + Tailwind CSS v4

---

## The 7-Section Architecture

Single domain `rectorspace.com` with route-based sections:

| Section | Route | Purpose | Status |
|---------|-------|---------|--------|
| Homepage | / | Identity hub & landing | 📋 Planned |
| Portfolio | /portfolio | Professional work showcase | 📋 Planned |
| Labs | /labs | Experiments & learning projects | 📋 Planned |
| Journal | /journal | Blog & writings (Ghost CMS integration) | 📋 Planned |
| Cheatsheet | /cheatsheet | Dev reference & notes | 📋 Planned |
| Dakwa | /dakwa | Islamic da'wah content | 📋 Planned |
| Quran | /quran | Quranic resources & tools | 📋 Planned |

**Architecture Decision:**
- Rails monolith for unified codebase, shared authentication, single deployment
- Route-based sections instead of separate apps/subdomains
- Portfolio (polished professional work) separate from Labs (experiments/learning)
- Ghost CMS as external service, integrated via API for Journal section

---

## Structure & Key Files

```
core/
├── .github/workflows/       # GitHub Actions (Claude Code integration)
├── app/                     # Rails application (controllers, models, views)
│   ├── controllers/
│   │   ├── pages_controller.rb       # Homepage
│   │   ├── portfolio_controller.rb
│   │   ├── labs_controller.rb
│   │   ├── journal_controller.rb
│   │   ├── cheatsheet_controller.rb
│   │   ├── dakwa_controller.rb
│   │   └── quran_controller.rb
│   ├── models/
│   │   ├── project.rb               # Portfolio projects
│   │   ├── experiment.rb            # Labs experiments
│   │   ├── snippet.rb               # Cheatsheet entries
│   │   ├── dakwa_content.rb
│   │   └── quran_resource.rb
│   └── views/
├── config/                  # Rails configuration
├── db/                      # Database migrations & schema
├── public/                  # Static assets
├── assets/images/           # Brand assets (3 logo variants + profile)
└── docs/                    # Documentation
```

**Branches:** `main` (protected) | `dev` (default) | `feature/*`

---

## Design System

**Complete specification:** See `docs/DESIGN_SYSTEM.md`

**Color Palette (NFT-inspired warm theme):**
- Primary: Sky Blue `#41CFFF` (links), Warm Yellow `#F9C846` (accents)
- Base: Soft Cream `#FFF7E1` (background), Deep Brown `#3B2C22` (text)
- Supporting: Clay Orange `#E58C2E`, Leaf Green `#A8E063`, Muted Red `#C75A44`

**Typography:** JetBrains Mono (full stack - headings, body, code)
- Weights: 400 (body), 500 (emphasis), 600 (subheadings), 700 (headings)
- Size: 18px body (monospace needs larger size for readability)
- Line height: 1.75-1.875 (generous for comfort)

**Layout Philosophy:**
- DHH.dk inspired: Minimal navigation, letter-style narrative, embedded links
- Basecamp inspired: Generous whitespace, conversational tone, calm spacing
- No navbar/footer/sidebar - links integrated naturally in text
- Profile picture (NFT): 150px rounded circle, centered, subtle shadow

**Visual Style:**
- Light/warm theme only (no dark mode)
- Pixel art graphics from Kenney.nl/itch.io (see `docs/PIXEL_ART_RESOURCES.md`)
- Clean, minimal, content-focused
- Anonymous identity via NFT profile picture

---

## Rails Development Workflow

**Prerequisites:**
- Ruby 3.3+ (use rbenv or asdf)
- Rails 8
- PostgreSQL (recommended) or SQLite (development)
- Node.js 18+ (for asset pipeline)

**Common Commands:**
```bash
# Start development server
bin/rails server

# Run console
bin/rails console

# Database setup
bin/rails db:create db:migrate db:seed

# Run tests
bin/rails test

# Asset compilation
bin/rails assets:precompile

# Generate scaffolds
bin/rails generate controller Portfolio index show
bin/rails generate model Project title:string description:text
```

**Running the App:**
```bash
bundle install
bin/rails db:setup
bin/rails server
# Visit http://localhost:3000
```

---

## Deployment Strategy

**VPS Deployment:**
- Single Rails app deployment (Nginx + Puma/Passenger)
- 1 user account per deployment environment (staging/production)
- PostgreSQL database
- Let's Encrypt SSL for rectorspace.com
- GitHub Actions CI/CD
- SSH via `~/.ssh/config`

**Environment Variables:**
- Ghost CMS API credentials
- Database connection strings
- External API keys (GitHub API, Quran API)

**Security:** Never commit `.env`, use Rails credentials (encrypted)

---

## External Integrations

**Journal Section:**
- Ghost CMS hosted separately (journal subdomain or external)
- Integrate via Ghost Content API
- Fetch posts and display in `/journal` route
- Consider caching strategy for performance

**Portfolio Section:**
- GitHub API integration for repository showcase
- Display pinned repos, contribution stats

**Quran Section:**
- Integrate Quran API (quran.com API or similar)
- Tafsir, translations, recitations

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
1. Read this CLAUDE.md first, check branch (`git branch`), understand Rails conventions
2. Follow Rails MVC patterns and conventions
3. Survey docs before creating new `.md` files - propose organization first
4. Work in `dev` branch, never commit directly to `main`
5. Update this CLAUDE.md if architecture changes
6. Use Rails generators when appropriate
7. Write tests for new features (RSpec or Minitest)

**Commit Format:** `<type>: <description>` (feat/fix/docs/refactor/chore/test)

---

## Quick Commands

**Development:**
```bash
bin/rails server          # Start dev server (port 3000)
bin/rails console         # Interactive console
bin/rails routes          # Show all routes
bin/rails db:migrate      # Run migrations
bin/rails test            # Run test suite
```

**Troubleshooting:**
```bash
# Reset database: bin/rails db:reset
# Clear cache: bin/rails tmp:clear
# Bundle issues: bundle install --full-index
# Asset issues: bin/rails assets:clobber && bin/rails assets:precompile
```

---

## Resources

**Docs:** [Rails Guides](https://guides.rubyonrails.org) | [Tailwind CSS](https://tailwindcss.com/docs) | [Ghost API](https://ghost.org/docs/content-api/)

**Links:** [@rz1989s](https://github.com/rz1989s) | [RECTOR-LABS](https://github.com/RECTOR-LABS) | rectorspace.com _(coming soon)_

**Maintainer:** RECTOR | **Updated:** 2025-11-03 | **Version:** 3.0 (Rails Monolith)

---

**May Allah bless this work and make it beneficial. Aamiin.**

**RECTOR LABS** | Building for Eternity | 2025
