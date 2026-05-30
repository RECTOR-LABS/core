import { describe, it, expect } from "vitest";
import type { Repo } from "./repos";
import { currentStack, CATEGORIES } from "./tech-stack";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal Repo for tech-stack tests. Only language and isFork matter here. */
function makeRepo(overrides: Partial<Repo> = {}): Repo {
  return {
    fullName: "rz1989s/repo",
    name: "repo",
    description: null,
    language: "TypeScript",
    htmlUrl: "https://github.com/rz1989s/repo",
    stargazersCount: 0,
    forksCount: 0,
    pushedAt: "2026-01-01T00:00:00Z",
    isFork: false,
    topics: [],
    account: "rz1989s",
    commitCount: null,
    latestCommitSha: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Fixture
//
// 4 TypeScript (non-fork), 2 Rust (non-fork), 1 Python (non-fork)
// 1 TypeScript FORK  → must be excluded
// 1 null-language non-fork → excluded from allLanguages, counted in totalRepos
// 1 "Brainfuck" non-fork → not in any CATEGORY → lands in `other`
//
// totalRepos (non-forks, including null and Brainfuck) = 4+2+1+1+1 = 9
// allLanguages (non-null, non-fork)  = { TypeScript: 4, Rust: 2, Python: 1, Brainfuck: 1 }
//   → sorted DESC: TypeScript(4) > Rust(2) > Python(1) == Brainfuck(1)
//   (stable: insertion order for ties is TypeScript first → Python vs Brainfuck
//    depends on sort; we just check relative order for the top entries)
// ---------------------------------------------------------------------------

const FIXTURE_REPOS: Repo[] = [
  // 4 non-fork TypeScript repos
  makeRepo({ fullName: "rz1989s/ts-1", name: "ts-1", language: "TypeScript" }),
  makeRepo({ fullName: "rz1989s/ts-2", name: "ts-2", language: "TypeScript" }),
  makeRepo({ fullName: "rz1989s/ts-3", name: "ts-3", language: "TypeScript" }),
  makeRepo({ fullName: "rz1989s/ts-4", name: "ts-4", language: "TypeScript" }),
  // 2 non-fork Rust repos
  makeRepo({ fullName: "rz1989s/rust-1", name: "rust-1", language: "Rust" }),
  makeRepo({ fullName: "rz1989s/rust-2", name: "rust-2", language: "Rust" }),
  // 1 non-fork Python repo
  makeRepo({ fullName: "rz1989s/py-1", name: "py-1", language: "Python" }),
  // 1 FORK TypeScript — must NOT be counted
  makeRepo({ fullName: "rz1989s/fork-ts", name: "fork-ts", language: "TypeScript", isFork: true }),
  // 1 null-language non-fork — counted in totalRepos, excluded from allLanguages
  makeRepo({ fullName: "rz1989s/no-lang", name: "no-lang", language: null }),
  // 1 uncategorised language non-fork — should land in `other`
  makeRepo({ fullName: "rz1989s/brainfuck-1", name: "brainfuck-1", language: "Brainfuck" }),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CATEGORIES constant", () => {
  it("contains all expected category keys in declaration order", () => {
    const keys = Object.keys(CATEGORIES);
    expect(keys).toEqual(["blockchain", "web", "backend", "mobile", "infra", "data", "systems"]);
  });

  it("includes Rust in both blockchain and systems (multi-category)", () => {
    expect(CATEGORIES.blockchain).toContain("Rust");
    expect(CATEGORIES.systems).toContain("Rust");
  });

  it("includes Go in both backend and systems", () => {
    expect(CATEGORIES.backend).toContain("Go");
    expect(CATEGORIES.systems).toContain("Go");
  });

  it("includes Python in both backend and data", () => {
    expect(CATEGORIES.backend).toContain("Python");
    expect(CATEGORIES.data).toContain("Python");
  });

  it("includes Kotlin in both backend and mobile", () => {
    expect(CATEGORIES.backend).toContain("Kotlin");
    expect(CATEGORIES.mobile).toContain("Kotlin");
  });
});

describe("currentStack — empty input", () => {
  it("returns safe zero state with no divide-by-zero error", () => {
    const result = currentStack([]);
    expect(result).toEqual({
      allLanguages: {},
      categorized: {},
      primary: [],
      totalRepos: 0,
    });
  });
});

describe("currentStack — totalRepos", () => {
  it("counts only non-fork repos (including null-language) as totalRepos", () => {
    const { totalRepos } = currentStack(FIXTURE_REPOS);
    // non-forks: ts-1, ts-2, ts-3, ts-4, rust-1, rust-2, py-1, no-lang, brainfuck-1 = 9
    // fork-ts is excluded
    expect(totalRepos).toBe(9);
  });

  it("excludes all forks from totalRepos", () => {
    const allForks = [
      makeRepo({ language: "TypeScript", isFork: true }),
      makeRepo({ language: "Rust", isFork: true }),
    ];
    expect(currentStack(allForks).totalRepos).toBe(0);
  });
});

describe("currentStack — allLanguages", () => {
  it("counts only non-fork, non-null-language repos", () => {
    const { allLanguages } = currentStack(FIXTURE_REPOS);
    // Fork TypeScript and null-language repo both excluded
    expect(allLanguages["TypeScript"]).toBe(4);
    expect(allLanguages["Rust"]).toBe(2);
    expect(allLanguages["Python"]).toBe(1);
    expect(allLanguages["Brainfuck"]).toBe(1);
  });

  it("does not include the null-language repo as a key", () => {
    const { allLanguages } = currentStack(FIXTURE_REPOS);
    expect(Object.keys(allLanguages)).not.toContain(null);
    expect(Object.keys(allLanguages)).not.toContain("null");
  });

  it("sorts languages by count DESCENDING (TypeScript before Rust before Python/Brainfuck)", () => {
    const { allLanguages } = currentStack(FIXTURE_REPOS);
    const keys = Object.keys(allLanguages);
    expect(keys.indexOf("TypeScript")).toBeLessThan(keys.indexOf("Rust"));
    expect(keys.indexOf("Rust")).toBeLessThan(keys.indexOf("Python"));
    expect(keys.indexOf("Rust")).toBeLessThan(keys.indexOf("Brainfuck"));
  });

  it("returns an empty object when all repos are forks", () => {
    const forkOnly = [
      makeRepo({ language: "TypeScript", isFork: true }),
    ];
    expect(currentStack(forkOnly).allLanguages).toEqual({});
  });

  it("returns an empty object when all non-fork repos have null language", () => {
    const nullOnly = [
      makeRepo({ language: null, isFork: false }),
      makeRepo({ language: null, isFork: false }),
    ];
    expect(currentStack(nullOnly).allLanguages).toEqual({});
  });
});

describe("currentStack — categorized", () => {
  it("puts TypeScript under web category", () => {
    const { categorized } = currentStack(FIXTURE_REPOS);
    expect(categorized.web).toBeDefined();
    expect(categorized.web["TypeScript"]).toBe(4);
  });

  it("puts Rust under BOTH blockchain AND systems (multi-category membership)", () => {
    const { categorized } = currentStack(FIXTURE_REPOS);
    expect(categorized.blockchain).toBeDefined();
    expect(categorized.blockchain["Rust"]).toBe(2);

    expect(categorized.systems).toBeDefined();
    expect(categorized.systems["Rust"]).toBe(2);
  });

  it("puts Python under BOTH backend AND data", () => {
    const { categorized } = currentStack(FIXTURE_REPOS);
    expect(categorized.backend["Python"]).toBe(1);
    expect(categorized.data["Python"]).toBe(1);
  });

  it("omits categories that have no matching languages", () => {
    const { categorized } = currentStack(FIXTURE_REPOS);
    // Fixture has no mobile/infra languages
    expect(categorized.mobile).toBeUndefined();
    expect(categorized.infra).toBeUndefined();
  });

  it("places an uncategorised language in the other bucket", () => {
    const { categorized } = currentStack(FIXTURE_REPOS);
    expect(categorized.other).toBeDefined();
    expect(categorized.other["Brainfuck"]).toBe(1);
  });

  it("omits the other bucket when all languages belong to a category", () => {
    // Only TypeScript (web) — no uncategorised language
    const repos = [
      makeRepo({ language: "TypeScript" }),
      makeRepo({ language: "Rust" }),
    ];
    const { categorized } = currentStack(repos);
    expect(categorized.other).toBeUndefined();
  });

  it("preserves CATEGORIES declaration order in categorized keys (before other)", () => {
    const { categorized } = currentStack(FIXTURE_REPOS);
    const categoryKeys = Object.keys(categorized).filter((k) => k !== "other");
    const allCategoryKeys = Object.keys(CATEGORIES);

    // Each key in categorized (non-other) must appear in allCategoryKeys
    // and their relative order must match CATEGORIES declaration order
    const catPositions = categoryKeys.map((k) => allCategoryKeys.indexOf(k));
    for (let i = 0; i < catPositions.length - 1; i++) {
      expect(catPositions[i]).toBeLessThan(catPositions[i + 1]);
    }
  });

  it("other bucket preserves DESC order from allLanguages", () => {
    // Two uncategorised languages — higher-count one should appear first in `other`
    const repos = [
      makeRepo({ language: "Brainfuck" }),
      makeRepo({ language: "Brainfuck" }),
      makeRepo({ language: "COBOL" }),
    ];
    const { categorized } = currentStack(repos);
    expect(categorized.other).toBeDefined();
    const otherKeys = Object.keys(categorized.other!);
    expect(otherKeys[0]).toBe("Brainfuck");
    expect(otherKeys[1]).toBe("COBOL");
  });
});

describe("currentStack — primary languages", () => {
  it("returns at most 5 entries", () => {
    // 6 distinct languages — primary must cap at 5
    const repos = [
      makeRepo({ language: "TypeScript" }),
      makeRepo({ language: "Rust" }),
      makeRepo({ language: "Python" }),
      makeRepo({ language: "Go" }),
      makeRepo({ language: "Ruby" }),
      makeRepo({ language: "Shell" }),
    ];
    expect(currentStack(repos).primary.length).toBeLessThanOrEqual(5);
    expect(currentStack(repos).primary.length).toBe(5);
  });

  it("orders primary by count DESC (highest count first)", () => {
    const { primary } = currentStack(FIXTURE_REPOS);
    // TypeScript(4) > Rust(2) > …
    expect(primary[0].name).toBe("TypeScript");
    expect(primary[0].count).toBe(4);
    expect(primary[1].name).toBe("Rust");
    expect(primary[1].count).toBe(2);
  });

  it("computes exact percentage for TypeScript (hand-verified)", () => {
    // totalRepos = 9 (non-forks including null-language + Brainfuck)
    // TypeScript count = 4
    // percentage = round1(4/9 * 100) = round1(44.444…) = 44.4
    const { primary } = currentStack(FIXTURE_REPOS);
    const ts = primary.find((p) => p.name === "TypeScript");
    expect(ts).toBeDefined();
    expect(ts!.percentage).toBe(44.4);
  });

  it("computes exact percentage for Rust (hand-verified)", () => {
    // Rust count = 2, totalRepos = 9
    // percentage = round1(2/9 * 100) = round1(22.222…) = 22.2
    const { primary } = currentStack(FIXTURE_REPOS);
    const rust = primary.find((p) => p.name === "Rust");
    expect(rust).toBeDefined();
    expect(rust!.percentage).toBe(22.2);
  });

  it("computes clean 50% when exactly half of totalRepos speak the language", () => {
    // 2 TypeScript non-forks, totalRepos = 4 (2 TS + 2 Rust)
    // 2/4 * 100 = 50.0 — clean, tests round1 with no rounding needed
    const repos = [
      makeRepo({ language: "TypeScript" }),
      makeRepo({ language: "TypeScript" }),
      makeRepo({ language: "Rust" }),
      makeRepo({ language: "Rust" }),
    ];
    const { primary } = currentStack(repos);
    expect(primary[0].name).toBe("TypeScript");
    expect(primary[0].percentage).toBe(50);
  });

  it("exercises 1-decimal rounding (33.3%)", () => {
    // 1 TypeScript out of 3 totalRepos → 1/3 * 100 = 33.333… → 33.3
    const repos = [
      makeRepo({ language: "TypeScript" }),
      makeRepo({ language: "Rust" }),
      makeRepo({ language: "Python" }),
    ];
    const { primary } = currentStack(repos);
    const ts = primary.find((p) => p.name === "TypeScript");
    expect(ts!.percentage).toBe(33.3);
  });

  it("returns percentage 0 for all entries when totalRepos is 0 (empty input guard)", () => {
    const { primary } = currentStack([]);
    expect(primary).toEqual([]);
  });

  it("uses totalRepos (including null-language repos) as the denominator, not allLanguages count", () => {
    // 1 TypeScript, 1 null-language → totalRepos = 2, not 1
    // percentage = round1(1/2*100) = 50, NOT 100
    const repos = [
      makeRepo({ language: "TypeScript" }),
      makeRepo({ language: null }),
    ];
    const { primary, totalRepos } = currentStack(repos);
    expect(totalRepos).toBe(2);
    expect(primary[0].percentage).toBe(50);
  });
});

describe("currentStack — shape contract", () => {
  it("returns all required keys", () => {
    const result = currentStack(FIXTURE_REPOS);
    expect(result).toHaveProperty("allLanguages");
    expect(result).toHaveProperty("categorized");
    expect(result).toHaveProperty("primary");
    expect(result).toHaveProperty("totalRepos");
  });

  it("is deterministic — same input produces identical output", () => {
    const a = currentStack(FIXTURE_REPOS);
    const b = currentStack(FIXTURE_REPOS);
    expect(a).toEqual(b);
  });
});
