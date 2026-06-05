import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { HackathonRadar, type Hackathon } from "./HackathonRadar";

function h(over: Partial<Hackathon> & { name: string }): Hackathon {
  return {
    prize: "$1,000", prizeValue: 1000,
    deadlineLabel: "Jun 10", deadlineWIB: "Jun 10", deadlineSort: "2026-06-10T00:00:00Z",
    fit: 1, location: "Remote", theme: "t", status: "open",
    link: "https://example.com", platform: "Devpost", eligibility: "open",
    about: `About ${over.name}`, correction: null, ...over,
  };
}

const rows: Hackathon[] = [
  h({ name: "Alpha", prizeValue: 5000, deadlineSort: "2026-06-12T00:00:00Z", fit: 3, location: "Remote", theme: "security" }),
  h({ name: "Bravo", prizeValue: 9000, deadlineSort: "2026-06-11T00:00:00Z", fit: 1, location: "On-site", theme: "ethereum" }),
  h({ name: "Closed One", status: "closed", deadlineSort: null, correction: "was wrong" }),
];

const source = { label: "@kenn_ronin", url: "https://x.com/kenn_ronin" };

function bodyRows(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("tbody tr.radar-row"));
}
function names(): string[] {
  return bodyRows().map((r) => r.querySelector(".radar-name")?.textContent?.replace(/[▶▼↗]/g, "").trim() ?? "");
}

describe("HackathonRadar island", () => {
  it("renders only enterable rows by default (closed hidden)", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    expect(names()).toEqual(expect.arrayContaining(["Alpha", "Bravo"]));
    expect(names()).not.toContain("Closed One");
  });

  it("shows closed/dead when the toggle is checked", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    fireEvent.click(screen.getByLabelText(/show closed/i));
    expect(names()).toContain("Closed One");
  });

  it("defaults to deadline sort (nearest first)", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    expect(names()).toEqual(["Bravo", "Alpha"]); // Jun 11 before Jun 12
  });

  it("sorts by prize when the Prize header is clicked", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    fireEvent.click(screen.getByRole("button", { name: /prize/i }));
    expect(names()).toEqual(["Alpha", "Bravo"]); // 5000 < 9000 asc
  });

  it("filters by search across name/theme", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    fireEvent.change(screen.getByLabelText(/search/i), { target: { value: "security" } });
    expect(names()).toEqual(["Alpha"]);
  });

  it("filters by location", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: "On-site" } });
    expect(names()).toEqual(["Bravo"]);
  });

  it("expands a row to reveal its about + correction", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    fireEvent.click(within(bodyRows()[0]).getByText(/Bravo/));
    expect(screen.getByText(/About Bravo/)).toBeInTheDocument();
  });

  it("renders a corrections section listing entries with a correction", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    const details = document.querySelector(".radar-corrections")!;
    expect(details.textContent).toContain("Closed One");
    expect(details.textContent).toContain("was wrong");
  });

  it("credits the source and stamps the asOf date", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    expect(screen.getByText(/2026-06-04/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /kenn_ronin/ })).toHaveAttribute("href", source.url);
  });

  it("reverses sort direction when a sort header is clicked twice", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    const prizeBtn = screen.getByRole("button", { name: /prize/i });
    fireEvent.click(prizeBtn); // ascending: 5000, 9000
    expect(names()).toEqual(["Alpha", "Bravo"]);
    fireEvent.click(prizeBtn); // descending: 9000, 5000
    expect(names()).toEqual(["Bravo", "Alpha"]);
  });

  it("shows the empty state when no rows match the filters", () => {
    render(<HackathonRadar hackathons={rows} asOf="2026-06-04" source={source} />);
    fireEvent.change(screen.getByLabelText(/search/i), { target: { value: "zzz-no-such-thing" } });
    expect(screen.getByText(/no hackathons match/i)).toBeInTheDocument();
  });
});
