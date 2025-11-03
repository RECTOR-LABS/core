# RECTOR LABS

> **"Building for Eternity"**

Rails 8 monolithic application for the complete rectorspace.com ecosystem.

[![Status](https://img.shields.io/badge/status-in_development-yellow.svg)](https://github.com/RECTOR-LABS/core)
[![Rails](https://img.shields.io/badge/Rails-8-red.svg)](https://rubyonrails.org)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Overview

**RECTOR LABS** is a unified Rails application serving 7 sections under a single domain. This monolithic architecture combines professional portfolio, experimental projects, Islamic da'wah content, and developer resources into one cohesive platform.

**Philosophy:** "Building for Eternity" - Integrating worldly excellence (dunya) with Islamic values and afterlife objectives (akhirah).

**Tech Stack:** Ruby on Rails 8 + Tailwind CSS v4

---

## The 7-Section Ecosystem

All sections served under `rectorspace.com`:

| Section | Route | Purpose | Status |
|---------|-------|---------|--------|
| Homepage | / | Identity hub & landing | ✅ Live |
| Portfolio | /portfolio | Professional work showcase | 📋 Planned |
| Labs | /labs | Experiments & learning projects | 📋 Planned |
| Journal | /journal | Blog & writings (Ghost CMS) | 📋 Planned |
| Cheatsheet | /cheatsheet | Dev reference & notes | 📋 Planned |
| Dakwa | /dakwa | Islamic da'wah content | 📋 Planned |
| Quran | /quran | Quranic resources & tools | 📋 Planned |

**Architecture Highlights:**
- Single Rails 8 monolith for unified codebase and deployment
- Route-based sections instead of microservices
- Shared authentication, database, and design system
- External Ghost CMS integration for Journal
- API integrations: GitHub (Portfolio), Quran API (Quran section)

---

## Quick Start

### Prerequisites

- Ruby 3.3+ (use `rbenv` or `asdf`)
- Rails 8
- PostgreSQL (recommended) or SQLite (development)
- Node.js 18+ (for asset pipeline)
- Bundler 2.x

### Installation

```bash
# Clone repository
git clone git@github.com:RECTOR-LABS/core.git
cd core

# Install dependencies
bundle install

# Setup environment
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN

# Setup database
bin/rails db:create db:migrate
bin/rails github:sync  # Sync repos from GitHub

# Start development server
bin/rails server

# Visit http://localhost:3000
```

---

## Repository Structure

```
core/
├── app/
│   ├── controllers/      # Section controllers (portfolio, labs, journal, etc.)
│   ├── models/           # Data models (projects, experiments, snippets, etc.)
│   ├── views/            # View templates for each section
│   └── assets/           # Stylesheets, JavaScript, images
├── config/               # Rails configuration, routes, database
├── db/                   # Database migrations and schema
├── public/               # Static files
├── test/                 # Test suite (Minitest or RSpec)
├── assets/images/        # Brand assets (logos, profile image)
├── docs/                 # Documentation
├── CLAUDE.md             # AI assistant guidance
└── README.md             # This file
```

---

## Tech Stack Details

### Backend
- **Framework:** Ruby on Rails 8 (fullstack, hybrid architecture)
- **Database:** PostgreSQL
- **Authentication:** TBD (Devise or Rails built-in)
- **Background Jobs:** Solid Queue (Rails 8 built-in) for hourly GitHub sync
- **Caching:** Solid Cache (Rails 8 built-in)

### Frontend
- **Styling:** Tailwind CSS v4 (utility-first, modern design)
- **JavaScript:** Hotwire (Turbo + Stimulus) for reactive UI
- **Build:** Propshaft/Sprockets for asset pipeline

### External Services
- **CMS:** Ghost (journal.rectorspace.com or external)
- **APIs:** GitHub API, Quran API

---

## Design System

**Complete Specification:** [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)

### Design Philosophy

**"Warm, Personal, Technical"** - Inspired by RECTOR's MonkeDAO NFT profile picture

- **Warm:** Soft cream backgrounds, yellow accents, inviting palette
- **Personal:** Letter-style narrative (DHH.dk inspired), first-person tone, no navbar/footer
- **Technical:** JetBrains Mono throughout, pixel art graphics, developer aesthetic
- **Anonymous but Present:** NFT as visual identity

### Brand Colors (NFT-Inspired)

| Color | Hex | Usage |
|-------|-----|-------|
| **Soft Cream** | `#FFF7E1` | Background |
| **Deep Brown** | `#3B2C22` | Text, headings, code blocks |
| **Sky Blue** | `#41CFFF` | Links, interactive |
| **Warm Yellow** | `#F9C846` | Accents, hover |
| **Clay Orange** | `#E58C2E` | Subheadings |
| **Leaf Green** | `#A8E063` | Success, CTAs |
| **Muted Red** | `#C75A44` | Shadows, depth |

### Typography

**Single Font:** JetBrains Mono (monospace) for everything
- **Body:** 18px, weight 400, line-height 1.75
- **Headings:** 24-40px, weight 600-700
- **Code:** 15px, weight 400

**Why JetBrains Mono:**
- Developer/hacker aesthetic
- Perfect for code blocks
- Distinctive personality
- Aligns with pixel art NFT

### Layout Inspiration

- **DHH.dk:** Minimal nav, letter-style bio, embedded links, generous whitespace
- **Basecamp.com:** Conversational tone, calm spacing, confident simplicity
- **Profile Picture:** 150px rounded circle (medium size), centered at top

### Brand Assets

Located in `assets/images/`:
- RECTOR NFT profile (pixel art)
- Pixel art icons (from Kenney.nl/itch.io - see `docs/PIXEL_ART_RESOURCES.md`)
- Custom section icons (portfolio, labs, journal, etc.)

---

## Development Workflow

### Running the Application

```bash
# Start Rails server
bin/rails server

# Interactive console
bin/rails console

# Run tests
bin/rails test  # or: bundle exec rspec

# View routes
bin/rails routes
```

### Database Management

```bash
# Create and migrate database
bin/rails db:create db:migrate

# Seed sample data
bin/rails db:seed

# Reset database (drop, create, migrate, seed)
bin/rails db:reset

# Rollback last migration
bin/rails db:rollback
```

### Generating Code

```bash
# Generate controller
bin/rails generate controller Portfolio index show

# Generate model
bin/rails generate model Project title:string description:text url:string featured:boolean

# Generate migration
bin/rails generate migration AddCategoryToProjects category:string
```

---

## Implemented Features

### Homepage (✅ Live)

The homepage is fully implemented with dynamic GitHub integration:

**Features:**
- NFT-inspired warm design with JetBrains Mono typography
- Vision/Mission/Passion statements
- Dynamic project showcase (6 latest repos from GitHub)
- Tech stack summary (parsed from all repositories)
- Contact links (GitHub, X @RZ1989sol, Email rheza10@gmail.com)

**GitHub Integration:**
- Automatic hourly sync via Solid Queue background jobs
- Caches 35 repositories (personal + RECTOR-LABS organization)
- Filters out forks, shows only original projects
- Tech stack parser categorizes by language
- Current stats: 18 non-fork repos, TypeScript 44.4%, Shell 16.7%

**Manual Commands:**
```bash
bin/rails github:sync          # Sync repos immediately
bin/rails github:tech_stack    # View tech stack summary
```

**Environment Setup:**
1. Copy `.env.example` to `.env`
2. Add your `GITHUB_TOKEN` (get from https://github.com/settings/tokens)
3. Token scope: `public_repo` (read-only)
4. Rate limit: 5,000 requests/hour (vs 60 without token)

---

## Section Overviews

### Portfolio (/portfolio)
Professional work showcase with GitHub integration.
- Display finished projects, case studies
- GitHub repository integration (pinned repos, stats)
- Filterable by category, technology

### Labs (/labs)
Experimental projects and learning journey.
- Quick prototypes, hackathon projects
- Learning experiments, code explorations
- More casual, WIP-friendly environment

### Journal (/journal)
Blog and writings powered by Ghost CMS.
- External Ghost CMS integration via Content API
- Display posts, articles, tutorials
- RSS feed support

### Cheatsheet (/cheatsheet)
Developer reference and notes.
- Code snippets, command references
- Tips, tricks, best practices
- Searchable, categorized content

### Dakwa (/dakwa)
Islamic da'wah content and resources.
- Articles on Islamic topics
- Beneficial reminders, guidance
- Community resources

### Quran (/quran)
Quranic resources and tools.
- Quran API integration
- Tafsir, translations, recitations
- Search and bookmark features

---

## Deployment

### VPS Deployment Strategy

- **Server:** Nginx + Puma/Passenger
- **Database:** PostgreSQL
- **SSL:** Let's Encrypt (certbot)
- **CI/CD:** GitHub Actions
- **Environment:** Production user account on VPS
- **Monitoring:** TBD (Sentry, New Relic, or similar)

### Environment Variables

Required environment variables (use Rails credentials or `.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `GHOST_API_URL` - Ghost CMS Content API URL
- `GHOST_API_KEY` - Ghost API key
- `GITHUB_TOKEN` - GitHub API token (for Portfolio)
- `QURAN_API_KEY` - Quran API credentials (if needed)

**Security:** Never commit `.env` files. Use Rails encrypted credentials for production.

---

## Branch Strategy

- **`main`** - Production-ready code (protected)
- **`dev`** - Active development (default branch)
- **`feature/*`** - Feature branches (merge into `dev`)
- **`hotfix/*`** - Critical fixes (merge into `main` and `dev`)

### Commit Format

Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `refactor:` - Code refactoring
- `test:` - Test additions/updates
- `chore:` - Maintenance tasks

---

## Philosophy & Values

### Building for Eternity

Integrating worldly (dunya) aspirations with afterlife (akhirah) objectives:

**Worldly (Dunya):**
- Technical excellence and professional portfolio
- Independent builder identity and personal brand
- Hackathon success and community impact
- Continuous learning and skill development

**Afterlife (Akhirah):**
- Islamic da'wah platforms (Dakwa, Quran sections)
- Sharing beneficial knowledge (`ilm nafi'`)
- Building tools and resources for the ummah
- Sadaqah jariyah (ongoing charity through beneficial content)

### Islamic Values in Code

- **Ihsan (Excellence):** Strive for perfection in every implementation, 100% working standard
- **Amanah (Trust):** Treat codebase as sacred responsibility, maintain with care
- **Avoid Israf (Waste):** Write efficient, clean code without bloat or redundancy
- **Barakah through Sadaqah:** Give sadaqah before complex tasks to invite Allah's blessings

---

## Contributing

This is a personal project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Resources & Links

**Documentation:**
- [Rails Guides](https://guides.rubyonrails.org)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Ghost Content API](https://ghost.org/docs/content-api/)
- [GitHub REST API](https://docs.github.com/en/rest)

**Links:**
- **Organization:** [RECTOR-LABS](https://github.com/RECTOR-LABS)
- **Personal GitHub:** [@rz1989s](https://github.com/rz1989s)
- **Website:** [rectorspace.com](https://rectorspace.com) _(coming soon)_

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

**May Allah accept this work and make it beneficial for the ummah. Aamiin.**

**RECTOR LABS** | Building for Eternity | 2025
