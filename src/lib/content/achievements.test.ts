import path from "node:path";
import { describe, it, expect } from "vitest";
import { loadAchievements } from "./achievements";

// Hand-computed from data/achievements.yml (14 entries):
//   9000 + 8500 + 400 + 1500 + 2000 + 1500 + 750 + 6000 + 10000 + 1000 + 5000 + 6500 + 1500 + 300 = 53950
// yearRange: dates span 2024-12 → 2026-04, so min=2024 max=2026 → "2024-2026"

const REAL_YAML = path.join(process.cwd(), "data", "achievements.yml");
const MALFORMED_DATE_YAML = path.join(__dirname, "__fixtures__/achievements-malformed-date.yml");

describe("loadAchievements", () => {
  it("loads and validates the real achievements.yml without throwing", () => {
    expect(() => loadAchievements(REAL_YAML)).not.toThrow();
  });

  it("all.length equals winCount (14)", () => {
    const { all, winCount } = loadAchievements(REAL_YAML);
    expect(winCount).toBe(14);
    expect(all.length).toBe(winCount);
  });

  it("totalEarnings equals the hand-summed prize total (53950)", () => {
    const { totalEarnings } = loadAchievements(REAL_YAML);
    expect(totalEarnings).toBe(53_950);
  });

  it("yearRange matches the YYYY-YYYY format spanning 2024-2026", () => {
    const { yearRange } = loadAchievements(REAL_YAML);
    // Expect exactly "2024-2026" given the real data
    expect(yearRange).toBe("2024-2026");
    // Also assert it matches the general pattern the Rails model produces
    expect(yearRange).toMatch(/^\d{4}(-\d{4})?$/);
  });

  it("preserves file order (newest first — conatus-grand-champion is first)", () => {
    const { all } = loadAchievements(REAL_YAML);
    expect(all[0].slug).toBe("conatus-grand-champion");
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

  // -------------------------------------------------------------------------
  // badgeLabel — ported from Achievement#badge_label
  // -------------------------------------------------------------------------
  it("badgeLabel: approved place → 'Grant Approved'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // sip-protocol-grant: type=grant, place=approved
    expect(bySlug["sip-protocol-grant"].badgeLabel).toBe("Grant Approved");
  });

  it("badgeLabel: winner place → 'Winner'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // sip-protocol-zypherpunk: type=hackathon, place=winner
    expect(bySlug["sip-protocol-zypherpunk"].badgeLabel).toBe("Winner");
  });

  it("badgeLabel: placed entry → '<place> Place'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // openbudget-id: type=hackathon, place=2nd
    expect(bySlug["openbudget-id"].badgeLabel).toBe("2nd Place");
  });

  // -------------------------------------------------------------------------
  // formattedPrize — ported from Achievement#formatted_prize
  // -------------------------------------------------------------------------
  it("formattedPrize: with prize_extras → '$<amount> + <extras>'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // web3-deal-discovery: prize_amount=5000, prize_extras=NFT
    expect(bySlug["web3-deal-discovery"].formattedPrize).toBe("$5,000 + NFT");
  });

  it("formattedPrize: without prize_extras → '$<amount>'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // solana-security-audit: prize_amount=1500, prize_extras=null
    expect(bySlug["solana-security-audit"].formattedPrize).toBe("$1,500");
  });

  // -------------------------------------------------------------------------
  // fullEvent — ported from Achievement#full_event
  // -------------------------------------------------------------------------
  it("fullEvent: with event_detail → '<event> • <event_detail>'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // solana-security-audit: event="Audit & Fix Open-Source Solana Repos for Vulnerabilities",
    //   event_detail="Superteam Earn"
    expect(bySlug["solana-security-audit"].fullEvent).toBe(
      "Audit & Fix Open-Source Solana Repos for Vulnerabilities • Superteam Earn",
    );
  });

  // -------------------------------------------------------------------------
  // badgeClass — ported from Achievement#badge_class (the missing method)
  // -------------------------------------------------------------------------
  it("badgeClass: type=grant → 'achievement-gold'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // sip-protocol-grant: type=grant, place=approved
    expect(bySlug["sip-protocol-grant"].badgeClass).toBe("achievement-gold");
    // sip-protocol-audit-subsidy: type=grant, place=approved
    expect(bySlug["sip-protocol-audit-subsidy"].badgeClass).toBe("achievement-gold");
  });

  it("badgeClass: type=bounty → 'achievement-bounty'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // solana-security-audit: type=bounty, place=1st
    expect(bySlug["solana-security-audit"].badgeClass).toBe("achievement-bounty");
    // pnode-pulse: type=bounty, place=3rd
    expect(bySlug["pnode-pulse"].badgeClass).toBe("achievement-bounty");
  });

  it("badgeClass: type=hackathon, place=1st → 'achievement-gold'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // web3-deal-discovery: type=hackathon, place=1st
    expect(bySlug["web3-deal-discovery"].badgeClass).toBe("achievement-gold");
    // sip-protocol-graveyard-torque: type=hackathon, place=1st
    expect(bySlug["sip-protocol-graveyard-torque"].badgeClass).toBe("achievement-gold");
  });

  it("badgeClass: type=hackathon, place=winner → 'achievement-gold'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // sip-protocol-zypherpunk: type=hackathon, place=winner
    expect(bySlug["sip-protocol-zypherpunk"].badgeClass).toBe("achievement-gold");
  });

  it("badgeClass: type=hackathon, place=2nd → 'achievement-silver'", () => {
    const { all } = loadAchievements(REAL_YAML);
    const bySlug = Object.fromEntries(all.map((a) => [a.slug, a]));
    // openbudget-id: type=hackathon, place=2nd
    expect(bySlug["openbudget-id"].badgeClass).toBe("achievement-silver");
  });

  // -------------------------------------------------------------------------
  // Schema hardening — a malformed date must fail loud at the validation
  // boundary; otherwise yearRange would silently parse it to NaN.
  // -------------------------------------------------------------------------
  it("throws on a malformed date instead of silently producing NaN", () => {
    expect(() => loadAchievements(MALFORMED_DATE_YAML)).toThrow(/Invalid achievement at index 0/);
  });
});
