import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import WorkStory from "./page";

// The page is an async Server Component. Rendering it requires awaiting the
// element (it loads real ./content/work markdown via process.cwd()) and then
// handing the resolved tree to RTL. "core" is a stable, non-draft fixture.
async function renderStory(slug: string) {
  const ui = await WorkStory({ params: Promise.resolve({ slug }) });
  return render(ui);
}

describe("WorkStory link colors (WCAG AA)", () => {
  it("renders the Back to Work link with the AA link color (text-link, not the brand sky)", async () => {
    const { getByText } = await renderStory("core");
    const back = getByText("← Back to Work");
    expect(back.className).toContain("text-link");
    // The low-contrast brand sky must NOT be used as resting link text.
    expect(back.className).not.toContain("#41CFFF");
    // Warm clay hover is preserved.
    expect(back.className).toContain("hover:text-[#E58C2E]");
  });

  it("renders the GitHub link with text-link (core.md has a github_url)", async () => {
    const { getByText } = await renderStory("core");
    const gh = getByText("GitHub →");
    expect(gh.className).toContain("text-link");
    expect(gh.className).not.toContain("#41CFFF");
  });
});
