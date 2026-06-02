import type { Metadata } from "next";

import { arbitalData } from "@/lib/content/arbital";
import { RetroArbital } from "@/components/apply/RetroArbital";
import { ModernArbital } from "@/components/apply/ModernArbital";
import { ArbitalSwitcher } from "@/components/apply/ArbitalSwitcher";
import { arbitalGeneratedAt, arbitalLastUpdated } from "./footer-date";

// ---------------------------------------------------------------------------
// /apply/arbital — the dual-theme switcher CV.
//
// A page-local wrapper (ArbitalSwitcher) starts in the retro theme and toggles
// between the two server-rendered <RetroArbital>/<ModernArbital> halves via the
// ThemeSwitcher island. Both halves carry the switcher chrome (below the profile)
// and the "Requirements → Experience" section, and use the CORRECT 6th stat
// (`tradingProjects` = 6 / "Trading Projects") — unlike the standalone /retro
// and /modern routes, which faithfully reproduce the Rails `solana_projects`
// nil-typo as a blank stat. (See the standalone pages / report.)
//
// Static SSG RSC: data is the hardcoded `arbitalData`; footer stamps are fixed
// at build time. `robots: noindex,nofollow` is inherited from the /apply layout.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "RECTOR × Arbital | Application",
};

// Theme-switcher chrome blocks. These are static markup; the ThemeSwitcher
// island wires the `[data-toggle]` button (click delegation) and rewrites every
// `[data-label]` on toggle. Initial label text matches prod's SSR DOM (retro →
// "SWITCH TO MODERN", modern → "SWITCH TO RETRO").
function RetroSwitcherChrome() {
  return (
    <div className="theme-switcher-wrapper">
      <div className="theme-cta">▼ Bored of this view? Switch it up! ▼</div>
      <button type="button" className="theme-switch-btn" data-toggle>
        <span className="switch-icon">◐</span>
        <span className="switch-label" data-label>
          SWITCH TO MODERN
        </span>
      </button>
      {/* Braces force a string expression: the leading "//" is content, not a JS comment. */}
      <div className="theme-hint">{"// senior devs appreciate options"}</div>
    </div>
  );
}

function ModernSwitcherChrome() {
  return (
    <div className="theme-switcher-wrapper">
      <div className="theme-cta">▼ Bored of this view? Switch it up! ▼</div>
      <button type="button" className="theme-switch-btn" data-toggle>
        <span className="switch-icon">◑</span>
        <span className="switch-label" data-label>
          SWITCH TO RETRO
        </span>
      </button>
      <div className="theme-hint">senior devs appreciate options</div>
    </div>
  );
}

export default function ArbitalPage() {
  const generatedAt = arbitalGeneratedAt();
  const lastUpdated = arbitalLastUpdated();
  // Switcher uses the CORRECT key the controller actually sets (trading_projects).
  const tradingProjects = String(arbitalData.stats.tradingProjects);

  return (
    <ArbitalSwitcher
      retro={
        <RetroArbital
          sixthStatValue={tradingProjects}
          sixthStatLabel="Trading Projects"
          footerPath="rectorspace.com/apply/arbital"
          generatedAt={generatedAt}
          showRequirements
          switcher={<RetroSwitcherChrome />}
        />
      }
      modern={
        <ModernArbital
          sixthStatValue={tradingProjects}
          sixthStatLabel="Trading Projects"
          footerPath="rectorspace.com/apply/arbital"
          lastUpdated={lastUpdated}
          showRequirements
          switcher={<ModernSwitcherChrome />}
        />
      }
    />
  );
}
