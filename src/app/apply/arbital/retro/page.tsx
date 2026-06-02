import type { Metadata } from "next";

import { RetroArbital } from "@/components/apply/RetroArbital";
import { arbitalGeneratedAt } from "../footer-date";

// ---------------------------------------------------------------------------
// /apply/arbital/retro — the standalone RETRO arbital CV (no theme switcher).
//
// Static SSG RSC: all data is the hardcoded `arbitalData` module — no live data,
// so there is NO `revalidate`. The footer timestamp is fixed at build time
// (matching the "deploy = publish" model used across the file-based sections).
//
// PARITY QUIRK (reproduced, NOT fixed): arbital_retro.html.erb renders the 6th
// stat from `@stats[:solana_projects]`, a key the controller never sets → nil →
// prod renders an EMPTY stat value under the "Solana Projects" label. We pass
// `sixthStatValue=""` to reproduce that blank exactly. See the report.
// ---------------------------------------------------------------------------

// Title only. `robots: noindex,nofollow` is inherited from the /apply layout
// (Next merges metadata layout→page; this page sets no robots, so it survives).
export const metadata: Metadata = {
  title: "RECTOR × Arbital | Application",
};

export default function ArbitalRetroPage() {
  return (
    <div className="retro-terminal">
      <RetroArbital
        sixthStatValue=""
        sixthStatLabel="Solana Projects"
        footerPath="rectorspace.com/apply/arbital/retro"
        generatedAt={arbitalGeneratedAt()}
      />
    </div>
  );
}
