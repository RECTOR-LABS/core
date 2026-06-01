import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { ThemeSwitcher } from "./ThemeSwitcher";

// ---------------------------------------------------------------------------
// Setup — clean localStorage + body classes between tests.
// The Stimulus controller touches document.body.classList and localStorage,
// which persist between tests in jsdom.
// ---------------------------------------------------------------------------

/** rAF callbacks queued during the test. */
let rafCallbacks: Array<(t: number) => void> = [];
/** Ids cancelled via cancelAnimationFrame. */
const cancelledRafIds: Set<number> = new Set();

beforeEach(() => {
  localStorage.clear();
  document.body.className = "";

  rafCallbacks = [];
  cancelledRafIds.clear();

  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb as (t: number) => void);
      return rafCallbacks.length; // 1-based id
    }),
  );

  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id: number) => {
      cancelledRafIds.add(id);
      const idx = id - 1;
      if (idx >= 0 && idx < rafCallbacks.length) {
        rafCallbacks.splice(idx, 1);
      }
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  document.body.className = "";
});

/** Flush all queued rAF callbacks with the given timestamp. */
function flushRaf(t = 0) {
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  for (const cb of cbs) cb(t);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderThemeSwitcher(initialTheme?: "retro" | "modern") {
  return render(<ThemeSwitcher initialTheme={initialTheme} />);
}

function getToggleButton(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>("[data-toggle]")!;
}

function getLabelEl(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>("[data-label]");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ThemeSwitcher island", () => {
  describe("initial state — default theme retro", () => {
    it("adds retro-terminal class to body on mount (default theme)", () => {
      renderThemeSwitcher();
      expect(document.body.classList.contains("retro-terminal")).toBe(true);
      expect(document.body.classList.contains("modern-dark")).toBe(false);
    });

    it("shows label for switching to modern (current = retro)", () => {
      const { container } = renderThemeSwitcher();
      const label = getLabelEl(container);
      // When retro is active, label shows "SWITCH TO MODERN"
      expect(label?.textContent).toBe("SWITCH TO MODERN");
    });

    it("loads saved preference from localStorage (modern)", () => {
      localStorage.setItem("arbital-cv-theme", "modern");
      renderThemeSwitcher();
      expect(document.body.classList.contains("modern-dark")).toBe(true);
      expect(document.body.classList.contains("retro-terminal")).toBe(false);
    });

    it("loads saved preference from localStorage (retro)", () => {
      localStorage.setItem("arbital-cv-theme", "retro");
      renderThemeSwitcher();
      expect(document.body.classList.contains("retro-terminal")).toBe(true);
    });

    it("defaults to retro if no localStorage value", () => {
      renderThemeSwitcher();
      expect(document.body.classList.contains("retro-terminal")).toBe(true);
    });
  });

  describe("initialTheme prop override", () => {
    it("starts in modern when initialTheme=modern passed", () => {
      renderThemeSwitcher("modern");
      expect(document.body.classList.contains("modern-dark")).toBe(true);
    });

    it("localStorage overrides initialTheme prop (saved wins)", () => {
      localStorage.setItem("arbital-cv-theme", "modern");
      renderThemeSwitcher("retro");
      // localStorage takes precedence, matching Stimulus's connect() logic
      expect(document.body.classList.contains("modern-dark")).toBe(true);
    });
  });

  describe("toggle behavior", () => {
    it("switches from retro to modern on toggle click", () => {
      const { container } = renderThemeSwitcher();

      // Start: retro-terminal
      expect(document.body.classList.contains("retro-terminal")).toBe(true);

      fireEvent.click(getToggleButton(container));

      // After toggle: modern-dark
      expect(document.body.classList.contains("modern-dark")).toBe(true);
      expect(document.body.classList.contains("retro-terminal")).toBe(false);
    });

    it("switches from modern to retro on second toggle click", () => {
      const { container } = renderThemeSwitcher();

      fireEvent.click(getToggleButton(container)); // retro → modern
      fireEvent.click(getToggleButton(container)); // modern → retro

      expect(document.body.classList.contains("retro-terminal")).toBe(true);
      expect(document.body.classList.contains("modern-dark")).toBe(false);
    });

    it("updates label to SWITCH TO RETRO when switching to modern", () => {
      const { container } = renderThemeSwitcher();
      const label = getLabelEl(container);

      fireEvent.click(getToggleButton(container));

      expect(label?.textContent).toBe("SWITCH TO RETRO");
    });

    it("updates label back to SWITCH TO MODERN when switching back to retro", () => {
      const { container } = renderThemeSwitcher();
      const label = getLabelEl(container);

      fireEvent.click(getToggleButton(container)); // → modern
      fireEvent.click(getToggleButton(container)); // → retro

      expect(label?.textContent).toBe("SWITCH TO MODERN");
    });

    it("persists theme to localStorage on toggle", () => {
      const { container } = renderThemeSwitcher();

      fireEvent.click(getToggleButton(container));

      expect(localStorage.getItem("arbital-cv-theme")).toBe("modern");
    });

    it("persists retro back to localStorage on second toggle", () => {
      const { container } = renderThemeSwitcher();

      fireEvent.click(getToggleButton(container)); // retro → modern
      fireEvent.click(getToggleButton(container)); // modern → retro

      expect(localStorage.getItem("arbital-cv-theme")).toBe("retro");
    });
  });

  describe("data-theme container visibility", () => {
    it("shows retro container and hides modern container on retro theme", () => {
      // Render with a retro and a modern container in the DOM
      document.body.innerHTML = `
        <div data-theme="retro" id="retro-section">Retro</div>
        <div data-theme="modern" id="modern-section">Modern</div>
      `;
      renderThemeSwitcher(); // default: retro

      const retroEl = document.getElementById("retro-section") as HTMLElement;
      const modernEl = document.getElementById("modern-section") as HTMLElement;

      // Retro visible, modern hidden
      expect(retroEl.style.display).toBe("block");
      expect(modernEl.style.display).toBe("none");
    });

    it("shows modern container and hides retro container on modern theme", () => {
      document.body.innerHTML = `
        <div data-theme="retro" id="retro-section">Retro</div>
        <div data-theme="modern" id="modern-section">Modern</div>
      `;
      const { container } = renderThemeSwitcher();
      document.body.appendChild(container);

      fireEvent.click(getToggleButton(container));

      const retroEl = document.getElementById("retro-section") as HTMLElement;
      const modernEl = document.getElementById("modern-section") as HTMLElement;

      expect(modernEl.style.display).toBe("block");
      expect(retroEl.style.display).toBe("none");
    });
  });

  describe("localStorage key", () => {
    it("uses the exact key 'arbital-cv-theme'", () => {
      const { container } = renderThemeSwitcher();
      fireEvent.click(getToggleButton(container));
      expect(localStorage.getItem("arbital-cv-theme")).not.toBeNull();
    });
  });

  describe("cleanup — rAF cancellation", () => {
    it("cancels the pending rAF when unmounted before the frame fires", () => {
      const { unmount } = renderThemeSwitcher();
      // applyTheme queues a rAF for setting opacity; unmount before it fires
      expect(rafCallbacks.length).toBeGreaterThan(0);
      unmount();
      // Cleanup must have cancelled the in-flight rAF
      expect(cancelledRafIds.size).toBeGreaterThan(0);
    });

    it("still applies opacity=1 on the next frame when NOT unmounted", () => {
      document.body.innerHTML = `<div data-theme="retro" id="ts-test"></div>`;
      renderThemeSwitcher("retro");
      const el = document.getElementById("ts-test") as HTMLElement;
      // Opacity starts at 0 (set synchronously by applyTheme)
      expect(el.style.opacity).toBe("0");
      // Flush the queued rAF → opacity should become "1"
      act(() => flushRaf());
      expect(el.style.opacity).toBe("1");
    });

    it("cancels previous rAF when theme changes rapidly (no orphaned frame)", () => {
      document.body.innerHTML = `
        <div data-theme="retro" id="r"></div>
        <div data-theme="modern" id="m"></div>
      `;
      const { container } = renderThemeSwitcher("retro");

      // First applyTheme (on mount) queued a rAF
      const idsAfterMount = rafCallbacks.length;
      expect(idsAfterMount).toBeGreaterThan(0);

      // Toggle rapidly — old rAF should be cancelled before new one fires
      act(() => fireEvent.click(getToggleButton(container)));
      // At least one rAF must have been cancelled by the effect cleanup
      expect(cancelledRafIds.size).toBeGreaterThan(0);
    });
  });
});
