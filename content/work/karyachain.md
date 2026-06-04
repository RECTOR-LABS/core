---
title: KaryaChain
slug: karyachain
summary: Blockchain-based IP protection for Indonesia's creative economy — tamper-proof ownership records and programmable licensing. Built for the OJK-EKRAF hackathon.
category: Civic Tech
status: Draft
github_url: https://github.com/RECTOR-LABS/ojk-ekraf-hackathon
repo_name: RECTOR-LABS/ojk-ekraf-hackathon
created_at: '2025-12-24'
featured: false
technologies:
- Next.js 14
- TypeScript
- PostgreSQL
github_stars: 0
github_forks: 0
---

# KaryaChain: When Blockchain Meets Creative Rights

Indonesian creators get ripped off constantly. Musicians see their songs on streaming platforms without royalties. Designers find their work copied without attribution. Photographers watch their images spread across the internet with no compensation.

Intellectual property protection in Indonesia is broken. The legal system is slow, expensive, and often ineffective. Creators with legitimate claims give up because enforcement costs more than potential recovery.

The OJK-EKRAF hackathon asked: can blockchain fix this? KaryaChain is my answer.

**The Creative Economy Problem**

Indonesia's creative economy is massive — hundreds of billions in annual output, millions of workers, growing faster than traditional sectors. But IP theft bleeds billions more.

The core issues:

- **Registration is cumbersome** — Government IP offices require physical visits, paper forms, weeks of processing
- **Proof of creation is weak** — Timestamps can be forged, metadata can be stripped, disputes become he-said-she-said
- **Enforcement is expensive** — Legal action costs thousands of dollars, beyond most individual creators
- **Tracking usage is impossible** — Once work is released, creators have no visibility into how it spreads

Blockchain addresses several of these. Not all — technology cant replace legal systems entirely — but enough to make meaningful impact.

**The KaryaChain Solution**

At its core, KaryaChain creates tamper-proof ownership records for creative works.

**Registration Flow:**

1. Creator uploads work (image, audio, video, document)
2. System generates cryptographic hash — unique fingerprint of the content
3. Hash is recorded on-chain with creator's wallet address and timestamp
4. Creator receives ownership certificate with verifiable on-chain proof

This registration is instantaneous, costs pennies in transaction fees, and produces evidence admissible in Indonesian courts (per digital signature regulations).

**Licensing and Monetization:**

Beyond proof of ownership, KaryaChain enables programmable licensing. Creators specify terms:

- Commercial use: yes/no/conditional
- Attribution requirements
- Geographic restrictions
- Duration limits
- Royalty rates for different use cases

Smart contracts enforce these terms automatically. A business wanting to use a photograph queries the chain, sees the license terms, pays the specified fee, and receives verifiable permission.

**The Technical Architecture**

Built during a hackathon weekend, so architecture prioritized shipping over perfection.

Frontend: [Next.js 14](https://nextjs.org) with TypeScript. Clean submission forms, portfolio views, licensing dashboards. Server components for initial load performance, client components for interactive elements.

Smart contracts: Would ideally be Solana programs, but hackathon timeline pushed toward simpler solutions. Used a hybrid approach — on-chain registration records with off-chain metadata storage.

Verification system: Content hashing using SHA-256 for documents, perceptual hashing for images (tolerates minor modifications). Hash comparison enables detecting derivatives and copies.

Database: PostgreSQL for user accounts, work metadata, licensing history. On-chain data serves as source of truth; database enables fast queries and UX features.

**Why This Matters for Indonesia**

OJK is Indonesia's Financial Services Authority. EKRAF is the creative economy agency. Their joint hackathon signals government interest in blockchain solutions for real problems — not speculation, not DeFi, but practical applications affecting ordinary Indonesians.

KaryaChain demonstrates that interest is justified. Blockchain's properties — immutability, transparency, programmability — map well to IP protection needs. The technology isn't magic, but it's genuinely useful.

If implemented nationally, systems like KaryaChain could:

- Reduce registration friction, increasing formal IP protection rates
- Create portable proof of ownership that works across jurisdictions
- Enable automated royalty collection for digital content
- Provide courts with clear evidence chains for disputes

**The Hackathon Experience**

48 hours to build something meaningful. No sleep, endless coffee, that strange hackathon energy where impossible timelines somehow get met.

The judges cared about practical impact, not technical showmanship. Could this actually help Indonesian creators? Would they use it? Does the blockchain component add real value or is it just buzzword decoration?

Good questions. KaryaChain's answers were convincing enough for recognition. The IP protection use case is legitimate — blockchain genuinely helps here, unlike many forced applications.

**What I Learned**

**Government interest in blockchain is real.** OJK and EKRAF sponsoring this hackathon reflects serious exploration of blockchain applications. Builders who focus on genuine utility — not speculation — have opportunities.

**Indonesian creators desperately need solutions.** Conversations with artists and musicians during the hackathon revealed how pervasive IP theft is. Not edge cases — the default experience for most creators.

**Simple beats complex.** The winning approaches at hackathons are usually the clearest, not the most technically sophisticated. KaryaChain's value proposition fits in one sentence.

**Hybrid architectures work.** Pure on-chain systems have UX challenges. Combining blockchain guarantees with traditional database convenience serves users better.

**The Road Ahead**

KaryaChain is a hackathon prototype. Production deployment would require:

- Security audits of smart contracts
- Legal validation with Indonesian IP attorneys
- Integration with existing government registration systems
- Mobile app for casual creators
- Partnerships with creative platforms for automated registration

The foundation works. Scaling it requires resources beyond hackathon scope. But the prototype proves the concept — blockchain-based IP protection for Indonesian creators isn't theoretical; it's buildable.

---

**Tech Stack:** Next.js 14, TypeScript, PostgreSQL, Blockchain (hybrid architecture)

**Status:** Hackathon Prototype

**Links:** [GitHub](https://github.com/RECTOR-LABS/ojk-ekraf-hackathon)

**Focus:** IP rights management for Indonesian creative economy