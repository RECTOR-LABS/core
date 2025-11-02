# RECTOR LABS - CORE

> **"Building for Eternity"**

Central planning, design system, and infrastructure hub for the RECTOR LABS ecosystem.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-foundation-yellow.svg)]()

---

## 🎯 Overview

**CORE** is the foundation repository for RECTOR LABS digital ecosystem, housing:

- 📋 **Master Planning & Documentation** - PRD, architecture, implementation tracking
- 🎨 **Design System** - Shared colors, typography, and UI components
- 🏗️ **Infrastructure as Code** - Deployment configs, CI/CD pipelines
- 🔗 **Project Orchestration** - Git submodules for all subdomain projects

---

## 🌐 RECTOR LABS Ecosystem

The RECTOR LABS ecosystem consists of 7 interconnected platforms:

| Subdomain | Purpose | Tech Stack | Status |
|-----------|---------|------------|--------|
| **rectorspace.com** | Identity hub & landing page | Astro + Tailwind | 📋 Planned |
| **portfolio.rectorspace.com** | Work showcase (GitHub-powered) | Next.js + GitHub API | 📋 Planned |
| **labs.rectorspace.com** | RECTOR LABS project showcase | Astro + Tailwind | 📋 Planned |
| **journal.rectorspace.com** | Personal blog & writings | Ghost CMS | 📋 Planned |
| **cheatsheet.rectorspace.com** | Developer reference library | Astro + Markdown | 📋 Planned |
| **dakwa.rectorspace.com** | Islamic da'wah platform | Next.js + CMS | 📋 Planned |
| **quran.rectorspace.com** | Quranic resources | Next.js + Quran API | 📋 Planned |

---

## 📁 Repository Structure

```
core/
├── docs/                          # Planning & documentation
│   ├── PRD.md                     # Product Requirements Document
│   ├── ARCHITECTURE.md            # Technical architecture
│   ├── BRAND_GUIDELINES.md        # Visual identity & design rules
│   └── IMPLEMENTATION_PLAN.md     # Progress tracking
│
├── design-system/                 # Shared design assets
│   ├── colors.json               # Brand color palette
│   ├── typography.json           # Font system
│   ├── components/               # Reusable UI components
│   └── assets/                   # Logos, icons, images
│
├── infrastructure/                # Deployment & hosting
│   ├── dns/                      # Domain configuration
│   ├── hosting/                  # VPS, Nginx, SSL setup
│   └── ci-cd/                    # GitHub Actions workflows
│
├── prototypes/                    # Experiments & mockups
│
├── projects/                      # Git submodules (individual repos)
│   ├── homepage/                 (→ RECTOR-LABS/homepage)
│   ├── portfolio/                (→ RECTOR-LABS/portfolio)
│   ├── labs/                     (→ RECTOR-LABS/labs)
│   ├── cheatsheet/               (→ RECTOR-LABS/cheatsheet)
│   ├── dakwa/                    (→ RECTOR-LABS/dakwa)
│   └── quran/                    (→ RECTOR-LABS/quran)
│
└── README.md                      # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for component development)
- Git
- Access to RECTOR-LABS GitHub organization

### Clone with Submodules
```bash
# Clone the core repository
git clone --recurse-submodules git@github.com:RECTOR-LABS/core.git
cd core

# If already cloned without submodules
git submodule update --init --recursive
```

### Working with Submodules

**Update all submodules to latest:**
```bash
git submodule update --remote --merge
```

**Work on specific project:**
```bash
cd projects/homepage
npm install
npm run dev
```

**Add new submodule:**
```bash
git submodule add git@github.com:RECTOR-LABS/<repo-name>.git projects/<repo-name>
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PRD](docs/PRD.md) | Complete product requirements and scope |
| [Architecture](docs/ARCHITECTURE.md) | Technical architecture and infrastructure |
| [Brand Guidelines](docs/BRAND_GUIDELINES.md) | Visual identity, colors, typography, UI rules |
| [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) | Progress tracking and task management |

---

## 🎨 Design System

The RECTOR LABS design system ensures consistency across all platforms.

### Brand Colors
- **Primary Gradient:** Turquoise (#5EDDC6) → Cyan (#4DD0E1) → Blue (#42A5F5)
- **Backgrounds:** Dark Navy (#1A252F), Navy (#2C3E50)
- **See:** [`design-system/colors.json`](design-system/colors.json)

### Typography
- **Headings:** Space Grotesk
- **Body:** Inter
- **Code:** JetBrains Mono
- **See:** [`design-system/typography.json`](design-system/typography.json)

### Components
Reusable UI components in [`design-system/components/`](design-system/components/)

---

## 🏗️ Infrastructure

### VPS Hosting
- **Domain:** rectorspace.com
- **Strategy:** One user account per project (security isolation)
- **Reverse Proxy:** Nginx with SSL (Let's Encrypt)
- **Process Management:** PM2 (Node.js apps), systemd (Ghost)

### CI/CD
- **Tool:** GitHub Actions
- **Strategy:** Auto-deploy on push to `main`
- **Configs:** [`infrastructure/ci-cd/`](infrastructure/ci-cd/)

### DNS Configuration
All subdomains point to VPS, routed by Nginx reverse proxy.

---

## 📊 Current Status

**Phase:** Foundation (Week 1)
**Progress:** Planning & Documentation - 100% Complete

### Week 1 Achievements:
- ✅ Created CORE directory structure
- ✅ Extracted brand colors and typography
- ✅ Wrote comprehensive PRD (15,000+ words)
- ✅ Documented technical architecture
- ✅ Created brand guidelines
- ✅ Initialized implementation plan
- ✅ Completed main README.md
- ✅ Initialized git repository and pushed to GitHub

### Next Steps (Week 2):
- 📋 Create homepage repository
- 📋 Build design system components
- 📋 Document infrastructure setup
- 📋 Begin homepage implementation

---

## 🤝 Contributing

This is a personal project, but feedback and ideas are welcome!

### Workflow:
1. Create feature branch: `git checkout -b feature/description`
2. Make changes and commit with meaningful messages
3. Push to GitHub: `git push origin feature/description`
4. Create Pull Request to `dev` branch
5. After review, merge to `main` for production

---

## 📖 Philosophy

### Building for Eternity
RECTOR LABS integrates worldly (dunya) aspirations with afterlife (akhirah) objectives. Every project serves both technical excellence and Islamic values.

### Core Principles:
- **Ihsan (Excellence):** Strive for perfection in every implementation
- **Amanah (Trust):** Treat codebases as sacred responsibility
- **Avoid Waste (Israf):** Write efficient, clean code without bloat
- **Independence:** Not employee, not freelancer - building on own terms

---

## 🔗 Links

- **GitHub Organization:** [RECTOR-LABS](https://github.com/RECTOR-LABS)
- **Homepage:** [rectorspace.com](https://rectorspace.com) (coming soon)
- **Portfolio:** [portfolio.rectorspace.com](https://portfolio.rectorspace.com) (coming soon)
- **Personal GitHub:** [@rz1989s](https://github.com/rz1989s)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🕌 Islamic Expressions

This project embraces Islamic values and expressions:
- **Bismillah** - In the name of Allah (beginning tasks)
- **Alhamdulillah** - Praise be to Allah (expressing gratitude)
- **InshaAllah** - If Allah wills (future plans)
- **MashaAllah** - What Allah has willed (admiration)

May Allah accept this work and make it beneficial. Aamiin.

---

**RECTOR LABS** | Building for Eternity | 2025
