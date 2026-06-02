"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Theme = "retro" | "modern";

const STORAGE_KEY = "arbital-cv-theme";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ThemeSwitcherProps {
  /**
   * Ref to the themed *wrapper* element (the page-local `<div className="retro-terminal">`).
   * The switcher toggles THIS element's class — NOT `document.body`.
   *
   * WHY (Next architecture, vs the 1:1 Stimulus port which toggled <body>):
   *   The root layout owns a single shared `<body>` (warm cream) that Next does
   *   NOT reset on client-side navigation. Toggling the theme class on <body>
   *   would (a) flash on SSR and (b) leak the dark `.modern-dark` / terminal
   *   `.retro-terminal` styles onto `/`, `/work`, `/journal` after the user
   *   navigates away from /apply/arbital. Targeting a page-local wrapper that
   *   unmounts cleanly on navigation avoids both. apply.css is already scoped to
   *   `.retro-terminal` / `.modern-dark`, so a wrapper class is sufficient.
   *
   * The toggle BUTTON(s) and label(s) live in the page markup (RetroArbital /
   * ModernArbital) — faithful to the Stimulus source, where the controller had
   * no button and wired `[data-action]` buttons + `[data-target=label]` spans in
   * the .erb. This island is the controller; it locates `[data-toggle]` buttons
   * and `[data-label]` spans inside the wrapper via delegation.
   */
  targetRef: RefObject<HTMLElement | null>;
  /** Initial theme before localStorage is read. Default: "retro" (matches Stimulus default). */
  initialTheme?: Theme;
}

// ---------------------------------------------------------------------------
// applyTheme — applies a theme to the wrapper element + its descendants.
// Mirrors Stimulus applyTheme(), but scoped to `wrapper` instead of <body>.
//
// Returns the rAF handle for the opacity transition so callers can cancel it on
// cleanup (prevents opacity mutations on detached nodes after unmount).
// ---------------------------------------------------------------------------

function applyTheme(wrapper: HTMLElement, theme: Theme): number {
  const isRetro = theme === "retro";

  // Toggle the wrapper's theme class — remove both, add the active one.
  wrapper.classList.remove("retro-terminal", "modern-dark");
  wrapper.classList.add(isRetro ? "retro-terminal" : "modern-dark");

  // Update every label inside the wrapper — shows which theme to switch TO.
  wrapper.querySelectorAll<HTMLElement>("[data-label]").forEach((label) => {
    label.textContent = isRetro ? "SWITCH TO MODERN" : "SWITCH TO RETRO";
  });

  let rafId = 0;

  // Toggle the [data-theme] containers' visibility with a fade — scoped to the
  // wrapper so it cannot touch [data-theme] nodes on other routes.
  wrapper.querySelectorAll<HTMLElement>("[data-theme]").forEach((el) => {
    if (el.dataset.theme === theme) {
      el.style.display = "block";
      el.style.opacity = "0";
      rafId = requestAnimationFrame(() => {
        el.style.transition = "opacity 0.3s ease";
        el.style.opacity = "1";
      });
    } else {
      el.style.display = "none";
    }
  });

  return rafId;
}

// ---------------------------------------------------------------------------
// ThemeSwitcher island (controller-only)
//
// Port of app/javascript/controllers/theme_switcher_controller.js, adapted for
// the Next App Router (see `targetRef` docblock for the body→wrapper rationale).
//
// On mount: loads the saved theme from localStorage (key "arbital-cv-theme"),
// falling back to `initialTheme` (default "retro"); applies it to the wrapper.
// A delegated click handler on the wrapper toggles + persists the theme whenever
// any `[data-toggle]` button inside it is clicked. Label text mirrors Stimulus
// ("SWITCH TO MODERN" when retro is active, "SWITCH TO RETRO" when modern).
//
// Renders nothing of its own — the visible chrome is in the page markup.
// ---------------------------------------------------------------------------

export function ThemeSwitcher({ targetRef, initialTheme = "retro" }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // On mount: load saved preference, exactly like Stimulus connect().
  // One-shot external-system read (localStorage → React state); ref-guarded to
  // prevent a double-run under Strict Mode. Same pattern as FilterSort's URL sync.
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

  // Whenever theme changes: apply to the wrapper, capturing the rAF handle so we
  // can cancel it on cleanup (prevents opacity mutation on detached nodes).
  useEffect(() => {
    const wrapper = targetRef.current;
    if (!wrapper) return;
    const rafId = applyTheme(wrapper, theme);
    return () => {
      // rafId is 0 when no [data-theme] container matched (nothing scheduled).
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [theme, targetRef]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "retro" ? "modern" : "retro";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  // Delegated click handling: any `[data-toggle]` inside the wrapper toggles the
  // theme. Faithful to the Stimulus `data-action="click->theme-switcher#toggle"`
  // wiring, and supports the two buttons (one per [data-theme] container) sharing
  // a single controller — exactly as in arbital.html.erb.
  useEffect(() => {
    const wrapper = targetRef.current;
    if (!wrapper) return;
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-toggle]")) {
        toggle();
      }
    }
    wrapper.addEventListener("click", onClick);
    return () => {
      wrapper.removeEventListener("click", onClick);
    };
  }, [targetRef, toggle]);

  return null;
}
