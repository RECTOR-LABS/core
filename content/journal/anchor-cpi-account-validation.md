---
title: "Validate the Source: The Solana Bug Class Hiding Inside Anchor Itself"
slug: anchor-cpi-account-validation
date: 2026-06-15
summary: "Most Solana exploits are one mistake wearing different masks — trusting a value without checking where it came from. Anchor's account constraints exist to stop exactly that. So it's worth knowing about the one path the framework's own net didn't cover: CPI return-data spoofing, CVSS 7.5, found during my 14-protocol audit."
tags: [security, solana, anchor, cpi, smart-contracts]
draft: false
---

In my [last post](/journal/auditing-solana-core) I walked through auditing 14 of the biggest Solana protocols and the framework-level bug that won the competition. I promised a full technical deep-dive on that finding — proof-of-concept programs and all. This is it.

But I want to make it more useful than a single advisory. Because that bug is not a one-off. It is the most expensive recurring mistake on Solana, wearing a costume the framework didn't recognize.

The mistake has one shape: **you trusted a value without validating its source.** Once you can see it, you find it everywhere — and you find the exact spot where Anchor, the framework whose entire job is to enforce validation, let it slip through its own net.

## The pattern, named

Solana's execution model is permissionless by default. Anyone can pass any account into your instruction. Anyone can deploy a program and invoke it in the same transaction as yours. The runtime will not stop them — it does not know which accounts you *meant*. That is your job.

So nearly all of smart-contract security on Solana reduces to one discipline: for every input you read, prove at runtime that it is what you assumed it was. The right **owner**. The real **signer**. The expected **program**. Skip the proof, and you are not reading your data — you are reading whatever an attacker decided to hand you.

Anchor exists, in large part, to make that discipline the default. Its account constraints are source-validation expressed as types.

## Family one: account validation

This is the well-trodden class — the one every Solana security checklist opens with. Three questions, each a constraint:

| The question | What it proves | Anchor enforces it with | Skip it and... |
|---|---|---|---|
| Who **owns** this account? | it belongs to the program you expect | `Account<'info, T>`, `#[account(owner = …)]` | an attacker passes a look-alike account they control |
| Did this **signer** actually sign? | the authority was really granted | `Signer<'info>`, `#[account(signer)]` | anyone impersonates the authority |
| Is this the **type** I think it is? | the bytes aren't a different struct reinterpreted | `Account<T>` discriminator check | account substitution / type confusion |

In raw Solana you write these checks by hand, and forgetting one is how protocols lose money. Anchor turns them into declarations the framework can't forget:

```rust
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, has_one = authority)]   // vault.authority must equal `authority`
    pub vault: Account<'info, Vault>,      // owner + discriminator checked for free
    pub authority: Signer<'info>,          // must have signed the transaction
}
```

Here is the part most write-ups skip: the discipline is not just *adding* checks — it is knowing where they already live. During the audit I flagged what looked like a missing owner check in MarginFi. Then I tried to kill it, the way you have to try to kill every finding. It died: the validation existed, just in the account-resolution layer rather than the line I first read. Not a bug. **A finding isn't real until you've genuinely tried to disprove it and failed** — and half of that work is learning where a well-built protocol *puts* its checks.

So Anchor's constraint system is, in effect, a machine for answering "who owns this, who signed this, what type is this" automatically. It is very good at it. Which is exactly why the next bug is interesting: it is the same question — *which source produced this value?* — asked in the one place Anchor's constraints don't reach.

## Family two: the value Anchor forgot to source-check

When one Anchor program calls another and reads its return value, it uses `Return<T>::get()`. Under the hood that calls Solana's `get_return_data()` syscall, which returns a tuple:

```rust
// (Pubkey, Vec<u8>) — the Pubkey says WHICH program set this data
let (program_id, data) = get_return_data().unwrap();
```

That `program_id` is the source. It is the entire point of the syscall returning a tuple instead of just bytes. Anchor's codegen threw it away:

```rust
// anchor: lang/syn/src/codegen/program/cpi.rs
pub fn get(&self) -> T {
    let (_key, data) = get_return_data().unwrap();
    //   ^^^^ program_id discarded — source never validated
    T::try_from_slice(&data).unwrap()
}
```

Why that is dangerous comes down to one word: `get_return_data()` reads **global** transaction state. It returns whatever program *most recently* called `set_return_data()` in the call chain — not a value scoped to the CPI you just made. So anything that runs between your call and your `.get()` can swap the value underneath you:

```
1.  You CPI to Vault          → Vault sets return data = 10
2.  A later CPI runs           → attacker's program calls set_return_data(999)
3.  You call result.get()      → you read 999, and trust it as Vault's answer
```

No memory corruption, no exotic primitive. Just an unvalidated source. The fix that makes it real is the smallest possible proof-of-concept — three programs:

```rust
// 1. Callee (honest): returns 10
pub fn return_u64(_ctx: Context<CpiReturn>) -> Result<u64> { Ok(10) }

// 2. Malicious: overwrites the global return slot with 999
pub fn spoof_return_data(_ctx: Context<SpoofReturn>) -> Result<()> {
    set_return_data(&999u64.to_le_bytes());
    Ok(())
}

// 3. Caller (victim): CPIs to both, then reads "the callee's" value
let result = callee::cpi::return_u64(cpi_ctx)?;   // honest: 10
malicious::cpi::spoof_return_data(spoof_ctx)?;     // swaps the slot
let value = result.get();                          // reads 999, not 10
```

```
VULNERABILITY CONFIRMED:
  Callee returned:   10
  Malicious spoofed: 999
  Caller received:   999   (SPOOFED)
```

For a framework with ~4,900 GitHub stars that powers most of the ecosystem, every program reading CPI return values was potentially exposed. **CVSS 7.5 (High)** — `AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N`: network-reachable, no privileges, no user interaction, high integrity impact.

## The tell: the right pattern was three functions away

The most instructive part is not the bug. It is that Anchor *already knew the answer*. The same repository validates the source correctly in its `token_2022.rs` helpers — and does it in three separate functions:

```rust
get_return_data()
    .ok_or(ProgramError::InvalidInstructionData)
    .and_then(|(key, data)| {
        if key != ctx.program_id {
            Err(ProgramError::IncorrectProgramId)   // validates the source
        } else {
            data.try_into().map(u64::from_le_bytes)/* … */
        }
    })
```

The correct pattern existed in the codebase. It simply had never been carried into the generic `Return<T>` codegen that most programs actually use. The fix mirrors it: store the expected `program_id` on `Return<T>`, compare it inside `get()`, and add a `get_unchecked()` escape hatch for the rare, deliberate cross-program read.

```diff
 impl<T: AnchorDeserialize> Return<T> {
     pub fn get(&self) -> T {
-        let (_key, data) = get_return_data().unwrap();
+        let (key, data) = get_return_data().unwrap();
+        if key != self.program_id {
+            panic!("CPI return data from unexpected program");
+        }
         T::try_from_slice(&data).unwrap()
     }
 }
```

Submitted upstream as Issue #4232 / PR #4231, 13/13 tests passing, fixed across both codegen paths.

## The lesson an engineer can actually use

Account validation and CPI-return spoofing look like different bugs. They are the same bug. Both ask *which source produced this?* — and both are exploitable the instant you skip the answer.

That collapses to three habits worth burning in:

1. **For every account: who owns it, did it sign, is it the type I expect.** In Anchor, prefer `Account<T>` / `Signer` / `has_one` over reading fields raw — make the framework answer for you.
2. **For every cross-program value: which program produced it.** Validate the `program_id` from `get_return_data()`. Treat a returned value with the same suspicion as a passed-in account, because that is exactly what it is.
3. **Where you drop below the framework — raw syscalls, manual deserialization, `remaining_accounts` — assume its guarantees stop at that boundary.** Anchor's constraints are excellent precisely because they are mechanical; the moment you step outside them, the mechanism is you.

The bug that touched the most code in the entire audit was not the most sophisticated. It was the most *ordinary* mistake, made one level deeper than the framework's net was hung. The highest-leverage security work is rarely finding a new kind of bug. It is recognizing the old one in a place nobody thought to look.

---

*If you are shipping on Solana and want this kind of review — or you are building agents and want someone who audits as seriously as he builds — that is what I do. More at [rectorspace.com](https://rectorspace.com). Open to contract and full-time.*
