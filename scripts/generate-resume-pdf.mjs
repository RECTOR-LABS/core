#!/usr/bin/env node
// ---------------------------------------------------------------------------
// generate-resume-pdf.mjs
//
// Standalone local Node ESM script — NOT imported by any Next.js route, NOT
// part of the build, NOT deployed.  Port of `rake resume:generate` +
// app/views/apply/_resume_pdf.html.erb.
//
// Usage:
//   node scripts/generate-resume-pdf.mjs
//   node scripts/generate-resume-pdf.mjs --out /tmp/resume-test
//   RESUME_OUT_DIR=/tmp/resume-test node scripts/generate-resume-pdf.mjs
//
// Default output: ~/Documents/secret/ (RECTOR's established resume paths)
//   ~/Documents/secret/rheza-sulaiman-resume.html
//   ~/Documents/secret/rheza-sulaiman-resume.pdf
//
// Data loading: reads web/data/{resume,achievements}.yml via js-yaml (already
// a production dep). The existing loaders (resume.ts / achievements.ts) live
// in TypeScript and require tsx to import. Instead this script uses js-yaml
// directly — identical semantics, zero extra tooling.
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { chromium } from "playwright";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT   = path.resolve(__dirname, "..");
const DATA_DIR   = path.join(WEB_ROOT, "data");

const RESUME_YAML       = path.join(DATA_DIR, "resume.yml");
const ACHIEVEMENTS_YAML = path.join(DATA_DIR, "achievements.yml");

// ---------------------------------------------------------------------------
// CLI arg / env override for output directory.
// Default: ~/Documents/secret (RECTOR's established path).
// ---------------------------------------------------------------------------
function resolveOutDir() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  if (outIdx !== -1 && args[outIdx + 1]) {
    return path.resolve(args[outIdx + 1]);
  }
  if (process.env.RESUME_OUT_DIR) {
    return path.resolve(process.env.RESUME_OUT_DIR);
  }
  return path.join(os.homedir(), "Documents", "secret");
}

// ---------------------------------------------------------------------------
// Data loading (mirrors the Ruby loaders — no schema validation here since
// the TS loaders with Zod do that; this script is a local utility that trusts
// the YAML files are already correct.)
// ---------------------------------------------------------------------------
function loadData() {
  const resume = yaml.load(fs.readFileSync(RESUME_YAML, "utf8"));
  const rawAchievements = yaml.load(fs.readFileSync(ACHIEVEMENTS_YAML, "utf8"));

  if (!resume || typeof resume !== "object") {
    throw new Error("resume.yml is empty or malformed");
  }
  if (!Array.isArray(rawAchievements)) {
    throw new Error("achievements.yml must be a top-level array");
  }

  return { resume, rawAchievements };
}

// ---------------------------------------------------------------------------
// Achievement helpers — ported from achievements.ts (plain JS, no TS types)
// ---------------------------------------------------------------------------
function badgeLabel(place) {
  switch (place.toLowerCase()) {
    case "approved": return "Grant Approved";
    case "winner":   return "Winner";
    default:         return `${place} Place`;
  }
}

function formattedPrize(prizeAmount, prizeExtras) {
  const base = `$${prizeAmount.toLocaleString("en-US")}`;
  return prizeExtras ? `${base} + ${prizeExtras}` : base;
}

function fullEvent(event, eventDetail) {
  return eventDetail ? `${event} • ${eventDetail}` : event;
}

function mapAchievement(raw) {
  return {
    prizeAmount:    raw.prize_amount,
    prizeExtras:    raw.prize_extras ?? null,
    type:           raw.type,
    title:          raw.title,
    place:          raw.place,
    event:          raw.event,
    eventDetail:    raw.event_detail ?? null,
    badgeLabel:     badgeLabel(raw.place),
    formattedPrize: formattedPrize(raw.prize_amount, raw.prize_extras ?? null),
    fullEvent:      fullEvent(raw.event, raw.event_detail ?? null),
  };
}

// ---------------------------------------------------------------------------
// PDF stats — port of resume.rake stats hash + ERB template values:
//
//   <%= stats[:wins] %> Wins
//   <%= stats[:earnings] %> Earned
//   125 Vulns Found             ← hardcoded in the ERB
//   <%= stats[:grants_amount] %> in Grants
// ---------------------------------------------------------------------------
function buildPdfStats(achievements) {
  const totalEarnings = achievements.reduce((sum, a) => sum + a.prizeAmount, 0);
  const winCount = achievements.length;
  const grantsTotal = achievements
    .filter((a) => a.type === "grant")
    .reduce((sum, a) => sum + a.prizeAmount, 0);

  return {
    wins:         String(winCount),
    earnings:     `$${totalEarnings.toLocaleString("en-US")}+`,
    vulns:        "13",                                           // Superteam audit: 13 findings (corrected from stale "125" gaming-audit claim)
    grantsAmount: `$${grantsTotal.toLocaleString("en-US")}`,
  };
}

// ---------------------------------------------------------------------------
// HTML builder — faithful port of app/views/apply/_resume_pdf.html.erb
// Sections in order: Header, Summary, Stats Bar, Technical Skills,
// Experience (pdf bullets only), Awards & Grants, Education.
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(resume, achievements, stats) {
  const personal = resume.personal;

  // ── Header contact line
  const contactFields = [
    personal.location,
    personal.email,
    personal.website,
    personal.github,
  ];
  const contactLine = contactFields
    .map((f) => escapeHtml(f))
    .join('<span class="sep">&middot;</span>');

  // ── Technical Skills rows
  const skillsHtml = (resume.skills || [])
    .map(
      (skill) =>
        `<div class="skills-row">
          <span class="skills-label">${escapeHtml(skill.category)}</span>
          <span class="skills-value">${escapeHtml(
            (skill.items || []).join(", "),
          )}</span>
        </div>`,
    )
    .join("\n");

  // ── Experience entries (pdf bullets only)
  const expHtml = (resume.experience || [])
    .map((exp) => {
      const pdfBullets = (exp.bullets || []).filter((b) => b.pdf === true);
      const bulletsHtml = pdfBullets
        .map((b) => `<li>${escapeHtml(b.text)}</li>`)
        .join("\n");
      return `<div class="exp-entry">
        <div class="exp-header">
          <div class="exp-title">
            ${escapeHtml(exp.title)} <span class="exp-company">&mdash; ${escapeHtml(exp.company)}</span>
          </div>
          <div class="exp-date">${escapeHtml(exp.date_start)} &mdash; ${escapeHtml(exp.date_end)}</div>
        </div>
        <ul class="exp-bullets">
          ${bulletsHtml}
        </ul>
      </div>`;
    })
    .join("\n");

  // ── Awards grid — sorted by prizeAmount DESC (port of sort_by { |a| -a.prize_amount })
  const sortedAwards = [...achievements].sort(
    (a, b) => b.prizeAmount - a.prizeAmount,
  );
  const awardsHtml = sortedAwards
    .map(
      (a) =>
        `<div class="award-item">
          <span class="award-name">${escapeHtml(a.formattedPrize)}</span>
          <span class="award-place">${escapeHtml(a.badgeLabel)}</span>
          &mdash; <span class="award-event">${escapeHtml(a.fullEvent)} (${escapeHtml(a.title)})</span>
        </div>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(personal.name)} &mdash; Resume</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    @page {
      size: letter;
      margin: 0.5in 0.6in;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      font-size: 10px;
      line-height: 1.5;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10px;
      line-height: 1.5;
      color: #1a1a1a;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in 0.6in;
    }

    @media print {
      body { padding: 0; }
    }

    /* ── Header ─────────────────────────────────── */

    .header {
      text-align: center;
      margin-bottom: 10px;
    }

    .header h1 {
      font-size: 22px;
      font-weight: 700;
      color: #41CFFF;
      letter-spacing: 2px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    .header .contact-line {
      font-size: 9px;
      color: #555;
    }

    .header .contact-line .sep {
      margin: 0 5px;
      color: #ccc;
    }

    /* ── Summary ─────────────────────────────────── */

    .summary {
      margin-bottom: 8px;
    }

    .summary p {
      font-size: 10px;
      color: #333;
      text-align: justify;
    }

    /* ── Stats Bar ───────────────────────────────── */

    .stats-bar {
      text-align: center;
      margin-bottom: 10px;
      padding: 5px 0;
      border-top: 1px solid #e5e5e5;
      border-bottom: 1px solid #e5e5e5;
      font-size: 9.5px;
      color: #444;
    }

    .stats-bar .stat-value {
      color: #41CFFF;
      font-weight: 700;
    }

    .stats-bar .stat-sep {
      margin: 0 10px;
      color: #ccc;
    }

    /* ── Section Titles ──────────────────────────── */

    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      border-bottom: 1.5px solid #41CFFF;
      padding-bottom: 2px;
      margin-bottom: 6px;
      color: #1a1a1a;
    }

    section {
      margin-bottom: 8px;
    }

    /* ── Technical Skills ────────────────────────── */

    .skills-row {
      display: flex;
      line-height: 1.6;
    }

    .skills-label {
      width: 120px;
      min-width: 120px;
      font-weight: 600;
      font-size: 9.5px;
      color: #333;
    }

    .skills-value {
      font-size: 9.5px;
      color: #444;
      flex: 1;
    }

    /* ── Experience ──────────────────────────────── */

    .exp-entry {
      margin-bottom: 6px;
    }

    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .exp-title {
      font-size: 10px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .exp-company {
      font-weight: 400;
      color: #555;
    }

    .exp-date {
      font-size: 9px;
      color: #777;
      white-space: nowrap;
    }

    .exp-bullets {
      list-style: disc;
      padding-left: 16px;
      margin-top: 2px;
    }

    .exp-bullets li {
      font-size: 9.5px;
      color: #333;
      margin-bottom: 1px;
    }

    /* ── Awards & Grants ─────────────────────────── */

    .awards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px 20px;
    }

    .award-item {
      font-size: 9.5px;
      line-height: 1.5;
    }

    .award-name {
      color: #41CFFF;
      font-weight: 600;
    }

    .award-place {
      font-weight: 600;
      color: #333;
    }

    .award-event {
      color: #555;
    }

    /* ── Education ───────────────────────────────── */

    .education p {
      font-size: 9.5px;
      color: #777;
      font-style: italic;
    }
  </style>
</head>
<body>

  <!-- 1. Header -->
  <div class="header">
    <h1>${escapeHtml(personal.name.toUpperCase())}</h1>
    <div class="contact-line">
      ${contactLine}
    </div>
  </div>

  <!-- 2. Summary -->
  <div class="summary">
    <p>${escapeHtml(resume.summary.pdf)}</p>
  </div>

  <!-- 3. Stats Bar -->
  <div class="stats-bar">
    <span class="stat-value">${escapeHtml(stats.wins)}</span> Wins<span class="stat-sep">|</span><span class="stat-value">${escapeHtml(stats.earnings)}</span> Earned<span class="stat-sep">|</span><span class="stat-value">${escapeHtml(stats.vulns)}</span> Vulns Found<span class="stat-sep">|</span><span class="stat-value">${escapeHtml(stats.grantsAmount)}</span> in Grants
  </div>

  <!-- 4. Technical Skills -->
  <section>
    <div class="section-title">Technical Skills</div>
    ${skillsHtml}
  </section>

  <!-- 5. Experience -->
  <section>
    <div class="section-title">Experience</div>
    ${expHtml}
  </section>

  <!-- 6. Awards & Grants -->
  <section>
    <div class="section-title">Awards &amp; Grants</div>
    <div class="awards-grid">
      ${awardsHtml}
    </div>
  </section>

  <!-- 7. Education -->
  <section class="education">
    <div class="section-title">Education</div>
    <p>${escapeHtml(resume.education.text)}</p>
  </section>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const outDir = resolveOutDir();

  // Ensure output directory exists (guard — the real ~/Documents/secret always
  // exists; for --out /tmp/resume-test create if needed).
  fs.mkdirSync(outDir, { recursive: true });

  const htmlPath = path.join(outDir, "rheza-sulaiman-resume.html");
  const pdfPath  = path.join(outDir, "rheza-sulaiman-resume.pdf");

  // 1. Load data
  console.log("Loading data…");
  const { resume, rawAchievements } = loadData();
  const achievements = rawAchievements.map(mapAchievement);
  const stats = buildPdfStats(achievements);

  console.log(`  resume.yml loaded: ${(resume.experience || []).length} experience entries`);
  console.log(`  achievements.yml loaded: ${achievements.length} achievements`);
  console.log(`  Stats: ${stats.wins} wins · ${stats.earnings} earned · ${stats.grantsAmount} in grants`);

  // 2. Build HTML
  console.log("Building HTML…");
  const html = buildHtml(resume, achievements, stats);

  // 3. Write HTML
  fs.writeFileSync(htmlPath, html, "utf8");
  console.log(`  HTML written: ${htmlPath} (${(html.length / 1024).toFixed(1)} KB)`);

  // 4. Render PDF via Playwright
  console.log("Launching Chromium for PDF render…");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({
      path: pdfPath,
      format: "Letter",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    console.log(`  PDF written: ${pdfPath}`);
  } finally {
    await browser.close();
  }

  // 5. Report
  const htmlSize = fs.statSync(htmlPath).size;
  const pdfSize  = fs.statSync(pdfPath).size;
  console.log("\nDone.");
  console.log(`  HTML: ${(htmlSize / 1024).toFixed(1)} KB → ${htmlPath}`);
  console.log(`  PDF:  ${(pdfSize  / 1024).toFixed(1)} KB → ${pdfPath}`);
}

main().catch((err) => {
  console.error("generate-resume-pdf failed:", err);
  process.exit(1);
});
