import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AchievementCard } from "./AchievementCard";
import type { Achievement } from "@/lib/content/achievements";

const fixture: Achievement = {
  slug: "web3-deal-discovery",
  title: "Web3 Deal Discovery",
  type: "hackathon",
  place: "1st",
  prizeAmount: 5000,
  prizeExtras: "Gen3 Monke NFT",
  event: "MonkeDAO Cypherpunk",
  eventDetail: "Hackathon 2025",
  date: "2025-12",
  githubUrl: "https://github.com/RECTOR-LABS/web3-deal-discovery-nft-coupons",
  repoName: "RECTOR-LABS/web3-deal-discovery-nft-coupons",
  description: "NFT coupons on Solana — Groupon meets DeFi.",
  badgeEmoji: "🥇",
  badgeLabel: "1st Place",
  formattedPrize: "$5,000 + Gen3 Monke NFT",
  fullEvent: "MonkeDAO Cypherpunk • Hackathon 2025",
  badgeClass: "achievement-gold",
};

describe("AchievementCard", () => {
  it("renders the badge with the correct badgeClass CSS class", () => {
    render(<AchievementCard achievement={fixture} />);
    const badge = screen.getByText(/🥇 1st Place/);
    expect(badge).toHaveClass("achievement-badge");
    expect(badge).toHaveClass("achievement-gold");
  });

  it("renders the badge with emoji and label text", () => {
    render(<AchievementCard achievement={fixture} />);
    expect(screen.getByText(/🥇 1st Place/)).toBeInTheDocument();
  });

  it("renders the title as a link with correct href", () => {
    render(<AchievementCard achievement={fixture} />);
    const link = screen.getByRole("link", { name: "Web3 Deal Discovery" });
    expect(link).toHaveAttribute("href", "https://github.com/RECTOR-LABS/web3-deal-discovery-nft-coupons");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("renders the fullEvent text", () => {
    render(<AchievementCard achievement={fixture} />);
    expect(screen.getByText("MonkeDAO Cypherpunk • Hackathon 2025")).toBeInTheDocument();
  });

  it("renders the formattedPrize text", () => {
    render(<AchievementCard achievement={fixture} />);
    expect(screen.getByText("$5,000 + Gen3 Monke NFT")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<AchievementCard achievement={fixture} />);
    expect(screen.getByText("NFT coupons on Solana — Groupon meets DeFi.")).toBeInTheDocument();
  });

  it("wraps everything in an .achievement-card div", () => {
    const { container } = render(<AchievementCard achievement={fixture} />);
    expect(container.firstChild).toHaveClass("achievement-card");
  });
});
