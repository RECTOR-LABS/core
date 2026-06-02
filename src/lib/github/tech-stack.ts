/**
 * Tech stack parser for GitHub repos.
 *
 * Faithful port of:
 *   app/services/tech_stack_parser.rb
 *
 * Architectural constraints:
 *   - No React / no next/* imports.
 *   - Pure & deterministic: no Date.now(), no I/O, no async.
 *   - Operates on a Repo[] already in memory (no DB, no fetch).
 *
 * @see app/services/tech_stack_parser.rb
 */

import type { Repo } from "./repos";

// ---------------------------------------------------------------------------
// Public shape
// ---------------------------------------------------------------------------

/**
 * Result of currentStack().
 *
 * Faithful camelCase port of TechStackParser#parse return hash.
 */
export interface TechStack {
  /** Language → repo count, sorted by count DESCENDING. Null-language repos excluded. */
  allLanguages: Record<string, number>;
  /**
   * Category → { language → count }.
   * Categories present only when they contain ≥1 matching language.
   * An `other` bucket is appended for languages that match no category, omitted if empty.
   */
  categorized: Record<string, Record<string, number>>;
  /** Top 5 languages by count. percentage = round1(count / totalRepos * 100). */
  primary: Array<{ name: string; count: number; percentage: number }>;
  /** Total non-fork repos INCLUDING repos with null language (denominator for percentages). */
  totalRepos: number;
}

// ---------------------------------------------------------------------------
// Constants — exact copy of TechStackParser::CATEGORIES (tech_stack_parser.rb:5-13)
// NOTE: a language may belong to multiple categories (Rust, Go, Python, Kotlin).
// ---------------------------------------------------------------------------

/**
 * Language categorisation map.
 * Faithful copy of TechStackParser::CATEGORIES.
 */
export const CATEGORIES: Record<string, readonly string[]> = {
  blockchain: ["Rust", "Solidity", "Move"],
  web: ["JavaScript", "TypeScript", "HTML", "CSS", "SCSS"],
  backend: ["Ruby", "Python", "Go", "Java", "Kotlin", "PHP"],
  mobile: ["Swift", "Kotlin", "Dart"],
  infra: ["Shell", "Dockerfile", "HCL"],
  data: ["Python", "R", "Julia"],
  systems: ["C", "C++", "Rust", "Go"],
};

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Faithful port of TechStackParser#count_languages.
 *
 * Groups non-fork repos by language (null excluded), counts occurrences,
 * sorts by count DESCENDING. Returns a plain object with insertion order = desc order.
 */
function countLanguages(nonForkRepos: Repo[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const repo of nonForkRepos) {
    if (repo.language === null) continue;
    counts[repo.language] = (counts[repo.language] ?? 0) + 1;
  }

  // Sort by count DESC, rebuild object so insertion order reflects sort order.
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  const result: Record<string, number> = {};
  for (const [lang, count] of sorted) {
    result[lang] = count;
  }
  return result;
}

/**
 * Faithful port of TechStackParser#categorize_languages.
 *
 * Iterates CATEGORIES in declaration order; includes a category only when ≥1 language matches.
 * Appends an `other` bucket for any language not present in ANY category; omits `other` if empty.
 *
 * @param languageCounts - assumed pre-sorted by count DESC (insertion order = count order);
 *   that order is preserved into each category bucket and the `other` bucket.
 */
function categorizeLanguages(
  languageCounts: Record<string, number>,
): Record<string, Record<string, number>> {
  const categorized: Record<string, Record<string, number>> = {};

  for (const [category, languages] of Object.entries(CATEGORIES)) {
    const bucket: Record<string, number> = {};
    for (const [lang, count] of Object.entries(languageCounts)) {
      if (languages.includes(lang)) {
        bucket[lang] = count;
      }
    }
    if (Object.keys(bucket).length > 0) {
      categorized[category] = bucket;
    }
  }

  // Other bucket — languages not in ANY category list
  const allCategorisedLangs = new Set(Object.values(CATEGORIES).flat());
  const otherBucket: Record<string, number> = {};
  for (const [lang, count] of Object.entries(languageCounts)) {
    if (!allCategorisedLangs.has(lang)) {
      otherBucket[lang] = count;
    }
  }
  if (Object.keys(otherBucket).length > 0) {
    categorized["other"] = otherBucket;
  }

  return categorized;
}

/**
 * Round to 1 decimal place.
 * Matches Ruby `(value).round(1)`.
 */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Faithful port of TechStackParser#calculate_percentage.
 * Returns 0 when total is 0 (guards divide-by-zero, matching Ruby's `return 0 if total.zero?`).
 */
function calculatePercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return round1((count / total) * 100);
}

/**
 * Faithful port of TechStackParser#determine_primary_languages (limit: 5).
 *
 * Takes the first 5 entries of languageCounts (already sorted DESC) and maps each to
 * { name, count, percentage }.
 */
function determinePrimaryLanguages(
  languageCounts: Record<string, number>,
  totalRepos: number,
  limit = 5,
): Array<{ name: string; count: number; percentage: number }> {
  return Object.entries(languageCounts)
    .slice(0, limit)
    .map(([name, count]) => ({
      name,
      count,
      percentage: calculatePercentage(count, totalRepos),
    }));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse the tech stack from an array of repos.
 *
 * Faithful port of TechStackParser#parse (called via TechStackParser.current_stack in Rails).
 *
 * Key semantics:
 *   - Operates over NON-FORK repos only (r.isFork === false).
 *   - totalRepos = non-fork count INCLUDING null-language repos (the percentage denominator).
 *   - allLanguages counts only repos with a NON-NULL language, sorted DESC.
 *   - categorized mirrors CATEGORIES order; other bucket appended if needed.
 *   - primary = top 5 by count with round1 percentage.
 *
 * @param repos - Full repo list (forks included; this function filters them out).
 */
export function currentStack(repos: Repo[]): TechStack {
  const nonForkRepos = repos.filter((r) => !r.isFork);
  const totalRepos = nonForkRepos.length;

  const allLanguages = countLanguages(nonForkRepos);
  const categorized = categorizeLanguages(allLanguages);
  const primary = determinePrimaryLanguages(allLanguages, totalRepos);

  return { allLanguages, categorized, primary, totalRepos };
}
