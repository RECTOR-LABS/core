# Product Requirements Document (PRD)
# RECTOR LABS Ecosystem

**Version:** 1.0
**Last Updated:** 2025-11-02
**Owner:** RECTOR
**Status:** Foundation Phase

---

## 1. Executive Summary

### Vision
Build a comprehensive digital ecosystem that represents RECTOR's identity as an independent builder, showcasing technical excellence while integrating Islamic values and da'wah mission. The ecosystem serves both worldly (dunya) aspirations and afterlife (akhirah) objectives through technology.

### Mission Statement
"Building for Eternity" - Creating digital products and platforms that deliver value in this world while serving as a means of da'wah and benefit for the ummah.

### Core Philosophy
- **Independent Builder**: Not employee, not freelancer - building on own terms
- **Integration of Dunya & Akhirah**: Technical work intertwined with Islamic mission
- **Excellence (Ihsan)**: Strive for perfection in every implementation
- **Trust (Amanah)**: Treat projects as sacred responsibility
- **Efficiency**: Avoid waste (Israf) in code and resources

---

## 2. Project Scope

### 2.1 In Scope - Phase 1 (Foundation)

**EPIC 1: Identity & Brand Foundation**
- Story 1.1: RECTOR LABS brand identity and design system
- Story 1.2: Homepage (rectorspace.com) - Identity hub
- Story 1.3: Core infrastructure and deployment pipeline

**EPIC 2: Professional Presence**
- Story 2.1: Portfolio system (portfolio.rectorspace.com)
- Story 2.2: RECTOR LABS showcase (labs.rectorspace.com)
- Story 2.3: Developer cheatsheet library (cheatsheet.rectorspace.com)

**EPIC 3: Content & Da'wah Platforms**
- Story 3.1: Personal journal (journal.rectorspace.com) - Ghost CMS
- Story 3.2: Islamic da'wah platform (dakwa.rectorspace.com)
- Story 3.3: Quranic resources (quran.rectorspace.com)

### 2.2 Out of Scope - Phase 1
- E-commerce functionality
- User authentication systems
- Mobile applications
- Third-party integrations (except GitHub API for portfolio)

---

## 3. Subdomain Architecture

### 3.1 rectorspace.com (Homepage)
**Purpose:** RECTOR's identity hub and landing page

**Key Features:**
- Hero section: "Who is RECTOR?"
- Mission statement and philosophy
- Links to all subdomains
- Contact information
- Brief showcase of featured work

**Target Audience:**
- Potential collaborators
- Hackathon organizers
- Islamic community
- AI agents and bots seeking information

**Tech Stack:** Static site (HTML/CSS/JS or Astro)

---

### 3.2 portfolio.rectorspace.com
**Purpose:** Comprehensive showcase of all RECTOR's work

**Key Features:**
- Featured projects (top 3-5 most impactful)
- Activity timeline (chronological stream)
- Category filters:
  - Hackathons & Competitions
  - Bounties & Grants
  - Open Source Contributions
  - Business Projects
  - Da'wah Tech Projects
- Skills & tech stack visualization
- GitHub integration (auto-fetch from rz1989s + RECTOR-LABS)
- Project details: description, tech stack, awards, learnings

**Data Sources:**
- GitHub API: rz1989s (personal)
- GitHub API: RECTOR-LABS (organization)
- Manual enrichment: awards, impact, reflections

**Tech Stack:** Next.js/Astro + GitHub API + Tailwind CSS

---

### 3.3 labs.rectorspace.com
**Purpose:** RECTOR LABS showcase - tools, projects, innovations

**Key Features:**
- RECTOR LABS mission and vision
- Active projects and tools
- Innovation showcase
- Team/collaborators (if applicable)
- Blog/updates section

**Tech Stack:** Static site or Next.js

---

### 3.4 journal.rectorspace.com
**Purpose:** Personal thoughts, technical writings, reflections

**Key Features:**
- Blog posts (technical & personal)
- Islamic reflections
- Project learnings
- Book reviews
- Tagging and categorization

**Tech Stack:** Ghost CMS (self-hosted)

---

### 3.5 cheatsheet.rectorspace.com
**Purpose:** Personal developer reference library

**Key Features:**
- Searchable cheatsheet database
- Categories: Languages, Frameworks, Tools, DevOps, etc.
- Quick copy code snippets
- Personal notes and annotations
- Bookmarking/favorites

**Tech Stack:** Astro + Markdown + Search (Algolia/Fuse.js)

---

### 3.6 dakwa.rectorspace.com
**Purpose:** Islamic da'wah content and resources

**Key Features:**
- Islamic articles and content
- Da'wah resources
- Islamic guidance for developers
- Integration of faith and technology
- Multilingual support (Arabic, English, Indonesian)

**Tech Stack:** Astro/Next.js + CMS (Sanity/Contentful)

---

### 3.7 quran.rectorspace.com
**Purpose:** Quranic resources and insights

**Key Features:**
- Quranic verses with translations
- Tafsir (commentary) integration
- Search functionality
- Daily ayah
- Thematic exploration
- Arabic with multiple translations

**Tech Stack:** Next.js + Quran API + Custom DB

---

## 4. Technical Architecture

### 4.1 Repository Structure

**CORE Repository (this repo):**
```
core/
├── docs/                    # Planning & documentation
├── design-system/           # Shared design assets
├── infrastructure/          # Deployment configs
├── prototypes/             # Experiments
└── projects/               # Git submodules
    ├── homepage/           (submodule)
    ├── portfolio/          (submodule)
    ├── labs/               (submodule)
    ├── cheatsheet/         (submodule)
    ├── dakwa/              (submodule)
    └── quran/              (submodule)
```

**Individual Repositories:**
- `rector-labs/homepage` → rectorspace.com
- `rector-labs/portfolio` → portfolio.rectorspace.com
- `rector-labs/labs` → labs.rectorspace.com
- `rector-labs/cheatsheet` → cheatsheet.rectorspace.com
- `rector-labs/dakwa` → dakwa.rectorspace.com
- `rector-labs/quran` → quran.rectorspace.com

### 4.2 Infrastructure

**Hosting:** VPS (rectorspace.com)
- Dedicated user accounts per project (isolation principle)
- Nginx reverse proxy
- SSL certificates (Let's Encrypt)
- PM2/systemd for process management

**DNS Management:**
- Primary domain: rectorspace.com
- Subdomain strategy: project-specific subdomains

**CI/CD:**
- GitHub Actions for automated deployment
- Branch strategy: main (production), dev (development)

### 4.3 Technology Preferences

**Frontend Framework:**
- Primary: Astro (static performance)
- Dynamic: Next.js (when interactivity needed)
- Styling: Tailwind CSS

**CMS:**
- Ghost (journal.rectorspace.com)
- Headless CMS (dakwa - Sanity/Contentful)

**APIs:**
- GitHub API (portfolio data)
- Quran API (quran.rectorspace.com)

---

## 5. Design System

### 5.1 Brand Colors
- **Primary Gradient:** Turquoise (#5EDDC6) → Cyan (#4DD0E1) → Blue (#42A5F5)
- **Backgrounds:** Dark Navy (#1A252F), Navy (#2C3E50)
- **Text:** Navy (#2C3E50), White (#FFFFFF)

### 5.2 Typography
- **Headings:** Space Grotesk (modern, technical)
- **Body:** Inter (readable, professional)
- **Code:** JetBrains Mono (developer-focused)

### 5.3 Visual Identity
- **Logo:** RECTOR LABS "R" formed by tech/science symbols
- **Style:** Modern, tech-forward, Islamic-aware
- **Imagery:** Pixel art RECTOR profile, tech illustrations

---

## 6. Success Metrics

### 6.1 Phase 1 (Foundation) - Q1 2025
- ✅ All 7 subdomains deployed and accessible
- ✅ Homepage clearly communicates RECTOR's identity
- ✅ Portfolio displays at least 10 projects from GitHub
- ✅ Design system documented and reusable
- ✅ Infrastructure automated (CI/CD functional)

### 6.2 Phase 2 (Content) - Q2 2025
- 🎯 Journal: 12+ published articles
- 🎯 Dakwa: 20+ Islamic content pieces
- 🎯 Cheatsheet: 30+ documented references
- 🎯 Labs: 3+ active projects showcased

### 6.3 Phase 3 (Engagement) - Q3-Q4 2025
- 🎯 Portfolio: Auto-updating from GitHub (weekly sync)
- 🎯 Analytics: 1000+ monthly visitors across ecosystem
- 🎯 Da'wah impact: Measurable engagement on dakwa/quran sites

---

## 7. Timeline & Phases

### Phase 1: Foundation (Weeks 1-4)
**Week 1: Planning & Setup** - ✅ Complete
- ✅ PRD creation (15,000+ words)
- ✅ Design system definition
- ✅ Infrastructure planning
- ✅ Repository structure setup
- ✅ Git repository initialization and push to GitHub

**Week 2: Core Sites**
- Homepage (rectorspace.com)
- Portfolio MVP (portfolio.rectorspace.com)
- Infrastructure deployment

**Week 3: Content Platforms**
- Cheatsheet site
- Ghost setup (journal)
- RECTOR LABS showcase

**Week 4: Da'wah Platforms**
- Dakwa site foundation
- Quran site foundation
- Testing & launch

### Phase 2: Content Creation (Weeks 5-12)
- Populate cheatsheets
- Write journal articles
- Create da'wah content
- Develop Quran resources

### Phase 3: Automation & Enhancement (Weeks 13+)
- GitHub auto-sync for portfolio
- SEO optimization
- Analytics integration
- Performance optimization

---

## 8. Risk Management

### 8.1 Technical Risks
| Risk | Mitigation |
|------|------------|
| VPS downtime | Monitoring + backup strategy |
| GitHub API rate limits | Caching + periodic sync |
| Content management complexity | Start simple, iterate |

### 8.2 Scope Risks
| Risk | Mitigation |
|------|------------|
| Feature creep | Strict adherence to PRD phases |
| Time underestimation | Buffer time in timeline |
| Perfectionism paralysis | Ship MVP, iterate based on usage |

---

## 9. Dependencies

### 9.1 External Services
- GitHub (API access)
- VPS hosting (rectorspace.com)
- Domain registrar (DNS management)
- Ghost CMS (self-hosted)
- Quran API (third-party)

### 9.2 Internal Dependencies
- Design system completion before site development
- Infrastructure setup before deployment
- Content strategy before platform launch

---

## 10. Appendix

### 10.1 Glossary
- **RECTOR:** Builder, developer, Islamic content creator
- **RECTOR LABS:** Innovation lab and project showcase
- **Building for Eternity:** Philosophy of integrating dunya and akhirah
- **Ihsan:** Excellence and perfection in execution
- **Amanah:** Trust and responsibility in work

### 10.2 References
- Global CLAUDE.md: `/Users/rz/.claude/CLAUDE.md`
- Brand Assets: `/Users/rz/local-dev/core/design-system/assets/logos/`
- Design System: `/Users/rz/local-dev/core/design-system/`

---

**Document Control:**
- Created: 2025-11-02
- Last Review: 2025-11-02
- Next Review: Weekly during Phase 1
- Approved by: RECTOR
