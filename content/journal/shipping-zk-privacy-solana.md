---
title: "From Hackathon Demo to Mainnet — Shipping ZK Privacy on Solana"
slug: shipping-zk-privacy-solana
date: 2026-06-11
summary: "SIP Protocol started as a hackathon demo with mocked proofs and a note that said 'someone could take this to production.' Six months and 1,008 commits later: real Noir circuits, two Anchor programs live on Solana mainnet, and a 3,900-test SDK. This is what the distance between a demo and a shipped protocol actually looks like."
tags: [solana, zk-proofs, privacy, cryptography, shipping]
draft: false
---

Every payment you make on Solana is public. The amount, the sender, the recipient — indexed forever, linkable to everything else you have ever done with that wallet. Pay a contractor and they can see your treasury. Receive a salary and anyone can chart it. We built the most transparent financial system in history and called the bug a feature.

SIP — the Shielded Intents Protocol — is my answer to that. It started in December 2025 as a [Zypherpunk Hackathon](https://zypherpunk.xyz) entry that won across three tracks ($6,500, #9 of 93 entries), with a 1st-place sponsor-track win at the Solana Graveyard Hackathon close behind. The write-up I published back then ended with an honest confession: the ZK proofs were mocked, and "someone with more privacy expertise could probably take this to production."

Six months later, that someone turned out to be me — with the Solana Foundation betting on the same outcome along the way. The mocked proofs are real Noir circuits now. Two Anchor programs are live on Solana mainnet. The SDK is published, versioned, and covered by about 3,900 tests. This post is about the distance between those two states — because the gap between a winning demo and a shipped protocol is where almost every crypto project dies.

## What SIP actually does

Three cryptographic pieces, each hiding one thing a transparent chain exposes:

| Exposure on a public chain | SIP's answer | How |
|---|---|---|
| **Who receives** | Stealth addresses | A fresh one-time address per payment, derived ECDH-style — only the recipient can detect and spend it |
| **How much** | Pedersen commitments | `C = v*G + r*H` — the chain stores a commitment that hides the value but still binds the sender to it |
| **Is it valid?** | Zero-knowledge proofs | Three Noir circuits (funding, validity, fulfillment) prove balance, authorization, and correct delivery without revealing any of it |

The framing that won the hackathon still holds:

```
HTTP    -> HTTPS   (web privacy upgrade)
Intents -> SIP     (transaction privacy upgrade)
```

Same chain, same UX, private by default. And because "private" cannot mean "unaccountable," SIP has a third mode beyond transparent and shielded: **compliant** — a hierarchical viewing-key system (master key deriving auditor-, regulator-, time-, and purpose-scoped keys, XChaCha20-Poly1305 under the hood) that lets you disclose selectively to an auditor without exposing yourself to the world. Privacy by default, auditability by consent.

## The hard part: privacy on a chain with no shadows

Zcash gets privacy from a shielded pool baked into the protocol. Solana gives you nothing — every account is public state, every instruction is visible. You cannot hide *on* Solana. What you can do is make what's visible **unlinkable**, and that reframing drove the entire on-chain design.

The shipped flow is a two-program dance:

1. **Deposit** — the sender escrows SPL tokens into `sipher-vault`. This step is public by design; no privacy is claimed yet.
2. **Withdraw to stealth** — the vault releases funds toward a freshly derived one-time stealth address, carrying a Pedersen commitment instead of a readable amount-and-recipient pair.
3. **Announce** — `sipher-vault` makes a CPI call into `sip-privacy`, which records the ephemeral public key recipients need, as an announcement memo.
4. **Scan and claim** — the recipient scans announcements off-chain, derives the one-time key, and claims from an address no observer can link back to them.

`sipher-vault` is the escrow half: tokens go in publicly (no privacy claim there), and leave toward a stealth address carrying a Pedersen commitment instead of a readable association. `sip-privacy` is the announcement half: a CPI call records the ephemeral public key that recipients need for off-chain scanning. Nullifier tracking prevents double-claims; a refund timeout state machine handles the case where a recipient never shows up. Both programs are live on mainnet — and yes, the vanity IDs were worth the grind: `S1PMFspo…9at` and `S1Phr5rm…kHB`.

What made this genuinely hard was not any single instruction. It was that **privacy properties are systemic**: one leaked linkage anywhere — a reused ephemeral key, an amount that round-trips in the clear, a timing correlation between deposit and claim — and the cryptography upstream of it bought you nothing. You end up reasoning about the union of every observer's view across both programs, the memo log, and the token accounts. That is an audit mindset, not a feature mindset, and it is the part I could not have shipped at hackathon speed.

## The second hard part: proofs in the browser

A privacy protocol that generates your proofs on a server is a surveillance protocol with extra steps. Whoever runs the prover sees your secrets. So SIP's proofs are generated client-side: Noir circuits compiled to a Barretenberg WASM backend running entirely in the browser.

Making that production-grade was unglamorous engineering: circuit artifacts run past 100KB and proof generation takes seconds, so the SDK lazy-loads the prover, caches compiled artifacts through a multi-tier cache (memory, then IndexedDB), and hides the whole thing behind a `ProofProvider` interface. That interface is also what makes the test suite possible — a `MockProofProvider` keeps 3,900+ tests fast and deterministic while `NoirProofProvider` does the real cryptography in production. No trusted server, no proof outsourcing, nothing to subpoena.

## What "shipped" actually took

The numbers, because shipping stories should have receipts:

- **1,008 commits** between Nov 26, 2025 and today — roughly 200 days of sustained building
- **17 milestones** (M1 foundation through M17 same-chain privacy), shipped in sequence
- **7 published npm packages** — `@sip-protocol/sdk@0.11.1` plus types, react, react-native, cli, api, and sns-stealth
- **$16,000 in Solana Foundation backing** — a $10K grant plus a $6K audit subsidy, funding the same-chain privacy work and the external security audit on the roadmap
- **245 test files / ~3,938 tests** across the monorepo, CI-gated with lint, typecheck, and coverage
- **2 Anchor programs on mainnet**, 3 Noir circuits, and an Ethereum verifier suite already on Sepolia for the cross-chain phase

None of those numbers is the point by itself. The point is the shape of the work: the hackathon took two weeks and produced the *idea*; production took six months and produced maybe 5% novel cryptography and 95% systems engineering — key derivation that has to be right forever, caches, retries, refund paths, CI, and tests for failure modes I hope no user ever sees.

## Lessons that generalize

**Milestones are how solo projects survive.** Seventeen named milestones, each independently shippable, is the only reason a one-person protocol crossed six months without stalling. "Done with M12" is a fact; "almost done with the protocol" is a mood.

**The cryptography is the easy part.** Audited curve libraries and a mature proving stack exist. What does not exist until you build it is everything around the math — and that surrounding system, not the math, is what users actually touch and what attackers actually probe.

**Compliance is a design input, not a retrofit.** The viewing-key hierarchy exists because "how does this survive an auditor?" was asked at architecture time. Privacy tech that cannot answer that question stays a demo forever.

---

*SIP Protocol is open-source at [github.com/sip-protocol/sip-protocol](https://github.com/sip-protocol/sip-protocol), live at [sip-protocol.org](https://sip-protocol.org). I build production systems on Solana — privacy protocols, AI agents, and the audits that keep them honest. More at [rectorspace.com](https://rectorspace.com). Open to contract and full-time.*
