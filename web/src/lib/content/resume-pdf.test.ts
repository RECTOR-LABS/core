import { describe, it, expect } from "vitest";
import type { Achievement } from "./achievements";
import type { Resume } from "./resume";
import {
  buildPdfStats,
  pdfBullets,
  buildPdfExpEntries,
  buildPdfAwards,
  formatContactFields,
} from "./resume-pdf";

// ---------------------------------------------------------------------------
// Minimal fixture helpers
// ---------------------------------------------------------------------------

function makeAchievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    slug: "test-slug",
    title: "Test Project",
    type: "hackathon",
    place: "1st",
    prizeAmount: 1000,
    prizeExtras: null,
    event: "Test Hackathon",
    eventDetail: "Superteam Earn",
    date: "2026-01",
    githubUrl: "https://github.com/test/test",
    repoName: "test",
    description: "Test description",
    badgeEmoji: "🥇",
    badgeLabel: "1st Place",
    formattedPrize: "$1,000",
    fullEvent: "Test Hackathon • Superteam Earn",
    badgeClass: "achievement-gold",
    ...overrides,
  };
}

type Bullet = Resume["experience"][number]["bullets"][number];

function makeBullet(text: string, pdf: boolean, web: boolean): Bullet {
  return { text, pdf, web };
}

type Experience = Resume["experience"][number];

function makeExp(overrides: Partial<Experience> = {}): Experience {
  return {
    title: "Engineer",
    company: "ACME Corp",
    date_start: "2024-01",
    date_end: "present",
    location: "Remote",
    bullets: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildPdfStats
// ---------------------------------------------------------------------------

describe("buildPdfStats", () => {
  it("returns the correct wins count equal to achievement count", () => {
    const achievements = [makeAchievement(), makeAchievement()];
    const stats = buildPdfStats(achievements);
    expect(stats.wins).toBe("2");
  });

  it("formats earnings as $total+ with thousand separator", () => {
    const achievements = [
      makeAchievement({ prizeAmount: 10000 }),
      makeAchievement({ prizeAmount: 1500 }),
    ];
    const stats = buildPdfStats(achievements);
    expect(stats.earnings).toBe("$11,500+");
  });

  it("returns hardcoded vulns value '125'", () => {
    const stats = buildPdfStats([]);
    expect(stats.vulns).toBe("125");
  });

  it("sums only grant-type achievements for grantsAmount", () => {
    const achievements = [
      makeAchievement({ type: "grant", prizeAmount: 10000 }),
      makeAchievement({ type: "grant", prizeAmount: 6000 }),
      makeAchievement({ type: "hackathon", prizeAmount: 5000 }),
      makeAchievement({ type: "bounty", prizeAmount: 2000 }),
    ];
    const stats = buildPdfStats(achievements);
    // Only the two grants sum: 10000 + 6000 = 16000
    expect(stats.grantsAmount).toBe("$16,000");
  });

  it("formats grantsAmount with thousand separator", () => {
    const achievements = [
      makeAchievement({ type: "grant", prizeAmount: 10000 }),
      makeAchievement({ type: "grant", prizeAmount: 6000 }),
    ];
    const stats = buildPdfStats(achievements);
    expect(stats.grantsAmount).toBe("$16,000");
  });

  it("handles zero achievements without throwing", () => {
    const stats = buildPdfStats([]);
    expect(stats.wins).toBe("0");
    expect(stats.earnings).toBe("$0+");
    expect(stats.grantsAmount).toBe("$0");
    expect(stats.vulns).toBe("125");
  });

  it("formats earnings correctly for real data (11 achievements, ~$35,550)", () => {
    // Simulates the real achievements.yml total
    const achievements = [
      makeAchievement({ type: "bounty",   prizeAmount: 1500 }),
      makeAchievement({ type: "bounty",   prizeAmount: 2000 }),
      makeAchievement({ type: "bounty",   prizeAmount: 1500 }),
      makeAchievement({ type: "hackathon", prizeAmount: 750 }),
      makeAchievement({ type: "grant",    prizeAmount: 6000 }),
      makeAchievement({ type: "grant",    prizeAmount: 10000 }),
      makeAchievement({ type: "bounty",   prizeAmount: 1000 }),
      makeAchievement({ type: "hackathon", prizeAmount: 5000 }),
      makeAchievement({ type: "hackathon", prizeAmount: 6500 }),
      makeAchievement({ type: "hackathon", prizeAmount: 1500 }),
      makeAchievement({ type: "bounty",   prizeAmount: 300 }),
    ];
    const stats = buildPdfStats(achievements);
    expect(stats.wins).toBe("11");
    expect(stats.earnings).toBe("$36,050+");
    expect(stats.grantsAmount).toBe("$16,000");
  });
});

// ---------------------------------------------------------------------------
// pdfBullets
// ---------------------------------------------------------------------------

describe("pdfBullets", () => {
  it("returns only bullets where pdf is true", () => {
    const bullets = [
      makeBullet("PDF only", true, false),
      makeBullet("Web only", false, true),
      makeBullet("Both", true, true),
      makeBullet("Neither", false, false),
    ];
    const result = pdfBullets(bullets);
    expect(result).toEqual(["PDF only", "Both"]);
  });

  it("returns an empty array when no bullets have pdf:true", () => {
    const bullets = [
      makeBullet("Web only 1", false, true),
      makeBullet("Web only 2", false, true),
    ];
    expect(pdfBullets(bullets)).toEqual([]);
  });

  it("returns all texts when all bullets are pdf:true", () => {
    const bullets = [
      makeBullet("A", true, true),
      makeBullet("B", true, false),
    ];
    expect(pdfBullets(bullets)).toEqual(["A", "B"]);
  });
});

// ---------------------------------------------------------------------------
// buildPdfExpEntries
// ---------------------------------------------------------------------------

describe("buildPdfExpEntries", () => {
  it("maps experience entries with only pdf-true bullets", () => {
    const exp = makeExp({
      bullets: [
        makeBullet("Keep this", true, true),
        makeBullet("Skip this", false, true),
      ],
    });
    const result = buildPdfExpEntries([exp]);
    expect(result).toHaveLength(1);
    expect(result[0].bullets).toEqual(["Keep this"]);
  });

  it("preserves all exp metadata fields", () => {
    const exp = makeExp({
      title: "Senior Engineer",
      company: "Big Corp",
      date_start: "2025-06",
      date_end: "present",
      bullets: [makeBullet("Did a thing", true, true)],
    });
    const result = buildPdfExpEntries([exp]);
    expect(result[0].title).toBe("Senior Engineer");
    expect(result[0].company).toBe("Big Corp");
    expect(result[0].dateStart).toBe("2025-06");
    expect(result[0].dateEnd).toBe("present");
  });

  it("includes entries with zero pdf bullets (matching Rails behaviour)", () => {
    const exp = makeExp({ bullets: [makeBullet("Web only", false, true)] });
    const result = buildPdfExpEntries([exp]);
    expect(result).toHaveLength(1);
    expect(result[0].bullets).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// buildPdfAwards
// ---------------------------------------------------------------------------

describe("buildPdfAwards", () => {
  it("sorts awards by prizeAmount descending", () => {
    const achievements = [
      makeAchievement({ prizeAmount: 500,   title: "Small" }),
      makeAchievement({ prizeAmount: 10000, title: "Large" }),
      makeAchievement({ prizeAmount: 2000,  title: "Medium" }),
    ];
    const result = buildPdfAwards(achievements);
    expect(result.map((a) => a.title)).toEqual(["Large", "Medium", "Small"]);
  });

  it("does not mutate the original array", () => {
    const achievements = [
      makeAchievement({ prizeAmount: 500 }),
      makeAchievement({ prizeAmount: 2000 }),
    ];
    const original = achievements.map((a) => a.prizeAmount);
    buildPdfAwards(achievements);
    expect(achievements.map((a) => a.prizeAmount)).toEqual(original);
  });

  it("maps to the correct fields for the award template", () => {
    const a = makeAchievement({
      prizeAmount: 5000,
      formattedPrize: "$5,000 + NFT",
      badgeLabel: "1st Place",
      fullEvent: "MonkeDAO Cypherpunk • Superteam Earn",
      title: "Web3 Deal Discovery",
    });
    const result = buildPdfAwards([a]);
    expect(result[0]).toEqual({
      formattedPrize: "$5,000 + NFT",
      badgeLabel: "1st Place",
      fullEvent: "MonkeDAO Cypherpunk • Superteam Earn",
      title: "Web3 Deal Discovery",
    });
  });

  it("keeps stable order for equal prize amounts (JS sort is stable)", () => {
    const achievements = [
      makeAchievement({ prizeAmount: 1500, title: "First in file" }),
      makeAchievement({ prizeAmount: 1500, title: "Second in file" }),
    ];
    const result = buildPdfAwards(achievements);
    expect(result[0].title).toBe("First in file");
    expect(result[1].title).toBe("Second in file");
  });
});

// ---------------------------------------------------------------------------
// formatContactFields
// ---------------------------------------------------------------------------

describe("formatContactFields", () => {
  it("returns [location, email, website, github] in order", () => {
    const personal: Resume["personal"] = {
      name: "Rheza Sulaiman",
      alias: "RECTOR",
      location: "Jakarta, Indonesia",
      email: "rector@rectorspace.com",
      website: "rectorspace.com",
      github: "github.com/rz1989s",
      telegram: "@RZ1989sol",
      twitter: "@RZ1989sol",
      avatar: "rector_profile_image.png",
    };
    const fields = formatContactFields(personal);
    expect(fields).toEqual([
      "Jakarta, Indonesia",
      "rector@rectorspace.com",
      "rectorspace.com",
      "github.com/rz1989s",
    ]);
  });
});
