---
title: Sanctum Gateway
slug: sanctum-gateway
summary: Transaction analytics that translate cryptic Solana transactions into human-readable insights for the Sanctum ecosystem.
category: Developer Tools
status: Draft
github_url: https://github.com/RECTOR-LABS/sanctum-gateway-track
repo_name: RECTOR-LABS/sanctum-gateway-track
created_at: '2025-12-24'
featured: false
technologies:
- TypeScript
- Next.js
- tRPC
- PostgreSQL
- Solana Web3.js
github_stars: 0
github_forks: 0
---

# Sanctum Gateway Track: Making Sense of Solana Transactions

Solana transactions are cryptic. Raw instruction data, nested program calls, compressed logs that require decoder rings to interpret. Even experienced developers struggle to understand what happened in complex transactions.

[Sanctum](https://sanctum.so) operates critical DeFi infrastructure on Solana — liquid staking, validator routing, the Infinity pool. Their users and partners need to understand transaction flows, verify operations completed correctly, and debug when things go wrong.

Sanctum Gateway Track provides that understanding. Transaction analytics that translate chain gibberish into human-readable insights.

**The Readability Problem**

Query any Solana transaction through standard explorers. You'll see:

- Program IDs (32-byte base58 strings)
- Instruction data (hex blobs)
- Account arrays (more 32-byte strings)
- Log messages (program-specific formats)

Understanding what actually happened requires:
- Knowing which program ID maps to which protocol
- Having the IDL to decode instruction data
- Understanding the protocol's account model
- Parsing log messages according to program-specific conventions

This is exhausting. Even builders working daily with Solana transactions find themselves confused. End users have zero chance.

**The Gateway Approach**

Sanctum Gateway Track processes raw transactions and produces structured, readable output:

**Action Identification** — "This transaction staked 100 SOL through Sanctum's validator router"

**Account Labeling** — "The token account at abc...xyz belongs to wallet def...uvw and holds USDC"

**Flow Visualization** — "SOL moved from User → Router → Validator Pool, receiving stSOL in return"

**Success/Failure Analysis** — "Transaction succeeded but inner instruction #3 returned an error that was caught"

The raw data is still available. But now it's annotated, organized, labeled. Understanding happens in seconds instead of minutes.

**Technical Architecture**

The system ingests transaction data from Solana RPC nodes. Parsers decode instructions using protocol-specific IDLs. Analyzers classify transaction types and extract semantic meaning.

**Parser Layer:**
- Anchor IDL integration for typed instruction decoding
- Native program support (System, Token, Associated Token)
- Sanctum-specific decoders for their proprietary programs
- Fallback raw display when schemas unavailable

**Analysis Layer:**
- Transaction type classification (stake, unstake, swap, transfer, etc.)
- Cross-reference with known addresses (labeled accounts)
- Fee calculation and cost attribution
- Multi-instruction flow reconstruction

**Presentation Layer:**
- JSON API for programmatic access
- Web dashboard for visual exploration
- Exportable reports for documentation/compliance

Built with [TypeScript](https://www.typescriptlang.org) throughout. [Next.js](https://nextjs.org) frontend, tRPC API routes, PostgreSQL for caching and historical queries.

**Why Sanctum Needed This**

Sanctum handles significant volume — hundreds of millions in TVL, thousands of daily transactions. When something goes wrong, support teams need to quickly understand what happened.

Before Gateway Track:
1. User reports issue
2. Support requests transaction signature
3. Engineer manually decodes transaction
4. 30 minutes later: "Oh, the slippage tolerance was exceeded"

After Gateway Track:
1. User reports issue
2. Support pastes transaction signature
3. Dashboard immediately shows: "Swap failed: slippage exceeded, user received 0 tokens"
4. Resolution in 2 minutes

For integration partners, the API enables automated monitoring. Their systems query transaction status, receive structured data, and react programmatically. No human interpretation required.

**The Labeling Challenge**

Addresses are meaningless without context. "GnCaQ9WVN..." tells you nothing. "Sanctum Validator Router Program" tells you everything.

Building a comprehensive address label database is ongoing work:
- Official program deployments (verified from protocol docs)
- Known wallets (treasury addresses, team multisigs)
- Protocol infrastructure (pools, vaults, escrows)
- Ecosystem contracts (DEXes, bridges, oracles)

Labels accumulate over time. Each new label improves readability for every transaction involving that address.

**Multi-Instruction Complexity**

Simple transactions are easy. Send SOL from A to B. One instruction, obvious meaning.

Sanctum transactions are complex. A single stake operation might involve:
1. Create associated token account
2. Approve token transfer
3. Invoke validator router
4. Route to specific validator
5. Mint liquid staking token
6. Transfer staking token to user

Understanding this requires following the entire chain, recognizing intermediate steps, and summarizing the overall action.

Gateway Track handles this through instruction graph analysis. It identifies entry points, traces execution flow, and collapses complexity into meaningful summaries while preserving detail for those who need it.

**What I Learned**

**Every protocol is different.** No universal decoder handles all Solana programs. Each protocol has quirks, conventions, undocumented behaviors. Supporting a new protocol means learning its specific patterns.

**Labels are surprisingly valuable.** The simple act of naming things transforms usability. Technical work on decoders matters less than the humble label database.

**Historical context helps.** Some transaction interpretation requires knowing prior state. "This unstake withdrew 50% of position" only makes sense if you know the position size before.

**Developers need this too.** Initially built for end users, but developers became heavy users. Debugging complex transactions is universally painful.

**The Broader Application**

Transaction analytics isn't Sanctum-specific. Every Solana protocol needs it. DeFi, NFTs, gaming — all have complex transactions that benefit from interpretation.

Gateway Track's architecture is generalizable. New parser plugins for new protocols. Expanded label databases. The same analysis patterns apply across ecosystems.

Maybe this becomes a product. Maybe it stays infrastructure for Sanctum. Either way, the problem — making blockchain transactions readable — isn't going away. If anything, it gets worse as transactions get more complex.

---

**Tech Stack:** TypeScript, Next.js, tRPC, PostgreSQL, Solana Web3.js

**Status:** Live for Sanctum ecosystem

**Links:** [GitHub](https://github.com/RECTOR-LABS/sanctum-gateway-track)

**Purpose:** Transaction analytics and insights for Solana developers