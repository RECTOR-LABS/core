import type { ReactNode } from "react";

import { arbitalData } from "@/lib/content/arbital";
import { ScrollReveal } from "@/components/islands/ScrollReveal";
import { ProgressBar } from "@/components/islands/ProgressBar";
import { langModifier, techBars } from "./arbital-helpers";

// ---------------------------------------------------------------------------
// ModernArbital — the MODERN ("dark gradient") arbital CV markup.
//
// Renders verbatim from `arbitalData`, wiring two islands:
//   • ScrollReveal — staggers the stat / project / org cards in on scroll
//   • ProgressBar  — animates the tech-stack bars on scroll (children mode)
//
// Sources:
//   app/views/apply/arbital_modern.html.erb             (standalone /modern)
//   the [data-theme="modern"] block in arbital.html.erb  (switcher container)
//
// ScrollReveal placement (mirrors the superteam route's documented rule):
//   The Stimulus scroll_reveal controller animates ONLY the
//   `data-scroll-reveal-target="item"` elements (the cards) — never the
//   `<h2 class="section-title">`. The React ScrollReveal island animates its
//   DIRECT children, so the wrapper goes around the cards' parent (the grid) and
//   the <h2> stays OUTSIDE it as a static sibling. The projects grid uses
//   `data-scroll-reveal-delay-value="80"` in the .erb → `delay={80}` here.
// ---------------------------------------------------------------------------

interface ModernArbitalProps {
  /**
   * Value rendered for the 6th stat card.
   *
   * PARITY QUIRK: the standalone modern view (arbital_modern.html.erb) references
   * `@stats[:solana_projects]` (nil → prod renders an EMPTY
   * `<div class="stat-value"></div>`). The switcher container uses
   * `@stats[:trading_projects]` → "6". Callers pass "" or "6" accordingly.
   */
  sixthStatValue: string;
  /** Label for the 6th stat: "Solana Projects" (standalone) | "Trading Projects" (switcher). */
  sixthStatLabel: string;
  /** Footer URL path text, e.g. "rectorspace.com/apply/arbital/modern". */
  footerPath: string;
  /** Build-time date string for the footer ("%Y-%m-%d"). */
  lastUpdated: string;
  /**
   * Optional theme-switcher chrome, rendered inside the hero exactly where the
   * switcher container places it. Omitted on the standalone /modern route.
   */
  switcher?: ReactNode;
  /**
   * Whether to render the "Your Requirements → My Experience" section.
   * Present only in the switcher container; absent on the standalone /modern route.
   */
  showRequirements?: boolean;
}

export function ModernArbital({
  sixthStatValue,
  sixthStatLabel,
  footerPath,
  lastUpdated,
  switcher,
  showRequirements = false,
}: ModernArbitalProps) {
  const { identity, stats, featuredProjects, techStack, orgs, whyArbital, whatIBring, contact } =
    arbitalData;

  const bars = techBars(techStack);

  return (
    <div className="modern-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="avatar-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element -- avatar sizing/border are driven by `.modern-dark .avatar-img`; next/image's wrapper would fight that composition for no LCP benefit on a 3KB same-origin image */}
          <img src={`/images/${identity.avatar}`} className="avatar-img" alt={identity.name} />
        </div>
        <h1 className="hero-name">{identity.name}</h1>
        <p className="hero-tagline">{identity.tagline}</p>
        <p className="hero-role">{identity.role}</p>

        <div className="badge-row">
          <span className="badge rust">Rust</span>
          <span className="badge python">Python</span>
          <span className="badge solana">Solana</span>
        </div>

        {/* Theme Switcher — Below Profile (switcher context only) */}
        {switcher}
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <h2 className="section-title">Proof of Work</h2>
        <ScrollReveal className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalStars}</div>
            <div className="stat-label">GitHub Stars</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.vulnerabilitiesFound}</div>
            <div className="stat-label">Vulnerabilities Found</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.bountyEarned}</div>
            <div className="stat-label">Bounty Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.hackathons2025}</div>
            <div className="stat-label">Hackathons 2025</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalRepos}</div>
            <div className="stat-label">Repositories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{sixthStatValue}</div>
            <div className="stat-label">{sixthStatLabel}</div>
          </div>
        </ScrollReveal>
      </section>

      {/* Requirements Match (switcher context only) */}
      {showRequirements && (
        <section className="requirements-section">
          <h2 className="section-title">Your Requirements → My Experience</h2>
          <div className="requirements-match">
            {whatIBring.map((item) => (
              <div className="match-item" key={item.area}>
                <div className="match-area">{item.area}</div>
                <div className="match-arrow">→</div>
                <div className="match-desc">{item.match}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Arbital */}
      <section className="why-section-wrapper">
        <h2 className="section-title">Why Arbital</h2>
        <div className="why-section">
          {whyArbital.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="projects-section">
        <h2 className="section-title">Featured Projects</h2>
        <ScrollReveal className="projects-grid" delay={80}>
          {featuredProjects.map((project) => (
            <div className="project-card" key={project.name}>
              <div className="project-header">
                <span className="project-name">{project.name}</span>
                <span className={`project-lang ${langModifier(project.language)}`}>
                  {project.language}
                </span>
              </div>
              <div className="project-org">@{project.org}</div>
              <p className="project-desc">{project.description}</p>
              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="project-relevance">{project.relevance}</div>
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* Tech Stack */}
      <section className="tech-section">
        <h2 className="section-title">Technical Stack</h2>
        <ProgressBar className="tech-grid">
          {bars.map((tech) => (
            <div className="tech-item" key={tech.name}>
              <span className={`tech-name${tech.highlight ? " highlight" : ""}`}>
                {tech.name}
              </span>
              <div className="tech-bar-wrapper">
                <div
                  className={`tech-bar${tech.highlight ? " highlight" : ""}`}
                  data-bar
                  data-target-width={tech.width}
                  style={{ width: tech.width }}
                />
              </div>
              <span className="tech-percent">{tech.level}%</span>
            </div>
          ))}
        </ProgressBar>

        <div className="domains-wrap">
          {techStack.domains.map((domain) => (
            <span className="domain-pill" key={domain}>
              {domain}
            </span>
          ))}
        </div>
      </section>

      {/* GitHub Presence */}
      <section className="github-section">
        <h2 className="section-title">GitHub Presence</h2>
        <ScrollReveal className="orgs-grid">
          {orgs.map((org) => (
            <a
              href={org.url}
              target="_blank"
              rel="noopener"
              className="org-card"
              key={org.name}
            >
              <div className="org-info">
                <span className="org-name">@{org.name}</span>
                <span className="org-type">{org.type}</span>
              </div>
              <div className="org-count">
                {org.repos}
                <span>repos</span>
              </div>
            </a>
          ))}
        </ScrollReveal>
      </section>

      {/* Contact */}
      <section className="contact-section">
        <p className="contact-prompt">Ready to build what the Old Guard won&apos;t?</p>
        <div className="contact-links">
          <a href={contact.github} target="_blank" rel="noopener" className="contact-btn">
            GitHub
          </a>
          <a
            href={contact.twitter}
            target="_blank"
            rel="noopener"
            className="contact-btn primary"
          >
            Twitter / X
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="page-footer">
        <p>{footerPath}</p>
        <p>Last updated: {lastUpdated}</p>
      </footer>
    </div>
  );
}
