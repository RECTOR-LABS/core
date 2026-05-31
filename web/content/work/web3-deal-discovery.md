---
title: Web3 Deal Discovery
slug: web3-deal-discovery
summary: NFT coupons on Solana — 'Groupon meets DeFi' with escrow-based resale marketplace.
  1st place MonkeDAO Cypherpunk.
category: Blockchain
status: Winner
github_url: https://github.com/RECTOR-LABS/web3-deal-discovery-nft-coupons
repo_name: RECTOR-LABS/web3-deal-discovery-nft-coupons
started_at: '2025-12-10'
launched_at: '2025-12-23'
featured: true
technologies:
- Solana
- Anchor
- Next.js 15
- Supabase
- Tailwind CSS
- Metaplex
- TypeScript
github_stars: 0
github_forks: 0
---

# Web3 Deal Discovery: When Coupons Met the Blockchain

Picture this: December 2025, MonkeDAO announces their Cypherpunk track on Superteam Earn. The brief? Build something that combines Web3 with real-world utility. And I'm sitting there thinking... what's the most un-crypto thing I could put on a blockchain?

Coupons. Freaking coupons. Groupon, but make it Web3.

**The Idea That Shouldn't Work**

Here's the thing about traditional coupons - they're incredibly wasteful. You buy a deal, life happens, coupon expires, money gone. Can't sell it. Can't transfer it. Just... poof. Billions of dollars in unrealized value every year.

But what if coupons were NFTs? Suddenly they become tradable assets. Your unused restaurant coupon becomes someone else's 20% discount dinner. You recover some money. They get a deal. The merchant still gets a customer. Everyone wins.

It sounds obvious in hindsight. But I spent three days convincing myself it wasn't stupid before writing a single line of code.

**The 14-Day Sprint**

Bismillah. Let's build this thing.

The stack came together fast: [Solana](https://solana.com) with [Anchor](https://www.anchor-lang.com/) for the smart contracts, [Next.js 15](https://nextjs.org) for the frontend, [Supabase](https://supabase.com) for the off-chain data. Standard stuff. What wasn't standard was the scope.

I wrote down 13 epics. Ninety-five tasks. Then looked at the 14-day deadline and laughed. This was insane.

But here's what hackathons teach you - scope is a lie. You don't need everything. You need the right things, done really well.

**The Escrow Breakthrough**

Day 5, I hit a wall. The resale marketplace. How do you let someone sell a coupon NFT to a stranger without either party getting scammed?

Traditional approach: list it, buyer pays, seller transfers. But what if the seller never transfers? What if they transfer a fake? Crypto is full of these trust problems.

Then it clicked - escrow PDAs. The seller lists the NFT, but it gets locked in a program-derived account. Not in their wallet anymore, not in the buyer's yet. Just... held by the smart contract. Buyer pays, atomic swap happens, everyone's happy.

This ended up being the thing that made us stand out. Industry-first escrow-based coupon resale. The judges actually said "wait, nobody's done this before?"

Nope. We did.

**Making Web3 Invisible**

The biggest challenge wasn't the blockchain stuff. It was hiding it.

See, normal people don't care about PDAs and transaction signatures. They care about "can I get this 30% off pizza deal?" So I built the whole thing with what I call "Web3 invisible UX."

No crypto jargon. "NFT" becomes "Coupon." "Mint" becomes "Claim." "Burn" becomes "Redeem." Wallet connection happens once, then gets out of the way. Users browse deals, click claim, sign one transaction, done. Their coupon shows up in "My Coupons" like it's any normal app.

The blockchain is infrastructure, not interface. Just like you don't think about TCP/IP when browsing the web. (I used this same philosophy in [OpenBudget.ID](/work/openbudget-id) for government transparency.)

**The Demo Video Grind**

Day 12. Feature freeze. Time for demo videos.

I recorded five of them. Merchant registration. Free coupon claims. Paid purchases. The full resale flow end-to-end. Merchant redemption with QR scanning.

Each video took about 10 takes. "Wait, I clicked the wrong button." "The wallet popup covered the important part." "Why is my voice so weird?" You know the drill.

But by the end, I had a 27-minute demo suite showing every single feature actually working. Not mockups. Not "imagine this works." Real transactions on devnet. Real NFTs being minted, traded, and burned.

**The Pitch Deck Easter Egg**

I built an interactive pitch deck right into the app. Not a PDF - an actual route at `/pitch-deck` with embedded videos, code evidence, screenshot carousels, the works.

The idea was simple: judges are busy. They're reviewing dozens of submissions. Make it stupid easy for them to see everything without leaving the browser.

Framer Motion animations. MonkeDAO branding throughout (gotta represent the track sponsors). Mobile responsive because who knows what device they're using.

Looking back, this might have been overkill. But it felt right. Ihsan - excellence in everything, right?

**Results Day**

December 23rd, 2025. Results drop.

I'm refreshing the Superteam page like a maniac. Scroll past third place... not me. Second place... not me either. First place...

🥇 **RECTOR SOL - $5,000 USDC + Gen3 Monke NFT**

Alhamdulillah. Actually screamed out loud. Woke up my whole house.

The feedback mentioned the escrow marketplace innovation, the professional demo videos, and the "Web3 invisible" UX philosophy. Everything I'd stressed over actually mattered.

**What I'd Do Differently**

Honestly? Less features, more polish. I shipped 13 epics but some of them could've been cut. The staking system? Cool but unnecessary. The loyalty badges? Nice to have, not need to have.

Next hackathon, I'm doing 5 epics, polished to perfection. Quality over quantity.

Also, I'd start the demo videos earlier. Recording under deadline pressure is not fun.

**The Tech That Mattered**

The whole thing runs on like $0.00025 per transaction. That's Solana for you. The smart contract has 9 instructions covering the full lifecycle - from merchant registration to coupon redemption.

Metaplex v5 for the NFT standard. Supabase for the off-chain metadata (you can't put 1000 characters of deal description on-chain, that's insane). Real-time updates via Supabase subscriptions.

The frontend is Next.js 15 with the app router, [Tailwind v4](https://tailwindcss.com), and the Solana wallet adapter. Nothing fancy, just solid choices.

**What's Next**

The hackathon's done but the idea isn't. I'm exploring pilot partnerships with local merchants in Jakarta. The code is open source - if someone wants to fork it and launch in their city, go for it.

The real dream? Replace Groupon entirely. A global, decentralized deal marketplace where your unused coupons always have value.

Ambitious? Maybe. But that's what hackathons are for - proving that crazy ideas can actually work.

---

**Result:** 🥇 1st Place - MonkeDAO Cypherpunk Track (Superteam Earn)

**Prize:** $5,000 USDC + Gen3 Monke NFT (12-month locked)

**Tech Stack:** Solana, Anchor, Next.js 15, Supabase, Tailwind CSS v4, Metaplex v5

**Stats:** 13 Epics, 95 Tasks, 34 Tests, 5 Demo Videos

**Links:** [GitHub](https://github.com/RECTOR-LABS/web3-deal-discovery-nft-coupons)
