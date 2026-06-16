import path from "node:path";
import { describe, it, expect } from "vitest";
import { loadHackathons } from "./hackathons";

const REAL = path.join(process.cwd(), "data", "hackathons.yml");
const MALFORMED = path.join(__dirname, "__fixtures__/hackathons-malformed.yml");
const LABELED = path.join(__dirname, "__fixtures__/hackathons-labeled.yml");

describe("loadHackathons", () => {
  it("loads and validates the real hackathons.yml without throwing", () => {
    expect(() => loadHackathons(REAL)).not.toThrow();
  });

  it("exposes all 22 entries and the meta", () => {
    const { all, asOf, source } = loadHackathons(REAL);
    expect(all.length).toBe(22);
    expect(asOf).toBe("2026-06-04");
    expect(source.label).toContain("kenn_ronin");
  });

  it("enterable = open/upcoming only (excludes closed/dead/ineligible)", () => {
    const { enterable } = loadHackathons(REAL);
    expect(enterable.every((h) => h.status === "open" || h.status === "upcoming")).toBe(true);
    expect(enterable.some((h) => h.name === "Sui Overflow 2026")).toBe(false);
  });

  it("sortedByDeadline puts the nearest first and sinks null deadlines to the end", () => {
    const { sortedByDeadline } = loadHackathons(REAL);
    expect(sortedByDeadline[0].name).toBe("HackerNoon Proof of Usefulness"); // Jun 5, earliest
    const lastReal = sortedByDeadline.findIndex((h) => h.deadlineSort === null);
    // every entry after the first null is also null (nulls grouped at the end)
    expect(sortedByDeadline.slice(lastReal).every((h) => h.deadlineSort === null)).toBe(true);
  });

  it("corrections returns only entries with a non-null correction", () => {
    const { corrections } = loadHackathons(REAL);
    expect(corrections.length).toBeGreaterThan(0);
    expect(corrections.every((h) => typeof h.correction === "string")).toBe(true);
    expect(corrections.some((h) => h.name === "Sui Overflow 2026")).toBe(true);
  });

  it("throws loudly on a malformed entry instead of silently coercing", () => {
    expect(() => loadHackathons(MALFORMED)).toThrow(/Invalid hackathon at index 0/);
  });

  it("defaults labels to the edition-1 strings when the block is absent", () => {
    const { labels } = loadHackathons(REAL);
    expect(labels).toEqual({
      correctionLabel: "Correction",
      correctionsHeading: "What the viral list got wrong",
      correctionsStatLabel: "corrections",
    });
  });

  it("uses the file's labels when present", () => {
    const { labels } = loadHackathons(LABELED);
    expect(labels).toEqual({
      correctionLabel: "Caveat",
      correctionsHeading: "What to double-check before you build",
      correctionsStatLabel: "caveats",
    });
  });
});
