import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { FilterSort, type ActiveWork } from "./FilterSort";

// ---------------------------------------------------------------------------
// Fixtures
//
// The real data has exactly ONE active work (CORE), so show-more (>12) can
// only be exercised with synthetic props. We build 15 works to cross the
// LIMIT=12 boundary, with controlled tech/stars/commits/date/title so every
// branch of filter + sort is observable.
// ---------------------------------------------------------------------------

/** Build an active work with sensible defaults; override per-test. */
function work(overrides: Partial<ActiveWork> & { slug: string }): ActiveWork {
  return {
    title: overrides.slug,
    summary: `Summary of ${overrides.slug}`,
    status: "Live",
    technologies: [],
    stars: 0,
    commits: 0,
    sha: null,
    launchedAt: null,
    ...overrides,
  };
}

// 15 works: w01..w15. Dates ascending by index (w15 newest). Stars/commits
// crafted so date-desc, stars-desc, commits-desc, and alpha each produce a
// DISTINCT leading card, making the active sort observable.
function makeFifteen(): ActiveWork[] {
  return Array.from({ length: 15 }, (_, i) => {
    const n = i + 1;
    const pad = String(n).padStart(2, "0");
    return work({
      slug: `w${pad}`,
      title: `Project ${pad}`,
      // launchedAt ascending → w15 is newest (date-desc leader)
      launchedAt: `2025-01-${pad}T00:00:00.000Z`,
      // stars ascending → w15 has the most stars (stars-desc leader = w15 too;
      // we override one below to disambiguate from date)
      stars: n,
      commits: 100 - n, // commits descending → w01 has the most commits
      technologies: n % 2 === 0 ? ["TypeScript"] : ["Rust"],
    });
  });
}

// A small, fully-controlled set for filter + sort leader assertions.
const sortFixtures: ActiveWork[] = [
  work({
    slug: "alpha",
    title: "Alpha",
    launchedAt: "2025-01-01T00:00:00.000Z", // oldest
    stars: 5,
    commits: 50,
    technologies: ["TypeScript", "Solana"],
  }),
  work({
    slug: "bravo",
    title: "Bravo",
    launchedAt: "2025-06-01T00:00:00.000Z", // newest → date-desc leader
    stars: 1,
    commits: 99, // commits-desc leader
    technologies: ["Rust"],
  }),
  work({
    slug: "charlie",
    title: "Charlie",
    launchedAt: "2025-03-01T00:00:00.000Z",
    stars: 99, // stars-desc leader
    commits: 1,
    technologies: ["Python", "AI"],
  }),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** The grid in DOM order. Filtered-out works are omitted from the DOM (the
 *  island renders only the visible set); show-more-hidden cards remain in the
 *  DOM with the class, so tests assert on class/order over these. */
function gridCards(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".work-grid .work-card"),
  );
}

/** Cards that are actually visible: rendered (i.e. not filtered out) and not
 *  paginated away by show-more. Filtered-out cards never enter the DOM, so only
 *  show-more-hidden needs excluding here. */
function visibleCards(): HTMLElement[] {
  return gridCards().filter((c) => !c.classList.contains("show-more-hidden"));
}

function titles(cards: HTMLElement[]): string[] {
  return cards.map(
    (c) => c.querySelector(".work-card-title")?.textContent ?? "",
  );
}

function chip(label: string): HTMLElement {
  return screen.getByRole("button", { name: label });
}

function sortBtn(label: string): HTMLElement {
  // Sort buttons live inside .sort-buttons; scope to avoid colliding with chips.
  const container = document.querySelector<HTMLElement>(".sort-buttons")!;
  return within(container).getByRole("button", { name: label });
}

function counterText(): string {
  return document.querySelector(".work-counter")?.textContent?.trim() ?? "";
}

function showMoreBtn(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".show-more-btn");
}

function noResultsHidden(): boolean {
  const el = document.querySelector(".no-results");
  return !!el && el.classList.contains("hidden");
}

// Reset URL between tests so URL-sync effects start clean.
beforeEach(() => {
  window.history.replaceState({}, "", "/work");
});
afterEach(() => {
  window.history.replaceState({}, "", "/work");
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("FilterSort island", () => {
  describe("filter bar markup", () => {
    it("renders the All chip plus the 8 fixed tech chips", () => {
      render(<FilterSort works={sortFixtures} />);
      const chips = document.querySelectorAll(".filter-chip");
      // All + 8 techs = 9
      expect(chips.length).toBe(9);
      const labels = Array.from(chips).map((c) => c.textContent?.trim());
      expect(labels).toEqual([
        "All",
        "TypeScript",
        "Solana",
        "Rust",
        "Next.js",
        "Anchor",
        "Python",
        "AI",
        "Shell",
      ]);
    });

    it("renders the 4 sort buttons with the Latest one active by default", () => {
      render(<FilterSort works={sortFixtures} />);
      expect(sortBtn("Latest").className).toContain("active");
      expect(sortBtn("Stars").className).not.toContain("active");
      expect(sortBtn("Commits").className).not.toContain("active");
      expect(sortBtn("A-Z").className).not.toContain("active");
    });

    it("marks the All chip active by default (no techs selected)", () => {
      render(<FilterSort works={sortFixtures} />);
      expect(chip("All").className).toContain("active");
      expect(chip("TypeScript").className).not.toContain("active");
    });
  });

  describe("default sort (date desc)", () => {
    it("orders visible cards newest launchedAt first", () => {
      render(<FilterSort works={sortFixtures} />);
      // bravo (Jun) > charlie (Mar) > alpha (Jan)
      expect(titles(visibleCards())).toEqual(["Bravo", "Charlie", "Alpha"]);
    });
  });

  describe("sorting", () => {
    it("sorts by stars descending", () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(sortBtn("Stars"));
      // charlie (99) > alpha (5) > bravo (1)
      expect(titles(visibleCards())).toEqual(["Charlie", "Alpha", "Bravo"]);
      expect(sortBtn("Stars").className).toContain("active");
      expect(sortBtn("Latest").className).not.toContain("active");
    });

    it("sorts by commits descending", () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(sortBtn("Commits"));
      // bravo (99) > alpha (50) > charlie (1)
      expect(titles(visibleCards())).toEqual(["Bravo", "Alpha", "Charlie"]);
    });

    it("sorts alphabetically by title (A-Z)", () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(sortBtn("A-Z"));
      expect(titles(visibleCards())).toEqual(["Alpha", "Bravo", "Charlie"]);
    });
  });

  describe("filtering", () => {
    it("shows only cards matching a single selected tech", () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(chip("Rust"));
      // Only bravo has Rust
      expect(titles(visibleCards())).toEqual(["Bravo"]);
      // All chip no longer active, Rust chip active
      expect(chip("Rust").className).toContain("active");
      expect(chip("All").className).not.toContain("active");
    });

    it("treats multiple selected techs as an OR (union)", () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(chip("Rust")); // bravo
      fireEvent.click(chip("Python")); // charlie
      // OR union → bravo + charlie; date-desc order: bravo (Jun) then charlie (Mar)
      expect(titles(visibleCards())).toEqual(["Bravo", "Charlie"]);
      expect(chip("Rust").className).toContain("active");
      expect(chip("Python").className).toContain("active");
    });

    it("toggling a selected chip off removes it from the filter", () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(chip("Rust"));
      expect(titles(visibleCards())).toEqual(["Bravo"]);
      fireEvent.click(chip("Rust")); // toggle off → back to all (empty filter)
      expect(visibleCards().length).toBe(3);
      expect(chip("All").className).toContain("active");
    });

    it("All chip clears all selected techs", () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(chip("Rust"));
      fireEvent.click(chip("Python"));
      expect(visibleCards().length).toBe(2);
      fireEvent.click(chip("All"));
      expect(visibleCards().length).toBe(3);
      expect(chip("All").className).toContain("active");
      expect(chip("Rust").className).not.toContain("active");
      expect(chip("Python").className).not.toContain("active");
    });

    it("matches tech case-insensitively (card techs vs chip data-tech)", () => {
      // Card stores "TypeScript"; chip toggles lowercased "typescript".
      render(
        <FilterSort
          works={[work({ slug: "ts", title: "TS", technologies: ["TypeScript"] })]}
        />,
      );
      fireEvent.click(chip("TypeScript"));
      expect(visibleCards().length).toBe(1);
    });
  });

  describe("no results", () => {
    it("shows the no-results message and 0 counter when a tech matches nothing", () => {
      render(<FilterSort works={sortFixtures} />);
      // Anchor is not in any fixture's technologies
      fireEvent.click(chip("Anchor"));
      expect(visibleCards().length).toBe(0);
      expect(noResultsHidden()).toBe(false); // visible
      expect(counterText()).toBe("0 projects");
    });

    it("keeps the no-results message hidden while results exist", () => {
      render(<FilterSort works={sortFixtures} />);
      expect(noResultsHidden()).toBe(true);
    });
  });

  describe("counter pluralization", () => {
    it('renders "1 project" (singular) when exactly one is visible', () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(chip("Rust")); // only bravo
      expect(counterText()).toBe("1 project");
    });

    it('renders "N projects" (plural) for more than one', () => {
      render(<FilterSort works={sortFixtures} />);
      expect(counterText()).toBe("3 projects");
    });

    it('renders "0 projects" (plural) when none match', () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(chip("Anchor"));
      expect(counterText()).toBe("0 projects");
    });
  });

  describe("show-more (LIMIT=12)", () => {
    it("shows only the first 12 of 15 visible cards by default", () => {
      render(<FilterSort works={makeFifteen()} />);
      // 15 cards in the DOM, 12 visible
      expect(gridCards().length).toBe(15);
      expect(visibleCards().length).toBe(12);
    });

    it('labels the button "Show 3 more" when 15 are visible', () => {
      render(<FilterSort works={makeFifteen()} />);
      expect(showMoreBtn()).not.toBeNull();
      expect(showMoreBtn()!.className).not.toContain("hidden");
      expect(showMoreBtn()!.textContent?.trim()).toBe("Show 3 more");
    });

    it('expands to all 15 and switches the label to "Show less" on click', () => {
      render(<FilterSort works={makeFifteen()} />);
      fireEvent.click(showMoreBtn()!);
      expect(visibleCards().length).toBe(15);
      expect(showMoreBtn()!.textContent?.trim()).toBe("Show less");
    });

    it("collapses back to 12 when clicked again", () => {
      render(<FilterSort works={makeFifteen()} />);
      fireEvent.click(showMoreBtn()!); // expand
      fireEvent.click(showMoreBtn()!); // collapse
      expect(visibleCards().length).toBe(12);
      expect(showMoreBtn()!.textContent?.trim()).toBe("Show 3 more");
    });

    it("hides the button entirely when 12 or fewer are visible", () => {
      // 10 works → never crosses the limit
      const ten = makeFifteen().slice(0, 10);
      render(<FilterSort works={ten} />);
      expect(visibleCards().length).toBe(10);
      // The button is conditionally rendered — absent entirely when nothing is hidden.
      expect(showMoreBtn()).toBeNull();
    });

    it("recomputes hidden count after a filter narrows the set below the limit", () => {
      render(<FilterSort works={makeFifteen()} />);
      // Even-indexed works are TypeScript (w02,w04,...,w14 = 7 cards) → below 12
      fireEvent.click(chip("TypeScript"));
      expect(visibleCards().length).toBe(7);
      expect(showMoreBtn()).toBeNull();
    });

    it("resets to collapsed (12) when the filter changes after expanding", () => {
      render(<FilterSort works={makeFifteen()} />);
      fireEvent.click(showMoreBtn()!); // expand → 15 visible
      expect(visibleCards().length).toBe(15);

      // Apply a filter that still leaves >12 — but expansion must RESET.
      // Re-select All keeps 15 visible but resets expanded → back to 12.
      fireEvent.click(chip("All"));
      expect(visibleCards().length).toBe(12);
      expect(showMoreBtn()!.textContent?.trim()).toBe("Show 3 more");
    });

    it("resets to collapsed (12) when the SORT changes after expanding", () => {
      // Rails dispatches filter-sort:filtered from setSort too, so changing the
      // sort order triggers show-more#handleFilter (expanded -> false).
      render(<FilterSort works={makeFifteen()} />);
      fireEvent.click(showMoreBtn()!); // expand → 15 visible
      expect(visibleCards().length).toBe(15);

      fireEvent.click(sortBtn("Stars")); // re-sort → still 15 match, but collapse
      expect(visibleCards().length).toBe(12);
      expect(showMoreBtn()!.textContent?.trim()).toBe("Show 3 more");
    });
  });

  describe("active card markup (parity)", () => {
    it("renders a Live badge with a live-pulse for Live status", () => {
      render(
        <FilterSort works={[work({ slug: "live", title: "L", status: "Live" })]} />,
      );
      const badge = document.querySelector(".badge-live");
      expect(badge).toBeInTheDocument();
      expect(badge?.querySelector(".live-pulse")).toBeInTheDocument();
      expect(badge?.textContent).toContain("Live");
    });

    it("renders a status badge (not live) for a non-Live status", () => {
      render(
        <FilterSort
          works={[work({ slug: "ip", title: "IP", status: "In Progress" })]}
        />,
      );
      const badge = document.querySelector(".badge-status");
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toBe("In Progress");
      expect(document.querySelector(".badge-live")).not.toBeInTheDocument();
    });

    it("omits both badges when status is blank", () => {
      render(<FilterSort works={[work({ slug: "x", title: "X", status: "" })]} />);
      expect(document.querySelector(".badge-live")).not.toBeInTheDocument();
      expect(document.querySelector(".badge-status")).not.toBeInTheDocument();
    });

    it("renders the first 3 technologies joined by ' • '", () => {
      render(
        <FilterSort
          works={[
            work({
              slug: "t",
              title: "T",
              technologies: ["A", "B", "C", "D"],
            }),
          ]}
        />,
      );
      expect(document.querySelector(".work-card-tech")?.textContent).toBe(
        "A • B • C",
      );
    });

    it("renders a BARE star number (no inline glyph — CSS ::before supplies it) when stars > 0", () => {
      render(<FilterSort works={[work({ slug: "s", title: "S", stars: 7 })]} />);
      const stars = document.querySelector(".work-card-stars");
      expect(stars).toBeInTheDocument();
      // Active cards must NOT contain the inline ⭐ glyph (that's the winner-card quirk).
      expect(stars?.textContent).toBe("7");
      expect(stars?.textContent).not.toContain("⭐");
    });

    it("omits the stars span when stars is 0", () => {
      render(<FilterSort works={[work({ slug: "s0", title: "S0", stars: 0 })]} />);
      expect(document.querySelector(".work-card-stars")).not.toBeInTheDocument();
    });

    it("renders a BARE commits number when commits > 0", () => {
      render(<FilterSort works={[work({ slug: "c", title: "C", commits: 42 })]} />);
      const commits = document.querySelector(".work-card-commits");
      expect(commits?.textContent).toBe("42");
      expect(commits?.textContent).not.toContain("⊙");
    });

    it("omits the commits span when commits is 0", () => {
      render(<FilterSort works={[work({ slug: "c0", title: "C0", commits: 0 })]} />);
      expect(document.querySelector(".work-card-commits")).not.toBeInTheDocument();
    });

    it("renders the sha span when sha is present, omits it when null", () => {
      const { unmount } = render(
        <FilterSort works={[work({ slug: "sha", title: "Sha", sha: "abc1234" })]} />,
      );
      expect(document.querySelector(".work-card-sha")?.textContent).toBe(
        "abc1234",
      );
      unmount();
      render(<FilterSort works={[work({ slug: "nosha", title: "NoSha", sha: null })]} />);
      expect(document.querySelector(".work-card-sha")).not.toBeInTheDocument();
    });

    it("links each card to /work/<slug>", () => {
      render(<FilterSort works={[work({ slug: "core", title: "CORE" })]} />);
      const link = document.querySelector<HTMLAnchorElement>(".work-card-active");
      expect(link?.getAttribute("href")).toBe("/work/core");
    });
  });

  describe("URL sync on mount", () => {
    it("initializes selected techs from ?tech=a,b", () => {
      window.history.replaceState({}, "", "/work?tech=rust,python");
      render(<FilterSort works={sortFixtures} />);
      // bravo (rust) + charlie (python)
      expect(titles(visibleCards())).toEqual(["Bravo", "Charlie"]);
      expect(chip("Rust").className).toContain("active");
      expect(chip("Python").className).toContain("active");
      expect(chip("All").className).not.toContain("active");
    });

    it("initializes the sort from ?sort=stars", () => {
      window.history.replaceState({}, "", "/work?sort=stars");
      render(<FilterSort works={sortFixtures} />);
      expect(sortBtn("Stars").className).toContain("active");
      expect(titles(visibleCards())).toEqual(["Charlie", "Alpha", "Bravo"]);
    });

    it("ignores an invalid ?sort value (falls back to date)", () => {
      window.history.replaceState({}, "", "/work?sort=bogus");
      render(<FilterSort works={sortFixtures} />);
      expect(sortBtn("Latest").className).toContain("active");
      expect(titles(visibleCards())).toEqual(["Bravo", "Charlie", "Alpha"]);
    });
  });

  describe("URL sync on change", () => {
    it("writes ?tech= when a chip is selected and clears it on All", () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(chip("Rust"));
      expect(window.location.search).toContain("tech=rust");
      fireEvent.click(chip("All"));
      // empty filter → no tech param
      expect(window.location.search).not.toContain("tech=");
    });

    it("writes ?sort= only for non-default sorts", () => {
      render(<FilterSort works={sortFixtures} />);
      fireEvent.click(sortBtn("Stars"));
      expect(window.location.search).toContain("sort=stars");
      fireEvent.click(sortBtn("Latest"));
      // date is the default → param dropped
      expect(window.location.search).not.toContain("sort=");
    });
  });
});
