import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ThemeSwitcher } from "./ThemeSwitcher";

// ---------------------------------------------------------------------------
// Setup — clean localStorage + body classes between tests.
// The Stimulus controller touches document.body.classList and localStorage,
// which persist between tests in jsdom.
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
  document.body.className = "";
});

afterEach(() => {
  localStorage.clear();
  document.body.className = "";
});

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
});
