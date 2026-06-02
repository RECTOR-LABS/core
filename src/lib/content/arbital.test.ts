import { describe, it, expect } from "vitest";
import { arbitalData } from "./arbital";

// ---------------------------------------------------------------------------
// arbital.test.ts — Port-fidelity guards for the arbital data module.
// Tests verify structural counts and representative exact values to catch
// copy-paste typos from the Rails controller.
// ---------------------------------------------------------------------------

describe("arbitalData — identity", () => {
  it('name is "RECTOR"', () => {
    expect(arbitalData.identity.name).toBe("RECTOR");
  });

  it("has all four identity fields", () => {
    const { name, tagline, role, avatar } = arbitalData.identity;
    expect(name).toBeTruthy();
    expect(tagline).toBeTruthy();
    expect(role).toBeTruthy();
    expect(avatar).toBeTruthy();
  });

  it("avatar is the correct filename", () => {
    expect(arbitalData.identity.avatar).toBe("rector_profile_image.png");
  });
});

describe("arbitalData — stats", () => {
  it("vulnerabilitiesFound is 125", () => {
    expect(arbitalData.stats.vulnerabilitiesFound).toBe(125);
  });

  it("totalStars is 203", () => {
    expect(arbitalData.stats.totalStars).toBe(203);
  });

  it("bountyEarned is the pre-formatted string $7.5K", () => {
    expect(arbitalData.stats.bountyEarned).toBe("$7.5K");
  });

  it("hackathons2025 is 8", () => {
    expect(arbitalData.stats.hackathons2025).toBe(8);
  });

  it("totalRepos is 64", () => {
    expect(arbitalData.stats.totalRepos).toBe(64);
  });

  it("tradingProjects is 6", () => {
    expect(arbitalData.stats.tradingProjects).toBe(6);
  });

  it("does NOT have a solanaProjects key (controller never sets it)", () => {
    // arbital_retro.html.erb references @stats[:solana_projects] (→ nil in Rails).
    // This key must NOT be silently invented in the TS port.
    expect((arbitalData.stats as unknown as Record<string, unknown>)["solanaProjects"]).toBeUndefined();
  });
});

describe("arbitalData — featuredProjects", () => {
  it("has exactly 6 projects", () => {
    expect(arbitalData.featuredProjects).toHaveLength(6);
  });

  it("first project is recMEV Suite", () => {
    expect(arbitalData.featuredProjects[0].name).toBe("recMEV Suite");
  });

  it("first project org is RECTOR-LABS", () => {
    expect(arbitalData.featuredProjects[0].org).toBe("RECTOR-LABS");
  });

  it("first project language is Rust", () => {
    expect(arbitalData.featuredProjects[0].language).toBe("Rust");
  });

  it("first project has 3 tags", () => {
    expect(arbitalData.featuredProjects[0].tags).toHaveLength(3);
  });

  it("first project has no liveUrl (optional field absent)", () => {
    expect(arbitalData.featuredProjects[0].liveUrl).toBeUndefined();
  });

  it("Saros DLMM Manager (index 1) has a liveUrl", () => {
    expect(arbitalData.featuredProjects[1].liveUrl).toBe("https://saros-demo.rectorspace.com");
  });

  it("Meteora Fee Routing (index 2) has a liveUrl", () => {
    expect(arbitalData.featuredProjects[2].liveUrl).toBe(
      "https://meteora-fee-routing.rectorspace.com",
    );
  });

  it("Solana Whale Alert (index 3) has no liveUrl", () => {
    expect(arbitalData.featuredProjects[3].liveUrl).toBeUndefined();
  });

  it("every project has name, org, description, language, tags, url, relevance", () => {
    for (const p of arbitalData.featuredProjects) {
      expect(p.name).toBeTruthy();
      expect(p.org).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.language).toBeTruthy();
      expect(Array.isArray(p.tags)).toBe(true);
      expect(p.url).toBeTruthy();
      expect(p.relevance).toBeTruthy();
    }
  });

  it("last project is GPT Web Scraper (Python)", () => {
    const last = arbitalData.featuredProjects[5];
    expect(last.name).toBe("GPT Web Scraper");
    expect(last.language).toBe("Python");
  });
});

describe("arbitalData — techStack", () => {
  it("has primary, secondary, and domains keys", () => {
    expect(arbitalData.techStack).toHaveProperty("primary");
    expect(arbitalData.techStack).toHaveProperty("secondary");
    expect(arbitalData.techStack).toHaveProperty("domains");
  });

  it("primary has 3 entries", () => {
    expect(arbitalData.techStack.primary).toHaveLength(3);
  });

  it("secondary has 4 entries", () => {
    expect(arbitalData.techStack.secondary).toHaveLength(4);
  });

  it("domains has 6 entries", () => {
    expect(arbitalData.techStack.domains).toHaveLength(6);
  });

  it("Rust is first in primary with level 85 and highlight true", () => {
    const rust = arbitalData.techStack.primary[0];
    expect(rust.name).toBe("Rust");
    expect(rust.level).toBe(85);
    expect(rust.highlight).toBe(true);
  });

  it("TypeScript is third in primary with level 95 and no highlight flag", () => {
    const ts = arbitalData.techStack.primary[2];
    expect(ts.name).toBe("TypeScript");
    expect(ts.level).toBe(95);
    expect(ts.highlight).toBeUndefined();
  });

  it("first domain is Trading Systems", () => {
    expect(arbitalData.techStack.domains[0]).toBe("Trading Systems");
  });
});

describe("arbitalData — orgs", () => {
  it("has exactly 4 orgs", () => {
    expect(arbitalData.orgs).toHaveLength(4);
  });

  it("first org is rz1989s Personal with 28 repos", () => {
    const org = arbitalData.orgs[0];
    expect(org.name).toBe("rz1989s");
    expect(org.type).toBe("Personal");
    expect(org.repos).toBe(28);
    expect(org.url).toBe("https://github.com/rz1989s");
  });

  it("second org is RECTOR-LABS Organization with 19 repos", () => {
    const org = arbitalData.orgs[1];
    expect(org.name).toBe("RECTOR-LABS");
    expect(org.type).toBe("Organization");
    expect(org.repos).toBe(19);
  });

  it("last org is sip-protocol with 5 repos", () => {
    const org = arbitalData.orgs[3];
    expect(org.name).toBe("sip-protocol");
    expect(org.repos).toBe(5);
  });
});

describe("arbitalData — whyArbital (paragraph array)", () => {
  it("has exactly 5 paragraphs (matching the Rails heredoc split on \\n\\n)", () => {
    expect(arbitalData.whyArbital).toHaveLength(5);
  });

  it("first paragraph opens with the institutional-grade sentence", () => {
    expect(arbitalData.whyArbital[0]).toMatch(
      /You're building institutional-grade execution for on-chain perps/,
    );
  });

  it("last paragraph is the closing statement about small teams", () => {
    expect(arbitalData.whyArbital[4]).toMatch(
      /Small team, high ownership, building core infra from day one/,
    );
  });

  it("every paragraph is a non-empty string", () => {
    for (const p of arbitalData.whyArbital) {
      expect(typeof p).toBe("string");
      expect(p.trim().length).toBeGreaterThan(0);
    }
  });

  it("no paragraph contains a double-newline (the split separator)", () => {
    for (const p of arbitalData.whyArbital) {
      expect(p).not.toContain("\n\n");
    }
  });
});

describe("arbitalData — whatIBring", () => {
  it("has exactly 6 entries", () => {
    expect(arbitalData.whatIBring).toHaveLength(6);
  });

  it("first entry is Execution Engine mapped to recMEV Suite", () => {
    const first = arbitalData.whatIBring[0];
    expect(first.area).toBe("Execution Engine");
    expect(first.match).toContain("recMEV Suite");
  });

  it("last entry is Crypto Native", () => {
    const last = arbitalData.whatIBring[5];
    expect(last.area).toBe("Crypto Native");
    expect(last.match).toContain("$7.5K");
  });

  it("every entry has non-empty area and match", () => {
    for (const entry of arbitalData.whatIBring) {
      expect(entry.area.trim().length).toBeGreaterThan(0);
      expect(entry.match.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("arbitalData — contact", () => {
  it("github points to rz1989s", () => {
    expect(arbitalData.contact.github).toBe("https://github.com/rz1989s");
  });

  it("twitter points to x.com/rz1989sol", () => {
    expect(arbitalData.contact.twitter).toBe("https://x.com/rz1989sol");
  });

  it("email is apply@rectorspace.com", () => {
    expect(arbitalData.contact.email).toBe("apply@rectorspace.com");
  });
});
