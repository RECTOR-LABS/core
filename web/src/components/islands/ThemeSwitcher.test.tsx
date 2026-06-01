import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { StrictMode, useRef } from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { ThemeSwitcher } from "./ThemeSwitcher";

// ---------------------------------------------------------------------------
// Setup — clean localStorage + stub rAF/cancelAnimationFrame between tests.
//
// NOTE (Next adaptation): the island now toggles a page-local WRAPPER element
// (passed via `targetRef`) instead of `document.body`. Rationale lives in the
// ThemeSwitcher `targetRef` docblock: Next shares one <body> across all routes
// and never resets it on client navigation, so a body-class toggle would flash
// on SSR and leak the dark theme onto /, /work, /journal. These tests therefore
// assert the WRAPPER's class/containers/labels, not the body's.
// ---------------------------------------------------------------------------

/** rAF callbacks queued during the test. */
let rafCallbacks: Array<(t: number) => void> = [];
/** Ids cancelled via cancelAnimationFrame. */
const cancelledRafIds: Set<number> = new Set();

beforeEach(() => {
  localStorage.clear();

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
});

/** Flush all queued rAF callbacks with the given timestamp. */
function flushRaf(t = 0) {
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  for (const cb of cbs) cb(t);
}

// ---------------------------------------------------------------------------
// Harness — reproduces the switcher page shape: a themed wrapper holding the
// ThemeSwitcher (controller), a [data-toggle] button + [data-label] span, and
// the two [data-theme] containers. The wrapper starts at `wrapperClass`.
// ---------------------------------------------------------------------------

function Harness({
  initialTheme,
  wrapperClass = "retro-terminal",
}: {
  initialTheme?: "retro" | "modern";
  wrapperClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className={wrapperClass} data-testid="wrapper">
      <ThemeSwitcher targetRef={ref} initialTheme={initialTheme} />
      <button type="button" data-toggle>
        <span data-label>SWITCH TO MODERN</span>
      </button>
      <div data-theme="retro" data-testid="retro-container">
        Retro
      </div>
      <div data-theme="modern" data-testid="modern-container" style={{ display: "none" }}>
        Modern
      </div>
    </div>
  );
}

function renderHarness(
  opts: { initialTheme?: "retro" | "modern"; wrapperClass?: string } = {},
) {
  const result = render(
    <Harness initialTheme={opts.initialTheme} wrapperClass={opts.wrapperClass} />,
  );
  const wrapper = result.getByTestId("wrapper");
  const toggle = wrapper.querySelector<HTMLElement>("[data-toggle]")!;
  const label = wrapper.querySelector<HTMLElement>("[data-label]")!;
  const retro = result.getByTestId("retro-container");
  const modern = result.getByTestId("modern-container");
  return { ...result, wrapper, toggle, label, retro, modern };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ThemeSwitcher island", () => {
  describe("initial state — default theme retro", () => {
    it("keeps retro-terminal on the WRAPPER on mount (default theme)", () => {
      const { wrapper } = renderHarness();
      expect(wrapper.classList.contains("retro-terminal")).toBe(true);
      expect(wrapper.classList.contains("modern-dark")).toBe(false);
    });

    it("does NOT touch document.body (no theme class leaks to the shared body)", () => {
      renderHarness();
      expect(document.body.classList.contains("retro-terminal")).toBe(false);
      expect(document.body.classList.contains("modern-dark")).toBe(false);
    });

    it("sets the label to 'SWITCH TO MODERN' when retro is active", () => {
      const { label } = renderHarness();
      expect(label.textContent).toBe("SWITCH TO MODERN");
    });

    it("loads saved preference from localStorage (modern) onto the wrapper", () => {
      localStorage.setItem("arbital-cv-theme", "modern");
      const { wrapper } = renderHarness();
      expect(wrapper.classList.contains("modern-dark")).toBe(true);
      expect(wrapper.classList.contains("retro-terminal")).toBe(false);
    });

    it("loads saved preference from localStorage (retro)", () => {
      localStorage.setItem("arbital-cv-theme", "retro");
      const { wrapper } = renderHarness();
      expect(wrapper.classList.contains("retro-terminal")).toBe(true);
    });

    it("defaults to retro if no localStorage value", () => {
      const { wrapper } = renderHarness();
      expect(wrapper.classList.contains("retro-terminal")).toBe(true);
    });
  });

  describe("initialTheme prop override", () => {
    it("starts in modern when initialTheme=modern passed", () => {
      // Wrapper starts at modern-dark so the prop and SSR class agree.
      const { wrapper } = renderHarness({ initialTheme: "modern", wrapperClass: "modern-dark" });
      expect(wrapper.classList.contains("modern-dark")).toBe(true);
    });

    it("localStorage overrides initialTheme prop (saved wins)", () => {
      localStorage.setItem("arbital-cv-theme", "modern");
      const { wrapper } = renderHarness({ initialTheme: "retro" });
      // localStorage takes precedence, matching Stimulus's connect() logic
      expect(wrapper.classList.contains("modern-dark")).toBe(true);
    });
  });

  describe("toggle behavior", () => {
    it("switches the wrapper from retro to modern on toggle click", () => {
      const { wrapper, toggle } = renderHarness();

      expect(wrapper.classList.contains("retro-terminal")).toBe(true);
      fireEvent.click(toggle);

      expect(wrapper.classList.contains("modern-dark")).toBe(true);
      expect(wrapper.classList.contains("retro-terminal")).toBe(false);
    });

    it("switches back to retro on a second toggle click", () => {
      const { wrapper, toggle } = renderHarness();

      fireEvent.click(toggle); // retro → modern
      fireEvent.click(toggle); // modern → retro

      expect(wrapper.classList.contains("retro-terminal")).toBe(true);
      expect(wrapper.classList.contains("modern-dark")).toBe(false);
    });

    it("updates the label to SWITCH TO RETRO when switching to modern", () => {
      const { toggle, label } = renderHarness();
      fireEvent.click(toggle);
      expect(label.textContent).toBe("SWITCH TO RETRO");
    });

    it("updates the label back to SWITCH TO MODERN when switching back to retro", () => {
      const { toggle, label } = renderHarness();
      fireEvent.click(toggle); // → modern
      fireEvent.click(toggle); // → retro
      expect(label.textContent).toBe("SWITCH TO MODERN");
    });

    it("persists theme to localStorage on toggle", () => {
      const { toggle } = renderHarness();
      fireEvent.click(toggle);
      expect(localStorage.getItem("arbital-cv-theme")).toBe("modern");
    });

    it("persists retro back to localStorage on second toggle", () => {
      const { toggle } = renderHarness();
      fireEvent.click(toggle); // retro → modern
      fireEvent.click(toggle); // modern → retro
      expect(localStorage.getItem("arbital-cv-theme")).toBe("retro");
    });
  });

  describe("data-theme container visibility (scoped to the wrapper)", () => {
    it("shows the retro container and hides the modern container on retro theme", () => {
      const { retro, modern } = renderHarness(); // default: retro
      expect(retro.style.display).toBe("block");
      expect(modern.style.display).toBe("none");
    });

    it("shows the modern container and hides the retro container after toggle", () => {
      const { toggle, retro, modern } = renderHarness();
      fireEvent.click(toggle);
      expect(modern.style.display).toBe("block");
      expect(retro.style.display).toBe("none");
    });
  });

  describe("localStorage key", () => {
    it("uses the exact key 'arbital-cv-theme'", () => {
      const { toggle } = renderHarness();
      fireEvent.click(toggle);
      expect(localStorage.getItem("arbital-cv-theme")).not.toBeNull();
    });
  });

  describe("cleanup — rAF cancellation", () => {
    it("cancels the pending rAF when unmounted before the frame fires", () => {
      const { unmount } = renderHarness();
      // applyTheme queues a rAF for setting opacity; unmount before it fires
      expect(rafCallbacks.length).toBeGreaterThan(0);
      unmount();
      // Cleanup must have cancelled the in-flight rAF
      expect(cancelledRafIds.size).toBeGreaterThan(0);
    });

    it("applies opacity=1 to the visible container on the next frame when NOT unmounted", () => {
      const { retro } = renderHarness({ initialTheme: "retro" });
      // Opacity starts at 0 (set synchronously by applyTheme on the visible container)
      expect(retro.style.opacity).toBe("0");
      // Flush the queued rAF → opacity should become "1"
      act(() => flushRaf());
      expect(retro.style.opacity).toBe("1");
    });

    it("cancels the previous rAF when the theme changes rapidly (no orphaned frame)", () => {
      const { toggle } = renderHarness({ initialTheme: "retro" });

      // First applyTheme (on mount) queued a rAF
      expect(rafCallbacks.length).toBeGreaterThan(0);

      // Toggle rapidly — old rAF should be cancelled before the new one fires
      act(() => fireEvent.click(toggle));
      expect(cancelledRafIds.size).toBeGreaterThan(0);
    });
  });

  describe("StrictMode double-mount guard", () => {
    it("reads localStorage exactly once under StrictMode (ref-guarded mount effect)", () => {
      localStorage.setItem("arbital-cv-theme", "modern");
      const getItem = vi.spyOn(Storage.prototype, "getItem");
      // StrictMode double-invokes the mount effect (mount → cleanup → mount).
      // The didLoadPref ref must collapse those into a single localStorage read.
      const { getByTestId } = render(
        <StrictMode>
          <Harness />
        </StrictMode>,
      );
      const themeReads = getItem.mock.calls.filter(
        (c) => c[0] === "arbital-cv-theme",
      ).length;
      expect(themeReads).toBe(1);
      // And the saved theme was still applied to the wrapper.
      expect(getByTestId("wrapper").classList.contains("modern-dark")).toBe(true);
      getItem.mockRestore();
    });
  });
});
