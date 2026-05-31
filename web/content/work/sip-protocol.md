---
title: SIP Protocol
slug: sip-protocol
summary: Privacy layer for cross-chain transactions via NEAR Intents + Zcash. Stealth
  addresses & ZK proofs.
category: Privacy
status: Winner
github_url: https://github.com/sip-protocol/sip-protocol
repo_name: sip-protocol/sip-protocol
started_at: '2025-11-15'
launched_at: '2025-12-01'
featured: true
technologies:
- TypeScript
- Next.js 14
- NEAR
- Zcash
- pnpm
- Turborepo
- "@noble/curves"
github_stars: 0
github_forks: 0
---

# SIP Protocol: Because Privacy Shouldn't Be Optional

Here's a thought experiment: what if every time you paid for coffee, everyone in the coffee shop could see your bank balance, transaction history, and who you've been sending money to?

That's blockchain right now. Every transaction, permanently visible, forever linked to your identity. We built a "transparent" financial system and somehow convinced ourselves that's a feature, not a bug.

I wanted to fix that. Enter SIP - Shielded Intents Protocol.

**The HTTPS Moment**

Remember when the web was all HTTP? Every website you visited, every form you submitted, visible to anyone watching the network. Then HTTPS came along, and suddenly everything was encrypted. Same web, same experience, but private by default.

SIP is that, but for blockchain transactions.

```
HTTP    → HTTPS   (Web privacy upgrade)
Intents → SIP     (Blockchain privacy upgrade)
```

The [Zypherpunk Hackathon](https://zypherpunk.xyz) had a NEAR track focused on cross-chain intents. I saw an opportunity to add a privacy layer that nobody was building.

**The Technical Rabbit Hole**

This project sent me deep into cryptography I'd only read about before.

[Pedersen commitments](https://en.wikipedia.org/wiki/Commitment_scheme) - hide the amount you're sending while still proving it's valid. Basically, you commit to a value without revealing it. Mathematical magic.

[Stealth addresses](https://vitalik.eth.limo/general/2023/01/20/stealth.html) - one-time addresses for every transaction. Even if someone knows your main address, they can't link your transactions together. Every payment goes to a fresh address only you can spend from.

Zero-knowledge proofs - prove something is true without revealing any information about it. "Yes, I have enough funds for this swap" without showing your balance.

I spent three days just understanding [EIP-5564](https://eips.ethereum.org/EIPS/eip-5564) (stealth address standard) before writing any code. Worth it.

**The Stack**

Built it as a proper monorepo with [pnpm](https://pnpm.io) and Turborepo:

- `@sip-protocol/sdk` - the main SDK for creating shielded intents
- `@sip-protocol/types` - TypeScript definitions
- `apps/demo` - Next.js reference implementation

The cryptography runs on [@noble/curves](https://github.com/paulmillr/noble-curves) - audited, fast, and actually secure. Not some random npm package with 12 downloads.

[NEAR Intents](https://near.org) handles the cross-chain execution. [Zcash](https://z.cash) provides the shielded pool for actual privacy. The SDK just wraps it all in a developer-friendly API.

**Three Privacy Levels**

Not everyone needs full privacy all the time. So I built three modes:

1. **TRANSPARENT** - Standard public transaction. When you don't care who sees.
2. **SHIELDED** - Full privacy via Zcash. Sender hidden, amount hidden, recipient hidden.
3. **COMPLIANT** - Privacy + viewing key. For institutions that need audit capability.

The last one's important. "But what about regulation?" is the first question everyone asks about privacy tech. COMPLIANT mode means you can prove your transactions to auditors without exposing them to the world. Best of both worlds.

**The Demo That Sold It**

For the hackathon demo, I built a comparison view. Side by side:

Left: Public intent. Shows your wallet, exact amounts, recipient address. Everything exposed.

Right: Shielded intent. Shows only a commitment hash, stealth address, and ZK proof. Solvers can fulfill the trade without knowing who you are.

Same swap. Same result. Completely different privacy story.

The judges got it immediately. "Oh, so it's like... actually private?" Yeah. Actually private.

**Why This Matters**

Privacy isn't about hiding bad stuff. It's about not having to explain yourself constantly.

Imagine if your employer could see every purchase you make. Your landlord. Your insurance company. "Why did you buy that? Why did you go there?" The chilling effect on behavior is real.

Financial privacy is a human right. Not a feature for criminals. We had it with cash - we shouldn't lose it just because we went digital.

**The Win**

Zypherpunk announced results: **SIP Protocol - Winner, NEAR Track, $4,000.**

The feedback highlighted the "HTTPS for blockchain" framing and the practical three-tier privacy model. Sometimes explaining things simply matters more than technical complexity.

**What's Next**

The protocol is still in development. The hackathon proved the concept, but there's work to do:

- Real ZK proof generation (currently mocked)
- Full solver network integration
- Security audit before mainnet

But the foundation is there. The SDK works. The architecture is sound. Someone with more privacy expertise than me could probably take this to production.

And maybe that's the point. Plant seeds. See what grows.

---

**Result:** 🏆 Winner - Zypherpunk Hackathon (NEAR Track)

**Prize:** $4,000

**Tech Stack:** Next.js 14, TypeScript, pnpm Monorepo, @noble/curves, NEAR Intents, Zcash

**Philosophy:** "Privacy is not a feature. It's a right."

**Links:** [GitHub](https://github.com/sip-protocol/sip-protocol)

**See also:** [Web3 Deal Discovery](/work/web3-deal-discovery) (1st place, Solana) • [OpenBudget.ID](/work/openbudget-id) (2nd place, civic tech)
