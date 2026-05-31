"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Props
//
// Faithful combined port of two Rails Stimulus controllers driving the Active
// Projects <section> of app/views/works/index.html.erb:
//   - filter_sort_controller.js  (multi-select tech filter + 4-way sort + URL sync)
//   - show_more_controller.js    (collapse to LIMIT, expand/collapse, reset on filter)
// They are coupled in Rails via `filter-sort:filtered -> show-more#handleFilter`;
// here they share a single React state model.
//
// Each ActiveWork mirrors the `data-*` attributes the Rails card exposed:
//   technologies / stars / commits / date(=launchedAt iso) / title — plus the
//   fields needed to render the card body (slug, summary, status, sha).
// ---------------------------------------------------------------------------

export interface ActiveWork {
  slug: string;
  title: string;
  summary: string;
  status: string;
  technologies: string[];
  stars: number;
  commits: number;
  /** 7-char latest commit sha, or null when unavailable (matches Rails). */
  sha: string | null;
  /** launchedAt as ISO string, or null when the work has no launch date. */
  launchedAt: string | null;
}

interface FilterSortProps {
  works: ActiveWork[];
}

// ---------------------------------------------------------------------------
// Constants — ported 1:1 from the Stimulus controllers / ERB.
// ---------------------------------------------------------------------------

/** show_more_controller `limit` default. */
const LIMIT = 12;

/** Fixed chip list from the ERB; `data-tech` is the lowercased value. */
const TECH_CHIPS = [
  "TypeScript",
  "Solana",
  "Rust",
  "Next.js",
  "Anchor",
  "Python",
  "AI",
  "Shell",
] as const;

type SortBy = "date" | "stars" | "commits" | "alpha";
const VALID_SORTS: readonly SortBy[] = ["date", "stars", "commits", "alpha"];

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Filter predicate — port of filter_sort_controller#applyFiltersAndSort filter:
 *   matches = selectedTechs.length === 0 ||
 *             selectedTechs.some(tech => cardTechs.includes(tech.toLowerCase()))
 * where cardTechs is the card's technologies lowercased.
 */
function matchesFilter(work: ActiveWork, selectedTechs: string[]): boolean {
  if (selectedTechs.length === 0) return true;
  const cardTechs = work.technologies.map((t) => t.toLowerCase());
  return selectedTechs.some((tech) => cardTechs.includes(tech.toLowerCase()));
}

/**
 * Comparator — port of filter_sort_controller#applyFiltersAndSort sort switch.
 * `date` is the default (newest launch first); a null launchedAt becomes
 * `new Date(0)` exactly like Rails' `new Date(card.dataset.date || 0)`.
 */
function compare(a: ActiveWork, b: ActiveWork, sortBy: SortBy): number {
  switch (sortBy) {
    case "stars":
      return b.stars - a.stars;
    case "commits":
      return b.commits - a.commits;
    case "alpha":
      return a.title.localeCompare(b.title);
    case "date":
    default:
      return (
        new Date(b.launchedAt ?? 0).getTime() -
        new Date(a.launchedAt ?? 0).getTime()
      );
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FilterSort({ works }: FilterSortProps) {
  // Stimulus values: selectedTechs (Array, default []) + sortBy (String, default "date").
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("date");
  // show_more_controller `expanded` value (Boolean, default false).
  const [expanded, setExpanded] = useState(false);

  // -------------------------------------------------------------------------
  // readFromURL — Stimulus runs this in connect(); we run it once on mount.
  //
  // SSR and the first client render both use the defaults (so the hydrated
  // markup matches the server HTML — no mismatch), then this effect reconciles
  // state from ?tech / ?sort, mirroring filter_sort_controller#readFromURL.
  // window is client-only here (effects never run on the server).
  //
  // The set-state-in-effect suppression below is a deliberate OVERRIDE, not a
  // pattern the rule blesses: we synchronise React state FROM an external system
  // (the URL) once on mount. The cleaner-looking alternatives don't fit a
  // static/ISR route — useSearchParams forces a Suspense boundary + dynamic
  // rendering (defeating ISR), and a lazy useState initializer reading window
  // would hydration-mismatch. The read is synchronous (not deferred) so
  // URL-driven state is applied before any user interaction — matching the
  // Stimulus controller, which reads the URL in connect() *before* its first
  // applyFiltersAndSort(). The two updates are batched into a single commit by
  // React, so there is no cascade; a one-shot ref keeps it to a single run.
  // -------------------------------------------------------------------------
  const didReadUrl = useRef(false);
  useEffect(() => {
    if (didReadUrl.current) return;
    didReadUrl.current = true;

    const params = new URLSearchParams(window.location.search);

    const techParam = params.get("tech");
    if (techParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot URL sync on mount (external-system read); batched, ref-guarded, faithful to Stimulus connect()
      setSelectedTechs(techParam.split(",").filter((t) => t));
    }

    const sortParam = params.get("sort");
    if (sortParam && (VALID_SORTS as readonly string[]).includes(sortParam)) {
      setSortBy(sortParam as SortBy);
    }
  }, []);

  // -------------------------------------------------------------------------
  // updateURL — Stimulus calls this after every toggleFilter / setSort.
  // Derived from state so it stays in lockstep: tech= only when non-empty,
  // sort= only when not the "date" default, then history.replaceState.
  // A ref skips the initial mount run so we don't clobber a URL we haven't
  // read yet (and avoids a setState-in-effect mount gate).
  // -------------------------------------------------------------------------
  const didSkipFirstWrite = useRef(false);
  useEffect(() => {
    if (!didSkipFirstWrite.current) {
      didSkipFirstWrite.current = true;
      return;
    }
    const params = new URLSearchParams();
    if (selectedTechs.length > 0) params.set("tech", selectedTechs.join(","));
    if (sortBy !== "date") params.set("sort", sortBy);

    const qs = params.toString();
    const newURL = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    window.history.replaceState({}, "", newURL);
  }, [selectedTechs, sortBy]);

  // -------------------------------------------------------------------------
  // Derived: the filtered + sorted list (port of applyFiltersAndSort body).
  // -------------------------------------------------------------------------
  const visible = useMemo(() => {
    return works
      .filter((w) => matchesFilter(w, selectedTechs))
      .sort((a, b) => compare(a, b, sortBy));
  }, [works, selectedTechs, sortBy]);

  // show_more: among VISIBLE items, the first LIMIT are shown; the rest are
  // hidden unless expanded. hiddenCount drives the button (port of updateVisibility).
  const hiddenCount = visible.length - LIMIT;

  // -------------------------------------------------------------------------
  // Handlers — ported from the controller actions.
  // -------------------------------------------------------------------------

  // toggleFilter — "all" clears; otherwise toggle membership (multi-select).
  // Any filter change resets show-more to collapsed (filter-sort:filtered ->
  // show-more#handleFilter, which sets expanded = false).
  function toggleFilter(tech: string) {
    if (tech === "all") {
      setSelectedTechs([]);
    } else {
      setSelectedTechs((prev) => {
        const idx = prev.indexOf(tech);
        if (idx > -1) {
          const next = [...prev];
          next.splice(idx, 1);
          return next;
        }
        return [...prev, tech];
      });
    }
    setExpanded(false);
  }

  // setSort — change the sort order. Resets show-more to collapsed because
  // Rails' setSort calls applyFiltersAndSort(), which dispatches the "filtered"
  // event wired to show-more#handleFilter (expanded -> false). So changing the
  // sort collapses an expanded list, exactly like changing the filter does.
  function setSort(value: SortBy) {
    setSortBy(value);
    setExpanded(false);
  }

  function toggleShowMore() {
    setExpanded((e) => !e);
  }

  // -------------------------------------------------------------------------
  // Visual state helpers
  // -------------------------------------------------------------------------
  const isAllActive = selectedTechs.length === 0;
  const counterLabel = `${visible.length} project${visible.length !== 1 ? "s" : ""}`;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <section className="work-section">
      <div className="work-section-header">
        <h2 className="work-section-title">
          <span className="work-section-icon">🔨</span>
          Active Projects
          <span className="work-counter">{counterLabel}</span>
        </h2>
      </div>

      {/* Filter Chips + Sort Buttons */}
      <div className="filter-bar">
        <div className="filter-chips">
          <button
            type="button"
            className={"filter-chip" + (isAllActive ? " active" : "")}
            data-tech="all"
            onClick={() => toggleFilter("all")}
          >
            All
          </button>
          {TECH_CHIPS.map((tech) => {
            const value = tech.toLowerCase();
            const active = selectedTechs.includes(value);
            return (
              <button
                key={value}
                type="button"
                className={"filter-chip" + (active ? " active" : "")}
                data-tech={value}
                onClick={() => toggleFilter(value)}
              >
                {tech}
              </button>
            );
          })}
        </div>

        <div className="sort-buttons">
          <span className="sort-label">Sort:</span>
          {(
            [
              ["date", "Latest"],
              ["stars", "Stars"],
              ["commits", "Commits"],
              ["alpha", "A-Z"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={"sort-btn" + (sortBy === value ? " active" : "")}
              data-sort={value}
              onClick={() => setSort(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid — only the filtered+sorted `visible` cards are rendered (filtered-out
          works are omitted from the DOM entirely, not class-hidden); among those,
          cards past LIMIT carry `show-more-hidden` until expanded. Behaviorally
          identical to the Rails filter-hidden/show-more-hidden DOM model. */}
      <div className="work-grid">
        {visible.map((work, index) => {
          // Among the visible (filtered + sorted) cards, the first LIMIT show;
          // the rest are hidden unless expanded (show_more updateVisibility).
          const hidden = index >= LIMIT && !expanded;
          return (
            <Link
              key={work.slug}
              href={`/work/${work.slug}`}
              className={"work-card work-card-active" + (hidden ? " show-more-hidden" : "")}
            >
              <div className="work-card-header">
                {work.status === "Live" ? (
                  <div className="work-card-badge badge-live">
                    <span className="live-pulse"></span> Live
                  </div>
                ) : work.status ? (
                  <div className="work-card-badge badge-status">{work.status}</div>
                ) : null}
              </div>

              <h3 className="work-card-title">{work.title}</h3>
              <p className="work-card-summary">{work.summary}</p>

              <div className="work-card-meta">
                {work.technologies.length > 0 && (
                  <span className="work-card-tech">
                    {work.technologies.slice(0, 3).join(" • ")}
                  </span>
                )}
                {/* Bare number — the .work-card-stars::before CSS supplies the ⭐. */}
                {work.stars > 0 && (
                  <span className="work-card-stars">{work.stars}</span>
                )}
                {work.commits > 0 && (
                  <span className="work-card-commits">{work.commits}</span>
                )}
                {work.sha && (
                  <span className="work-card-sha font-mono text-[10px] text-brown/40">
                    {work.sha}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Show More — rendered only when the visible set exceeds the limit
          (Rails shows it server-side only when active.count > 12, then JS hides
          it once hiddenCount <= 0; deriving from hiddenCount unifies both). */}
      {hiddenCount > 0 && (
        <div className="work-show-more">
          <button type="button" className="show-more-btn" onClick={toggleShowMore}>
            {expanded ? "Show less" : `Show ${hiddenCount} more`}
          </button>
        </div>
      )}

      {/* No Results — `hidden` toggles exactly like the Rails noResults target. */}
      <div className={"no-results" + (visible.length > 0 ? " hidden" : "")}>
        <p>No projects match your filters. Try adjusting your selection.</p>
      </div>
    </section>
  );
}
