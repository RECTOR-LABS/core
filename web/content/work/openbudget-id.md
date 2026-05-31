---
title: OpenBudget.ID
slug: openbudget-id
summary: Government spending transparency on Solana for Indonesia. Ministries publish
  on-chain, citizens verify.
category: Civic Tech
status: Winner
github_url: https://github.com/RECTOR-LABS/openbudget-id
live_url: https://openbudget.rectorspace.com
repo_name: RECTOR-LABS/openbudget-id
started_at: '2025-10-15'
launched_at: '2025-10-20'
created_at: '2026-03-14T07:28:09.385Z'
featured: true
technologies:
- Solana
- Anchor
- Next.js 14
- PostgreSQL
- Tailwind CSS
- NextAuth
- Rust
github_stars: 0
github_forks: 0
---

# OpenBudget.ID: Bringing Transparency to Indonesian Government Spending

Indonesia has a corruption problem. Everyone knows it. The question is: what do you do about it?

Garuda Spark hackathon - organized by Superteam Indonesia with the Ministry of Communication and Ministry of Creative Economy - had a simple brief: use blockchain for social good. And I thought... what if citizens could actually verify where their tax money goes?

**The Problem Nobody Talks About**

Government budget allocation in Indonesia is essentially a black box. Money gets allocated. Money gets spent. Reports come out quarterly, sometimes annually. By then, the money's gone, and nobody can verify if it went where it was supposed to.

This isn't malice (usually). It's just bad infrastructure. Paper trails. PDF reports. Systems that don't talk to each other. Plenty of opportunity for things to "get lost."

Blockchain is literally an immutable public ledger. Why aren't we using it for this?

**The Core Insight**

Here's what I realized: you don't need to put everything on-chain. You just need to put the right things.

Ministry publishes a project: "We're spending Rp 500 million on Creative Economy Grants." That goes on Solana. Timestamp, amount, recipient category. Immutable.

They release funds for milestone 1: "Rp 100 million released, here's the proof document." That goes on Solana too. Transaction hash, proof URL, timestamp.

Now any citizen can verify: yes, the ministry really did release this money, on this date, for this purpose. No PDF that could've been edited. No report that could've been delayed. Blockchain truth.

**Blockchain as Infrastructure, Not Interface**

The biggest design decision: hide the blockchain from users who don't care about it.

Ministry staff log in with Google. They create projects in a normal web form. They click "Publish to Blockchain" and connect a wallet once. After that, everything just works. They don't need to understand PDAs or transaction signatures.

Citizens browse projects without logging in. They see progress bars, milestone timelines, budget breakdowns. If they want to verify, they click "View on Solana Explorer" and see the raw blockchain data. But they don't have to.

The blockchain is infrastructure. Like how you don't think about DNS when visiting a website. This same philosophy powered my [Web3 Deal Discovery](/work/web3-deal-discovery) win.

**The 4-Day Sprint**

This was the most compressed timeline I've ever worked with.

**Day 1:** Solana program with Anchor. 4 instructions: initialize platform, create project, add milestone, release funds. 14 tests passing. Deployed to devnet by midnight.

**Day 2 Morning:** PostgreSQL schema. API routes. The hybrid architecture where blockchain is source of truth, database is cache for fast queries.

**Day 2 Afternoon:** Admin dashboard. Google OAuth. Wallet integration. Real blockchain transactions from the UI.

**Day 3:** Public citizen dashboard. Project browsing. Milestone timelines. Verification links. Then citizen engagement features - comments, ratings, watchlist, issue reporting.

**Day 4:** Analytics dashboard. Ministry leaderboard. Spending trends. Anomaly detection. Then deploy to VPS and record demo video.

I slept maybe 12 hours total. Worth it.

**The Self-Healing Database**

One of my favorite technical bits: the database heals itself from the blockchain.

See, in development, Next.js Fast Refresh sometimes interrupts database writes. You release funds on-chain, but the database update fails. Now you have inconsistent state.

So I built automatic recovery. When the system detects a mismatch, it queries the blockchain (source of truth), finds the actual transaction, and fixes the database. No manual intervention.

Citizens always see accurate data because the blockchain can't lie.

**The Analytics Layer**

For the hackathon judges, I added an analytics dashboard:

- **Ministry Leaderboard:** Ranked by completion rate, budget accuracy, release speed, trust score
- **Spending Trends:** Time-series visualizations with Recharts
- **Anomaly Detection:** Automatic flags for low release rates, missing proofs, budget discrepancies

This is where blockchain data becomes actionable. Not just "here's what happened" but "here's what looks suspicious."

**Demo Day**

Live demo for the judges:

1. Login as ministry → Create project → Publish to blockchain → Show transaction hash
2. Switch to public view → Browse as citizen → Click project → See milestones
3. Release funds → Show Solana Explorer → Prove immutability

The whole thing took 8 minutes. Clean. No crashes. (Thank Allah, because I'd only rehearsed twice.)

**The Result**

🥈 **2nd Place - Garuda Spark Hackathon - 1,500 USDC**

First place went to a project with more direct ministry partnerships already lined up. Fair enough. They had a head start on the "actually deploy this" part.

But the technical foundation we built? Solid. The concept? Validated. The code? Open source and ready for anyone to fork.

**Impact Potential**

Indonesia's government budget is around Rp 3,000 trillion annually. Even tracking 1% of that transparently would be Rp 30 trillion visible on-chain.

Imagine: every citizen can verify if the road construction in their village actually got funded. If the school grant actually went to the school. If the healthcare budget actually reached the hospital.

That's the dream. Garuda Spark was proof it's technically possible.

**What I Learned**

Building for government is different. You can't assume tech literacy. You can't assume crypto familiarity. Everything needs to be obvious.

But that constraint makes you build better products. If a ministry staff member can use it, anyone can.

Also: civic tech is underrated. There's so much opportunity to use these tools for actual public good, not just DeFi derivatives. (Though I also explored privacy tech in [SIP Protocol](/work/sip-protocol).)

---

**Result:** 🥈 2nd Place - Garuda Spark Hackathon

**Prize:** 1,500 USDC

**Organizers:** Superteam Indonesia × Ministry of Communication × Ministry of Creative Economy

**Tech Stack:** Solana Anchor, Next.js 14, PostgreSQL, Tailwind CSS, NextAuth

**Links:** [GitHub](https://github.com/RECTOR-LABS/openbudget-id) • [Live Demo](https://openbudget.rectorspace.com)
