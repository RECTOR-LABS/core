import type { ReactNode } from "react";

import { arbitalData } from "@/lib/content/arbital";
import { BootSequence } from "@/components/islands/BootSequence";
import { ProgressBar } from "@/components/islands/ProgressBar";
import { Typing } from "@/components/islands/Typing";
import { bootLines, langModifier, techBars } from "./arbital-helpers";

// ---------------------------------------------------------------------------
// RetroArbital — the RETRO ("CRT terminal") arbital CV markup.
//
// Renders verbatim from `arbitalData`, wiring three islands:
//   • BootSequence — types the BIOS boot-header lines, then fades in the content
//   • ProgressBar  — animates the tech-stack bars on scroll (children mode)
//   • Typing       — types the contact prompt
//
// Sources:
//   app/views/apply/arbital_retro.html.erb            (standalone /retro)
//   the [data-theme="retro"] block in arbital.html.erb (switcher container)
//
// The two contexts differ only in a few spots, which are parameterized via props
// (see below). The markup is otherwise identical, so this single component backs
// both the standalone /apply/arbital/retro route and the switcher's retro half.
// ---------------------------------------------------------------------------

interface RetroArbitalProps {
  /**
   * Value rendered for the 6th stat box.
   *
   * PARITY QUIRK: the standalone retro view (arbital_retro.html.erb) references
   * `@stats[:solana_projects]`, a key the controller never sets → nil → prod
   * renders an EMPTY `<div class="stat-value"></div>`. The switcher container
   * (arbital.html.erb) uses the correct `@stats[:trading_projects]` → "6".
   * Callers pass "" (standalone, reproducing the nil) or "6" (switcher).
   */
  sixthStatValue: string;
  /** Label for the 6th stat: "Solana Projects" (standalone) | "Trading Projects" (switcher). */
  sixthStatLabel: string;
  /** Footer URL path text, e.g. "rectorspace.com/apply/arbital/retro". */
  footerPath: string;
  /** Build-time timestamp string for the footer ("%Y-%m-%d %H:%M UTC"). */
  generatedAt: string;
  /**
   * Optional theme-switcher chrome, rendered below the profile exactly where the
   * switcher container places it. Omitted on the standalone /retro route (which
   * has no switcher); supplied on the switcher page.
   */
  switcher?: ReactNode;
  /**
   * Whether to render the "YOUR REQUIREMENTS → MY EXPERIENCE" section.
   * Present only in the switcher container; absent on the standalone /retro route.
   */
  showRequirements?: boolean;
}

export function RetroArbital({
  sixthStatValue,
  sixthStatLabel,
  footerPath,
  generatedAt,
  switcher,
  showRequirements = false,
}: RetroArbitalProps) {
  const { identity, stats, featuredProjects, techStack, orgs, whyArbital, whatIBring, contact } =
    arbitalData;

  const bars = techBars(techStack);

  return (
    <div className="crt-monitor">
      <div className="crt-screen">
        <BootSequence
          lines={bootLines(stats.totalRepos)}
          headerClassName="boot-header"
          lineClassName="bios-line"
          content={
            <>
              {/* Identity Section */}
              <div className="identity-section">
                <div className="avatar-container">
                  <div className="avatar-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element -- avatar sizing/border are driven by `.retro-terminal .avatar-frame img`; next/image's wrapper would fight that composition for no LCP benefit on a 3KB same-origin image */}
                    <img src={`/images/${identity.avatar}`} alt={identity.name} />
                  </div>
                </div>
                <div className="identity-info">
                  <h1 className="identity-name">{identity.name}</h1>
                  <div className="identity-tagline">&quot;{identity.tagline}&quot;</div>
                  <div className="identity-role">{identity.role}</div>
                </div>
              </div>

              {/* Theme Switcher — Below Profile (switcher context only) */}
              {switcher}

              {/* Stats Section */}
              <div className="section-header">PROOF OF WORK</div>
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-value">{stats.totalStars}</div>
                  <div className="stat-label">GitHub Stars</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{stats.vulnerabilitiesFound}</div>
                  <div className="stat-label">Vulns Found</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{stats.bountyEarned}</div>
                  <div className="stat-label">Bounty Won</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{stats.hackathons2025}</div>
                  <div className="stat-label">Hackathons &apos;25</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{stats.totalRepos}</div>
                  <div className="stat-label">Repositories</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{sixthStatValue}</div>
                  <div className="stat-label">{sixthStatLabel}</div>
                </div>
              </div>

              {/* Requirements Match (switcher context only) */}
              {showRequirements && (
                <>
                  <div className="section-header">YOUR REQUIREMENTS → MY EXPERIENCE</div>
                  <div className="requirements-match">
                    {whatIBring.map((item) => (
                      <div className="match-item" key={item.area}>
                        <div className="match-area">{item.area}</div>
                        <div className="match-arrow">→</div>
                        <div className="match-desc">{item.match}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Why Arbital */}
              <div className="section-header">WHY ARBITAL</div>
              <div className="why-section">
                {whyArbital.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Featured Projects */}
              <div className="section-header">FEATURED PROJECTS</div>
              <div className="project-list">
                {featuredProjects.map((project) => (
                  <div className="project-item glitch-hover" key={project.name}>
                    <div className="project-header">
                      <span className="project-name">{project.name}</span>
                      <span className={`project-lang ${langModifier(project.language)}`}>
                        {project.language}
                      </span>
                    </div>
                    <div className="project-org">@{project.org}</div>
                    <div className="project-desc">{project.description}</div>
                    <div className="project-tags">
                      {project.tags.map((tag) => (
                        <span className="project-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="project-relevance">{project.relevance}</div>
                  </div>
                ))}
              </div>

              {/* Tech Stack — animated progress bars */}
              <div className="section-header">TECHNICAL STACK</div>
              <ProgressBar className="tech-stack-list">
                {bars.map((tech) => (
                  <div className="tech-item" key={tech.name}>
                    <span className={`tech-name${tech.highlight ? " highlight" : ""}`}>
                      {tech.name}
                    </span>
                    <div className="tech-bar-container">
                      <div
                        className={`tech-bar${tech.highlight ? " highlight" : ""}`}
                        data-bar
                        data-target-width={tech.width}
                        style={{ width: tech.width }}
                      />
                    </div>
                    <span className="tech-level">{tech.level}%</span>
                  </div>
                ))}
              </ProgressBar>

              <div className="section-header">DOMAIN EXPERTISE</div>
              <div className="domains-list">
                {techStack.domains.map((domain) => (
                  <span className="domain-tag" key={domain}>
                    {domain}
                  </span>
                ))}
              </div>

              {/* GitHub Organizations */}
              <div className="section-header">GITHUB PRESENCE</div>
              <div className="orgs-grid">
                {orgs.map((org) => (
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener"
                    className="org-item"
                    key={org.name}
                  >
                    <div>
                      <div className="org-name">@{org.name}</div>
                      <div className="org-type">{org.type}</div>
                    </div>
                    <div className="org-repos">{org.repos} repos</div>
                  </a>
                ))}
              </div>

              {/* Contact */}
              <div className="contact-section">
                <div className="prompt">
                  <Typing
                    text="Ready to build what the Old Guard won't?"
                    speed={40}
                  />
                  <span className="cursor" />
                </div>
                <div className="contact-links">
                  <a
                    href={contact.github}
                    target="_blank"
                    rel="noopener"
                    className="contact-link"
                  >
                    [GitHub]
                  </a>
                  <a
                    href={contact.twitter}
                    target="_blank"
                    rel="noopener"
                    className="contact-link"
                  >
                    [Twitter/X]
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="terminal-footer">
                <div>{footerPath}</div>
                <div>Generated: {generatedAt}</div>
              </div>
            </>
          }
        />
      </div>
    </div>
  );
}
