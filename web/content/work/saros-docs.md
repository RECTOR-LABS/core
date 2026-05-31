---
title: Saros SDK Docs
slug: saros-docs
summary: Comprehensive Docusaurus documentation for Saros Finance SDKs with interactive
  API Explorer.
category: Documentation
status: Winner
github_url: https://github.com/rz1989s/saros-docs
live_url: https://saros-docs.rectorspace.com
repo_name: rz1989s/saros-docs
started_at: '2024-11-15'
launched_at: '2024-12-15'
featured: true
technologies:
- Docusaurus
- TypeScript
- React
- Algolia
- Vercel
- MDX
github_stars: 0
github_forks: 0
---

# Saros SDK Docs: Why I Spent a Month Writing Documentation

Let me tell you something that'll sound crazy: I won $300 for writing documentation.

Not code. Not a dApp. Not a smart contract. Documentation. And honestly? It was one of the most satisfying projects I've ever done.

**The Bounty**

December 2024. [Saros Finance](https://saros.xyz) - a DeFi protocol on Solana - posts a bounty on their Discord: "SDK Guide Challenge." Create comprehensive documentation for their TypeScript, DLMM, and Rust SDKs. Best submission wins.

Most developers see "documentation" and run the other way. I saw an opportunity.

**Why Docs Matter**

Here's the thing about developer tools: they live or die by their documentation.

I've used brilliant libraries that I abandoned because I couldn't figure out how to use them. I've used mediocre libraries that I stuck with because their docs were crystal clear.

Saros had solid SDKs. What they didn't have was a clear path from "I just installed this" to "I'm building production dApps." That gap? That's what I filled.

**The Docusaurus Deep Dive**

I went with [Docusaurus](https://docusaurus.io) - Meta's documentation framework. Same thing React, Jest, and a hundred other projects use. Fast, searchable, dark mode built-in.

But I didn't just spin up a default template. I customized everything:

- **Interactive API Explorer:** Test SDK methods directly in the browser. No local setup needed.
- **Working Code Examples:** Not pseudocode. Actual TypeScript that compiles and runs.
- **Algolia DocSearch:** Instant search across all documentation.
- **Mobile Responsive:** Because developers read docs on their phones too (usually at 2am debugging something).

The API Explorer was the killer feature. You paste in a token address, click "Execute," and see real Solana data come back. Try before you code.

**The Content Strategy**

Good documentation follows a journey:

1. **Getting Started:** Install the SDK, make your first call, see it work.
2. **Core Concepts:** Understand the mental model before diving deep.
3. **Tutorials:** Step-by-step guides for common tasks.
4. **API Reference:** Every method, every parameter, every return type.
5. **Examples:** Real code solving real problems.

I wrote all of it. Three SDKs (TypeScript, DLMM, Rust). Six complete examples with tests. Tutorial sections that actually make sense.

Total: about 15,000 words of documentation. Plus all the code.

**The Writing Process**

Here's my documentation workflow:

1. **Use the SDK myself.** Build something small. Note every confusion point.
2. **Write for the confused past-me.** What did I wish someone had told me?
3. **Show, don't tell.** Every explanation comes with a code snippet.
4. **Test every example.** Copy-paste from docs into editor. Does it work? If not, fix the docs.

That last point is crucial. Nothing kills trust faster than documentation examples that don't compile. Every single code block in my docs was tested.

**The Little Details**

Some things I obsessed over:

- **Consistent formatting.** Every code block uses the same style. Every API method follows the same template.
- **Proper TypeScript.** Not `any` types everywhere. Real interfaces, real types, real IDE support.
- **Error handling examples.** Not just happy paths. What happens when things fail?
- **Links everywhere.** Cross-reference related concepts. Make it easy to jump around.

I also added a performance optimization section. How to batch RPC calls. How to handle rate limits. The stuff that's obvious to experienced devs but crucial for beginners.

**The Submission**

Deployed to Vercel: [saros-docs.rectorspace.com](https://saros-docs.rectorspace.com)

Wrote a detailed submission explaining my approach. Linked to the GitHub repo. Showed the interactive features.

Then waited.

**The Win**

🥇 **1st Place - Saros SDK Guide Challenge - $300 USDC**

The Saros team actually reached out about integrating parts of my docs into their official site. That felt better than the money, honestly.

**What I Learned**

Documentation is a product. It has users, it has UX, it has success metrics. Treating it as an afterthought is why most docs suck.

Also: there's real money in docs. Not just bounties, but careers. Developer Advocate roles pay well precisely because most developers can't (or won't) communicate clearly.

And finally: writing documentation makes you a better developer. You can't explain something you don't understand. The process forces clarity.

**The Irony**

I'm now building documentation sections for all my projects. [CORE](/work/core) has a CLAUDE.md (for AI assistants). My hackathon projects — [Web3 Deal Discovery](/work/web3-deal-discovery), [SIP Protocol](/work/sip-protocol), [OpenBudget.ID](/work/openbudget-id) — have comprehensive READMEs.

Because if I learned anything from this bounty, it's that good docs are a competitive advantage. In a world of half-explained GitHub repos, clear documentation stands out.

$300 for a month of work isn't much. But the skill of writing great docs? That pays forever.

---

**Result:** 🥇 1st Place - Saros SDK Guide Challenge

**Prize:** $300 USDC

**What I Built:** Docusaurus site with interactive API Explorer, 15+ tutorials, 6 working examples

**Tech Stack:** Docusaurus 3, TypeScript, Algolia DocSearch, Vercel

**Links:** [Live Site](https://saros-docs.rectorspace.com) • [GitHub](https://github.com/rz1989s/saros-docs)
