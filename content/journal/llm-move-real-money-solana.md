---
title: "Letting an LLM Move Real Money on Solana — Safely"
slug: llm-move-real-money-solana
date: 2026-06-10
summary: "Most AI agents summarize and suggest. KAMI signs real mainnet transactions on Solana from a plain-English sentence. The hard part wasn't the LLM — it was the trust boundary that lets a probabilistic model touch real money without ever holding a key."
tags: [ai-agents, solana, llm, defi, kamino]
draft: false
---

Most things that call themselves "AI agents" never touch anything that matters. They summarize a page, draft an email, suggest a next step — and a human quietly does the part with consequences. KAMI is different. You type *"deposit 5 USDC into Kamino"* and a few seconds later you are signing a real transaction on Solana mainnet. You type *"will this borrow liquidate me?"* and it reads your actual on-chain position before it answers.

The interesting engineering was never the language model. It was the **trust boundary**: how do you let a probabilistic system orchestrate irreversible, real-money actions without ever giving it the power to drain a wallet or fat-finger a liquidation?

## What KAMI is, and why the stakes are different

KAMI is a conversation-driven frontend for [Kamino Finance](https://kamino.finance/), one of Solana's largest lending protocols. The normal way you interact with on-chain lending is a dashboard: load the page, eyeball APY numbers, do the health-factor math in your head, click, sign. That model scales badly with complexity. KAMI replaces the dashboard with a chat box — plain English in, a natural-language answer out, and when the request is actionable, a ready-to-sign mainnet transaction built with the real Kamino SDK.

It is live at [kami.rectorspace.com](https://kami.rectorspace.com), and it is not a testnet toy. The first thing the repository documents is a proof of life: 0.5 USDC supplied to the Kamino Main Market at ~5.09% APY, signed through the deployed UI and confirmed on-chain. The full deposit → repay → withdraw round-trip runs end-to-end on mainnet.

That "real money, real chain" part is the whole point — and the whole problem. On-chain, there is no rollback. A confused web app throws a 500 and you refresh; a confused agent with signing power can move funds you cannot get back. I audit Solana programs, where the default assumption is that anything that *can* go wrong will be made to go wrong on purpose. I built KAMI with the same assumption.

## The hard part: the trust boundary

### The LLM proposes; the human disposes

The model never holds a key. It orchestrates seven tools — three read-only for situational awareness, four that build transactions — and that is the entire extent of its power.

| Tool | Kind | What it does | klend-sdk primitive |
|------|------|--------------|---------------------|
| `getPortfolio` | read | Live position: deposits, borrows, LTV, health factor | `market.getObligationByAddress` |
| `findYield` | read | Reserves ranked by live supply / borrow APY | `reserve.totalSupplyAPY` |
| `simulateHealth` | read | Projects your health factor after a hypothetical action | `obligation.getSimulatedObligationStats` |
| `buildDeposit` | write | Unsigned `Deposit` transaction | `KaminoAction.buildDepositTxns` |
| `buildBorrow` | write | Unsigned `Borrow`, with a health preflight | `KaminoAction.buildBorrowTxns` |
| `buildWithdraw` | write | Unsigned `Withdraw` (principal + interest) | `KaminoAction.buildWithdrawTxns` |
| `buildRepay` | write | Unsigned `Repay`, with dust-floor recovery | `KaminoAction.buildRepayTxns` |

The read tools give the model eyes. The four write tools each map **one-to-one** onto a real `KaminoAction.build*Txns` primitive — no middleware, no hand-rolled instructions hiding behind a generic "DeFi" abstraction.

The critical detail is what a write tool returns: an *unsigned* transaction, never a signature. The server constructs the transaction for your wallet but has no way to sign it:

```ts
const ownerSigner = createNoopSigner(wallet); // builds for `wallet`, holds no key
const action = await KaminoAction.buildDepositTxns(market, amount, mint, ownerSigner, ...);
const base64Txn = getBase64EncodedWireTransaction(compileTransaction(txMessage));
```

`createNoopSigner` is exactly what it sounds like: a signer that cannot sign. The transaction comes back to the browser as base64 wire bytes, the UI renders a **Sign & Send** card with the exact action and amount, and you sign it in your own wallet. The model proposes; you dispose. There is no code path where the model's output becomes an on-chain action without a human signature in between.

### Deterministic guardrails around a probabilistic core

A clean signing boundary is not enough on its own — you also do not want to sign a doomed transaction. So every build tool runs `simulateTransaction` against the compiled payload *before* it ever reaches you. If your wallet is short on SOL for first-time account rent, KAMI surfaces the exact lamport shortfall instead of letting you discover it by burning a failed-transaction fee. Borrows and deposits reject if the price feed is more than ~600 slots stale. And the system prompt instructs the model to run `simulateHealth` before any borrow and refuse to proceed if the projected position would liquidate.

These are deterministic rails. The model is free to reason *inside* them, but it cannot reason its way *around* a simulation that fails or an oracle that is stale.

### The moment it becomes an agent: recovery by reasoning

Here is where "agentic" stops being a buzzword. Kamino's lending program rejects any action that would leave an obligation below a minimum net value — the `NetValueRemainingTooSmall` dust floor (Anchor error `0x17cc`). It protects solvency, but it breaks the obvious *"repay everything"* flow, which rounds straight into the floor.

KAMI handles this without a single line of hand-coded retry logic. When `buildRepay` fails with the dust-floor error, the model re-calls `getPortfolio` to read the freshly-refreshed amount, then re-calls `buildRepay` with a small buffer (~1% of the borrow). The second attempt confirms. The recovery is not a `try/catch` I wrote — it is a system prompt that teaches the model to read the error and reason about it. The framework handles the loop.

That sequence is not hypothetical. The exact deposit → auto-recovered repay → withdraw round-trip is archived as three signed mainnet transactions:

| Step | Mainnet signature |
|------|-------------------|
| Deposit 5 USDC | [`4QLiam…dYKJ`](https://solscan.io/tx/4QLiamwYufE9423dt2T6Qa4SJsRypjfiX8qrfFmxjq98Fc2Bf4ZSchNvWhpE1SBKtCqJUX5ZXwYJMpL6a4zHdYKJ) |
| Repay (after auto-recovery) | [`utDVX…LCX5`](https://solscan.io/tx/utDVXM4u8ybWUfq1kAkmhH1vd1uHkCoDdSeMhvUZxriS2JDG9VXFwg2epgU8gvNPdX51WZ4YjG1vWBrAngSLCX5) |
| Withdraw 5.200084 USDC | [`5QcBF…CX7x1`](https://solscan.io/tx/5QcBFn6LVMYsNsQjRiF6UhQSJ9WtbYBoDKdeKJycpD3W5pAMorp9ELuuz3MUz6tipQthZGsMYBLQUZngqU2CX7x1) |

That is the real definition of an agent: not a model that generates, but one that acts, observes a failure, and corrects.

## What it took to make it production

A few decisions shaped the build. The tools are deliberately **thin** — each wraps a single Kamino primitive, because a model reasons better about a small, honest surface than a clever one. The serverless target forced real engineering: Vercel Functions cannot upgrade the WebSocket that the standard `confirmTransaction` needs, so KAMI confirms by polling `getSignatureStatuses` and `getBlockHeight` over HTTP until the transaction lands or the blockhash expires. Every RPC call goes through a same-origin proxy with a ten-method allowlist, which keeps the Helius key off the client and sidesteps CORS in one move. None of that is glamorous; all of it, plus 186 tests across 21 files, is what "production" means.

## What generalizes

KAMI is a lending co-pilot, but the architecture generalizes to any agent that acts in the real world:

- **Separate proposal from execution, and gate the irreversible step.** On-chain, that gate is a wallet signature. Elsewhere it is a human approval, a permission check, a dry-run. The model should never be one token away from an action it cannot take back.
- **Wrap the probabilistic core in deterministic guardrails.** Simulate before you commit. Validate freshness. Refuse on projected failure. Let the model reason freely inside rails it cannot cross.
- **"Agentic" is recovery, not generation.** The moment that makes KAMI feel like an agent is not the answer it writes — it is the failure it reads and corrects on its own.

Design for the failure path first. That is an audit habit, and it is exactly what production agents need.

---

*KAMI is open-source and live on mainnet — code at [github.com/RECTOR-LABS/kami](https://github.com/RECTOR-LABS/kami), running at [kami.rectorspace.com](https://kami.rectorspace.com). I build production AI agents on Solana, audit-proven. If you are building agents that touch real value and want them engineered like they will be attacked, that is what I do. More at [rectorspace.com](https://rectorspace.com). Open to contract and full-time.*
