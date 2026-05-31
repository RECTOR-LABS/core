---
title: CORE
slug: core
summary: Rails 8 monolith for the complete rectorspace.com ecosystem - built in one
  weekend to prove monoliths aren't dead
category: Infrastructure
status: Live
github_url: https://github.com/RECTOR-LABS/core
live_url: https://rectorspace.com
repo_name: RECTOR-LABS/core
started_at: '2025-11-02'
launched_at: '2025-11-03'
featured: true
technologies:
- Ruby
- Rails 8
- PostgreSQL
- Tailwind CSS
- Nginx
- Puma
- Solid Queue
github_stars: 0
github_forks: 0
---

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

Rails? One repo. One deployment. Database migrations that actually work. Background jobs built-in with [Solid Queue](https://github.com/rails/solid_queue). It just... works. And after spending months in blockchain dev where nothing works the first time — though I eventually [won a few hackathons](/work/web3-deal-discovery) — that's refreshing as hell.

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
