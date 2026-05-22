# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**RECTOR LABS CORE** is a Rails 8 monolithic application serving the complete rectorspace.com ecosystem. This is the single source of truth for all platform sections.

**Current Status:** Live in production with Homepage and Work sections. Built in one weekend (Nov 2-3, 2025), deployed with CI/CD.

**Tech Stack:** Ruby on Rails 8 (fullstack, hybrid) + Tailwind CSS v4

---

## RECTOR's Achievements (YAML-Driven)

**Source of Truth:** `config/achievements.yml`

Achievements are managed via a YAML file. Homepage, meta tags, and totals auto-calculate.

**To add a new achievement:**
1. Edit `config/achievements.yml`
2. Add entry at the top (newest first)
3. Deploy - everything auto-updates

**Auto-calculated fields:**
- `Achievement.total_earnings` → sum of all prize amounts
- `Achievement.win_count` → total count
- `Achievement.year_range` → "2024-2026" from dates
- `Achievement.winner_projects` → hash for project badges

**Architecture:**
```
config/achievements.yml          # Single source of truth
app/models/achievement.rb        # PORO - loads YAML, queries, calculates
app/helpers/achievements_helper.rb  # Formatting helpers
app/views/pages/_achievement_card.html.erb  # Reusable card partial
```

**Project Details:**

1. **Web3 Deal Discovery** (`RECTOR-LABS/web3-deal-discovery-nft-coupons`)
   - NFT coupons on Solana — "Groupon meets DeFi"
   - Escrow-based resale marketplace (industry-first)
   - Stack: Solana Anchor + Next.js 15 + Supabase + Tailwind v4

2. **SIP Protocol** (`sip-protocol/sip-protocol`)
   - Privacy layer for cross-chain transactions via NEAR Intents + Zcash
   - Stealth addresses, Pedersen commitments, ZK proofs
   - Stack: Next.js 14 + pnpm monorepo + noble/curves

3. **OpenBudget.ID** (`openbudget-garuda-spark`)
   - Government spending transparency on Solana for Indonesia
   - Ministries publish on-chain, citizens verify immutably
   - Stack: Solana Anchor + Next.js 14 + PostgreSQL

4. **Saros SDK Docs** (`rz1989s/saros-docs`)
   - Comprehensive Docusaurus documentation for Saros Finance SDKs
   - Interactive API Explorer, 15+ tutorials, production examples
   - Live: https://saros-docs.rectorspace.com

5. **SOLIS** (`RECTOR-LABS/solis`)
   - Solana Onchain & Landscape Intelligence Signal
   - 4-layer signal fusion (social, developer, DeFi, market) with Z-score anomaly detection
   - LLM narrative clustering + build idea generation, autonomous daily reports
   - Stack: TypeScript + Next.js 15 + Claude Haiku (OpenRouter) + Recharts
   - Live: https://solis.rectorspace.com

6. **pNode Pulse** (`RECTOR-LABS/pnode-pulse`)
   - Real-time analytics for Xandeum's decentralized pNode storage network
   - TimescaleDB time-series, health scoring, 200+ nodes tracked
   - Stack: Next.js 14 + TypeScript + tRPC + TimescaleDB + Redis
   - Live: https://pulse.rectorspace.com

7. **Solana Security Audit** (`RECTOR-LABS/solana-security-audit`)
   - 1st place ($1,500 USDG) out of 116 submissions on Superteam Earn
   - Systematic audit of 14 open-source Solana repos, 13 vulnerabilities found across 7 repos
   - Submitted: Anchor CPI Return Data Spoofing (CVSSv3 7.5) — framework-level impact
   - Stack: Rust + Anchor + Solana CLI

---

## The 7-Section Architecture

Single domain `rectorspace.com` with route-based sections:

| Section | Route | Purpose | Status |
|---------|-------|---------|--------|
| Homepage | / | Identity hub & landing | ✅ Live |
| Work | /work | Story-driven project showcase | ✅ Live |
| Labs | /labs | Experiments & learning projects | 📋 Planned |
| Journal | /journal | Blog & writings (Ghost CMS integration) | 📋 Planned |
| Cheatsheet | /cheatsheet | Dev reference & notes | 📋 Planned |
| Dakwa | /dakwa | Islamic da'wah content | 📋 Planned |
| Quran | /quran | Quranic resources & tools | 📋 Planned |

**Architecture Decision:**
- Rails monolith for unified codebase, shared authentication, single deployment
- Route-based sections instead of separate apps/subdomains
- Work (story-driven narratives) separate from Labs (experiments/learning)
- Ghost CMS as external service, integrated via API for Journal section

---

## Structure & Key Files

```
core/
├── .github/workflows/       # GitHub Actions (Claude Code integration)
├── app/
│   ├── controllers/
│   │   ├── pages_controller.rb       # Homepage (✅ implemented)
│   │   └── works_controller.rb       # Work section (✅ implemented)
│   ├── models/
│   │   ├── achievement.rb            # PORO for YAML achievements (✅ implemented)
│   │   ├── github_repo.rb            # GitHub repository cache (✅ implemented)
│   │   └── work.rb                   # Work/project stories (✅ implemented)
│   ├── views/
│   │   ├── layouts/application.html.erb
│   │   ├── pages/home.html.erb       # Homepage view (✅ implemented)
│   │   └── works/
│   │       ├── index.html.erb        # Work listing (✅ implemented)
│   │       └── show.html.erb         # Story page with custom CSS (✅ implemented)
│   ├── helpers/
│   │   ├── achievements_helper.rb    # Achievement summary formatting (✅ implemented)
│   │   └── works_helper.rb           # Markdown rendering (✅ implemented)
│   ├── jobs/
│   │   └── sync_github_repos_job.rb  # Hourly GitHub sync (✅ implemented)
│   └── services/
│       ├── github_api_service.rb     # GitHub API client (✅ implemented)
│       └── tech_stack_parser.rb      # Language parser (✅ implemented)
├── config/
│   ├── achievements.yml              # Single source of truth for achievements (✅ implemented)
│   ├── routes.rb                     # Routes for /, /work (✅ configured)
│   └── recurring.yml                 # Solid Queue job schedule
├── db/
│   ├── migrate/                      # Database migrations
│   ├── schema.rb                     # Current schema
│   └── seeds.rb                      # Database seeds with CORE story (✅ implemented)
├── lib/tasks/
│   └── github.rake                   # Manual sync tasks (✅ implemented)
├── assets/images/                    # Brand assets (3 logo variants + profile)
├── docs/                             # Documentation
│   ├── DESIGN_SYSTEM.md
│   ├── PIXEL_ART_RESOURCES.md
│   └── RAILS_INITIALIZATION_PLAN.md
├── .env                              # Environment variables (gitignored)
└── .env.example                      # Template for setup
```

**Branches:** `main` (default; push to `main` deploys to production) | feature branches (`feat/*`, `fix/*`, `docs/*`, `chore/*`, `refactor/*`) → PR into `main`

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
# or use foreman (runs web + css watcher)
bin/dev

# Run console
bin/rails console

# Database setup
bin/rails db:create db:migrate db:seed

# GitHub integration
bin/rails github:sync           # Manually sync repos from GitHub
bin/rails github:tech_stack     # Show tech stack summary

# Run tests
bin/rails test

# Generate scaffolds
bin/rails generate controller Portfolio index show
bin/rails generate model Project title:string description:text
```

**Running the App:**
```bash
# First time setup
bundle install
cp .env.example .env          # Then add your GitHub token
bin/rails db:setup
bin/rails github:sync         # Initial sync of repos

# Start server
bin/rails server
# Visit http://localhost:3000
```

---

## Deployment

**Architecture:** Docker on shared VPS (reclabs3, 151.245.137.75)

```
GitHub push → Actions build → GHCR image → SSH → docker compose pull → up -d → image prune -f
```

**Containers** (docker-compose.yml):
| Service | Image | Port |
|---------|-------|------|
| postgres | postgres:16 | 127.0.0.1:5435:5432 |
| web | ghcr.io/rector-labs/core:latest | 8000:80 |
| solidqueue | ghcr.io/rector-labs/core:latest | — |

- Puma runs behind Thruster (port 80 inside container)
- nginx reverse proxies `rectorspace.com` → `127.0.0.1:8000`
- `db:prepare` runs automatically on container start (entrypoint)
- Solid Queue runs as a separate container (`bundle exec rake solid_queue:start`)

**VPS User:** `core` (SSH alias: `core`)

**GitHub Secrets:** `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_APP_PATH`

**Environment Variables** (VPS `~/core/.env`):
- `SECRET_KEY_BASE` — Rails secret
- `CORE_DATABASE_PASSWORD` — PostgreSQL password
- `GITHUB_TOKEN` — GitHub API access for repo sync

**Security:** Never commit `.env`. DB port bound to localhost only.

---

## External Integrations

**Journal Section:**
- Ghost CMS hosted separately (journal subdomain or external)
- Integrate via Ghost Content API
- Fetch posts and display in `/journal` route
- Consider caching strategy for performance

**Work Section:**
- Story-driven project pages (narrative format, not traditional portfolio)
- GitHub repository metadata integration
- Custom `/work:story` slash command for generating stories
- Markdown rendering via Redcarpet gem
- Custom CSS for readability (justified text, generous spacing)

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
4. Branch from `main` with a typed prefix (`feat/`, `fix/`, `docs/`, `chore/`, `refactor/`) and open a PR into `main`
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

## GitHub Integration

**Implemented Features (Homepage):**
- Dynamic project showcase from GitHub API
- Automatic caching with PostgreSQL database
- Hourly background sync via Solid Queue
- Tech stack parser with language categorization
- Manual sync via rake tasks

**Architecture:**
```
GitHub API → GithubApiService → GithubRepo (model/cache) → PagesController → Homepage View
                ↓
           SyncGithubReposJob (hourly)
                ↓
           TechStackParser (categorizes languages)
```

**Data Flow:**
1. `SyncGithubReposJob` runs every hour (configured in `config/recurring.yml`)
2. Fetches repos from `rz1989s` (personal) and `RECTOR-LABS` (organization)
3. Stores in `github_repos` table with metadata (name, description, language, pushed_at, etc.)
4. `TechStackParser` analyzes all non-fork repos and categorizes by language
5. Homepage displays 6 latest repos + tech stack summary

**Current Stats:**
- 35 total repositories cached (24 personal + 11 organization)
- 18 non-fork repositories
- Primary stack: TypeScript (44.4%), Shell (16.7%), JavaScript, Rust, Python
- Categories: blockchain, web, backend, infra, data, systems

**Environment Variables:**
```bash
# .env (gitignored)
GITHUB_TOKEN=ghp_xxx...   # Personal access token
```

**Benefits:**
- Rate limit: 5,000 requests/hour (vs 60 without token)
- Scope: `public_repo` (read-only public repositories)

**Manual Commands:**
```bash
bin/rails github:sync          # Sync repos now
bin/rails github:tech_stack    # Show tech stack summary
```

---

## Work Section (Story-Driven Projects)

**Implemented Features:**
- Story-driven project narratives (not traditional portfolio format)
- Individual project pages at `/work/:slug`
- Markdown content with Redcarpet rendering
- Custom CSS for optimal readability (justified text, 2rem paragraph spacing)
- GitHub repository metadata integration

**Database Schema:**
```ruby
create_table "works" do |t|
  t.string :title          # Project title
  t.string :slug           # URL-friendly identifier
  t.string :github_url     # GitHub repository URL
  t.string :live_url       # Live deployment URL
  t.string :repo_name      # "owner/repo" format
  t.text :story            # Full markdown narrative
  t.text :summary          # One-liner for listing
  t.string :category       # Project category
  t.string :status         # "Live", "In Progress", "Archived"
  t.date :started_at       # Project start date
  t.date :launched_at      # Launch date
  t.boolean :featured      # Highlight on homepage
  t.integer :github_stars  # GitHub stars count
  t.integer :github_forks  # GitHub forks count
  t.json :technologies     # Tech stack array
  t.timestamps
end
```

**Custom Slash Command: `/work:story`**
- Location: `~/.claude/commands/work/story.md`
- Purpose: Generate story-driven narratives from GitHub repos
- Features:
  - Duplicate detection (checks existing stories)
  - GitHub repo metadata fetching
  - AI-generated narrative in conversational tone
  - Proper markdown formatting with blank lines
  - Automatic database update (local + production)
- Usage: `/work:story <github-url>`
- Example: `/work:story https://github.com/RECTOR-LABS/core`

**Story Formatting Guidelines:**
- Blank lines between ALL paragraphs (critical for Redcarpet)
- Bold text (`**Section**`) for section headers
- Conversational, narrative tone (not corporate)
- Technical details woven into story
- Focus on "why" and "what I learned"
- 800-1200 words typical length

**Markdown Rendering:**
- Gem: Redcarpet
- Config: `hard_wrap: false` (respects markdown paragraph rules)
- Features: autolink, tables, fenced code blocks, strikethrough
- Output: `html_safe` rendered content

**Current Stories:**
1. **CORE** - Rails 8 monolith story (1,185 words)
   - URL: https://rectorspace.com/work/core
   - Slug: `core`
   - Status: Live

**Work Section Routes:**
```ruby
resources :works, only: [:index, :show]
# GET /work          - List all work projects
# GET /work/:slug    - Individual project story
```

---

## Resources

**Docs:** [Rails Guides](https://guides.rubyonrails.org) | [Tailwind CSS](https://tailwindcss.com/docs) | [Ghost API](https://ghost.org/docs/content-api/)

**Links:** [@rz1989s](https://github.com/rz1989s) | [RECTOR-LABS](https://github.com/RECTOR-LABS) | [rectorspace.com](https://rectorspace.com)

**Maintainer:** RECTOR | **Updated:** 2025-11-03 | **Version:** 3.1 (Work Section Live)

---

**May Allah bless this work and make it beneficial. Aamiin.**

**RECTOR LABS** | Building for Eternity | 2025
