import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema — mirrors the ActiveModel attributes declared in Achievement (Rails)
// and the actual field shape of config/achievements.yml.
// prize_amount is an integer in the YAML (no $ sign), matching the Rails
// `attribute :prize_amount, :integer` declaration.
// ---------------------------------------------------------------------------
const AchievementSchema = z.object({
  slug: z.string(),
  title: z.string(),
  type: z.string(),
  place: z.string(),
  prize_amount: z.number().int(),
  prize_extras: z.string().nullable().default(null),
  event: z.string(),
  event_detail: z.string().nullable().default(null),
  date: z.string(), // stored as "YYYY-MM" strings in the YAML
  github_url: z.string().url(),
  repo_name: z.string(),
  description: z.string(),
});

type RawAchievement = z.infer<typeof AchievementSchema>;

// ---------------------------------------------------------------------------
// Public shape — camelCase interface exposed to consumers.
// Matches the Rails Achievement instance + class methods.
// ---------------------------------------------------------------------------
export interface Achievement {
  slug: string;
  title: string;
  type: string;
  place: string;
  prizeAmount: number;
  prizeExtras: string | null;
  event: string;
  eventDetail: string | null;
  date: string;
  githubUrl: string;
  repoName: string;
  description: string;
  /** Ported from Achievement#badge_emoji */
  badgeEmoji: string;
  /** Ported from Achievement#badge_label */
  badgeLabel: string;
  /** Ported from Achievement#formatted_prize */
  formattedPrize: string;
  /** Ported from Achievement#full_event */
  fullEvent: string;
  /** Ported from Achievement#badge_class */
  badgeClass: string;
}

export interface AchievementsResult {
  /** All achievements in file order (newest first, matching the YAML) */
  all: Achievement[];
  /** Ported from Achievement.total_earnings — sum of all prize_amount integers */
  totalEarnings: number;
  /** Ported from Achievement.win_count — total entry count */
  winCount: number;
  /** Ported from Achievement.year_range — e.g. "2024-2026" or single "2025" */
  yearRange: string;
  /** Ported from Achievement.winner_projects — { repo_name: badge_emoji }, first occurrence wins */
  winnerProjects: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Helpers — ported directly from the Ruby instance methods
// ---------------------------------------------------------------------------

/** Ported from Achievement#badge_emoji */
function badgeEmoji(place: string): string {
  switch (place.toLowerCase()) {
    case "1st":
      return "🥇";
    case "2nd":
      return "🥈";
    case "3rd":
      return "🥉";
    case "winner":
      return "🏆";
    case "approved":
      return "✅";
    default:
      return "🎖️";
  }
}

/** Ported from Achievement#badge_label */
function badgeLabel(place: string): string {
  switch (place.toLowerCase()) {
    case "approved":
      return "Grant Approved";
    case "winner":
      return "Winner";
    default:
      return `${place} Place`;
  }
}

/** Ported from Achievement#formatted_prize */
function formattedPrize(prizeAmount: number, prizeExtras: string | null): string {
  const base = `$${prizeAmount.toLocaleString("en-US")}`;
  return prizeExtras ? `${base} + ${prizeExtras}` : base;
}

/** Ported from Achievement#full_event */
function fullEvent(event: string, eventDetail: string | null): string {
  return eventDetail ? `${event} • ${eventDetail}` : event;
}

/** Ported from Achievement#badge_class */
function badgeClass(type: string, place: string): string {
  switch (type.toLowerCase()) {
    case "grant":
      return "achievement-gold";
    case "bounty":
      return "achievement-bounty";
    default:
      // Hackathon badges based on place
      switch (place.toLowerCase()) {
        case "1st":
        case "winner":
          return "achievement-gold";
        case "2nd":
          return "achievement-silver";
        default:
          return "achievement-bounty";
      }
  }
}

/** Map a raw validated YAML entry to the public Achievement shape */
function toAchievement(raw: RawAchievement): Achievement {
  return {
    slug: raw.slug,
    title: raw.title,
    type: raw.type,
    place: raw.place,
    prizeAmount: raw.prize_amount,
    prizeExtras: raw.prize_extras,
    event: raw.event,
    eventDetail: raw.event_detail,
    date: raw.date,
    githubUrl: raw.github_url,
    repoName: raw.repo_name,
    description: raw.description,
    badgeEmoji: badgeEmoji(raw.place),
    badgeLabel: badgeLabel(raw.place),
    formattedPrize: formattedPrize(raw.prize_amount, raw.prize_extras),
    fullEvent: fullEvent(raw.event, raw.event_detail),
    badgeClass: badgeClass(raw.type, raw.place),
  };
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

const DEFAULT_PATH = path.join(process.cwd(), "data", "achievements.yml");

/**
 * Load and validate achievements from a YAML file.
 * Default path: <cwd>/data/achievements.yml
 *
 * Semantics match the Rails Achievement PORO exactly:
 *   - totalEarnings: sum of integer prize_amounts (no string parsing needed)
 *   - yearRange: derived from "YYYY-MM" date strings; uniq+sort years → "YYYY-YYYY" or "YYYY"
 *   - winnerProjects: { repo_name → badge_emoji }, first occurrence wins (dedup)
 */
export function loadAchievements(filePath: string = DEFAULT_PATH): AchievementsResult {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`achievements.yml must be a top-level array, got: ${typeof parsed}`);
  }

  const all: Achievement[] = parsed.map((entry, i) => {
    const result = AchievementSchema.safeParse(entry);
    if (!result.success) {
      throw new Error(`Invalid achievement at index ${i}: ${result.error.message}`);
    }
    return toAchievement(result.data);
  });

  // totalEarnings — direct sum of integer prize_amounts, matching Ruby's:
  //   all.sum(&:prize_amount)
  const totalEarnings = all.reduce((sum, a) => sum + a.prizeAmount, 0);

  // winCount — matching Ruby's: all.size
  const winCount = all.length;

  // yearRange — matching Ruby's:
  //   years = all.map { |a| a.date.to_s.split("-").first.to_i }.uniq.sort
  //   return years.first.to_s if years.size == 1
  //   "#{years.first}-#{years.last}"
  const years = [...new Set(all.map((a) => parseInt(a.date.split("-")[0], 10)))].sort(
    (a, b) => a - b,
  );
  const yearRange = years.length === 1 ? String(years[0]) : `${years[0]}-${years[years.length - 1]}`;

  // winnerProjects — matching Ruby's each_with_object with "next if hash.key?" guard:
  //   first occurrence per repo_name wins
  const winnerProjects: Record<string, string> = {};
  for (const achievement of all) {
    if (!(achievement.repoName in winnerProjects)) {
      winnerProjects[achievement.repoName] = achievement.badgeEmoji;
    }
  }

  return { all, totalEarnings, winCount, yearRange, winnerProjects };
}
