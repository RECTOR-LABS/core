import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// window.matchMedia mock
//
// jsdom does not implement window.matchMedia. The animation islands query
// `matchMedia("(prefers-reduced-motion: reduce)")` inside their effects, so
// without this every island test would throw. The default returns
// `matches: false` (motion ALLOWED) to preserve the existing tests' behaviour
// (full animation path). Individual reduced-motion tests override this per-test
// (and restore afterwards). The full MediaQueryList surface is implemented so
// any consumer that reads `.media` / attaches listeners works.
//
// Guarded by a `typeof window` check: some suites (e.g. opengraph-image) opt
// into the `node` test environment where `window` is undefined; this setup
// file runs for every environment, and matchMedia is only meaningful in a DOM.
// ---------------------------------------------------------------------------

if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
