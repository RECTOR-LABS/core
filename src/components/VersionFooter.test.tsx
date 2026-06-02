import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { VersionFooter } from "./VersionFooter";
import type { VersionView } from "@/lib/version";

// ---------------------------------------------------------------------------
// next/navigation mock — usePathname is the gate that hides the footer on
// /apply/* routes (Next shares one root <body> across all routes; the Rails
// apply layout simply had no footer). We drive the pathname per test.
// ---------------------------------------------------------------------------

let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

beforeEach(() => {
  mockPathname = "/";
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A fully-populated "shown" view model (production + all data present). */
function shownView(overrides: Partial<VersionView> = {}): VersionView {
  return {
    show: true,
    shortSha: "abc123d",
    branch: "main",
    commitGithubUrl: "https://github.com/RECTOR-LABS/core/commit/abc123def456789",
    branchGithubUrl: "https://github.com/RECTOR-LABS/core/tree/main",
    commitCount: 57,
    buildTime: "2026-06-01T12:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("VersionFooter", () => {
  describe("gating — show flag", () => {
    it("renders nothing when show is false", () => {
      const { container } = render(<VersionFooter show={false} />);
      expect(container.querySelector(".version-footer")).toBeNull();
      expect(container.firstChild).toBeNull();
    });

    it("renders the footer when show is true on a non-apply route", () => {
      const { container } = render(<VersionFooter {...shownView()} />);
      expect(container.querySelector("footer.version-footer")).not.toBeNull();
    });
  });

  describe("gating — /apply/* suppression via usePathname", () => {
    it("renders nothing on an /apply route even when show is true", () => {
      mockPathname = "/apply/superteam";
      const { container } = render(<VersionFooter {...shownView()} />);
      expect(container.querySelector(".version-footer")).toBeNull();
      expect(container.firstChild).toBeNull();
    });

    it("renders nothing on the bare /apply route", () => {
      mockPathname = "/apply";
      const { container } = render(<VersionFooter {...shownView()} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders nothing on a nested /apply route (arbital/modern)", () => {
      mockPathname = "/apply/arbital/modern";
      const { container } = render(<VersionFooter {...shownView()} />);
      expect(container.firstChild).toBeNull();
    });

    it("DOES render on /work (a non-apply route)", () => {
      mockPathname = "/work";
      const { container } = render(<VersionFooter {...shownView()} />);
      expect(container.querySelector("footer.version-footer")).not.toBeNull();
    });

    it("DOES render on the homepage /", () => {
      mockPathname = "/";
      const { container } = render(<VersionFooter {...shownView()} />);
      expect(container.querySelector("footer.version-footer")).not.toBeNull();
    });

    it("does NOT treat /applesauce as an apply route (prefix is /apply boundary)", () => {
      mockPathname = "/applesauce";
      const { container } = render(<VersionFooter {...shownView()} />);
      // Not under /apply — the footer must still render.
      expect(container.querySelector("footer.version-footer")).not.toBeNull();
    });
  });

  describe("markup parity (shown, full data)", () => {
    it("renders the branch link with correct href/target/rel and branch code", () => {
      const { container } = render(<VersionFooter {...shownView({ branch: "main" })} />);
      const link = container.querySelector<HTMLAnchorElement>("a.branch-link")!;
      expect(link.getAttribute("href")).toBe(
        "https://github.com/RECTOR-LABS/core/tree/main",
      );
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link.querySelector("code.version-branch")?.textContent).toBe("main");
    });

    it("sets the branch link title to 'View <branch> branch on GitHub'", () => {
      const { container } = render(<VersionFooter {...shownView({ branch: "feat/x" })} />);
      const link = container.querySelector<HTMLAnchorElement>("a.branch-link")!;
      expect(link.getAttribute("title")).toBe("View feat/x branch on GitHub");
    });

    it("renders the commit link with correct href/target/rel and short sha", () => {
      const { container } = render(<VersionFooter {...shownView({ shortSha: "abc123d" })} />);
      const link = container.querySelector<HTMLAnchorElement>("a.commit-link")!;
      expect(link.getAttribute("href")).toBe(
        "https://github.com/RECTOR-LABS/core/commit/abc123def456789",
      );
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link.querySelector("code.version-sha")?.textContent).toBe("abc123d");
    });

    it("renders the commit-count span as 'N Commits'", () => {
      const { container } = render(<VersionFooter {...shownView({ commitCount: 57 })} />);
      const span = container.querySelector(".version-commits");
      expect(span?.textContent).toBe("57 Commits");
    });

    it("renders an @ separator between branch and commit, and a • before the count", () => {
      const { container } = render(<VersionFooter {...shownView()} />);
      const seps = Array.from(
        container.querySelectorAll(".version-separator"),
      ).map((s) => s.textContent);
      expect(seps).toEqual(["@", "•"]);
    });

    it("renders two version icons (branch + commit) with aria-hidden", () => {
      const { container } = render(<VersionFooter {...shownView()} />);
      const icons = container.querySelectorAll("svg.version-icon");
      expect(icons.length).toBe(2);
      for (const icon of icons) {
        expect(icon.getAttribute("aria-hidden")).toBe("true");
      }
    });
  });

  describe("null-safe degradation", () => {
    it("omits the branch link AND the @ separator when branch is null", () => {
      const { container } = render(
        <VersionFooter {...shownView({ branch: null, branchGithubUrl: null })} />,
      );
      expect(container.querySelector("a.branch-link")).toBeNull();
      // The only separator left is the "•" before the commit count.
      const seps = Array.from(
        container.querySelectorAll(".version-separator"),
      ).map((s) => s.textContent);
      expect(seps).toEqual(["•"]);
      // Commit link is still present.
      expect(container.querySelector("a.commit-link")).not.toBeNull();
    });

    it("omits the commit-count span AND its • separator when commitCount is null", () => {
      const { container } = render(
        <VersionFooter {...shownView({ commitCount: null })} />,
      );
      expect(container.querySelector(".version-commits")).toBeNull();
      // Only the "@" separator (between branch and commit) remains.
      const seps = Array.from(
        container.querySelectorAll(".version-separator"),
      ).map((s) => s.textContent);
      expect(seps).toEqual(["@"]);
    });

    it("renders commit-only (no branch, no count) with just the commit link", () => {
      const { container } = render(
        <VersionFooter
          show
          shortSha="deadbee"
          branch={null}
          branchGithubUrl={null}
          commitGithubUrl="https://github.com/RECTOR-LABS/core/commit/deadbeefcafe"
          commitCount={null}
          buildTime={null}
        />,
      );
      expect(container.querySelector("a.branch-link")).toBeNull();
      expect(container.querySelector(".version-commits")).toBeNull();
      expect(container.querySelectorAll(".version-separator").length).toBe(0);
      expect(container.querySelector("a.commit-link")).not.toBeNull();
      expect(container.querySelector("code.version-sha")?.textContent).toBe("deadbee");
    });
  });

  describe("commit tooltip — hydration-safe 'deployed X ago'", () => {
    it("renders the base title on the SERVER render (no relative-time suffix → no hydration mismatch)", () => {
      // renderToStaticMarkup is the true SSR / first-render path: effects never
      // run, so the title must be the plain base text. (RTL's render() flushes
      // effects synchronously, which would mask this hydration-safety property.)
      const html = renderToStaticMarkup(<VersionFooter {...shownView()} />);
      expect(html).toContain('title="View commit on GitHub"');
      expect(html).not.toContain("deployed");
    });

    it("appends '(deployed X ago)' after mount when buildTime is present", () => {
      // buildTime ~2 hours before "now" → ActionView "about 2 hours".
      const buildTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      let result!: ReturnType<typeof render>;
      act(() => {
        result = render(<VersionFooter {...shownView({ buildTime })} />);
      });
      const link = result.container.querySelector<HTMLAnchorElement>("a.commit-link")!;
      expect(link.getAttribute("title")).toBe(
        "View commit on GitHub (deployed about 2 hours ago)",
      );
    });

    it("keeps the base title (no suffix) when buildTime is null, even after mount", () => {
      let result!: ReturnType<typeof render>;
      act(() => {
        result = render(<VersionFooter {...shownView({ buildTime: null })} />);
      });
      const link = result.container.querySelector<HTMLAnchorElement>("a.commit-link")!;
      expect(link.getAttribute("title")).toBe("View commit on GitHub");
    });
  });
});
