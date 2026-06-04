---
title: Earn Auto Reviewer
slug: earn-auto-reviewer
summary: An eight-judge AI panel that evaluates Superteam Earn bounty submissions in parallel — specialized reviewers for security, performance, testing, and more.
category: AI Agents
status: Draft
github_url: https://github.com/RECTOR-LABS/earn-auto-reviewer
repo_name: RECTOR-LABS/earn-auto-reviewer
created_at: '2025-12-24'
featured: false
technologies:
- Next.js 15
- React 19
- TypeScript
- Claude 3.5 Haiku
- OpenRouter
- Octokit
github_stars: 0
github_forks: 0
---

# Earn Auto Reviewer: Teaching AI to Judge Code

[Superteam Earn](https://earn.superteam.fun) processes hundreds of bounty submissions monthly. Developers submit code, reviewers evaluate it, winners get paid. Simple in theory. Exhausting in practice.

I watched reviewers burn out. Same patterns appearing submission after submission. Missing tests. Poor documentation. Security issues that should be caught automatically. Reviewers spending hours on work that felt mechanical.

What if AI could handle the mechanical parts? Not replace human judgment, but filter and prioritize. Catch the obvious issues. Let humans focus on what matters.

**The Eight-Judge Panel**

One AI reviewer isnt enough. Code quality has dimensions. Security differs from performance differs from documentation. A single prompt trying to evaluate everything produces mediocre results everywhere.

So I built a panel. Eight specialized judges, each an expert in their domain:

- **Architecture Judge** — Structure, patterns, modularity, separation of concerns
- **Security Judge** — Vulnerabilities, input validation, authentication, data exposure
- **Performance Judge** — Efficiency, algorithmic complexity, resource usage
- **UX/DX Judge** — Developer experience, API design, error messages, usability
- **Testing Judge** — Coverage, edge cases, test quality, mocking strategies
- **Documentation Judge** — Comments, READMEs, API documentation, clarity
- **Innovation Judge** — Creativity, novel approaches, problem-solving elegance
- **DevOps Judge** — Deployment, CI/CD, containerization, infrastructure

Each judge runs in parallel. Eight evaluations happening simultaneously. Thirty seconds total, not thirty seconds times eight.

**The Scoring System**

Raw opinions dont help. Reviewers need actionable data. So each judge produces structured output:

- Numerical score (0-100)
- Severity-tagged findings (critical, major, minor, suggestion)
- Specific file and line references where possible
- Concrete recommendations for improvement

These roll up into four weighted dimensions:

- Code Quality: 40 points
- Completeness: 30 points
- Testing: 20 points
- Innovation: 10 points

Final score maps to letter grades. An A+ submission looks different from a C-. Reviewers can prioritize their queue by grade, focusing human attention where it matters most.

**Token Economics**

AI isnt free. And bounty platforms operate on thin margins. The system needed to be cheap.

Claude 3.5 Haiku through [OpenRouter](https://openrouter.ai) hits the sweet spot. Fast, capable, inexpensive. Each review costs under five cents. At scale, closer to two cents. Thats sustainable for a platform processing thousands of submissions.

But tokens add up with large codebases. A 50,000-line repository cant go through AI raw. Smart optimization was essential:

- Filter boilerplate (node_modules, build artifacts, lock files)
- Prioritize source code over configuration
- Summarize rather than include verbose files
- Chunk large files with overlap for context

The optimizer reduces token usage by 60-80% without meaningful quality loss. The AI sees what matters.

**Real-Time Streaming**

Nobody wants to stare at a loading spinner for thirty seconds. The UI streams analysis as it happens. Watch judges complete one by one. See findings populate in real-time. Progress bars that actually reflect progress.

This was harder than expected. Server-sent events, streaming responses, managing eight parallel processes with unified output. But the experience transforms from "is it working?" to "watching intelligence unfold."

**Why This Matters for Superteam**

Superteam Earn connects builders with bounties across the Solana ecosystem. Quality control is essential — sponsors expect good work, contributors expect fair evaluation.

Manual review doesnt scale. As the platform grows, reviewer burden grows. Eventually something breaks — either review quality drops or response times explode.

Auto Reviewer changes the equation. AI handles first-pass filtering. Obvious rejections get flagged early. Strong submissions surface quickly. Human reviewers spend time on edge cases where judgment matters.

The goal isnt replacing humans. Its amplifying them. One reviewer with AI assistance processes more submissions at higher quality than three reviewers doing everything manually.

**The Technical Stack**

Frontend runs [Next.js 15](https://nextjs.org) with [React 19](https://react.dev) — latest everything because why not. TypeScript throughout. [Tailwind CSS](https://tailwindcss.com) for styling.

Backend uses the GitHub REST API via [Octokit](https://github.com/octokit/octokit.js). Fetches PRs, repositories, commits, branches — whatever URL you throw at it. Parser extracts relevant code and metadata.

AI calls go through OpenRouter to Claude. Structured prompts, JSON responses, parallel execution with Promise.all. Error handling because AI services occasionally hiccup.

Deployment on [Vercel](https://vercel.com) for simplicity. Docker-ready for self-hosting if Superteam wants to run it internally.

**What I Learned**

**Parallel beats sequential.** Eight judges at once instead of one after another. Simple architectural choice, dramatic performance improvement. Always ask: can this be parallel?

**Structured output is essential.** Free-form AI responses vary wildly. JSON schemas with required fields produce consistent, parseable results. Enforce structure at the prompt level.

**Streaming improves perceived performance.** Real progress feels faster than hidden progress. Users tolerate longer waits when they see activity.

**Token optimization is an art.** What to include, what to exclude, how to summarize. The optimizer is as important as the AI itself.

**Specialization beats generalization.** One expert judge per domain outperforms one generalist trying to evaluate everything. Divide and conquer applies to AI too.

**The Bigger Picture**

Code review AI is everywhere now. Copilot does it. Various startups do it. But the eight-judge panel approach — specialized experts operating in parallel — thats different.

Its how human review committees work. Security expert checks security. Performance expert checks performance. Each brings domain depth that generalists lack.

AI can work the same way. Not one model pretending omniscience, but multiple perspectives combining into comprehensive evaluation.

Earn Auto Reviewer is a proof of concept. The pattern applies anywhere code needs assessment at scale. Open source contributions. Job applications. Educational grading. Anywhere human review bottlenecks exist.

---

**Tech Stack:** Next.js 15, React 19, TypeScript, Claude 3.5 Haiku, OpenRouter, Octokit

**Status:** Live and processing submissions

**Links:** [GitHub](https://github.com/RECTOR-LABS/earn-auto-reviewer)

**Cost:** Under 5 cents per review