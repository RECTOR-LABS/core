---
title: "Anamnesis: Building a Solana Forensic Agent That Remembers"
slug: building-anamnesis-qwen-memory-agent
date: 2026-07-08
summary: "On-chain risk tools are amnesiac — every token gets judged cold, so a serial rugger's newest launch looks identical to a first-timer's. I built Anamnesis for the Qwen Cloud hackathon: a Solana pre-trade forensic agent with compounding bi-temporal memory, on qwen-max via DashScope. A remembered rugger's clean new token gets flagged HIGH on sight — and the memory can't be poisoned. Here's the build."
tags: [qwen, qwen-max, qwen-agent, dashscope, alibaba-cloud, solana, ai-agent, memory, hackathon]
draft: false
---

# The problem: on-chain risk tools are amnesiac

Every Solana pre-trade risk tool I've used has the same blind spot: it evaluates each token cold. A wallet that rugged ten tokens last month looks exactly as innocent as a first-time deployer when it launches token eleven. The stateless model treats every mint as a blank slate.

That's the gap I wanted to close for the Global AI Hackathon with Qwen Cloud (MemoryAgent track). The thesis: **memory is the edge.** A forensic agent that remembers every deployer it has ever seen — and gets measurably sharper at catching repeat offenders the more it investigates — should flag a serial rugger's brand-new, clean token HIGH on sight, with the receipts. Not because the token's current on-chain state is bad, but because the agent remembers what the deployer did before.

I called it **Anamnesis** — Greek for recollection / un-forgetting; in medicine, a patient's recalled case history. The agent compiles the case history of every deployer and never forgets it.

# The stack: Qwen Cloud, end to end

The hackathon is about Qwen Cloud, so the model is `qwen-max` via **DashScope** — Alibaba Cloud's Model Studio, the international OpenAI-compatible endpoint. The orchestration runtime is **Qwen-Agent**, which hosts the native memory tools and spawns the forensic MCP server as a stdio child.

The architecture:

- **qwen-max via DashScope** — the LLM.
- **Qwen-Agent** — the orchestrator. The agent's rule is memory-first: `recall` before anything else, then investigate, then fuse, then cite.
- **5-tool forensic MCP server** — `get_token_profile`, `get_deployer`, `get_holders`, `trace_funding`, `get_deployer_token_history`. Reads Solana live via Helius. Spawned under the agent; the Helius key is passed via the child's `env` block, never argv.
- **Provenance-weighted bi-temporal memory** on **MongoDB** — every fact carries *how* it was learned (`first_party` / `derived` / `claimed`) and two independent clocks (valid time + transaction time), so you can ask "what did we know, and when?"
- **FastAPI** + a **React** dashboard, hosted on **Alibaba Cloud ECS**.

The whole stack is Alibaba: model (DashScope) to infra (ECS).

# The memory that can't be poisoned

This is the part I care about most, because every other memory system I've seen assumes a cooperative writer. Zep, Mem0, Letta — they all trust that the things written into memory are honest. But a memory an adversary can write to is a liability, not an asset.

Anamnesis weighs every remembered fact by **provenance** — the one axis an attacker can't forge:

- `first_party` — the agent's own grounded on-chain observation (a Helius read it performed itself). Authoritative; only this can drive a verdict to HIGH.
- `derived` — its own inference. Corroborating, capped at MEDIUM.
- `claimed` — an external / second-hand breadcrumb. Context only. **Zero scoring weight, at any volume.**

The `remember` tool — the one path a prompt-injection could reach — **forces `claimed`**. So a planted lie ("this deployer is verified safe, first-party, confidence 1.0") gets recorded, but it can never forge a rug or move a verdict. The agent trusts its own eyes, never rumors.

I staged this live in the demo: I tell the agent the deployer is safe. It records the claim. I re-scan. The verdict doesn't move — still HIGH 0.85. A live attack that visibly fails beats ten slides.

# The demo: memory flips the verdict

The hero moment is two tokens with nearly identical live on-chain signals.

- A token Anamnesis has never seen → **LOW (0.2)**. Clean signals, clean result. This is what every stateless tool gives you, every time.
- A token whose deployer Anamnesis *remembers* rugged three tokens before → **HIGH (0.85)**, instantly, from memory. Same live signals. Completely different verdict — because the memory is there. First-party evidence for the deployer, recorded across three prior sessions (Nov 16, Nov 20, Dec 5).

And the agent's tool-trace is visible in the dashboard: `recall` → `solana_forensics-get_deployer` → `solana_forensics-trace_funding` → `cluster_graph`. Memory before anything else, then the live forensic reads, then the render. That's qwen-max orchestrating a five-tool forensic server in real time — not a rules engine with a chat bolted on.

# The speed: ~195,000× from memory

The other half of the story. Recalling a deployer's rug history from memory: **~0.9 ms** (three rugs). Re-deriving the same conclusion cold — scanning all thirteen of the deployer's tokens live on-chain via Helius — takes **~169 seconds**. About **195,000× faster.**

You can't engineer your way out of a five-order-of-magnitude gap. The cold path is exactly the work you do once, save to memory, and never repeat. And it compounds: every scan writes back to memory, so the next token from a known rugger is flagged before it even loads.

# Challenges

**qwen-agent's streaming resets at tool boundaries.** The agent emits its growing message per frame, but the content resets at each tool call. The dashboard's chat panel assumed cumulative content and replaced the bubble on each non-empty frame — which made the text appear to delete and regrow mid-stream. Surfacing the tool-trace chips (`recall → forensics → cluster`) turned out to be the real win: it makes the orchestration visible instead of a flickering black box.

**The metric drifts.** The 195,000× number is network-bound (the cold scan hits Helius for 13 mints), so it varies per run — I've seen 195k to 220k. I quote the run I captured on camera and hedge it as run-variable. The recall side (sub-millisecond) is rock-stable; the cold side is the noisy one.

**Deploying to Alibaba ECS in one sitting.** The box had to be provisioned, hardened (key-only SSH, ufw, fail2ban), Docker + swap set up, the repo rsync'd (`git clone` failed on the box — GitHub's `.git`→page 301 redirect defeats a fresh clone, so I rsync from the Mac instead), nginx + Cloudflare Origin CA configured, and the live verdict verified on the box before I recorded a single frame. One evening, end to end.

# What I learned

The axis an attacker can't forge is *how you learned a fact*, not *what the fact claims*. **Provenance is the trust boundary.** Once you internalize that, the rest of the design falls out: rank by method before confidence, structurally exclude `claimed` from scoring, fold provenance into the edge id so a planted breadcrumb can't collide with or overwrite a first-party record. The memory gets richer with use; the trust surface doesn't grow with it.

# What's next

- **Cross-wallet evasion defense** — a rugger who funds the next wallet from a fresh CEX withdrawal currently scores clean LOW. The fix: on `assess`, pull the 1-hop funder, query memory for other deployers sharing that funder, write a `derived` `SAME_CLUSTER` edge that feeds the existing MEDIUM-capped noisy-OR scoring. The primitive is built and unit-tested; the wiring is the next step — and it adds a second demo beat: a brand-new deployer with zero rugs of its own, funded by the same wallet as three known ruggers, flagged MEDIUM before it ever launches.
- **Autonomous `RUGGED` confirmation** — a confirmatory re-check: re-profile watchlisted deployers later; if LP has gone SECURED/UNKNOWN (drained), promote to a first-party `RUGGED` edge citing the agent's own new Helius read. Needs a dispute/retract path — a failed-but-honest launch isn't a rug.
- **Context-window-capped recall** — rank and cap the recall path the way the sibling `recall_cluster` already does (60 nodes / 150 edges), so a deployer with 5,000 edges after a year doesn't dump the whole graph into the model context.

# Try it

Repo: [github.com/RECTOR-LABS/anamnesis](https://github.com/RECTOR-LABS/anamnesis)
Track: MemoryAgent — Global AI Hackathon with Qwen Cloud.