import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";

import { arbitalData } from "@/lib/content/arbital";
import { techBars } from "./arbital-helpers";
import { ModernArbital } from "./ModernArbital";
import { RetroArbital } from "./RetroArbital";

// ---------------------------------------------------------------------------
// Children-mode ProgressBar ARIA — the PRODUCTION path.
//
// Both live arbital routes (the switcher container + the standalone
// /apply/arbital/{modern,retro} pages) render their tech bars through the
// ProgressBar island in CHILDREN mode: the component itself authors the
// `.tech-bar` <div> with role="progressbar" + aria-value{min,max,now} + an
// aria-label. ProgressBar.test only covers the UNUSED `bars` prop mode, so
// these assert the attrs on the real rendered DOM of each component, driven by
// the real `techBars(arbitalData.techStack)` (NOT invented fixtures).
//
// The components mount the ProgressBar island (IntersectionObserver +
// setTimeout). We stub both so the effect can run without a DOM environment
// surprise; the ARIA attributes are authored at render time and are unaffected
// by whether the animation ever fires.
// ---------------------------------------------------------------------------

beforeEach(() => {
  class NoopIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", NoopIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// The expected (name, level) pairs every component must render, in order.
const expectedBars = techBars(arbitalData.techStack);

/** Asserts the children-mode progressbar ARIA on every rendered `.tech-bar`. */
function assertTechBarAria(container: HTMLElement) {
  const bars = Array.from(container.querySelectorAll<HTMLElement>(".tech-bar"));

  // Sanity: one bar per primary+secondary tech entry, none missing.
  expect(bars).toHaveLength(expectedBars.length);
  expect(bars.length).toBeGreaterThan(0);

  bars.forEach((bar, i) => {
    const tech = expectedBars[i];
    expect(bar.getAttribute("role")).toBe("progressbar");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuenow")).toBe(String(tech.level));
    expect(bar.getAttribute("aria-label")).toBe(tech.name);
  });
}

describe("ModernArbital — children-mode progressbar ARIA", () => {
  it("gives every .tech-bar role=progressbar + valuemin/max + valuenow=level + label=name", () => {
    const { container } = render(
      <ModernArbital
        sixthStatValue="6"
        sixthStatLabel="Trading Projects"
        footerPath="rectorspace.com/apply/arbital/modern"
        lastUpdated="2026-06-01"
      />,
    );
    assertTechBarAria(container);
  });
});

describe("RetroArbital — children-mode progressbar ARIA", () => {
  it("gives every .tech-bar role=progressbar + valuemin/max + valuenow=level + label=name", () => {
    const { container } = render(
      <RetroArbital
        sixthStatValue="6"
        sixthStatLabel="Trading Projects"
        footerPath="rectorspace.com/apply/arbital/retro"
        generatedAt="2026-06-01 00:00 UTC"
      />,
    );
    assertTechBarAria(container);
  });
});
