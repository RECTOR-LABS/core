// ---------------------------------------------------------------------------
// Pure data transforms for the /apply/superteam page.
//
// Faithful ports of the Ruby logic in app/controllers/apply_controller.rb
// (#build_stats / #set_superteam_data) and the inline transforms in
// app/views/apply/superteam.html.erb (awards sort, bullet/project filters,
// skill-category → CSS-modifier map).
//
// These are kept React-free and side-effect-free so the page can compose them
// and they can be unit-tested in isolation.
// ---------------------------------------------------------------------------

import type { Achievement } from "./achievements";
import type { Resume } from "./resume";

// A resume `stats` entry — { label, value, number }. Reuse the Resume type so
// the shape stays locked to the loader's schema.
export type ResumeStat = Resume["stats"][number];

// A single stat-banner card.
export interface Stat {
  label: string;
  value: string;
  number: number;
}

// An experience bullet (mirrors the BulletSchema in resume.ts).
type Bullet = Resume["experience"][number]["bullets"][number];

// A project entry (mirrors the ProjectSchema in resume.ts).
type Project = Resume["projects"][number];

// ---------------------------------------------------------------------------
// buildStats — port of ApplyController#build_stats
//
//   earnings = Achievement.total_earnings
//   wins     = Achievement.win_count
//   grants   = Achievement.all.count { |a| a.type == "grant" }
//   yaml_stats = @resume[:stats] || []
//
//   [
//     { label: "Ecosystem Earnings", value: "$#{number_to_delimited(earnings)}+", number: earnings },
//     { label: "Wins",               value: wins.to_s,                            number: wins },
//     *yaml_stats.map { |s| { label: s[:label], value: s[:value], number: s[:number] } },
//     { label: "Grants Received",    value: grants.to_s,                          number: grants },
//   ]
//
// `number_to_delimited` (default delimiter ",") is equivalent to
// toLocaleString("en-US") for the non-negative integer earnings domain — the
// same equivalence already relied on by lib/format.numberWithDelimiter.
// ---------------------------------------------------------------------------
export function buildStats(
  source: { totalEarnings: number; winCount: number; achievements: Achievement[] },
  yamlStats: ResumeStat[],
): Stat[] {
  const { totalEarnings, winCount, achievements } = source;
  const grants = achievements.filter((a) => a.type === "grant").length;

  return [
    {
      label: "Ecosystem Earnings",
      value: `$${totalEarnings.toLocaleString("en-US")}+`,
      number: totalEarnings,
    },
    { label: "Wins", value: String(winCount), number: winCount },
    ...yamlStats.map((s) => ({ label: s.label, value: s.value, number: s.number })),
    { label: "Grants Received", value: String(grants), number: grants },
  ];
}

// ---------------------------------------------------------------------------
// sortAwardsByPrize — port of `@achievements.sort_by { |a| -a.prize_amount }`
//
// Ruby's sort_by is STABLE; ties keep their original (YAML) order. JS's
// Array.prototype.sort is spec-guaranteed stable (ES2019+), so a plain
// descending comparator reproduces the same result. Returns a new array
// (does not mutate the input, matching sort_by's non-destructive semantics).
// ---------------------------------------------------------------------------
export function sortAwardsByPrize(achievements: Achievement[]): Achievement[] {
  return [...achievements].sort((a, b) => b.prizeAmount - a.prizeAmount);
}

// ---------------------------------------------------------------------------
// webBullets — port of `exp[:bullets].select { |b| b[:web] }`
// Keep only bullets flagged for the web view.
// ---------------------------------------------------------------------------
export function webBullets(bullets: Bullet[]): Bullet[] {
  return bullets.filter((b) => b.web);
}

// ---------------------------------------------------------------------------
// featuredProjects — port of `@resume[:projects].select { |p| p[:featured] }`
// ---------------------------------------------------------------------------
export function featuredProjects(projects: Project[]): Project[] {
  return projects.filter((p) => p.featured);
}

// ---------------------------------------------------------------------------
// skillModifierClass — port of the view's skill_modifier_map:
//
//   { "Languages" => "lang", "Security" => "security", "Frameworks" => "framework",
//     "Databases" => "database", "Infrastructure" => "infra", "Blockchain" => "blockchain" }
//   modifier = skill_modifier_map[group[:category]] || "lang"
//
// Returns the CSS pill modifier for a skill category, defaulting to "lang".
// ---------------------------------------------------------------------------
const SKILL_MODIFIER_MAP: Record<string, string> = {
  Languages: "lang",
  Security: "security",
  Frameworks: "framework",
  Databases: "database",
  Infrastructure: "infra",
  Blockchain: "blockchain",
};

export function skillModifierClass(category: string): string {
  return SKILL_MODIFIER_MAP[category] ?? "lang";
}
