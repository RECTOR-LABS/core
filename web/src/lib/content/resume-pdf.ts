// ---------------------------------------------------------------------------
// PDF-specific data transforms for the resume generator script.
//
// Faithful port of the Rails rake task logic in lib/tasks/resume.rake and
// the ERB template in app/views/apply/_resume_pdf.html.erb.
//
// These are kept pure (no Node I/O, no Playwright, no React) so they can be
// unit-tested with vitest in isolation from the PDF generation side-effects.
// ---------------------------------------------------------------------------

import type { Achievement } from "./achievements";
import type { Resume } from "./resume";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PdfStats {
  /** Formatted wins count, e.g. "11" */
  wins: string;
  /** Formatted total earnings, e.g. "$35,550+" */
  earnings: string;
  /** Hard-coded vulnerabilities found (125, from ERB template) */
  vulns: string;
  /** Formatted grants total amount, e.g. "$16,000" */
  grantsAmount: string;
}

// An experience entry with only pdf-flagged bullets.
export interface PdfExpEntry {
  title: string;
  company: string;
  dateStart: string;
  dateEnd: string;
  bullets: string[];
}

// A rendered award row for the 2-column awards grid.
export interface PdfAward {
  formattedPrize: string;
  badgeLabel: string;
  fullEvent: string;
  title: string;
}

// ---------------------------------------------------------------------------
// buildPdfStats — port of the stats hash built in resume.rake:
//
//   earnings     = Achievement.total_earnings
//   wins         = Achievement.win_count
//   grants_amount = achievements.select { |a| a.type == "grant" }.sum(&:prize_amount)
//   stats = {
//     earnings:     "$#{number_to_delimited(earnings)}+",
//     wins:         wins,
//     grants_amount: "$#{number_to_delimited(grants_amount)}",
//   }
//
// The ERB uses:
//   <%= stats[:wins] %> Wins | <%= stats[:earnings] %> Earned |
//   125 Vulns Found          | <%= stats[:grants_amount] %> in Grants
//
// The "125" is hardcoded in the ERB — reproduced faithfully here.
// ---------------------------------------------------------------------------
export function buildPdfStats(achievements: Achievement[]): PdfStats {
  const totalEarnings = achievements.reduce((sum, a) => sum + a.prizeAmount, 0);
  const winCount = achievements.length;
  const grantsTotal = achievements
    .filter((a) => a.type === "grant")
    .reduce((sum, a) => sum + a.prizeAmount, 0);

  return {
    wins: String(winCount),
    earnings: `$${totalEarnings.toLocaleString("en-US")}+`,
    vulns: "125",
    grantsAmount: `$${grantsTotal.toLocaleString("en-US")}`,
  };
}

// ---------------------------------------------------------------------------
// pdfBullets — port of `exp[:bullets].select { |b| b[:pdf] }`
// Returns only bullets where pdf===true.
// ---------------------------------------------------------------------------
export function pdfBullets(
  bullets: Resume["experience"][number]["bullets"],
): string[] {
  return bullets.filter((b) => b.pdf).map((b) => b.text);
}

// ---------------------------------------------------------------------------
// buildPdfExpEntries — maps resume experience to PDF-ready entries.
// Only includes bullets flagged pdf:true (pdfBullets filter).
// Entries with zero pdf bullets are included (matching Rails behaviour — the
// exp-entry div still renders, just with an empty bullet list).
// ---------------------------------------------------------------------------
export function buildPdfExpEntries(
  experience: Resume["experience"],
): PdfExpEntry[] {
  return experience.map((exp) => ({
    title: exp.title,
    company: exp.company,
    dateStart: exp.date_start,
    dateEnd: exp.date_end,
    bullets: pdfBullets(exp.bullets),
  }));
}

// ---------------------------------------------------------------------------
// buildPdfAwards — port of `@achievements.sort_by { |a| -a.prize_amount }`
// Returns achievements sorted descending by prizeAmount.
// ---------------------------------------------------------------------------
export function buildPdfAwards(achievements: Achievement[]): PdfAward[] {
  return [...achievements]
    .sort((a, b) => b.prizeAmount - a.prizeAmount)
    .map((a) => ({
      formattedPrize: a.formattedPrize,
      badgeLabel: a.badgeLabel,
      fullEvent: a.fullEvent,
      title: a.title,
    }));
}

// ---------------------------------------------------------------------------
// formatContactLine — port of the ERB contact line:
//   location · email · website · github (middot separator)
//
// Returns an array of field values; the caller renders separators.
// This helper exists so tests can verify the ordering and content without
// touching HTML rendering.
// ---------------------------------------------------------------------------
export function formatContactFields(
  personal: Resume["personal"],
): [string, string, string, string] {
  return [
    personal.location,
    personal.email,
    personal.website,
    personal.github,
  ];
}
