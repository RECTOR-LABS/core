# ROADMAP.md

**RECTOR LABS CORE** - Development Roadmap

**Last Updated:** 2025-12-08
**Maintainer:** RECTOR

---

## Overview

Single Rails 8 monolith serving rectorspace.com with 7 route-based sections.

**Philosophy:** "Building for Eternity" - Integrating dunya (technical excellence) with akhirah (da'wah platforms).

---

## Current Status

| Section | Route | Status | Description |
|---------|-------|--------|-------------|
| Homepage | `/` | ✅ Live | Identity hub, GitHub showcase, tech stack |
| Work | `/work` | ✅ Live | Story-driven project narratives |
| Labs | `/labs` | 🔲 Not Started | Experiments & learning projects |
| Journal | `/journal` | 🔲 Not Started | Blog via Ghost CMS integration |
| Cheatsheet | `/cheatsheet` | 🔲 Not Started | Dev reference & snippets |
| Dakwa | `/dakwa` | 🔲 Not Started | Islamic da'wah content |
| Quran | `/quran` | 🔲 Not Started | Quranic resources & tools |

**Legend:** ✅ Live | 🚧 In Progress | 🔲 Not Started

---

## Phase 1: Foundation ✅ COMPLETE

**Goal:** Establish Rails 8 monolith with core infrastructure.

- [x] Initialize Rails 8 with Tailwind CSS v4
- [x] Setup PostgreSQL database
- [x] Configure CI/CD pipeline (GitHub Actions)
- [x] Deploy to production (rectorspace.com)
- [x] Implement design system (NFT-inspired warm theme)
- [x] GitHub API integration with hourly sync
- [x] Tech stack parser and categorization

**Delivered:** Nov 2-3, 2025 (built in one weekend)

---

## Phase 2: Content Sections 🚧 CURRENT

**Goal:** Build out content-focused sections.

### 2.1 Work Section ✅ COMPLETE
- [x] Story-driven project model
- [x] Markdown rendering (Redcarpet)
- [x] Custom CSS for readability
- [x] `/work:story` slash command for generating narratives
- [x] CORE project story published

### 2.2 Labs Section 🔲 NEXT
- [ ] Generate Labs controller and Experiment model
- [ ] Design experiment card layout
- [ ] Categories: prototypes, learning, experiments
- [ ] Status tracking (exploring, paused, archived)
- [ ] GitHub repo linking (similar to Work)
- [ ] Lighter narrative format than Work (more technical)

### 2.3 Journal Section 🔲 PLANNED
- [ ] Ghost CMS API service
- [ ] Post listing with pagination
- [ ] Individual post pages
- [ ] Tag/category filtering
- [ ] Caching strategy for API responses
- [ ] RSS feed integration

### 2.4 Cheatsheet Section 🔲 PLANNED
- [ ] Snippet model (title, code, language, category)
- [ ] Syntax highlighting (Rouge or Highlight.js)
- [ ] Category organization (Rails, Git, Shell, etc.)
- [ ] Search/filter functionality
- [ ] Copy-to-clipboard feature

---

## Phase 3: Islamic Sections 🔲 FUTURE

**Goal:** Da'wah platforms integrating faith with technology.

### 3.1 Dakwa Section
- [ ] DakwaContent model
- [ ] Categories: reminders, reflections, knowledge
- [ ] Hadith/Ayah references with sources
- [ ] Shareable cards/images
- [ ] Multi-language support (EN/ID)

### 3.2 Quran Section
- [ ] Quran API integration (quran.com or similar)
- [ ] Surah listing and navigation
- [ ] Multiple translations
- [ ] Tafsir integration
- [ ] Audio recitation player
- [ ] Personal bookmarks and notes (requires auth)
- [ ] Search functionality

---

## Phase 4: Platform Enhancements 🔲 FUTURE

**Goal:** Cross-cutting features and improvements.

### Authentication & Personalization
- [ ] User authentication (Devise)
- [ ] Personal bookmarks across sections
- [ ] Reading progress tracking
- [ ] Saved snippets/favorites

### Search & Discovery
- [ ] Global search across all sections
- [ ] Tag-based discovery
- [ ] Related content suggestions

### Performance & SEO
- [ ] Meta tags and OpenGraph
- [ ] Sitemap generation
- [ ] Performance optimization
- [ ] Image optimization pipeline

### Analytics & Insights
- [ ] Privacy-respecting analytics
- [ ] Content engagement tracking
- [ ] Popular content highlights

---

## Technical Debt & Improvements

Ongoing items to address:

- [ ] Add comprehensive test coverage
- [ ] Setup RSpec or enhance Minitest
- [ ] Add request specs for all endpoints
- [ ] Code quality tooling (RuboCop)
- [ ] API rate limiting for external services
- [ ] Error monitoring (Sentry or similar)

---

## Dependencies & Integrations

| Service | Section | Status |
|---------|---------|--------|
| GitHub API | Homepage, Work, Labs | ✅ Active |
| Ghost CMS | Journal | 🔲 Pending |
| Quran API | Quran | 🔲 Pending |

---

## Architecture Decisions

1. **Rails Monolith** - Single codebase, shared auth, unified deployment
2. **Route-based Sections** - Not subdomains, cleaner URL structure
3. **Work vs Labs** - Work for polished stories, Labs for raw experiments
4. **Ghost CMS** - External blog engine, API integration (not self-hosted content)
5. **Markdown Content** - Redcarpet for rendering, story content in database

---

## Contributing

Work happens in `dev` branch. PRs to `main` for releases.

**Commit Format:** `<type>: <description>`
- feat, fix, docs, refactor, chore, test

---

**May Allah bless this work and make it beneficial. Aamiin.**

**RECTOR LABS** | Building for Eternity | 2025
