import path from "node:path";
import { describe, it, expect } from "vitest";

import { loadResume } from "./resume";
import { loadAchievements, type Achievement } from "./achievements";
import {
  buildStats,
  sortAwardsByPrize,
  webBullets,
  featuredProjects,
  skillModifierClass,
} from "./superteam";

const REAL_RESUME = path.join(process.cwd(), "data", "resume.yml");
const REAL_ACHIEVEMENTS = path.join(process.cwd(), "data", "achievements.yml");

// ---------------------------------------------------------------------------
// Test helper: a minimal Achievement factory. Only the fields exercised by the
// superteam transforms (prizeAmount, type, and the display fields used in the
// awards grid) need to be meaningful; the rest are filled with valid stubs so
// the object satisfies the Achievement interface.
// ---------------------------------------------------------------------------
function makeAchievement(overrides: Partial<Achievement>): Achievement {
  return {
    slug: "stub",
    title: "Stub Project",
    type: "bounty",
    place: "1st",
    prizeAmount: 0,
    prizeExtras: null,
    event: "Stub Event",
    eventDetail: null,
    date: "2025-01",
    githubUrl: "https://github.com/stub/stub",
    repoName: "stub/stub",
    description: "stub",
    badgeEmoji: "🥇",
    badgeLabel: "1st Place",
    formattedPrize: "$0",
    fullEvent: "Stub Event",
    badgeClass: "achievement-bounty",
    ...overrides,
  };
}

// ===========================================================================
// buildStats — port of ApplyController#build_stats
//
//   [
//     { label: "Ecosystem Earnings", value: "$<delim(earnings)>+", number: earnings },
//     { label: "Wins",               value: wins.to_s,             number: wins },
//     *yaml_stats.map { |s| { label:, value:, number: } },
//     { label: "Grants Received",    value: grants.to_s,           number: grants },
//   ]
// ===========================================================================
describe("buildStats", () => {
  it("builds the exact stat banner array from the real YAML data", () => {
    const { totalEarnings, winCount, all } = loadAchievements(REAL_ACHIEVEMENTS);
    const { stats } = loadResume(REAL_RESUME);
    const grants = all.filter((a) => a.type === "grant").length;

    const result = buildStats({ totalEarnings, winCount, achievements: all }, stats);

    // Mirrors prod (curl https://rectorspace.com/apply/superteam):
    //   $36,050+ / 11 / 13 / 64+ / 2
    expect(result).toEqual([
      { label: "Ecosystem Earnings", value: `$${totalEarnings.toLocaleString("en-US")}+`, number: totalEarnings },
      { label: "Wins", value: String(winCount), number: winCount },
      { label: "Vulnerabilities Found", value: "13", number: 13 },
      { label: "Repositories", value: "64+", number: 64 },
      { label: "Grants Received", value: String(grants), number: grants },
    ]);
  });

  it("places earnings first and grants last, with YAML stats in between in order", () => {
    const yamlStats = [
      { label: "Vulnerabilities Found", value: "13", number: 13 },
      { label: "Repositories", value: "64+", number: 64 },
    ];
    const achievements = [
      makeAchievement({ type: "grant", prizeAmount: 10000 }),
      makeAchievement({ type: "grant", prizeAmount: 6000 }),
      makeAchievement({ type: "bounty", prizeAmount: 2000 }),
      makeAchievement({ type: "hackathon", prizeAmount: 5000 }),
    ];

    const result = buildStats(
      { totalEarnings: 23000, winCount: 4, achievements },
      yamlStats,
    );

    expect(result).toEqual([
      { label: "Ecosystem Earnings", value: "$23,000+", number: 23000 },
      { label: "Wins", value: "4", number: 4 },
      { label: "Vulnerabilities Found", value: "13", number: 13 },
      { label: "Repositories", value: "64+", number: 64 },
      { label: "Grants Received", value: "2", number: 2 },
    ]);
  });

  it("formats earnings with thousands delimiters and a trailing +", () => {
    const result = buildStats(
      { totalEarnings: 1234567, winCount: 0, achievements: [] },
      [],
    );
    expect(result[0]).toEqual({
      label: "Ecosystem Earnings",
      value: "$1,234,567+",
      number: 1234567,
    });
  });

  it("counts only achievements with type 'grant' toward Grants Received", () => {
    const achievements = [
      makeAchievement({ type: "grant" }),
      makeAchievement({ type: "bounty" }),
      makeAchievement({ type: "hackathon" }),
      makeAchievement({ type: "grant" }),
    ];
    const result = buildStats(
      { totalEarnings: 0, winCount: 4, achievements },
      [],
    );
    const grantsStat = result[result.length - 1];
    expect(grantsStat).toEqual({ label: "Grants Received", value: "2", number: 2 });
  });

  it("emits exactly 3 stats when there are no YAML stats", () => {
    const result = buildStats(
      { totalEarnings: 100, winCount: 1, achievements: [makeAchievement({ type: "grant" })] },
      [],
    );
    expect(result).toHaveLength(3);
    expect(result.map((s) => s.label)).toEqual([
      "Ecosystem Earnings",
      "Wins",
      "Grants Received",
    ]);
  });
});

// ===========================================================================
// sortAwardsByPrize — port of `@achievements.sort_by { |a| -a.prize_amount }`
// ===========================================================================
describe("sortAwardsByPrize", () => {
  it("orders the real achievements by prizeAmount descending (matches prod)", () => {
    const { all } = loadAchievements(REAL_ACHIEVEMENTS);
    const sorted = sortAwardsByPrize(all);

    const amounts = sorted.map((a) => a.prizeAmount);
    // Prod order: 10000, 6500, 6000, 5000, 2000, 1500, 1500, 1500, 1000, 750, 300
    expect(amounts).toEqual([10000, 6500, 6000, 5000, 2000, 1500, 1500, 1500, 1000, 750, 300]);

    // Spot-check the leaders match the rendered prod cards.
    expect(sorted[0].title).toBe("SIP Protocol");
    expect(sorted[0].prizeAmount).toBe(10000);
    expect(sorted[3].title).toBe("Web3 Deal Discovery");
    expect(sorted[3].prizeAmount).toBe(5000);
  });

  it("does not mutate the input array", () => {
    const input = [
      makeAchievement({ prizeAmount: 100 }),
      makeAchievement({ prizeAmount: 500 }),
      makeAchievement({ prizeAmount: 300 }),
    ];
    const snapshot = input.map((a) => a.prizeAmount);
    sortAwardsByPrize(input);
    expect(input.map((a) => a.prizeAmount)).toEqual(snapshot);
  });

  it("is a stable sort for equal prize amounts (preserves YAML order)", () => {
    // Ruby's sort_by is stable; ties keep their original relative order.
    const a = makeAchievement({ prizeAmount: 1500, slug: "a", title: "Solana Security Audit" });
    const b = makeAchievement({ prizeAmount: 1500, slug: "b", title: "Adrena AI Agent Arena" });
    const c = makeAchievement({ prizeAmount: 1500, slug: "c", title: "OpenBudget.ID" });
    const sorted = sortAwardsByPrize([a, b, c]);
    expect(sorted.map((x) => x.slug)).toEqual(["a", "b", "c"]);
  });

  it("orders a descending result correctly", () => {
    const sorted = sortAwardsByPrize([
      makeAchievement({ prizeAmount: 300 }),
      makeAchievement({ prizeAmount: 10000 }),
      makeAchievement({ prizeAmount: 2000 }),
    ]);
    expect(sorted.map((a) => a.prizeAmount)).toEqual([10000, 2000, 300]);
  });
});

// ===========================================================================
// webBullets — port of `exp[:bullets].select { |b| b[:web] }`
// ===========================================================================
describe("webBullets", () => {
  it("keeps only bullets with web === true", () => {
    const bullets = [
      { text: "shown-1", pdf: true, web: true },
      { text: "hidden-1", pdf: true, web: false },
      { text: "shown-2", pdf: false, web: true },
      { text: "hidden-2", pdf: false, web: false },
    ];
    expect(webBullets(bullets)).toEqual([
      { text: "shown-1", pdf: true, web: true },
      { text: "shown-2", pdf: false, web: true },
    ]);
  });

  it("keeps every web bullet of the real experience entries (web is a superset of pdf here)", () => {
    const { experience } = loadResume(REAL_RESUME);
    for (const exp of experience) {
      const shown = webBullets(exp.bullets);
      // In the real YAML every bullet is web:true, so nothing is dropped.
      expect(shown.length).toBe(exp.bullets.length);
      expect(shown.every((b) => b.web === true)).toBe(true);
    }
    // Sanity: the first entry (Arbital) has all 10 of its bullets on the web.
    expect(webBullets(experience[0].bullets)).toHaveLength(10);
  });

  it("returns an empty array when no bullet is web", () => {
    expect(webBullets([{ text: "x", pdf: true, web: false }])).toEqual([]);
  });
});

// ===========================================================================
// featuredProjects — port of `@resume[:projects].select { |p| p[:featured] }`
// ===========================================================================
describe("featuredProjects", () => {
  it("keeps only projects with featured === true, preserving order", () => {
    const { projects } = loadResume(REAL_RESUME);
    const featured = featuredProjects(projects);
    // Real YAML: 5 featured (SIP, Web3 Deal Discovery, pNode Pulse, LUMOS, Adrena),
    // 2 not featured (OpenBudget.ID, Saros SDK Docs).
    expect(featured.map((p) => p.name)).toEqual([
      "SIP Protocol",
      "Web3 Deal Discovery",
      "pNode Pulse",
      "LUMOS",
      "Adrena AI Agent Arena",
    ]);
    expect(featured.every((p) => p.featured === true)).toBe(true);
  });

  it("excludes non-featured projects", () => {
    const { projects } = loadResume(REAL_RESUME);
    const names = featuredProjects(projects).map((p) => p.name);
    expect(names).not.toContain("OpenBudget.ID");
    expect(names).not.toContain("Saros SDK Docs");
  });
});

// ===========================================================================
// skillModifierClass — port of skill_modifier_map (default "lang")
// ===========================================================================
describe("skillModifierClass", () => {
  it("maps every known category to its CSS modifier", () => {
    expect(skillModifierClass("Languages")).toBe("lang");
    expect(skillModifierClass("Security")).toBe("security");
    expect(skillModifierClass("Frameworks")).toBe("framework");
    expect(skillModifierClass("Databases")).toBe("database");
    expect(skillModifierClass("Infrastructure")).toBe("infra");
    expect(skillModifierClass("Blockchain")).toBe("blockchain");
  });

  it("falls back to 'lang' for an unknown category", () => {
    expect(skillModifierClass("Tooling")).toBe("lang");
    expect(skillModifierClass("")).toBe("lang");
  });

  it("maps each real resume skill category to a valid modifier", () => {
    const { skills } = loadResume(REAL_RESUME);
    const valid = new Set(["lang", "security", "framework", "database", "infra", "blockchain"]);
    for (const group of skills) {
      expect(valid.has(skillModifierClass(group.category))).toBe(true);
    }
  });
});
