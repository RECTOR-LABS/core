// ---------------------------------------------------------------------------
// arbital-helpers.ts — pure transforms shared by RetroArbital / ModernArbital.
//
// These extract the non-trivial bits of logic the .erb templates performed
// inline so they can be unit-tested in isolation (the JSX itself is plain
// presentational markup and is not unit-tested, matching the superteam route).
//
// Sources:
//   app/views/apply/arbital_retro.html.erb
//   app/views/apply/arbital_modern.html.erb
//   app/views/apply/arbital.html.erb
// ---------------------------------------------------------------------------

import type { ArbitalTechStack } from "@/lib/content/arbital";

// ---------------------------------------------------------------------------
// bootLines — the four BIOS boot-header lines.
//
// Three are static; the third interpolates the repository count, exactly like:
//   Loading <%= @stats[:total_repos] %> repositories... OK
// The retro boot header is identical in the standalone retro page and in the
// switcher's retro container, so this is the single source for both.
// ---------------------------------------------------------------------------

export function bootLines(totalRepos: number): string[] {
  return [
    "RECTOR SYSTEMS BIOS v2.0",
    "Initializing candidate profile...",
    `Loading ${totalRepos} repositories... OK`,
    "MEV subsystem... READY",
  ];
}

// ---------------------------------------------------------------------------
// langModifier — the per-language CSS modifier class.
//
// Ports the Rails expression used on every project-lang span:
//   project[:language].downcase.split('/').first
// e.g. "Rust" -> "rust", "WebSocket/REST" -> "websocket".
// `.split('/').first` can never be undefined for a non-empty string in Ruby;
// in JS `String.prototype.split` always returns at least one element, so the
// `[0]` access is total. We guard the empty-string case to "" to stay faithful
// (Ruby's "".split('/').first is nil, rendered as ""; JS "".split('/')[0] is "").
// ---------------------------------------------------------------------------

export function langModifier(language: string): string {
  return language.toLowerCase().split("/")[0] ?? "";
}

// ---------------------------------------------------------------------------
// TechBar — one animated progress bar's derived config.
//   width    — CSS width string, e.g. "85%" (from the numeric `level`)
//   level    — the original numeric level (for the "NN%" readout text)
//   name     — tech name (for the label column)
//   highlight— whether the highlight modifier class applies (primary only)
// ---------------------------------------------------------------------------

export interface TechBar {
  name: string;
  level: number;
  width: string;
  highlight: boolean;
}

// ---------------------------------------------------------------------------
// techBars — flattens primary + secondary tech into ordered bar configs.
//
// Mirrors the two consecutive `.each` loops in the .erb (primary first, then
// secondary). `width` is formatted as "<level>%" to feed the ProgressBar island
// (which animates from 0% to the target width). Secondary entries never carry a
// highlight flag, so `highlight` is always false for them.
// ---------------------------------------------------------------------------

export function techBars(techStack: ArbitalTechStack): TechBar[] {
  const primary = techStack.primary.map((t) => ({
    name: t.name,
    level: t.level,
    width: `${t.level}%`,
    highlight: t.highlight === true,
  }));
  const secondary = techStack.secondary.map((t) => ({
    name: t.name,
    level: t.level,
    width: `${t.level}%`,
    highlight: false,
  }));
  return [...primary, ...secondary];
}
