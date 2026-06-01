"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Theme = "retro" | "modern";

const STORAGE_KEY = "arbital-cv-theme";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ThemeSwitcherProps {
  /** Initial theme before localStorage is read. Default: "retro" (matches Stimulus). */
  initialTheme?: Theme;
  /** Optional className forwarded to the wrapper div. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Pure helper — applies theme to document.body and [data-theme] containers.
// Mirrors Stimulus's applyTheme() exactly.
// ---------------------------------------------------------------------------

function applyTheme(theme: Theme) {
  const body = document.body;
  const isRetro = theme === "retro";

  // Update body classes — remove both, add the active one
  body.classList.remove("retro-terminal", "modern-dark");
  body.classList.add(isRetro ? "retro-terminal" : "modern-dark");

  // Toggle container visibility with smooth transition
  document.querySelectorAll<HTMLElement>("[data-theme]").forEach((el) => {
    if (el.dataset.theme === theme) {
      el.style.display = "block";
      el.style.opacity = "0";
      requestAnimationFrame(() => {
        el.style.transition = "opacity 0.3s ease";
        el.style.opacity = "1";
      });
    } else {
      el.style.display = "none";
    }
  });
}

// ---------------------------------------------------------------------------
// ThemeSwitcher island
//
// Port of app/javascript/controllers/theme_switcher_controller.js.
//
// On mount: loads saved theme from localStorage (key "arbital-cv-theme");
// falls back to `initialTheme` (default "retro").  Applies the theme to
// document.body (classes) and [data-theme] containers.  The toggle button
// switches and persists the theme.  Label text mirrors the Stimulus source
// ("SWITCH TO MODERN" when retro is active, "SWITCH TO RETRO" when modern).
// ---------------------------------------------------------------------------

export function ThemeSwitcher({ initialTheme = "retro", className }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // On mount: load saved preference, exactly like Stimulus connect().
  // One-shot external-system read (localStorage → React state); ref-guarded to
  // prevent double-run in Strict Mode.  Same pattern as FilterSort's URL sync.
  const didLoadPref = useRef(false);
  useEffect(() => {
    if (didLoadPref.current) return;
    didLoadPref.current = true;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "retro" || saved === "modern") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot localStorage sync on mount (external-system read); ref-guarded; faithful to Stimulus connect()
      setTheme(saved);
    }
  }, []);

  // Whenever theme changes: apply to document
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "retro" ? "modern" : "retro";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const labelText = theme === "retro" ? "SWITCH TO MODERN" : "SWITCH TO RETRO";

  return (
    <div className={className}>
      <button type="button" data-toggle onClick={toggle}>
        <span data-label>{labelText}</span>
      </button>
    </div>
  );
}
