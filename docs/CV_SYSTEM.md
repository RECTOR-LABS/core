# CV System

The `/apply` section of rectorspace.com serves RECTOR's CV. This document covers the
**`resume.yml`-driven CV system**: how a single YAML source of truth produces two
outputs — an interactive web page and a printable PDF resume — that never drift apart.

## Overview

Two data files feed two outputs:

- **`config/resume.yml`** — personal info, professional summary, skills, experience,
  projects, and security expertise.
- **`config/achievements.yml`** — awards, grants, and bounties. Shared with the
  homepage; see the *Achievements* section of `CLAUDE.md`.

Both outputs read both files:

- **`/apply/superteam`** — the interactive web page, rendered by Rails on request.
- **`rake resume:generate`** — a standalone, printable HTML resume written to disk.

Because the data lives in one place, editing CV content updates the web page and the
PDF together — there is no second copy to keep in sync.

## Design rationale

The decisions behind the system, worth keeping in mind before changing it:

**Single source of truth.** CV content is plain YAML, edited once. Both outputs render
from the same data, so they cannot disagree. No copy-paste, no drift.

**Awards are never duplicated.** Achievements live *only* in `config/achievements.yml`,
read through the `Achievement` model. Totals — `Achievement.total_earnings`,
`Achievement.win_count` — are computed at render time. Recording one new win updates
the homepage, the web CV, and the PDF at once. `resume.yml` deliberately contains no
awards.

**`pdf` and `web` flags.** Each experience bullet, and the professional summary,
carries two booleans. The PDF is a tight one-pager and includes only `pdf: true`
content; the web page has more room and includes `web: true` content. One dataset
serves two audiences without a second draft.

**No database.** CV data is content, not application state. Keeping it in YAML makes
every change a reviewable git diff and avoids migrations. `resume.yml` is read fresh
at request time (web) and at task time (PDF).

## `config/resume.yml` structure

Top-level keys — see the file itself for current content:

| Key | Shape |
|-----|-------|
| `personal` | name, alias, location, contact handles, avatar |
| `stats` | list of `{ label, value, number }` — extra stat cards; earnings and win count are **not** here, they are computed from achievements |
| `summary` | `{ pdf, web }` — two length variants of the professional summary |
| `skills` | list of `{ category, items[] }` |
| `experience` | list of `{ title, company, date_start, date_end, location, bullets[] }`; each bullet is `{ text, pdf, web }` |
| `projects` | list of `{ name, org, github_url, live_url?, description, tags[], featured }` — only `featured: true` projects show on the web page |
| `security_expertise` | list of `{ area, detail }` |
| `education` | `{ text }` |

## Output 1 — Interactive page (`/apply/superteam`)

| Piece | Location |
|-------|----------|
| Route | `get "apply/superteam"` → `apply#superteam` (`config/routes.rb`) |
| Controller | `ApplyController#superteam`; data prepared by `set_superteam_data` |
| View | `app/views/apply/superteam.html.erb` (layout: `app/views/layouts/apply.html.erb`) |
| Styles | `app/assets/stylesheets/apply_superteam.css` |
| Behavior | Stimulus — `counter` (stat count-up) and `scroll-reveal` (fade-in on scroll) |

`set_superteam_data` loads `resume.yml`, `Achievement.all`, and assembles the stats
banner with `build_stats`. The banner is built at render time in this order:

1. **Ecosystem Earnings** — `Achievement.total_earnings`
2. **Wins** — `Achievement.win_count`
3. the `stats:` entries from `resume.yml` (e.g. Vulnerabilities Found, Repositories)
4. **Grants Received** — number of `type: grant` achievements

The view renders the resume data as themed sections in rectorspace.com's warm cream
design system. Featured projects (`featured: true`) and `web: true` experience
bullets are filtered in the view.

## Output 2 — PDF resume (`rake resume:generate`)

| Piece | Location |
|-------|----------|
| Task | `lib/tasks/resume.rake` → `resume:generate` |
| Template | `app/views/apply/_resume_pdf.html.erb` |
| Output | `~/Documents/secret/rheza-sulaiman-resume.html` |

`resume:generate` loads `resume.yml` and the achievements, computes a `stats` hash
(earnings, win count, grant amount, grant count), renders the ERB template through a
small `ResumeRenderer` binding, and writes a self-contained HTML file. The output
goes to `~/Documents/secret/` — outside the repo; the generated resume is not
committed.

The template includes only `pdf: true` content. To produce the final PDF, open the
generated HTML and print to PDF — the template carries `@page` and print rules for a
clean one-page result:

```bash
rake resume:generate
open ~/Documents/secret/rheza-sulaiman-resume.html   # then print → Save as PDF
```

## File map

| File | Role |
|------|------|
| `config/resume.yml` | CV data — source of truth |
| `config/achievements.yml` | Awards/grants — source of truth, shared with the homepage |
| `app/models/achievement.rb` | PORO that loads achievements and computes totals |
| `app/controllers/apply_controller.rb` | `superteam` action, `set_superteam_data`, `build_stats` |
| `config/routes.rb` | `apply/superteam` route |
| `app/views/apply/superteam.html.erb` | Interactive page view |
| `app/assets/stylesheets/apply_superteam.css` | Interactive page styles |
| `app/javascript/controllers/counter_controller.js` | Stat count-up animation |
| `lib/tasks/resume.rake` | `resume:generate` task and `ResumeRenderer` |
| `app/views/apply/_resume_pdf.html.erb` | PDF resume ERB template |

## Making changes

| To… | Edit… |
|-----|-------|
| Update CV content (summary, skills, experience, projects) | `config/resume.yml` |
| Add or change an award | `config/achievements.yml` — totals recompute automatically |
| Show or hide a bullet on PDF vs. web | the bullet's `pdf` / `web` flags in `resume.yml` |
| Regenerate the PDF resume | `rake resume:generate` |
| Restyle the web page | `app/assets/stylesheets/apply_superteam.css`, `superteam.html.erb` |
| Restyle the PDF | `app/views/apply/_resume_pdf.html.erb` |

## Related

`/apply/arbital`, `/apply/arbital/retro`, and `/apply/arbital/modern` are a separate,
earlier set of targeted CV pages. Their data is hardcoded in the controller
(`set_arbital_data`) rather than YAML-driven — they predate this system.

---

**Maintainer:** RECTOR · **Updated:** 2026-05-22
