"use client";

import { useRef, type ReactNode } from "react";

import { ThemeSwitcher } from "@/components/islands/ThemeSwitcher";

// ---------------------------------------------------------------------------
// ArbitalSwitcher — the client wrapper for the /apply/arbital switcher page.
//
// Owns the themed *wrapper* ref and hands it to <ThemeSwitcher>, which toggles
// the wrapper's class (.retro-terminal <-> .modern-dark) and shows/hides the two
// [data-theme] containers. The retro/modern markup is server-rendered and passed
// in as props, so only this thin shell ships the ref + client island.
//
// The wrapper class STARTS at "modern-dark" and the RETRO container starts hidden
// (inline display:none). Prod sets data-theme-switcher-theme-value="modern", so a
// first-time visitor with no saved pref ends up on MODERN after the Stimulus
// controller runs (prod SSR-renders retro, then flips → a flash). We server-render
// modern directly: same default end-state as prod, without the flash. A returning
// visitor whose saved pref is "retro" gets flipped to retro on mount (matching prod).
//
// Why a wrapper div (not document.body): see the ThemeSwitcher `targetRef`
// docblock — Next shares one <body> across routes and never resets it on client
// navigation, so toggling body would flash on SSR and leak the dark theme onto
// /, /work, /journal. A page-local wrapper unmounts cleanly on navigation.
// ---------------------------------------------------------------------------

interface ArbitalSwitcherProps {
  /** Server-rendered RetroArbital (with switcher chrome + requirements). */
  retro: ReactNode;
  /** Server-rendered ModernArbital (with switcher chrome + requirements). */
  modern: ReactNode;
}

export function ArbitalSwitcher({ retro, modern }: ArbitalSwitcherProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapperRef} className="modern-dark">
      <ThemeSwitcher targetRef={wrapperRef} initialTheme="modern" />

      <div data-theme="retro" style={{ display: "none" }}>
        {retro}
      </div>
      <div data-theme="modern">{modern}</div>
    </div>
  );
}
