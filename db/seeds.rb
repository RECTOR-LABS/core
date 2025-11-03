# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding database..."

# CORE work story
core_story = <<~MARKDOWN
  # CORE: When I Stopped Overthinking Everything

  Real talk - I had this whole grand plan. Seven different projects, seven repos, microservices architecture, Docker containers, Kubernetes, the works. Was gonna build this whole ecosystem for rectorspace.com with Next.js for the frontend, separate Node backends, maybe throw in some Rust microservices because why not, right?

  And then one Saturday morning, I'm sitting there with my third cup of coffee, staring at my whiteboard covered in architecture diagrams, and I'm like... wait. Why am I doing this to myself?

  Here's the thing about being a developer. We love to overcomplicate stuff. It's like a disease. Someone says "I need a website" and we're already planning the distributed system with event sourcing and CQRS. Meanwhile, Rails exists. Rails 8 specifically. And I'd been sleeping on it.

  So I made a decision that felt kinda blasphemous for someone who's been doing TypeScript and Solana work. I deleted everything and typed `rails new core`. Just like that. Two days ago, actually. November 2nd, 2025. Bismillah.

  **The Bet**

  I gave myself a challenge: can I ship a production-ready platform in one weekend? Not a prototype. Not an MVP. Production. With SSL, proper deployment, GitHub Actions CI/CD, the works. And it had to actually look good - none of that "I'll design it later" Bootstrap nonsense.

  Spoiler: kind of did it. With a bunch of bugs along the way, but hey, that's the fun part.

  **Why Rails? (The Honest Version)**

  Look, I could give you the technical reasons. Monolithic architecture, convention over configuration, mature ecosystem, all that. But real reason? I was tired of config files. So. Tired.

  With my previous setup, I had:
  - 7 different repos to maintain
  - Different package.json files
  - Separate deployment pipelines
  - Database connections between services
  - API versioning headaches
  - "Which port is this running on again?" moments

  Rails? One repo. One deployment. Database migrations that actually work. Background jobs built-in (Solid Queue is amazing btw). It just... works. And after spending months in blockchain dev where nothing works the first time, that's refreshing.

  Plus, Rails 8 came out with all these new goodies. Solid Queue for background jobs, Solid Cache, authentication generators. It's like DHH looked at what we were doing with external services and said "nah, let's just include it."

  **The Design Thing**

  Here's where it got interesting. I have this MonkeDAO NFT as my profile pic - pixel art monkey with this warm color palette. Orange, yellow, cream, brown. And I thought... what if the whole site matched that vibe?

  So I grabbed Tailwind CSS v4 (because of course), pulled the colors from my NFT, and built this whole warm, pixel-art-inspired design system. JetBrains Mono for everything - yes, even the body text. It's monospace. It's a bit unusual. I don't care, it looks cool and screams "developer made this."

  The layout is inspired by DHH's personal site - minimal nav, letter-style content, just text and links flowing naturally. None of that corporate navbar/sidebar/footer stuff. Just... content. The way blogs used to be before everyone decided they needed to look like SaaS products.

  **The 48-Hour Sprint**

  Friday night: Set up Rails, configure PostgreSQL, pick the color scheme. Got the homepage working around 2am.

  Saturday: This is where it got messy. Built the GitHub API integration to show my projects dynamically. Wrote a background job that syncs my repos every hour. Set up Tailwind with custom colors. Made like 15 commits just fixing CSS spacing lol.

  Then came deployment. Set up a VPS, configured Nginx, got SSL working with Let's Encrypt. Puma kept crashing because I forgot Unix sockets exist. Fixed that at 3am. Then SECRET_KEY_BASE wasn't loading. Then Ruby version mismatch. Then... you get the idea.

  Sunday morning: Alhamdulillah, it's live. rectorspace.com points to a actual working Rails app. The version footer shows which commit is running in production. GitHub Actions automatically deploys when I push to main. It's not perfect but it's real.

  **The Seven Sections** (Most Don't Exist Yet lol)

  The plan is seven sections under one domain:
  - Homepage (✅ live)
  - Work (📋 building this now actually)
  - Labs (📋 for experiments)
  - Journal (📋 Ghost CMS integration)
  - Cheatsheet (📋 dev notes)
  - Dakwa (📋 Islamic content)
  - Quran (📋 Quranic resources)

  Yeah, only homepage works right now. But that's fine! Ship first, build second. The infrastructure is solid. Adding new sections is just controllers and views.

  **What I Learned** (The Real Stuff)

  1. **Monoliths aren't evil.** Microservices are great when you need them. For a solo developer building multiple related things? Monolith wins.

  2. **Rails is still good.** Really good. The "Rails is dead" people don't know what they're talking about. Rails 8 feels modern and fast.

  3. **Ship broken things.** I deployed with bugs. Fixed them in production. It's fine. Perfect is the enemy of done.

  4. **Design matters but don't overthink it.** I spent 3 hours tweaking colors. Was it worth it? Maybe. But it makes me happy to look at it, so yeah.

  5. **Use boring technology.** PostgreSQL, Nginx, Puma, Rails - all boring, all battle-tested, all just work. Saved me so much debugging time.

  **Where It's Going**

  Right now I'm building the /work section with story-driven project pages. Not just "here's my projects" but actual narratives. Why they exist, what I learned, the messy parts. Because boring portfolios are... boring.

  Then Labs for experiments. Then Ghost CMS integration for writing. Then the Islamic sections because building for eternity means building for dunya AND akhirah, you know?

  The repo is public now (just made it public today actually). So you can see all the commits, all the fixes, all the "wait why did I do it that way" moments. Real code, real mess, real progress.

  **The Philosophy**

  There's this thing in Islam called "ihsan" - excellence in everything you do. Not perfection. Excellence. Doing your best work because Allah is watching. That's what this is about.

  Not trying to build a unicorn startup. Not chasing VC funding. Just building something useful, something beautiful, something that serves both my worldly goals and my faith. "Building for Eternity" isn't a tagline - it's literally the mission.

  Will people use it? Maybe. Will it make money? Not the priority. Will it be something I'm proud of in 10 years? InshaAllah, yes. That's enough.

  So yeah. That's CORE. Two days old. Already in production. Lots of placeholder sections. Even more bugs probably. But it's mine, it's real, and it's just getting started.

  And if you're wondering whether you should build that thing you've been planning for months - yes. Stop planning. Just build it. You can refactor later.

  ---

  **Tech Stack:** Ruby on Rails 8, PostgreSQL, Tailwind CSS v4, Nginx, Puma

  **Status:** Live in production (with bugs, naturally)

  **Links:** [GitHub](https://github.com/RECTOR-LABS/core) • [Live Site](https://rectorspace.com)

  **Timeline:** Started Nov 2, 2025 • Deployed Nov 3, 2025 • Still actively building
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
  technologies: [ "Ruby", "Rails 8", "PostgreSQL", "Tailwind CSS", "Nginx", "Puma" ],
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

puts "Database seeding completed!"
