import { describe, it, expect } from "vitest";
import { bootLines, langModifier, techBars } from "./arbital-helpers";
import { arbitalData } from "@/lib/content/arbital";

// ---------------------------------------------------------------------------
// arbital-helpers.test.ts — the non-trivial transforms behind the arbital views.
// (The presentational JSX in RetroArbital/ModernArbital is not unit-tested,
// matching the superteam route; only the real logic is.)
// ---------------------------------------------------------------------------

describe("bootLines", () => {
  it("returns the four BIOS lines in order", () => {
    const lines = bootLines(64);
    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe("RECTOR SYSTEMS BIOS v2.0");
    expect(lines[1]).toBe("Initializing candidate profile...");
    expect(lines[3]).toBe("MEV subsystem... READY");
  });

  it("interpolates the repository count into the third line", () => {
    expect(bootLines(64)[2]).toBe("Loading 64 repositories... OK");
    expect(bootLines(7)[2]).toBe("Loading 7 repositories... OK");
  });

  it("uses the real arbitalData totalRepos (64) for the boot header", () => {
    expect(bootLines(arbitalData.stats.totalRepos)[2]).toBe(
      "Loading 64 repositories... OK",
    );
  });
});

describe("langModifier", () => {
  it("lowercases a simple language", () => {
    expect(langModifier("Rust")).toBe("rust");
    expect(langModifier("Python")).toBe("python");
    expect(langModifier("TypeScript")).toBe("typescript");
  });

  it("takes only the segment before the first slash (Rails .split('/').first)", () => {
    expect(langModifier("WebSocket/REST")).toBe("websocket");
    expect(langModifier("Solana/Anchor")).toBe("solana");
  });

  it("returns an empty string for an empty language (no crash)", () => {
    expect(langModifier("")).toBe("");
  });

  it("maps every featured project's language to a non-undefined modifier", () => {
    for (const p of arbitalData.featuredProjects) {
      const mod = langModifier(p.language);
      expect(typeof mod).toBe("string");
      expect(mod).toBe(p.language.toLowerCase().split("/")[0]);
    }
  });
});

describe("techBars", () => {
  it("flattens primary then secondary into a single ordered list", () => {
    const bars = techBars(arbitalData.techStack);
    // 3 primary + 4 secondary = 7 bars
    expect(bars).toHaveLength(7);
    // primary first
    expect(bars[0].name).toBe("Rust");
    expect(bars[1].name).toBe("Python");
    expect(bars[2].name).toBe("TypeScript");
    // secondary after
    expect(bars[3].name).toBe("PostgreSQL");
    expect(bars[6].name).toBe("Solana/Anchor");
  });

  it("formats width as '<level>%' and preserves the numeric level", () => {
    const bars = techBars(arbitalData.techStack);
    const rust = bars[0];
    expect(rust.level).toBe(85);
    expect(rust.width).toBe("85%");
    const ts = bars[2];
    expect(ts.width).toBe("95%");
  });

  it("marks highlighted primary entries and never highlights secondary", () => {
    const bars = techBars(arbitalData.techStack);
    // Rust + Python are highlighted; TypeScript is not.
    expect(bars[0].highlight).toBe(true); // Rust
    expect(bars[1].highlight).toBe(true); // Python
    expect(bars[2].highlight).toBe(false); // TypeScript (no highlight flag)
    // every secondary bar is non-highlighted
    for (let i = 3; i < bars.length; i++) {
      expect(bars[i].highlight).toBe(false);
    }
  });

  it("treats a missing highlight flag as false (not undefined)", () => {
    const bars = techBars({
      primary: [{ name: "Go", level: 50 }],
      secondary: [],
      domains: [],
    });
    expect(bars[0].highlight).toBe(false);
  });
});
