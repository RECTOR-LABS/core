# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding database..."

# CORE work story (Enhanced with SEO links)
core_story = <<~MARKDOWN
  # CORE: When I Stopped Overthinking Everything

  Look, I had this whole grand plan. Seven different projects, seven separate repos, microservices architecture, Docker containers, the whole nine yards. Was gonna build this massive ecosystem for rectorspace.com with [Next.js](https://nextjs.org) frontends, [Node](https://nodejs.org) backends, maybe throw in some [Rust](https://www.rust-lang.org) services because why not, right?

  Then one Saturday morning, I'm on my third cup of coffee, staring at my whiteboard covered in architecture diagrams, and I just... stopped. Wait. Why am I doing this to myself?

  **The Realization**

  Here's the thing about being a developer - we love to overcomplicate stuff. It's like a disease. Someone says "I need a website" and we're already architecting a distributed system with event sourcing. Meanwhile, [Rails](https://rubyonrails.org) exists. Rails 8, specifically. And I'd been completely sleeping on it.

  So I made a decision that felt kinda blasphemous for someone who's been neck-deep in [TypeScript](https://www.typescriptlang.org) and [Solana](https://solana.com). I deleted everything. Well, archived it. Then typed `rails new core`. Just like that. November 2nd, 2025. Bismillah, let's start fresh.

  **The Weekend Challenge**

  I gave myself a stupid challenge: can I ship a production-ready platform in one weekend? Not a prototype. Not an "MVP". Actual production. With SSL, proper deployment, [GitHub Actions](https://docs.github.com/actions) CI/CD, zero-downtime updates, the works. And it had to look good - none of that "I'll design it later" Bootstrap nonsense.

  Spoiler alert: I kind of did it. With a lot of bugs along the way. But honestly? That's the fun part.

  **Why Rails? (The Real Reason)**

  I could give you all the technical reasons. Monolithic architecture, convention over configuration, mature ecosystem, blah blah. But real talk? I was tired of config files. So. Tired.

  With my previous setup I had seven different repos to juggle. Seven package.json files. Separate deployment pipelines. Database connections between services. API versioning headaches. Those "wait which port is this service running on again?" moments at 2am.

  Rails? One repo. One deployment. Database migrations that actually work. Background jobs built-in with [Solid Queue](https://github.com/rails/solid_queue). It just... works. And after spending months in blockchain dev where nothing works the first time, that's refreshing as hell.

  Plus Rails 8 dropped with all these new toys. Solid Queue for background jobs. [Solid Cache](https://github.com/rails/solid_cache). Authentication generators. DHH basically looked at what everyone was doing with external services and said "nah, let's just include it in the box."

  **The Design Journey**

  This is where it got interesting. I have this MonkeDAO NFT as my profile pic - pixel art monkey with this warm color palette. Orange, yellow, cream, brown. And I thought... what if the whole site matched that vibe?

  So I grabbed [Tailwind CSS](https://tailwindcss.com) v4, pulled the hex codes straight from my NFT, and built this whole warm pixel-art-inspired design system. [JetBrains Mono](https://www.jetbrains.com/lp/mono/) for everything. Yes, even body text. It's monospace. It's weird. I don't care, it looks cool and screams "developer made this."

  The layout's inspired by DHH's personal site - super minimal, letter-style content, links flowing naturally in text. No corporate navbar. No sidebar. No footer bloat. Just... content. The way personal sites used to be before everyone decided they needed to look like SaaS products.

  **The 48-Hour Build Sprint**

  Friday night: Rails setup, [PostgreSQL](https://www.postgresql.org) config, color scheme locked in. Homepage working around 2am.

  Saturday: This got messy. Built GitHub API integration to show projects dynamically. Wrote a background job that syncs my repos every hour. Solid Queue made this stupidly easy. Set up Tailwind with custom colors. Made probably 15 commits just fixing CSS spacing lol.

  Then came deployment hell. Set up a VPS. Configured [Nginx](https://nginx.org). Got SSL working with Let's Encrypt. [Puma](https://puma.io) kept crashing. Why? Because I forgot Unix sockets exist. Fixed that at 3am. Then SECRET_KEY_BASE wasn't loading properly. Then Ruby version mismatch between local and production. Then... you know how it goes.

  Sunday morning: Alhamdulillah, it's live. rectorspace.com actually points to a real Rails app. The version footer shows which commit is running. GitHub Actions automatically deploys when I push to main. It's not perfect but it's real.

  **The Seven Sections (Most Don't Exist Yet)**

  The vision is seven sections under one domain. Right now only two work:

  - Homepage (✅ live) - introduction, GitHub projects feed
  - Work (✅ live) - story-driven project pages like this one
  - Labs (📋 planned) - experiments and learning projects
  - Journal (📋 planned) - Ghost CMS integration for writing
  - Cheatsheet (📋 planned) - dev notes and references
  - Dakwa (📋 planned) - Islamic da'wah content
  - Quran (📋 planned) - Quranic resources and tools

  Yeah, only homepage and work are done. But that's fine! Ship first, build second. The infrastructure is rock solid. Adding new sections is just controllers and views now.

  **What I Actually Learned**

  Monoliths aren't evil. Microservices are great when you need them. For a solo developer building related things? Monolith wins every single time.

  Rails is still really good. Like, really really good. Everyone saying "Rails is dead" clearly hasn't used Rails 8. It feels modern and fast and just... works.

  Ship broken things. I deployed with bugs. Fixed them in production. It's fine. Nobody died. Perfect is the enemy of done.

  Design matters but don't overthink it. I spent 3 hours tweaking colors. Worth it? Maybe. But it makes me happy to look at it, so yeah.

  Use boring technology. PostgreSQL, Nginx, Puma, Rails - all boring, all battle-tested, all just work. Saved me countless hours of debugging weird edge cases.

  **What's Next**

  Right now I'm building out the work section you're reading. Story-driven project pages instead of boring portfolios. Why they exist, what I learned, the messy parts. Because nobody remembers another bulleted list of features.

  Then Labs for experiments. Then Ghost CMS integration for actual writing. Then the Islamic content sections because building for eternity means building for dunya AND akhirah.

  The repo went public today. So you can see all the commits, all the fixes, all the "wait why did I do it that way" moments. Real code, real progress, real mess.

  **The Philosophy**

  There's this concept in Islam called ihsan - excellence in everything you do. Not perfection. Excellence. Doing your best work because Allah is watching. That's what this is about.

  Not trying to build the next unicorn. Not chasing VC money. Just building something useful, something beautiful, something that serves both worldly goals and faith. "Building for Eternity" isn't a marketing slogan - it's the actual mission.

  Will it make money? Not the priority. Will people use it? Maybe. Will I be proud of it in 10 years? InshaAllah, yes. And that's enough.

  So yeah. That's CORE. Three days old. Two sections working. Probably a dozen bugs I haven't found yet. But it's mine, it's real, and it's just getting started.

  And if you're sitting there planning that thing you've been thinking about for months - stop planning. Just build it. Rails new your-project-name. Ship first, refactor later.

  ---

  **Tech Stack:** Ruby on Rails 8, PostgreSQL, Tailwind CSS v4, Nginx, Puma, Solid Queue

  **Status:** Live in production (with bugs, naturally)

  **Links:** [GitHub](https://github.com/RECTOR-LABS/core) • [Live Site](https://rectorspace.com)

  **Timeline:** Started Nov 2, 2025 • Deployed Nov 3, 2025 • Actively building
MARKDOWN

work = Work.find_or_initialize_by(slug: "core")
work.assign_attributes(
  title: "CORE",
  github_url: "https://github.com/RECTOR-LABS/core",
  live_url: "https://rectorspace.com",
  repo_name: "RECTOR-LABS/core",
  story: core_story,
  summary: "Rails 8 monolith for the complete rectorspace.com ecosystem - built in one weekend to prove monoliths aren't dead",
  category: "Infrastructure",
  status: "Live",
  technologies: [ "Ruby", "Rails 8", "PostgreSQL", "Tailwind CSS", "Nginx", "Puma", "Solid Queue" ],
  started_at: Date.parse("2025-11-02"),
  launched_at: Date.parse("2025-11-03"),
  featured: true,
  github_stars: 0,
  github_forks: 0
)

if work.save
  puts "✓ CORE work created/updated successfully"
else
  puts "✗ Failed to create CORE work: #{work.errors.full_messages.join(', ')}"
end

# Web3 Deal Discovery - 1st Place MonkeDAO Cypherpunk
web3_deal_story = <<~MARKDOWN
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

  The blockchain is infrastructure, not interface. Just like you don't think about TCP/IP when browsing the web.

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
MARKDOWN

work = Work.find_or_initialize_by(slug: "web3-deal-discovery")
work.assign_attributes(
  title: "Web3 Deal Discovery",
  github_url: "https://github.com/RECTOR-LABS/web3-deal-discovery-nft-coupons",
  live_url: nil,
  repo_name: "RECTOR-LABS/web3-deal-discovery-nft-coupons",
  story: web3_deal_story,
  summary: "NFT coupons on Solana — 'Groupon meets DeFi' with escrow-based resale marketplace. 1st place MonkeDAO Cypherpunk.",
  category: "Blockchain",
  status: "Winner",
  technologies: [ "Solana", "Anchor", "Next.js 15", "Supabase", "Tailwind CSS", "Metaplex", "TypeScript" ],
  started_at: Date.parse("2025-12-10"),
  launched_at: Date.parse("2025-12-23"),
  featured: true,
  github_stars: 0,
  github_forks: 0
)

if work.save
  puts "✓ Web3 Deal Discovery work created/updated successfully"
else
  puts "✗ Failed to create Web3 Deal Discovery work: #{work.errors.full_messages.join(', ')}"
end

# SIP Protocol - Winner Zypherpunk NEAR Track
sip_story = <<~MARKDOWN
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
MARKDOWN

work = Work.find_or_initialize_by(slug: "sip-protocol")
work.assign_attributes(
  title: "SIP Protocol",
  github_url: "https://github.com/sip-protocol/sip-protocol",
  live_url: nil,
  repo_name: "sip-protocol/sip-protocol",
  story: sip_story,
  summary: "Privacy layer for cross-chain transactions via NEAR Intents + Zcash. Stealth addresses & ZK proofs.",
  category: "Privacy",
  status: "Winner",
  technologies: [ "TypeScript", "Next.js 14", "NEAR", "Zcash", "pnpm", "Turborepo", "@noble/curves" ],
  started_at: Date.parse("2025-11-15"),
  launched_at: Date.parse("2025-12-01"),
  featured: true,
  github_stars: 0,
  github_forks: 0
)

if work.save
  puts "✓ SIP Protocol work created/updated successfully"
else
  puts "✗ Failed to create SIP Protocol work: #{work.errors.full_messages.join(', ')}"
end

# OpenBudget.ID - 2nd Place Garuda Spark
openbudget_story = <<~MARKDOWN
  # OpenBudget.ID: Bringing Transparency to Indonesian Government Spending

  Indonesia has a corruption problem. Everyone knows it. The question is: what do you do about it?

  Garuda Spark hackathon - organized by Superteam Indonesia with the Ministry of Communication and Ministry of Creative Economy - had a simple brief: use blockchain for social good. And I thought... what if citizens could actually verify where their tax money goes?

  **The Problem Nobody Talks About**

  Government budget allocation in Indonesia is essentially a black box. Money gets allocated. Money gets spent. Reports come out quarterly, sometimes annually. By then, the money's gone, and nobody can verify if it went where it was supposed to.

  This isn't malice (usually). It's just bad infrastructure. Paper trails. PDF reports. Systems that don't talk to each other. Plenty of opportunity for things to "get lost."

  Blockchain is literally an immutable public ledger. Why aren't we using it for this?

  **The Core Insight**

  Here's what I realized: you don't need to put everything on-chain. You just need to put the right things.

  Ministry publishes a project: "We're spending Rp 500 million on Creative Economy Grants." That goes on Solana. Timestamp, amount, recipient category. Immutable.

  They release funds for milestone 1: "Rp 100 million released, here's the proof document." That goes on Solana too. Transaction hash, proof URL, timestamp.

  Now any citizen can verify: yes, the ministry really did release this money, on this date, for this purpose. No PDF that could've been edited. No report that could've been delayed. Blockchain truth.

  **Blockchain as Infrastructure, Not Interface**

  The biggest design decision: hide the blockchain from users who don't care about it.

  Ministry staff log in with Google. They create projects in a normal web form. They click "Publish to Blockchain" and connect a wallet once. After that, everything just works. They don't need to understand PDAs or transaction signatures.

  Citizens browse projects without logging in. They see progress bars, milestone timelines, budget breakdowns. If they want to verify, they click "View on Solana Explorer" and see the raw blockchain data. But they don't have to.

  The blockchain is infrastructure. Like how you don't think about DNS when visiting a website.

  **The 4-Day Sprint**

  This was the most compressed timeline I've ever worked with.

  **Day 1:** Solana program with Anchor. 4 instructions: initialize platform, create project, add milestone, release funds. 14 tests passing. Deployed to devnet by midnight.

  **Day 2 Morning:** PostgreSQL schema. API routes. The hybrid architecture where blockchain is source of truth, database is cache for fast queries.

  **Day 2 Afternoon:** Admin dashboard. Google OAuth. Wallet integration. Real blockchain transactions from the UI.

  **Day 3:** Public citizen dashboard. Project browsing. Milestone timelines. Verification links. Then citizen engagement features - comments, ratings, watchlist, issue reporting.

  **Day 4:** Analytics dashboard. Ministry leaderboard. Spending trends. Anomaly detection. Then deploy to VPS and record demo video.

  I slept maybe 12 hours total. Worth it.

  **The Self-Healing Database**

  One of my favorite technical bits: the database heals itself from the blockchain.

  See, in development, Next.js Fast Refresh sometimes interrupts database writes. You release funds on-chain, but the database update fails. Now you have inconsistent state.

  So I built automatic recovery. When the system detects a mismatch, it queries the blockchain (source of truth), finds the actual transaction, and fixes the database. No manual intervention.

  Citizens always see accurate data because the blockchain can't lie.

  **The Analytics Layer**

  For the hackathon judges, I added an analytics dashboard:

  - **Ministry Leaderboard:** Ranked by completion rate, budget accuracy, release speed, trust score
  - **Spending Trends:** Time-series visualizations with Recharts
  - **Anomaly Detection:** Automatic flags for low release rates, missing proofs, budget discrepancies

  This is where blockchain data becomes actionable. Not just "here's what happened" but "here's what looks suspicious."

  **Demo Day**

  Live demo for the judges:

  1. Login as ministry → Create project → Publish to blockchain → Show transaction hash
  2. Switch to public view → Browse as citizen → Click project → See milestones
  3. Release funds → Show Solana Explorer → Prove immutability

  The whole thing took 8 minutes. Clean. No crashes. (Thank Allah, because I'd only rehearsed twice.)

  **The Result**

  🥈 **2nd Place - Garuda Spark Hackathon - 1,500 USDC**

  First place went to a project with more direct ministry partnerships already lined up. Fair enough. They had a head start on the "actually deploy this" part.

  But the technical foundation we built? Solid. The concept? Validated. The code? Open source and ready for anyone to fork.

  **Impact Potential**

  Indonesia's government budget is around Rp 3,000 trillion annually. Even tracking 1% of that transparently would be Rp 30 trillion visible on-chain.

  Imagine: every citizen can verify if the road construction in their village actually got funded. If the school grant actually went to the school. If the healthcare budget actually reached the hospital.

  That's the dream. Garuda Spark was proof it's technically possible.

  **What I Learned**

  Building for government is different. You can't assume tech literacy. You can't assume crypto familiarity. Everything needs to be obvious.

  But that constraint makes you build better products. If a ministry staff member can use it, anyone can.

  Also: civic tech is underrated. There's so much opportunity to use these tools for actual public good, not just DeFi derivatives.

  ---

  **Result:** 🥈 2nd Place - Garuda Spark Hackathon

  **Prize:** 1,500 USDC

  **Organizers:** Superteam Indonesia × Ministry of Communication × Ministry of Creative Economy

  **Tech Stack:** Solana Anchor, Next.js 14, PostgreSQL, Tailwind CSS, NextAuth

  **Links:** [GitHub](https://github.com/RECTOR-LABS/openbudget-id) • [Live Demo](https://openbudget.rectorspace.com)
MARKDOWN

work = Work.find_or_initialize_by(slug: "openbudget-id")
work.assign_attributes(
  title: "OpenBudget.ID",
  github_url: "https://github.com/RECTOR-LABS/openbudget-id",
  live_url: "https://openbudget.rectorspace.com",
  repo_name: "RECTOR-LABS/openbudget-id",
  story: openbudget_story,
  summary: "Government spending transparency on Solana for Indonesia. Ministries publish on-chain, citizens verify.",
  category: "Civic Tech",
  status: "Winner",
  technologies: [ "Solana", "Anchor", "Next.js 14", "PostgreSQL", "Tailwind CSS", "NextAuth", "Rust" ],
  started_at: Date.parse("2025-10-15"),
  launched_at: Date.parse("2025-10-20"),
  featured: true,
  github_stars: 0,
  github_forks: 0
)

if work.save
  puts "✓ OpenBudget.ID work created/updated successfully"
else
  puts "✗ Failed to create OpenBudget.ID work: #{work.errors.full_messages.join(', ')}"
end

# Saros SDK Docs - 1st Place Bounty
saros_story = <<~MARKDOWN
  # Saros SDK Docs: Why I Spent a Month Writing Documentation

  Let me tell you something that'll sound crazy: I won $300 for writing documentation.

  Not code. Not a dApp. Not a smart contract. Documentation. And honestly? It was one of the most satisfying projects I've ever done.

  **The Bounty**

  December 2024. [Saros Finance](https://saros.xyz) - a DeFi protocol on Solana - posts a bounty on their Discord: "SDK Guide Challenge." Create comprehensive documentation for their TypeScript, DLMM, and Rust SDKs. Best submission wins.

  Most developers see "documentation" and run the other way. I saw an opportunity.

  **Why Docs Matter**

  Here's the thing about developer tools: they live or die by their documentation.

  I've used brilliant libraries that I abandoned because I couldn't figure out how to use them. I've used mediocre libraries that I stuck with because their docs were crystal clear.

  Saros had solid SDKs. What they didn't have was a clear path from "I just installed this" to "I'm building production dApps." That gap? That's what I filled.

  **The Docusaurus Deep Dive**

  I went with [Docusaurus](https://docusaurus.io) - Meta's documentation framework. Same thing React, Jest, and a hundred other projects use. Fast, searchable, dark mode built-in.

  But I didn't just spin up a default template. I customized everything:

  - **Interactive API Explorer:** Test SDK methods directly in the browser. No local setup needed.
  - **Working Code Examples:** Not pseudocode. Actual TypeScript that compiles and runs.
  - **Algolia DocSearch:** Instant search across all documentation.
  - **Mobile Responsive:** Because developers read docs on their phones too (usually at 2am debugging something).

  The API Explorer was the killer feature. You paste in a token address, click "Execute," and see real Solana data come back. Try before you code.

  **The Content Strategy**

  Good documentation follows a journey:

  1. **Getting Started:** Install the SDK, make your first call, see it work.
  2. **Core Concepts:** Understand the mental model before diving deep.
  3. **Tutorials:** Step-by-step guides for common tasks.
  4. **API Reference:** Every method, every parameter, every return type.
  5. **Examples:** Real code solving real problems.

  I wrote all of it. Three SDKs (TypeScript, DLMM, Rust). Six complete examples with tests. Tutorial sections that actually make sense.

  Total: about 15,000 words of documentation. Plus all the code.

  **The Writing Process**

  Here's my documentation workflow:

  1. **Use the SDK myself.** Build something small. Note every confusion point.
  2. **Write for the confused past-me.** What did I wish someone had told me?
  3. **Show, don't tell.** Every explanation comes with a code snippet.
  4. **Test every example.** Copy-paste from docs into editor. Does it work? If not, fix the docs.

  That last point is crucial. Nothing kills trust faster than documentation examples that don't compile. Every single code block in my docs was tested.

  **The Little Details**

  Some things I obsessed over:

  - **Consistent formatting.** Every code block uses the same style. Every API method follows the same template.
  - **Proper TypeScript.** Not `any` types everywhere. Real interfaces, real types, real IDE support.
  - **Error handling examples.** Not just happy paths. What happens when things fail?
  - **Links everywhere.** Cross-reference related concepts. Make it easy to jump around.

  I also added a performance optimization section. How to batch RPC calls. How to handle rate limits. The stuff that's obvious to experienced devs but crucial for beginners.

  **The Submission**

  Deployed to Vercel: [saros-docs.rectorspace.com](https://saros-docs.rectorspace.com)

  Wrote a detailed submission explaining my approach. Linked to the GitHub repo. Showed the interactive features.

  Then waited.

  **The Win**

  🥇 **1st Place - Saros SDK Guide Challenge - $300 USDC**

  The Saros team actually reached out about integrating parts of my docs into their official site. That felt better than the money, honestly.

  **What I Learned**

  Documentation is a product. It has users, it has UX, it has success metrics. Treating it as an afterthought is why most docs suck.

  Also: there's real money in docs. Not just bounties, but careers. Developer Advocate roles pay well precisely because most developers can't (or won't) communicate clearly.

  And finally: writing documentation makes you a better developer. You can't explain something you don't understand. The process forces clarity.

  **The Irony**

  I'm now building documentation sections for all my projects. CORE has a CLAUDE.md (for AI assistants). My hackathon projects have comprehensive READMEs.

  Because if I learned anything from this bounty, it's that good docs are a competitive advantage. In a world of half-explained GitHub repos, clear documentation stands out.

  $300 for a month of work isn't much. But the skill of writing great docs? That pays forever.

  ---

  **Result:** 🥇 1st Place - Saros SDK Guide Challenge

  **Prize:** $300 USDC

  **What I Built:** Docusaurus site with interactive API Explorer, 15+ tutorials, 6 working examples

  **Tech Stack:** Docusaurus 3, TypeScript, Algolia DocSearch, Vercel

  **Links:** [Live Site](https://saros-docs.rectorspace.com) • [GitHub](https://github.com/rz1989s/saros-docs)
MARKDOWN

work = Work.find_or_initialize_by(slug: "saros-docs")
work.assign_attributes(
  title: "Saros SDK Docs",
  github_url: "https://github.com/rz1989s/saros-docs",
  live_url: "https://saros-docs.rectorspace.com",
  repo_name: "rz1989s/saros-docs",
  story: saros_story,
  summary: "Comprehensive Docusaurus documentation for Saros Finance SDKs with interactive API Explorer.",
  category: "Documentation",
  status: "Winner",
  technologies: [ "Docusaurus", "TypeScript", "React", "Algolia", "Vercel", "MDX" ],
  started_at: Date.parse("2024-11-15"),
  launched_at: Date.parse("2024-12-15"),
  featured: true,
  github_stars: 0,
  github_forks: 0
)

if work.save
  puts "✓ Saros SDK Docs work created/updated successfully"
else
  puts "✗ Failed to create Saros SDK Docs work: #{work.errors.full_messages.join(', ')}"
end

puts "Database seeding completed!"
