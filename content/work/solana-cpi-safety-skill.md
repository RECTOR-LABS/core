---
title: Solana CPI Safety Skill
slug: solana-cpi-safety-skill
summary: A Claude Code and Codex skill that hardens Solana cross-program invocations
  against four vulnerability classes — built from the audit finding that placed 1st
  of 116.
category: Security
status: Live
github_url: https://github.com/RECTOR-LABS/solana-cpi-safety-skill
repo_name: RECTOR-LABS/solana-cpi-safety-skill
started_at: '2026-06-19'
launched_at: '2026-06-22'
created_at: '2026-06-22T06:30:00.000Z'
featured: true
technologies:
- TypeScript
- Rust
- Anchor
- Pinocchio
- Solana
- LiteSVM
- Claude Code
- npm
github_stars: 1
github_forks: 0
---

# Solana CPI Safety Skill: The Finding That Became a Tool

I took part in Superteam Earn's Solana Security Audit — 14 of the most-used open-source protocols on the chain, 116 people hunting for bugs. I reported 13 findings and placed first. The one that won it wasn't inside any single protocol. It was in Anchor itself, the framework most Solana programs are built on.

Here's the bug in plain terms. When one Solana program calls another, the callee can hand a value back through a pair of syscalls — `set_return_data` on the way out, `get_return_data` on the way back. Picture a shared mailbox bolted to the transaction. Your program calls an oracle, then walks over to the mailbox to read the price it left.

The catch: the mailbox is shared, and Anchor's reader never checked who left the note. Any program that ran earlier in the same transaction could drop a forged price into that slot — and your program would read it as gospel, because the code threw away the one detail that mattered: the id of the program that actually produced the data.

The correct check already existed three functions away in the same repo. It had simply never been wired into the generic path. CVSS 7.5. Fixed upstream.

**It's a Class, Not a Bug**

What stuck with me afterward wasn't the single bug — it was how many of my findings traced back to the same moment: one program calling another.

Cross-program invocation, or CPI, is where Solana gets its composability. It's also where it gets most of its severe, exploitable bugs. The longer I looked, the more the mistakes rhymed. Four classes cover the bulk of the High and Critical CPI findings I'd seen:

- **Return-data spoofing** (Critical) — trusting `get_return_data()` without verifying who produced it. The bug above.
- **Arbitrary CPI** (High) — invoking a program id the attacker supplies, so a counterfeit SPL Token program runs inside your vault.
- **Stale account after CPI** (High) — reading account state a callee just mutated, without reloading it from the ledger.
- **PDA signing** (Medium-High) — `invoke_signed` with non-canonical bumps or leaked seeds, opening the door to unauthorized signatures.

Return-data spoofing is the meanest of the four: the least documented, and the hardest to catch in review, because the dangerous line looks completely ordinary.

**From a Finding to a Skill**

A finding helps one protocol. A pattern, written down, helps everyone. So I turned the defense into something reusable — a skill for Claude Code and Codex, built for the Solana AI Kit.

It teaches the assistant to recognize, explain, and fix all four classes, in both Anchor and native/Pinocchio code. Inside:

- a routing `SKILL.md` that hands off to a focused sub-skill per vulnerability class,
- an `/audit-cpi` command that scans a Solana repo and returns a structured findings report,
- a `cpi-auditor` agent that runs the audit end to end and proposes fixes in the right idiom.

The point is simple: knowledge that took a 116-person competition to surface should be one install away, sitting in the editor where the code is actually written.

**Proof, Not Claims**

This is the part I care about most. An auditor's habit is to never just assert a bug exists — you prove it. So the skill ships five runnable proofs of concept, one per class (return-data spoofing gets two).

Each PoC pairs real on-chain programs — an attacker and a victim — with a LiteSVM test suite that runs three cases:

- **Exploit** — the vulnerable program gets owned: it adopts the spoofed price, accepts the fake token program, or passes a solvency check against a vault that was already drained.
- **Defense** — the fixed program rejects the attack with a specific, named error.
- **Positive control** — the fixed program still accepts the legitimate path, proving the fix didn't just break everything.

The return-data PoC goes further, with a deeper-stack variant where the spoof leaks up through an innocent relay, plus a second proof written against raw Pinocchio rather than Anchor. The programs are precompiled and committed, so anyone can clone the repo and watch the exploits run with nothing but Node installed — no toolchain, no trust required:

```bash
npx @rector-labs/solana-cpi-safety-skill   # install the skill globally
# then, in any Solana project:
/audit-cpi
```

It's MIT-licensed, live on npm, and drops into the Solana AI Kit as a submodule.

**Find, Prove, Respond**

This skill is the first of three. The plan is a complete Solana security workflow:

- **solana-cpi-safety** — find and prevent the vulnerability classes. (This one — available now.)
- **solana-poc-forge** — forge the runnable exploit once something looks wrong. (Planned.)
- **solana-incident-response** — triage, contain, and disclose a live incident. (Planned.)

There's a reason I'm shipping these as skills instead of blog posts. More and more Solana code is being written with AI in the loop. If the defense that catches these bugs lives in that same loop — in the agent, at the moment the code is generated — it stops the bug before it ever ships. That's a far better place to catch a CVSS 7.5 than a post-mortem.

---

**Result:** Live — public and on npm as `@rector-labs/solana-cpi-safety-skill`. The first of the RECTOR-LABS Solana security suite.

**Tech Stack:** TypeScript, Rust, Anchor, Pinocchio, Solana, LiteSVM, Claude Code, npm

**The finding behind it:** Anchor CPI return-data spoofing — CVSS 7.5, fixed upstream — 1st of 116 in Superteam Earn's Solana Security Audit.

**Links:** [GitHub](https://github.com/RECTOR-LABS/solana-cpi-safety-skill) • [npm](https://www.npmjs.com/package/@rector-labs/solana-cpi-safety-skill)

**See also:** [Auditing Solana's Core](/journal/auditing-solana-core) (the full audit write-up) • [SIP Protocol](/work/sip-protocol) (privacy, ZK)
