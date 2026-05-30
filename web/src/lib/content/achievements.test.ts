import path from "node:path";
import { describe, it, expect } from "vitest";
import { loadAchievements } from "./achievements";

// Hand-computed from web/data/achievements.yml (11 entries):
//   1500 + 2000 + 1500 + 750 + 6000 + 10000 + 1000 + 5000 + 6500 + 1500 + 300 = 36050
// yearRange: dates span 2024-12 → 2026-04, so min=2024 max=2026 → "2024-2026"

const REAL_YAML = path.join(process.cwd(), "data", "achievements.yml");

describe("loadAchievements", () => {
  it("loads and validates the real achievements.yml without throwing", () => {
    expect(() => loadAchievements(REAL_YAML)).not.toThrow();
  });

  it("all.length equals winCount (11)", () => {
    const { all, winCount } = loadAchievements(REAL_YAML);
    expect(winCount).toBe(11);
    expect(all.length).toBe(winCount);
  });

  it("totalEarnings equals the hand-summed prize total (36050)", () => {
    const { totalEarnings } = loadAchievements(REAL_YAML);
    expect(totalEarnings).toBe(36_050);
  });

  it("yearRange matches the YYYY-YYYY format spanning 2024-2026", () => {
    const { yearRange } = loadAchievements(REAL_YAML);
    // Expect exactly "2024-2026" given the real data
    expect(yearRange).toBe("2024-2026");
    // Also assert it matches the general pattern the Rails model produces
    expect(yearRange).toMatch(/^\d{4}(-\d{4})?$/);
  });

  it("preserves file order (newest first — solana-security-audit is first)", () => {
    const { all } = loadAchievements(REAL_YAML);
    expect(all[0].slug).toBe("solana-security-audit");
    expect(all[all.length - 1].slug).toBe("saros-sdk-docs");
  });

  it("winnerProjects deduplicates by repo_name (first occurrence wins)", () => {
    const { winnerProjects } = loadAchievements(REAL_YAML);
    // sip-protocol appears 4× in the YAML — only one entry in winnerProjects
    const keys = Object.keys(winnerProjects);
    const sipEntries = keys.filter((k) => k === "sip-protocol");
    expect(sipEntries.length).toBe(1);
    // Emoji for first sip-protocol entry (slug: sip-protocol-graveyard-torque, place: 1st) → 🥇
    expect(winnerProjects["sip-protocol"]).toBe("🥇");
  });

  it("badge_emoji maps correctly for all place values", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    expect(bySlug["solana-security-audit"].badgeEmoji).toBe("🥇"); // 1st
    expect(bySlug["adrena-trading-arena"].badgeEmoji).toBe("🥈"); // 2nd
    expect(bySlug["pnode-pulse"].badgeEmoji).toBe("🥉"); // 3rd
    expect(bySlug["sip-protocol-zypherpunk"].badgeEmoji).toBe("🏆"); // winner
    expect(bySlug["sip-protocol-grant"].badgeEmoji).toBe("✅"); // approved
  });

  it("winnerProjects has the correct number of unique repos", () => {
    const { winnerProjects, all } = loadAchievements(REAL_YAML);
    // unique repo_names in the file
    const uniqueRepos = new Set(all.map((a) => a.repoName)).size;
    expect(Object.keys(winnerProjects).length).toBe(uniqueRepos);
  });
});
