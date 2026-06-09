---
title: "Auditing Solana's Core: 14 Protocols, 1st of 116, and a Bug in Anchor Itself"
slug: auditing-solana-core
date: 2026-06-09
summary: "I systematically audited 14 of the most-used open-source Solana protocols for a security competition. The result was 1st of 116 — and the worst bug wasn't in a DeFi protocol handling millions. It was in Anchor, the framework nearly everyone builds on."
tags: [security, solana, audit, anchor, smart-contracts]
draft: false
---

A security competition gave me a simple, ruthless prompt: find real, exploitable bugs in open-source Solana code. So I did the systematic thing — picked the 14 most-used protocols in the ecosystem and audited them one by one.

The result was **1st place out of 116 submissions**. (Second and third were autonomous AI agents. More on that at the end.) But the placement wasn't the interesting part. The interesting part was *where* the worst bug lived: not in a DeFi protocol moving millions, but in **Anchor** — the framework nearly every Solana program is built on.

Here is how the audit ran, what it found, and the finding that won it.

## The method: scoring before hunting

A list of "bugs" is worthless if half of them are noise. So before reviewing a single line, I defined how a finding would have to earn its place. Every candidate got scored:

```
TOTAL = SEVERITY × POPULARITY × EXPLOITABILITY × PROOF_QUALITY × FIX_SIMPLICITY
         (1-5)      (1-5)        (1-5)            (1-3)           (1-3)
```

Severity alone is a trap. A "critical" in an abandoned repo, or one that only triggers with admin keys, doesn't matter in the real world. **Popularity and exploitability carry as much weight as severity** — a medium-severity bug in a framework everyone uses, triggerable by anyone, beats a theoretical critical nobody can reach.

On top of the score, every finding had to clear hard gates: the repo had to be actively maintained (a PR to a dead repo never gets reviewed), the bug couldn't already be reported upstream, and the fix had to be a **clean, minimal diff with a working proof-of-concept**. That last constraint is the one most people skip — and it's exactly what separates a real finding from a hunch.

## The targets: 14 of the biggest names on Solana

| Repo | Upstream | Stars |
|------|----------|-------|
| Anchor | coral-xyz | 4,949 |
| Wormhole | wormhole-foundation | 1,875 |
| Agave | anza-xyz | 1,669 |
| Pinocchio | anza-xyz | 849 |
| Jito | jito-foundation | 681 |
| Whirlpools (Orca) | orca-so | 509 |
| Drift | drift-labs | 376 |
| Raydium CLMM | raydium-io | 368 |
| MarginFi v2 | mrgnlabs | 284 |
| Phoenix | Ellipsis-Labs | 246 |
| Metaplex | metaplex-foundation | 243 |
| Pyth | pyth-network | 226 |
| Squads v4 | Squads-Protocol | 171 |
| Kamino (klend) | Kamino-Finance | 158 |

DeFi, infrastructure, frameworks, oracles, multisig — the spread was deliberate. Different protocol classes fail in different ways, and breadth is how you learn which classes fail how.

## The discipline that matters: killing your own findings

Most of the work was not finding suspicious code. It was deciding what was *actually* a bug. Eleven-plus promising leads died under scrutiny, and being right about what **isn't** a vulnerability is half the job:

- **MarginFi** "missing owner check" — the proper checks existed, just in the account-validation layer, not where I first looked.
- **Pyth** "unrestricted price update" — by design. It's a permissionless relay; integrity comes from Wormhole guardian signatures, not access control.
- **Whirlpools** "fee-growth wrapping" — by design. It's the Uniswap v3 pattern, intentional and documented.
- **Kamino** "interest precision loss" — the function is literally named *approximate*. Intended behavior.

A finding isn't real until you've genuinely tried to kill it and failed.

## What the sweep found

Thirteen real findings across seven repos, after the false positives were cleared out:

| Repo | Finding | Note |
|------|---------|------|
| **Anchor** | CPI `Return<T>` discards program ID | framework-level — submitted |
| Phoenix | Ask-side fee underflow | verified |
| Phoenix | Quote-lot validation overflow | verified |
| Phoenix | Multi-order balance underflow | edge case |
| Agave | Vote-state `unwrap` panic | DoS |
| Pinocchio | 3 unchecked-path / offset gaps | defensive |
| Raydium | 2 fee-validation bugs | admin-gated |
| Drift | Oracle confidence inflation + unsafe `unwrap` | low / design |
| Kamino | Division-by-zero in LTV method | low |

And the counterintuitive result: **five of the fourteen were pristine** — Squads, Metaplex, Jito, Wormhole, and Whirlpools turned up zero exploitable issues. Clean is a finding too. Squads' invariant checking and Metaplex's validation are worth studying as hard as any bug; they're what "done right" looks like at scale.

## The finding that won: spoofing CPI return data in Anchor

When one Anchor program calls another and reads its return value, it uses `Return<T>::get()`. Under the hood that calls Solana's `get_return_data()` syscall, which hands back a tuple — `(program_id, data)`. The `program_id` tells you **which program** set that data.

Anchor threw it away:

```rust
// anchor: lang/syn/src/codegen/program/cpi.rs
pub fn get(&self) -> T {
    let (_key, data) = get_return_data().unwrap();
    //   ^^^^ program_id discarded — no validation
    T::try_from_slice(&data).unwrap()
}
```

Here's why that's dangerous. `get_return_data()` reads **global state** — it returns whatever program *most recently* called `set_return_data()` in the transaction's call chain, not a value scoped to your specific CPI. So if anything runs between your call and your `.get()`, the data underneath you can be swapped:

1. You CPI to a program; it legitimately returns `10`.
2. A later call — attacker-influenced — runs `set_return_data(999)`.
3. You call `.get()` and read `999`, trusting it as your callee's value.

For a framework with 4,949 stars that powers most of the ecosystem, **every program reading CPI return values was potentially exposed.** CVSS 7.5 (High).

The kicker: Anchor already knew the correct pattern. The same repository validates the program ID properly in its `token_2022.rs` helpers, three functions away:

```rust
.and_then(|(key, data)| {
    if key != ctx.program_id {
        Err(ProgramError::IncorrectProgramId) // validates the source!
    } else { /* deserialize */ }
})
```

The right pattern existed in the codebase — it just hadn't been applied to the generic `Return<T>` codegen. The fix stores the expected `program_id` on `Return<T>` and checks it in `get()` (with a `get_unchecked()` escape hatch for intentional cross-program reads). Submitted upstream as Issue #4232 / PR #4231, 13/13 tests passing.

(I'll do a full technical deep-dive on this one — PoC programs and all — in a later post.)

## What I took away

- **Severity is the headline; popularity × exploitability is the story.** The finding that mattered most wasn't the scariest in isolation — it was the one that touched the most code and could actually be triggered.
- **The framework is the highest-leverage attack surface.** An app bug hurts one protocol. A framework bug touches everyone downstream of it.
- **Discipline is mostly subtraction.** Eleven plausible findings died under scrutiny. Knowing what *isn't* a bug is the skill.
- **Clean code is a result, not an absence.** Five of fourteen repos were pristine, and studying them taught me as much as the bugs did.

And yes — second and third place went to autonomous AI security agents. I build those too. Which is exactly why it's useful to know, in detail, where they still miss.

---

*If you're shipping on Solana and want this kind of review — or you're building agents and want someone who audits as seriously as he builds — that's what I do. Find more at [rectorspace.com](https://rectorspace.com). Open to contract and full-time.*
