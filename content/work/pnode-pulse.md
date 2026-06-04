---
title: pNode Pulse
slug: pnode-pulse
summary: Real-time monitoring dashboard for Xandeum's decentralized storage network — 200+ nodes across 10+ countries, with health scoring and predictive alerts.
category: Infrastructure
status: Draft
github_url: https://github.com/RECTOR-LABS/pnode-pulse
repo_name: RECTOR-LABS/pnode-pulse
created_at: '2025-12-24'
featured: false
technologies:
- Next.js 14
- TypeScript
- TimescaleDB
- Redis
- tRPC
- Prisma
- Docker
github_stars: 0
github_forks: 0
---

# pNode Pulse: Watching 200 Nodes Sleep, Wake, and Sometimes Die

Decentralized storage is the future. Everybody says so. But nobody talks about the boring part — actually monitoring hundreds of nodes scattered across the globe, making sure they stay online, tracking their performance, predicting when theyre about to fail.

[Xandeum](https://xandeum.com) is building decentralized storage on Solana. Their pNode network spans 200+ nodes across 10+ countries. Beautiful vision. Operational nightmare without proper tooling.

I built that tooling.

**The Visibility Problem**

Running a distributed network blind is terrifying. Nodes go down. Storage fills up. Version mismatches cause consensus issues. IP addresses change. And without visibility, you dont know until users complain.

The Xandeum team needed answers to basic questions:

- How many nodes are actually online right now?
- Which nodes are falling behind on updates?
- Where is storage capacity concentrated?
- Which nodes are about to run out of disk space?
- Whats the overall network health?

Before pNode Pulse, answering these required SSH-ing into individual nodes or parsing raw gossip protocol data. Not sustainable at scale.

**Real-Time Everything**

The dashboard updates live. WebSocket connections stream metrics as they change. No refresh buttons. No stale data. Watch a node come online and see the number tick up immediately.

This sounds simple but required careful architecture:

- **Collector Worker** — Continuously polls the Xandeum gossip protocol, gathering node states, metrics, connectivity data
- **TimescaleDB** — Time-series database storing historical metrics for trend analysis and predictions
- **Redis Cache** — Frequently accessed data cached for instant dashboard loads
- **WebSocket Layer** — Pushes updates to connected clients in real-time

The collector runs on a tight loop. Every node gets checked regularly. Changes propagate through Redis to the WebSocket layer to every connected dashboard.

**Network Health Scoring**

Raw metrics overwhelm. Operators need signal, not noise. So I built a health scoring system.

Each node gets graded A through F based on:

- Uptime percentage (how often its been online)
- Storage utilization (too full is bad, too empty suggests problems)
- Version currency (running outdated software is risky)
- Response latency (slow nodes hurt network performance)
- Peer connectivity (isolated nodes cant participate)

Individual scores roll up into network-wide health. "The network is an A-" communicates more than pages of metrics. When health drops to B or C, operators know to investigate.

**The Node Graveyard**

Nodes die. Its inevitable in any distributed system. Hardware fails, operators abandon projects, network conditions change.

pNode Pulse tracks these deaths. The "graveyard" shows nodes that went offline and never returned. Time of death. Last known metrics. Geographic location.

Morbid? Maybe. Useful? Absolutely. Patterns in node deaths reveal systemic issues. If nodes in a specific region keep dying, maybe theres an infrastructure problem. If nodes running version X die more often, maybe thats a buggy release.

The graveyard turns individual failures into collective intelligence.

**Geographic Distribution**

Where are the nodes? This matters for decentralization and resilience.

The dashboard shows a global map — node density by country and region. If 80% of storage is in one country, thats a centralization risk. Diversification matters for fault tolerance.

Current Xandeum stats: 200+ nodes across 10+ countries with 5+ TB aggregate capacity. Not bad for an early network. The visualization helps the team identify gaps and target expansion efforts.

**Predictive Alerts**

Monitoring tells you what happened. Prediction tells you whats about to happen.

Using historical trends from TimescaleDB, pNode Pulse forecasts:

- Storage exhaustion dates (when will this node run out of disk?)
- Uptime degradation patterns (is this node getting flaky?)
- Growth projections (how fast is network capacity expanding?)

Operators get alerts before problems become crises. "Node X will exhaust storage in 7 days" is actionable. "Node X is full" is too late.

**The Technical Stack**

Frontend is [Next.js 14](https://nextjs.org) with TypeScript and [Tailwind CSS](https://tailwindcss.com). Charts use [Recharts](https://recharts.org) because it handles time-series data well. [React Query](https://tanstack.com/query) manages data fetching and caching.

Backend uses [tRPC](https://trpc.io) for type-safe API routes. [Prisma](https://prisma.io) as the ORM talking to PostgreSQL. TimescaleDB extension for efficient time-series queries. Redis for hot data caching.

Deployment is Docker Compose — easy to spin up for development, easy to deploy for production. The whole stack runs on a single modest server despite handling real-time data from 200+ nodes.

**Version Distribution Analytics**

Software updates in distributed systems are chaos. Some nodes update immediately. Others lag behind for months. Version fragmentation causes compatibility issues.

The dashboard shows version distribution across the network. How many nodes run v1.2.3 versus v1.2.2? Is the latest version being adopted? Are there stragglers on ancient releases?

This visibility helps the Xandeum team coordinate upgrades. They can identify operators running old versions and reach out directly. They can see if a new release is causing problems (adoption stalls = something wrong).

**What I Learned**

**Time-series databases are magic.** Regular databases choke on high-frequency metric data. TimescaleDB handles millions of data points with sub-second queries. Right tool, massive difference.

**Real-time adds complexity.** WebSockets, connection management, state synchronization — significant engineering overhead. Only add real-time when it genuinely matters. For network monitoring, it matters.

**Aggregation is interpretation.** The health scoring required endless tuning. What weights? What thresholds? What matters most? Technical decisions disguised as product decisions.

**Historical data enables prediction.** Cant forecast without history. Store everything, compress old data, query intelligently. Future you will thank past you.

**Building for Eternity**

Xandeum is trying to build permanent storage infrastructure. Data that lasts decades. Networks that outlive their creators.

pNode Pulse is a small piece of that vision. Making sure the nodes stay healthy, the network stays decentralized, the storage stays accessible. Monitoring infrastructure for infrastructure.

Not glamorous work. Nobody tweets about dashboards. But without visibility, distributed systems drift toward failure. Pulse keeps Xandeum honest — 200 nodes, 10 countries, 5 terabytes, one dashboard to watch them all.

---

**Tech Stack:** Next.js 14, TypeScript, TimescaleDB, Redis, tRPC, Prisma, Docker

**Status:** Live, monitoring 200+ nodes

**Links:** [GitHub](https://github.com/RECTOR-LABS/pnode-pulse)

**Coverage:** 200+ nodes • 10+ countries • 5+ TB capacity