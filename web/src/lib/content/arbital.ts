// ---------------------------------------------------------------------------
// arbital.ts — Hardcoded data for the /apply/arbital pages.
// Ported verbatim from ApplyController#set_arbital_data (Rails).
//
// Key mapping notes:
//   - All keys are camelCase (consistent with the rest of the TS content layer).
//   - Rails snake_case keys → camelCase counterparts are documented inline.
//   - `whyArbital` is stored as an array of paragraphs (strings), matching the
//     Rails rendering pattern used in all three views:
//       @why_arbital.split("\n\n").each { |p| … }
//     Consumers iterate the array and render each element as its own <p>.
//   - `techStack.primary` entries carry `level`, `projects`, and the optional
//     `highlight` flag exactly as Rails sets them.
//   - `stats.bountyEarned` is a pre-formatted string ("$7.5K"), NOT a number.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArbitalIdentity {
  /** @identity[:name] */
  name: string;
  /** @identity[:tagline] */
  tagline: string;
  /** @identity[:role] */
  role: string;
  /** @identity[:avatar] — filename relative to the public/images dir */
  avatar: string;
}

export interface ArbitalStats {
  /** @stats[:total_stars] */
  totalStars: number;
  /** @stats[:vulnerabilities_found] */
  vulnerabilitiesFound: number;
  /** @stats[:bounty_earned] — pre-formatted string, e.g. "$7.5K" */
  bountyEarned: string;
  /** @stats[:hackathons_2025] */
  hackathons2025: number;
  /** @stats[:total_repos] */
  totalRepos: number;
  /** @stats[:trading_projects] */
  tradingProjects: number;
}

export interface ArbitalProject {
  /** @featured_projects[n][:name] */
  name: string;
  /** @featured_projects[n][:org] */
  org: string;
  /** @featured_projects[n][:description] */
  description: string;
  /** @featured_projects[n][:language] */
  language: string;
  /** @featured_projects[n][:tags] */
  tags: string[];
  /** @featured_projects[n][:url] */
  url: string;
  /** @featured_projects[n][:live_url] — optional; not all projects have one */
  liveUrl?: string;
  /** @featured_projects[n][:relevance] */
  relevance: string;
}

export interface ArbitalTechEntry {
  name: string;
  level: number;
  projects?: number;
  highlight?: boolean;
}

export interface ArbitalSecondaryTech {
  name: string;
  level: number;
}

export interface ArbitalTechStack {
  /** @tech_stack[:primary] */
  primary: ArbitalTechEntry[];
  /** @tech_stack[:secondary] */
  secondary: ArbitalSecondaryTech[];
  /** @tech_stack[:domains] */
  domains: string[];
}

export interface ArbitalOrg {
  /** @orgs[n][:name] */
  name: string;
  /** @orgs[n][:type] */
  type: string;
  /** @orgs[n][:repos] */
  repos: number;
  /** @orgs[n][:url] */
  url: string;
}

export interface ArbitalBring {
  /** @what_i_bring[n][:area] */
  area: string;
  /** @what_i_bring[n][:match] */
  match: string;
}

export interface ArbitalContact {
  /** @contact[:github] */
  github: string;
  /** @contact[:twitter] */
  twitter: string;
  /** @contact[:email] */
  email: string;
}

export interface ArbitalData {
  identity: ArbitalIdentity;
  stats: ArbitalStats;
  /** 6 featured projects in controller order */
  featuredProjects: ArbitalProject[];
  techStack: ArbitalTechStack;
  /** 4 GitHub orgs in controller order */
  orgs: ArbitalOrg[];
  /**
   * Paragraphs of the "Why Arbital?" narrative.
   * Ported from @why_arbital (a heredoc) — split on "\n\n" to match:
   *   @why_arbital.split("\n\n").each { |p| … }
   * Consumers render each element as its own <p> block.
   */
  whyArbital: string[];
  /** 6 skill → project mappings in controller order */
  whatIBring: ArbitalBring[];
  contact: ArbitalContact;
}

// ---------------------------------------------------------------------------
// Data — verbatim port of ApplyController#set_arbital_data
// ---------------------------------------------------------------------------

export const arbitalData: ArbitalData = {
  // ---------------------------------------------------------------------------
  // @identity
  // ---------------------------------------------------------------------------
  identity: {
    name: "RECTOR",
    tagline: "Building what the Old Guard won't",
    role: "Backend Engineer • Rust/Python • Trading Infrastructure",
    avatar: "rector_profile_image.png",
  },

  // ---------------------------------------------------------------------------
  // @stats
  // ---------------------------------------------------------------------------
  stats: {
    totalStars: 203,
    vulnerabilitiesFound: 125,
    bountyEarned: "$7.5K",
    hackathons2025: 8,
    totalRepos: 64,
    tradingProjects: 6,
  },

  // ---------------------------------------------------------------------------
  // @featured_projects (6 entries)
  // ---------------------------------------------------------------------------
  featuredProjects: [
    {
      name: "recMEV Suite",
      org: "RECTOR-LABS",
      description:
        "High-performance DEX pool discovery for MEV strategies. Rust backend with real-time market data ingestion via WebSocket streams. Multi-DEX support with fault-tolerant execution.",
      language: "Rust",
      tags: ["MEV", "WebSocket", "Low-Latency"],
      url: "https://github.com/RECTOR-LABS/recMEV-installer",
      relevance: "→ Maps to: Execution engine, multi-DEX integration, WS pipelines",
    },
    {
      name: "Saros DLMM Manager",
      org: "rz1989s",
      description:
        "Automated position management for DLMM pools. Real-time P&L tracking, inventory rebalancing, and strategy execution with position health monitoring.",
      language: "TypeScript",
      tags: ["Trading Bot", "Position Management", "Automation"],
      url: "https://github.com/rz1989s/saros-dlmm-position-manager",
      liveUrl: "https://saros-demo.rectorspace.com",
      relevance: "→ Maps to: Strategy modules, inventory skewing, monitoring",
    },
    {
      name: "Meteora Fee Routing",
      org: "rz1989s",
      description:
        "AMM fee optimization engine. Analyzes pool states, calculates optimal routing, and executes fee harvesting strategies. Won $7,500 bounty.",
      language: "TypeScript",
      tags: ["AMM", "Optimization", "Fee Arbitrage"],
      url: "https://github.com/rz1989s/meteora-fee-routing",
      liveUrl: "https://meteora-fee-routing.rectorspace.com",
      relevance: "→ Maps to: Delta-neutral strategies, funding arbitrage",
    },
    {
      name: "Solana Whale Alert",
      org: "RECTOR-LABS",
      description:
        "Real-time whale transaction monitoring. WebSocket-based data pipeline with configurable thresholds and alerting. 99% cost savings vs enterprise solutions.",
      language: "TypeScript",
      tags: ["Data Pipeline", "WebSocket", "Monitoring"],
      url: "https://github.com/RECTOR-LABS/solana-whale-alert",
      relevance: "→ Maps to: Market data ingestion, monitoring systems",
    },
    {
      name: "Solana Gaming Audit",
      org: "rz1989s",
      description:
        "Security audit documenting 125 vulnerabilities. Deep Rust analysis of on-chain programs, state management, and economic attack vectors.",
      language: "Rust",
      tags: ["Security", "Rust", "Smart Contracts"],
      url: "https://github.com/rz1989s/solana-gaming-audit",
      relevance: "→ Maps to: Rust proficiency, system security mindset",
    },
    {
      name: "GPT Web Scraper",
      org: "RECTOR-LABS",
      description:
        "Python-based intelligent scraping with GPT-4 Vision and Playwright. Async architecture for high-throughput data extraction pipelines.",
      language: "Python",
      tags: ["Python", "Async", "Data Pipeline"],
      url: "https://github.com/RECTOR-LABS/gpt-web-scraper",
      relevance: "→ Maps to: Python async, data pipelines, automation",
    },
  ],

  // ---------------------------------------------------------------------------
  // @tech_stack
  // ---------------------------------------------------------------------------
  techStack: {
    primary: [
      { name: "Rust", level: 85, projects: 4, highlight: true },
      { name: "Python", level: 75, projects: 3, highlight: true },
      { name: "TypeScript", level: 95, projects: 25 },
    ],
    secondary: [
      { name: "PostgreSQL", level: 85 },
      { name: "WebSocket/REST", level: 90 },
      { name: "Docker/Cloud", level: 80 },
      { name: "Solana/Anchor", level: 90 },
    ],
    domains: [
      "Trading Systems",
      "Market Data Pipelines",
      "MEV Infrastructure",
      "Position Management",
      "WebSocket Architectures",
      "Low-Latency Systems",
    ],
  },

  // ---------------------------------------------------------------------------
  // @orgs (4 entries)
  // ---------------------------------------------------------------------------
  orgs: [
    { name: "rz1989s", type: "Personal", repos: 28, url: "https://github.com/rz1989s" },
    {
      name: "RECTOR-LABS",
      type: "Organization",
      repos: 19,
      url: "https://github.com/RECTOR-LABS",
    },
    { name: "getlumos", type: "Organization", repos: 12, url: "https://github.com/getlumos" },
    {
      name: "sip-protocol",
      type: "Organization",
      repos: 5,
      url: "https://github.com/sip-protocol",
    },
  ],

  // ---------------------------------------------------------------------------
  // @why_arbital — heredoc split on "\n\n" → paragraph array.
  // Trailing whitespace from <<~TEXT is stripped; each element is one paragraph.
  // Rails views iterate: @why_arbital.split("\n\n").each { |p| render p }
  // ---------------------------------------------------------------------------
  whyArbital: [
    "You're building institutional-grade execution for on-chain perps. I've been building the infrastructure that makes that possible.",
    "My recMEV suite handles real-time DEX pool discovery with WebSocket streams and fault-tolerant execution - the same patterns you need for Hyperliquid, Pacifica, and multi-DEX routing. I've built position managers that track P&L in real-time, rebalance inventory, and execute strategies autonomously.",
    "Rust for the execution engine where microseconds matter. Python for rapid strategy prototyping and data pipelines. I've shipped trading bots, fee arbitrage systems, and monitoring dashboards - all battle-tested in production.",
    "I understand perps: funding rates, liquidation mechanics, basis spreads, inventory risk. I've traded them. I've built tools around them. Delta-neutral isn't just a buzzword - it's the architecture I've been designing for.",
    "Small team, high ownership, building core infra from day one? That's exactly where I thrive.",
  ],

  // ---------------------------------------------------------------------------
  // @what_i_bring (6 entries)
  // ---------------------------------------------------------------------------
  whatIBring: [
    {
      area: "Execution Engine",
      match: "recMEV Suite - Multi-DEX pool discovery, order routing, fault tolerance",
    },
    {
      area: "Strategy Modules",
      match: "DLMM Manager - Position management, inventory skewing, P&L tracking",
    },
    {
      area: "Data Pipelines",
      match: "Whale Alert - WebSocket ingestion, real-time processing, alerting",
    },
    {
      area: "Rust Proficiency",
      match: "4 Rust projects including security audits and systems programming",
    },
    {
      area: "Python Async",
      match: "GPT Scraper - aiohttp patterns, high-throughput pipelines",
    },
    {
      area: "Crypto Native",
      match: "Traded perps, built MEV infra, won $7.5K bounty, 8 hackathons in 2025",
    },
  ],

  // ---------------------------------------------------------------------------
  // @contact
  // ---------------------------------------------------------------------------
  contact: {
    github: "https://github.com/rz1989s",
    twitter: "https://x.com/rz1989sol",
    email: "apply@rectorspace.com",
  },
};
