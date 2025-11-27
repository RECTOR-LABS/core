class ApplyController < ApplicationController
  layout "apply"

  before_action :set_arbital_data, only: [ :arbital, :arbital_retro, :arbital_modern ]

  # Final CV page with theme switcher
  def arbital
    render :arbital
  end

  # Retro Terminal version
  def arbital_retro
    render :arbital_retro
  end

  # Modern Dark version
  def arbital_modern
    render :arbital_modern
  end

  private

  def set_arbital_data
    @identity = {
      name: "RECTOR",
      tagline: "Building what the Old Guard won't",
      role: "Backend Engineer • Rust/Python • Trading Infrastructure",
      avatar: "rector_profile_image.png"
    }

    @stats = {
      total_stars: 203,
      vulnerabilities_found: 125,
      bounty_earned: "$7.5K",
      hackathons_2025: 8,
      total_repos: 64,
      trading_projects: 6
    }

    @featured_projects = [
      {
        name: "recMEV Suite",
        org: "RECTOR-LABS",
        description: "High-performance DEX pool discovery for MEV strategies. Rust backend with real-time market data ingestion via WebSocket streams. Multi-DEX support with fault-tolerant execution.",
        language: "Rust",
        tags: [ "MEV", "WebSocket", "Low-Latency" ],
        url: "https://github.com/RECTOR-LABS/recMEV-installer",
        relevance: "→ Maps to: Execution engine, multi-DEX integration, WS pipelines"
      },
      {
        name: "Saros DLMM Manager",
        org: "rz1989s",
        description: "Automated position management for DLMM pools. Real-time P&L tracking, inventory rebalancing, and strategy execution with position health monitoring.",
        language: "TypeScript",
        tags: [ "Trading Bot", "Position Management", "Automation" ],
        url: "https://github.com/rz1989s/saros-dlmm-position-manager",
        live_url: "https://saros-demo.rectorspace.com",
        relevance: "→ Maps to: Strategy modules, inventory skewing, monitoring"
      },
      {
        name: "Meteora Fee Routing",
        org: "rz1989s",
        description: "AMM fee optimization engine. Analyzes pool states, calculates optimal routing, and executes fee harvesting strategies. Won $7,500 bounty.",
        language: "TypeScript",
        tags: [ "AMM", "Optimization", "Fee Arbitrage" ],
        url: "https://github.com/rz1989s/meteora-fee-routing",
        live_url: "https://meteora-fee-routing.rectorspace.com",
        relevance: "→ Maps to: Delta-neutral strategies, funding arbitrage"
      },
      {
        name: "Solana Whale Alert",
        org: "RECTOR-LABS",
        description: "Real-time whale transaction monitoring. WebSocket-based data pipeline with configurable thresholds and alerting. 99% cost savings vs enterprise solutions.",
        language: "TypeScript",
        tags: [ "Data Pipeline", "WebSocket", "Monitoring" ],
        url: "https://github.com/RECTOR-LABS/solana-whale-alert",
        relevance: "→ Maps to: Market data ingestion, monitoring systems"
      },
      {
        name: "Solana Gaming Audit",
        org: "rz1989s",
        description: "Security audit documenting 125 vulnerabilities. Deep Rust analysis of on-chain programs, state management, and economic attack vectors.",
        language: "Rust",
        tags: [ "Security", "Rust", "Smart Contracts" ],
        url: "https://github.com/rz1989s/solana-gaming-audit",
        relevance: "→ Maps to: Rust proficiency, system security mindset"
      },
      {
        name: "GPT Web Scraper",
        org: "RECTOR-LABS",
        description: "Python-based intelligent scraping with GPT-4 Vision and Playwright. Async architecture for high-throughput data extraction pipelines.",
        language: "Python",
        tags: [ "Python", "Async", "Data Pipeline" ],
        url: "https://github.com/RECTOR-LABS/gpt-web-scraper",
        relevance: "→ Maps to: Python async, data pipelines, automation"
      }
    ]

    @tech_stack = {
      primary: [
        { name: "Rust", level: 85, projects: 4, highlight: true },
        { name: "Python", level: 75, projects: 3, highlight: true },
        { name: "TypeScript", level: 95, projects: 25 }
      ],
      secondary: [
        { name: "PostgreSQL", level: 85 },
        { name: "WebSocket/REST", level: 90 },
        { name: "Docker/Cloud", level: 80 },
        { name: "Solana/Anchor", level: 90 }
      ],
      domains: [
        "Trading Systems",
        "Market Data Pipelines",
        "MEV Infrastructure",
        "Position Management",
        "WebSocket Architectures",
        "Low-Latency Systems"
      ]
    }

    @orgs = [
      { name: "rz1989s", type: "Personal", repos: 28, url: "https://github.com/rz1989s" },
      { name: "RECTOR-LABS", type: "Organization", repos: 19, url: "https://github.com/RECTOR-LABS" },
      { name: "getlumos", type: "Organization", repos: 12, url: "https://github.com/getlumos" },
      { name: "sip-protocol", type: "Organization", repos: 5, url: "https://github.com/sip-protocol" }
    ]

    @why_arbital = <<~TEXT
      You're building institutional-grade execution for on-chain perps. I've been building the infrastructure that makes that possible.

      My recMEV suite handles real-time DEX pool discovery with WebSocket streams and fault-tolerant execution - the same patterns you need for Hyperliquid, Pacifica, and multi-DEX routing. I've built position managers that track P&L in real-time, rebalance inventory, and execute strategies autonomously.

      Rust for the execution engine where microseconds matter. Python for rapid strategy prototyping and data pipelines. I've shipped trading bots, fee arbitrage systems, and monitoring dashboards - all battle-tested in production.

      I understand perps: funding rates, liquidation mechanics, basis spreads, inventory risk. I've traded them. I've built tools around them. Delta-neutral isn't just a buzzword - it's the architecture I've been designing for.

      Small team, high ownership, building core infra from day one? That's exactly where I thrive.
    TEXT

    @what_i_bring = [
      { area: "Execution Engine", match: "recMEV Suite - Multi-DEX pool discovery, order routing, fault tolerance" },
      { area: "Strategy Modules", match: "DLMM Manager - Position management, inventory skewing, P&L tracking" },
      { area: "Data Pipelines", match: "Whale Alert - WebSocket ingestion, real-time processing, alerting" },
      { area: "Rust Proficiency", match: "4 Rust projects including security audits and systems programming" },
      { area: "Python Async", match: "GPT Scraper - aiohttp patterns, high-throughput pipelines" },
      { area: "Crypto Native", match: "Traded perps, built MEV infra, won $7.5K bounty, 8 hackathons in 2025" }
    ]

    @contact = {
      github: "https://github.com/rz1989s",
      twitter: "https://x.com/rz1989sol",
      email: "apply@rectorspace.com"
    }
  end
end
