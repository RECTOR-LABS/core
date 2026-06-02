import { cache } from "react";
import type { Metadata } from "next";

import { loadResume } from "@/lib/content/resume";
import { loadAchievements } from "@/lib/content/achievements";
import {
  buildStats,
  sortAwardsByPrize,
  webBullets,
  featuredProjects,
  skillModifierClass,
} from "@/lib/content/superteam";

import { ScrollReveal } from "@/components/islands/ScrollReveal";
import { Counter } from "@/components/islands/Counter";

// Dedupe the YAML read+parse across generateMetadata and the page body within a
// single render pass (mirrors the cache() pattern used by the work routes).
const getResume = cache(() => loadResume());

// ---------------------------------------------------------------------------
// Static SSG RSC. All data comes from local YAML (resume.yml + achievements.yml)
// — no live GitHub, no request-time data — so there is NO `revalidate`.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ScrollReveal mapping note
//
// The Rails Stimulus controller (scroll_reveal_controller.js) animates only the
// elements explicitly marked `data-scroll-reveal-target="item"` — NOT every
// child of the controller element. In superteam.html.erb those targets are the
// cards/items; the `<h2 class="section-title">` is NEVER a target, so it stays
// fully visible.
//
// The React ScrollReveal island animates its DIRECT children. To reproduce the
// Stimulus behavior faithfully, the wrapper is placed around the ITEMS' direct
// parent (the grid, or the run of entries) and the `<h2>` is kept OUTSIDE it as
// a static sibling — so the title is never hidden/revealed and each card/entry
// staggers independently, exactly as in production.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Metadata — ports the `content_for :title` / `content_for :head` from
// app/views/apply/superteam.html.erb. `robots: noindex,nofollow` is inherited
// from the /apply layout (Next shallow-merges metadata; this page does not set
// `robots`, so the layout value survives).
// ---------------------------------------------------------------------------
export function generateMetadata(): Metadata {
  const resume = getResume();
  return {
    title: "RECTOR | Superteam Application",
    openGraph: {
      title: "Rheza Sulaiman — Superteam Application",
      description: resume.summary.web,
      type: "profile",
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SuperteamPage() {
  const resume = getResume();
  const { all: achievements, totalEarnings, winCount } = loadAchievements();

  const stats = buildStats(
    { totalEarnings, winCount, achievements },
    resume.stats,
  );
  const awards = sortAwardsByPrize(achievements);
  const projects = featuredProjects(resume.projects);

  const { personal, summary } = resume;
  const githubUrl = `https://${personal.github}`;
  const twitterUrl = `https://x.com/${personal.twitter.replace(/@/g, "")}`;
  const telegramUrl = `https://t.me/${personal.telegram.replace(/@/g, "")}`;

  // Footer date — Rails renders Time.current.strftime("%Y-%m-%d"). This page is
  // statically generated, so the date is fixed at build time (matching the
  // "deploy = publish" model used across the file-based sections).
  const buildDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="superteam-page">
      <div className="superteam-container">
        {/* ── 2. Header ──────────────────────────────── */}
        <header className="superteam-header">
          {/* eslint-disable-next-line @next/next/no-img-element -- avatar: size/border/shadow are driven by the .superteam-header .avatar class; next/image's wrapper complicates that composition for no LCP benefit on a 140px same-origin image */}
          <img
            src={`/images/${personal.avatar}`}
            alt={personal.name}
            className="avatar"
            width={140}
            height={140}
          />
          <h1 className="name">{personal.name}</h1>
          <p className="alias">
            {personal.alias} · {personal.location}
          </p>
          <p className="tagline">{summary.web}</p>

          <div className="contact-pills">
            <a href={githubUrl} target="_blank" rel="noopener" className="contact-pill">
              GitHub
            </a>
            <a href={twitterUrl} target="_blank" rel="noopener" className="contact-pill">
              Twitter
            </a>
            <a href={telegramUrl} target="_blank" rel="noopener" className="contact-pill">
              Telegram
            </a>
            <a href={`mailto:${personal.email}`} className="contact-pill">
              Email
            </a>
          </div>
        </header>

        {/* ── 3. Stats Banner ───────────────────────── */}
        {/* No <h2> here — the stat cards ARE the section's direct children, so
            the wrapper is the section itself. */}
        <ScrollReveal className="superteam-stats">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <span className="stat-number">
                <Counter number={stat.number} display={stat.value} />
              </span>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </ScrollReveal>

        {/* ── 4. Awards & Grants ─────────────────────── */}
        <section className="superteam-awards">
          <h2 className="section-title">Awards &amp; Grants</h2>
          <ScrollReveal className="awards-grid">
            {awards.map((a) => (
              <div className={`award-card award-${a.type}`} key={a.slug}>
                <div className="award-place">
                  {a.badgeEmoji} {a.badgeLabel}
                </div>
                <div className="award-prize">{a.formattedPrize}</div>
                <div className="award-event">{a.fullEvent}</div>
                <div className="award-project">{a.title}</div>
              </div>
            ))}
          </ScrollReveal>
        </section>

        {/* ── 5. Featured Projects ──────────────────── */}
        <section className="superteam-projects">
          <h2 className="section-title">Featured Projects</h2>
          <ScrollReveal className="projects-grid">
            {projects.map((project) => (
              <div className="project-card" key={project.name}>
                <h3 className="project-name">{project.name}</h3>
                <span className="project-org">@{project.org}</span>
                <p className="project-desc">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span className="project-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="project-links">
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener"
                    className="project-link"
                  >
                    GitHub
                  </a>
                  {project.live_url ? (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener"
                      className="project-link"
                    >
                      Live
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </ScrollReveal>
        </section>

        {/* ── 6. Experience ──────────────────────────── */}
        {/* Stimulus targets are the .exp-entry elements (direct children after
            the <h2>). Wrap only the entries; keep the <h2> static. */}
        <section className="superteam-experience">
          <h2 className="section-title">Experience</h2>
          <ScrollReveal>
            {resume.experience.map((exp) => (
              <div className="exp-entry" key={`${exp.company}-${exp.title}`}>
                <div className="exp-header">
                  <div className="exp-title-group">
                    <h3 className="exp-title">{exp.title}</h3>
                    <div className="exp-company">{exp.company}</div>
                  </div>
                  <div className="exp-date">
                    {exp.date_start} — {exp.date_end}
                  </div>
                </div>
                <div className="exp-location">{exp.location}</div>
                <ul className="exp-bullets">
                  {webBullets(exp.bullets).map((bullet) => (
                    <li key={bullet.text}>{bullet.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </ScrollReveal>
        </section>

        {/* ── 7. Technical Skills ────────────────────── */}
        {/* Stimulus targets are the per-category <div> wrappers (the
            .skills-grid children). Wrap them; keep the <h2> static. */}
        <section className="superteam-skills">
          <h2 className="section-title">Technical Skills</h2>
          <ScrollReveal className="skills-grid">
            {resume.skills.map((group) => {
              const modifier = skillModifierClass(group.category);
              return (
                <div key={group.category}>
                  <div className="skill-category">{group.category}</div>
                  <div className="skill-pills">
                    {group.items.map((item) => (
                      <span className={`skill-pill ${modifier}`} key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </ScrollReveal>
        </section>

        {/* ── 8. Security Expertise ──────────────────── */}
        {/* Stimulus targets are the .security-item elements. Wrap them; keep the
            <h2> static. */}
        <section className="superteam-security">
          <h2 className="section-title">Security Expertise</h2>
          <ScrollReveal>
            {resume.security_expertise.map((item) => (
              <div className="security-item" key={item.area}>
                <p className="area-name">{item.area}</p>
                <p className="area-detail">{item.detail}</p>
              </div>
            ))}
          </ScrollReveal>
        </section>

        {/* ── 9. Education + Footer ──────────────────── */}
        {/* No scroll-reveal controller on this section in the .erb. */}
        <section className="superteam-education">
          <h2 className="section-title">Education</h2>
          <p>{resume.education.text}</p>
        </section>

        <footer className="superteam-footer">
          {/* Tech attribution updated for the migrated stack — the Rails source
              read "Built with Rails 8"; this page is now served by Next.js. */}
          <p>Built with Next.js · rectorspace.com/apply/superteam</p>
          <p>{buildDate}</p>
        </footer>
      </div>
    </div>
  );
}
