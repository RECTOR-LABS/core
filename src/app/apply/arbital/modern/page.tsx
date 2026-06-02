import type { Metadata } from "next";

import { ModernArbital } from "@/components/apply/ModernArbital";
import { arbitalLastUpdated } from "../footer-date";

// ---------------------------------------------------------------------------
// /apply/arbital/modern — the standalone MODERN arbital CV (no theme switcher).
//
// Static SSG RSC: all data is the hardcoded `arbitalData` module — no live data,
// so there is NO `revalidate`. The footer date is fixed at build time.
//
// PARITY QUIRK (reproduced, NOT fixed): arbital_modern.html.erb renders the 6th
// stat from `@stats[:solana_projects]` (nil → empty stat value under the
// "Solana Projects" label). We pass `sixthStatValue=""` to reproduce the blank.
// ---------------------------------------------------------------------------

// Title only; `robots: noindex,nofollow` inherited from the /apply layout.
export const metadata: Metadata = {
  title: "RECTOR × Arbital | Application",
};

export default function ArbitalModernPage() {
  return (
    <div className="modern-dark">
      <ModernArbital
        sixthStatValue=""
        sixthStatLabel="Solana Projects"
        footerPath="rectorspace.com/apply/arbital/modern"
        lastUpdated={arbitalLastUpdated()}
      />
    </div>
  );
}
