# RECTOR LABS - CORE

> **"Building for Eternity"**

Central orchestration hub for the RECTOR LABS 7-platform digital ecosystem.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Overview

**RECTOR LABS CORE** is the foundation repository that coordinates 7 independent platforms using git submodules. This repository contains brand assets, documentation, and serves as the central reference point for the entire RECTOR LABS ecosystem.

**Philosophy:** "Building for Eternity" - Integrating worldly excellence with Islamic values and da'wah mission.

---

## The Ecosystem

RECTOR LABS consists of 7 platforms under the `rectorspace.com` domain:

| Platform | Domain | Purpose | Status |
|----------|--------|---------|--------|
| Homepage | rectorspace.com | Identity hub & landing | 📋 Planned |
| Portfolio | portfolio.rectorspace.com | Work showcase | 📋 Planned |
| Labs | labs.rectorspace.com | Project showcase | 📋 Planned |
| Journal | journal.rectorspace.com | Blog & writings | 📋 Planned |
| Cheatsheet | cheatsheet.rectorspace.com | Dev reference | 📋 Planned |
| Dakwa | dakwa.rectorspace.com | Islamic content | 📋 Planned |
| Quran | quran.rectorspace.com | Quranic resources | 📋 Planned |

---

## Quick Start

### Clone with Submodules

```bash
git clone --recurse-submodules git@github.com:RECTOR-LABS/core.git
cd core
```

### Initialize Submodules (if not cloned recursively)

```bash
git submodule update --init --recursive
```

### Update All Platforms

```bash
git submodule update --remote --merge
```

---

## Repository Structure

```
core/
├── .github/workflows/    # GitHub Actions (Claude Code integration)
├── projects/            # Platform submodules
│   └── homepage/        # → RECTOR-LABS/homepage
├── assets/              # Brand assets and logos
├── docs/                # Documentation (TBD)
├── CLAUDE.md            # AI assistant guidance
└── README.md            # This file
```

---

## Tech Stack

**Unified Framework:** Next.js 15 (App Router + Server Components)

**Styling:** Tailwind CSS v4

**CMS:** Ghost (journal platform only)

**APIs:** GitHub API, Quran API

---

## Design System

### Brand Colors

- **Primary Gradient:** Turquoise (#5EDDC6) → Cyan (#4DD0E1) → Blue (#42A5F5)
- **Backgrounds:** Dark Navy (#1A252F), Navy (#2C3E50)

### Typography

- **Headings:** Space Grotesk
- **Body:** Inter
- **Code:** JetBrains Mono

### Brand Assets

Located in `assets/images/`:
- RECTOR LABS logos (3 variants)
- RECTOR profile image

---

## Working with Platforms

### Navigate to Platform

```bash
cd projects/homepage
npm run dev  # Start development server
```

### Add New Platform

```bash
# Create repository on GitHub first, then:
git submodule add git@github.com:RECTOR-LABS/<platform>.git projects/<platform>
git commit -m "Add <platform> as submodule"
git push origin dev
```

### Update CORE After Platform Changes

```bash
cd /path/to/core
git submodule update --remote --merge projects/<platform>
git add projects/<platform>
git commit -m "Update <platform> submodule"
git push origin dev
```

---

## Branch Strategy

- **`main`** - Production-ready (protected)
- **`dev`** - Active development (default)
- **`feature/*`** - Feature branches

---

## Philosophy

### Building for Eternity

Integrating worldly (dunya) aspirations with afterlife (akhirah) objectives:

**Worldly:**
- Technical excellence and professional portfolio
- Independent builder identity
- Hackathon success and community impact

**Afterlife:**
- Islamic da'wah platforms (dakwa, quran)
- Sharing beneficial knowledge
- Building tools for the ummah

### Islamic Values

- **Ihsan (Excellence):** Strive for perfection
- **Amanah (Trust):** Treat code as sacred responsibility
- **Avoid Israf (Waste):** Efficient, clean code

---

## Links

- **Organization:** [RECTOR-LABS](https://github.com/RECTOR-LABS)
- **Personal GitHub:** [@rz1989s](https://github.com/rz1989s)
- **Website:** [rectorspace.com](https://rectorspace.com) _(coming soon)_

---

## License

MIT License - See [LICENSE](LICENSE) for details

---

**May Allah accept this work and make it beneficial. Aamiin.**

**RECTOR LABS** | 2025
