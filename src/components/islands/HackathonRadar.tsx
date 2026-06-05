"use client";

import { Fragment, useMemo, useState } from "react";

export interface Hackathon {
  name: string;
  prize: string;
  prizeValue: number;
  deadlineLabel: string;
  deadlineWIB: string;
  deadlineSort: string | null;
  fit: number;
  location: "Remote" | "Hybrid" | "On-site";
  theme: string;
  status: string;
  link: string | null;
  platform: string;
  eligibility: string;
  about: string;
  correction: string | null;
}

interface HackathonRadarProps {
  hackathons: Hackathon[];
  asOf: string;
  source: { label: string; url: string };
}

type SortKey = "deadline" | "prize" | "fit" | "name";
const ENTERABLE = new Set(["open", "upcoming"]);
const FIT_LABEL = ["➖", "🎯", "🎯🎯", "🎯🎯🎯"];
const LOC: Record<Hackathon["location"], { icon: string; cls: string }> = {
  Remote: { icon: "🌍", cls: "loc-remote" },
  Hybrid: { icon: "🌗", cls: "loc-hybrid" },
  "On-site": { icon: "📍", cls: "loc-onsite" },
};

function sortVal(hk: Hackathon, key: SortKey): number | string {
  switch (key) {
    case "prize":
      return hk.prizeValue;
    case "fit":
      return hk.fit;
    case "name":
      return hk.name.toLowerCase();
    case "deadline":
    default:
      return hk.deadlineSort ? Date.parse(hk.deadlineSort) : Number.POSITIVE_INFINITY;
  }
}

export function HackathonRadar({ hackathons, asOf, source }: HackathonRadarProps) {
  const [search, setSearch] = useState("");
  const [fit, setFit] = useState("");
  const [location, setLocation] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [open, setOpen] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = hackathons.filter((hk) => {
      if (!showAll && !ENTERABLE.has(hk.status)) return false;
      if (fit !== "" && String(hk.fit) !== fit) return false;
      if (location !== "" && hk.location !== location) return false;
      if (q) {
        const hay = `${hk.name} ${hk.theme} ${hk.about} ${hk.prize} ${hk.platform} ${hk.status}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out.sort((a, b) => {
      const x = sortVal(a, sortKey);
      const y = sortVal(b, sortKey);
      if (typeof x === "number" && typeof y === "number") return (x - y) * sortDir;
      return String(x).localeCompare(String(y)) * sortDir;
    });
    return out;
  }, [hackathons, search, fit, location, showAll, sortKey, sortDir]);

  const corrections = useMemo(() => hackathons.filter((hk) => hk.correction), [hackathons]);
  const totalPrize = visible.reduce((s, hk) => s + hk.prizeValue, 0);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (-d) as 1 | -1);
    else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  return (
    <section className="radar">
      <div className="radar-stats">
        <div className="radar-stat"><b>{visible.length}</b><span>shown</span></div>
        <div className="radar-stat"><b>${Math.round(totalPrize / 1000).toLocaleString()}K</b><span>prize pool</span></div>
        <div className="radar-stat"><b>{corrections.length}</b><span>corrections</span></div>
      </div>

      <div className="radar-controls">
        <input
          className="radar-search"
          type="text"
          placeholder="Search name, theme, about…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search hackathons"
        />
        <select value={fit} onChange={(e) => setFit(e.target.value)} aria-label="Filter by fit">
          <option value="">All fit</option>
          <option value="3">🎯🎯🎯 Bullseye</option>
          <option value="2">🎯🎯 Strong</option>
          <option value="1">🎯 Viable</option>
          <option value="0">➖ Off-profile</option>
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Filter by location">
          <option value="">All locations</option>
          <option value="Remote">🌍 Remote</option>
          <option value="Hybrid">🌗 Hybrid</option>
          <option value="On-site">📍 On-site</option>
        </select>
        <label className="radar-checkbox">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Show closed/dead
        </label>
      </div>

      <table className="radar-table">
        <thead>
          <tr>
            <th><button type="button" onClick={() => toggleSort("name")}>Hackathon</button></th>
            <th><button type="button" onClick={() => toggleSort("fit")}>Fit</button></th>
            <th><button type="button" onClick={() => toggleSort("prize")}>Prize</button></th>
            <th><button type="button" onClick={() => toggleSort("deadline")}>Deadline (WIB)</button></th>
            <th>Location</th>
            <th>Theme</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((hk) => {
            const isOpen = open === hk.name;
            const dimmed = !ENTERABLE.has(hk.status);
            const loc = LOC[hk.location];
            return (
              <Fragment key={hk.name}>
                <tr className={"radar-row" + (dimmed ? " dimmed" : "")}>
                  <td className="radar-name">
                    <button
                      type="button"
                      className="radar-toggle"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : hk.name)}
                    >
                      <span className="radar-arrow">{isOpen ? "▼" : "▶"}</span> {hk.name}
                    </button>
                    {hk.link && (
                      <a
                        className="radar-ext"
                        href={hk.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${hk.name} site`}
                      >
                        ↗
                      </a>
                    )}
                  </td>
                  <td><span className={"radar-fit fit-" + hk.fit}>{FIT_LABEL[hk.fit]}</span></td>
                  <td className="radar-prize">{hk.prize}</td>
                  <td>{hk.deadlineWIB}</td>
                  <td><span className={"radar-loc " + loc.cls}>{loc.icon} {hk.location}</span></td>
                  <td className="radar-theme">{hk.theme}</td>
                </tr>
                {isOpen && (
                  <tr className="radar-detail">
                    <td colSpan={6}>
                      <p>{hk.about}</p>
                      {hk.correction && (
                        <p className="radar-corr"><b>Correction:</b> {hk.correction}</p>
                      )}
                      <div className="radar-meta">
                        <span><b>Deadline:</b> {hk.deadlineLabel} · {hk.deadlineWIB} WIB</span>
                        <span><b>Status:</b> {hk.status}</span>
                        <span><b>Platform:</b> {hk.platform}</span>
                        <span><b>Eligibility:</b> {hk.eligibility}</span>
                      </div>
                      {hk.link && (
                        <a className="radar-openbtn" href={hk.link} target="_blank" rel="noopener noreferrer">
                          Open site ↗
                        </a>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {visible.length === 0 && <p className="radar-empty">No hackathons match your filters.</p>}

      {corrections.length > 0 && (
        <details className="radar-corrections">
          <summary>What the viral list got wrong ({corrections.length})</summary>
          <ul>
            {corrections.map((hk) => (
              <li key={hk.name}><b>{hk.name}:</b> {hk.correction}</li>
            ))}
          </ul>
        </details>
      )}

      <p className="radar-source">
        Verified as of {asOf}. Source:{" "}
        <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>.
      </p>
    </section>
  );
}
