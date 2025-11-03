# Rails 8 + Tailwind v4 Initialization Plan

**Purpose:** Step-by-step guide to transform CORE into a Rails 8 monolithic application with Tailwind CSS v4.

**Date:** 2025-11-03
**Maintainer:** RECTOR

---

## Prerequisites Check

Before starting, ensure you have:

- [x] Ruby 3.2.2 (installed, confirmed via `ruby --version`)
- [ ] Rails 8.x (`gem install rails` or `gem install rails -v 8.0.0`)
- [ ] PostgreSQL (for production database)
- [ ] Node.js 18+ and npm/yarn (for asset pipeline)
- [ ] Git (for version control)

---

## Phase 1: Install Rails 8

### Step 1.1: Install Rails Gem

```bash
# Install latest Rails 8
gem install rails

# Or specify exact version
gem install rails -v 8.0.0

# Verify installation
rails --version
# Expected output: Rails 8.x.x
```

### Step 1.2: Install Bundler (if needed)

```bash
gem install bundler
bundler --version
```

---

## Phase 2: Initialize Rails Application

### Step 2.1: Initialize Rails in Current Directory

**IMPORTANT:** This command initializes Rails **in the current directory** (CORE repo).

```bash
# Navigate to CORE directory
cd /Users/rz/local-dev/core

# Initialize Rails app with PostgreSQL and Tailwind CSS
rails new . --database=postgresql --css=tailwind --skip-git

# Flags explained:
# .                    = Initialize in current directory
# --database=postgresql = Use PostgreSQL (recommended for production)
# --css=tailwind        = Install Tailwind CSS
# --skip-git            = Don't reinitialize git (we already have .git)
```

**What happens:**
- Rails creates `app/`, `config/`, `db/`, `public/`, etc.
- Existing files (`assets/`, `docs/`, `CLAUDE.md`, `README.md`) remain intact
- Rails will ask if you want to overwrite `.gitignore` → Answer **Yes** (Rails gitignore is comprehensive)

### Step 2.2: Upgrade Tailwind to v4

Rails 8 includes Tailwind CSS by default, but it might be v3. Upgrade to v4:

```bash
# Update Tailwind CSS to v4
npm install tailwindcss@next @tailwindcss/postcss@next

# Or if using yarn
yarn add tailwindcss@next @tailwindcss/postcss@next
```

**Update `tailwind.config.js`:**

```javascript
// tailwind.config.js
export default {
  content: [
    './app/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/javascript/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        // RECTOR LABS brand colors
        turquoise: '#5EDDC6',
        cyan: '#4DD0E1',
        blue: '#42A5F5',
        'dark-navy': '#1A252F',
        navy: '#2C3E50',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

**Update `app/assets/stylesheets/application.tailwind.css`:**

```css
@import "tailwindcss";

/* Custom styles */
@layer base {
  body {
    @apply font-body text-gray-900 bg-dark-navy;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }

  code, pre {
    @apply font-mono;
  }
}

@layer components {
  .gradient-text {
    @apply bg-gradient-to-r from-turquoise via-cyan to-blue bg-clip-text text-transparent;
  }
}
```

### Step 2.3: Install Dependencies

```bash
# Install Ruby gems
bundle install

# Install JavaScript packages
npm install
# or: yarn install
```

---

## Phase 3: Configure Database

### Step 3.1: Update Database Configuration

Edit `config/database.yml`:

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: core_development

test:
  <<: *default
  database: core_test

production:
  <<: *default
  database: core_production
  username: core
  password: <%= ENV['CORE_DATABASE_PASSWORD'] %>
```

### Step 3.2: Create Database

```bash
# Create development and test databases
bin/rails db:create

# Expected output:
# Created database 'core_development'
# Created database 'core_test'
```

---

## Phase 4: Generate Section Controllers and Models

### Step 4.1: Generate Homepage Controller

```bash
bin/rails generate controller Pages home about contact
```

This creates:
- `app/controllers/pages_controller.rb`
- `app/views/pages/home.html.erb`
- `app/views/pages/about.html.erb`
- `app/views/pages/contact.html.erb`

### Step 4.2: Generate Portfolio Resources

```bash
# Generate Portfolio controller
bin/rails generate controller Portfolio index show

# Generate Project model
bin/rails generate model Project \
  title:string \
  description:text \
  url:string \
  github_url:string \
  featured:boolean \
  category:string \
  tech_stack:text \
  published_at:datetime

# Run migrations
bin/rails db:migrate
```

### Step 4.3: Generate Labs Resources

```bash
# Generate Labs controller
bin/rails generate controller Labs index show

# Generate Experiment model
bin/rails generate model Experiment \
  title:string \
  description:text \
  url:string \
  github_url:string \
  status:string \
  tags:text \
  published_at:datetime

# Run migrations
bin/rails db:migrate
```

### Step 4.4: Generate Journal Controller

```bash
# Journal integrates with Ghost CMS (no model needed)
bin/rails generate controller Journal index show
```

### Step 4.5: Generate Cheatsheet Resources

```bash
# Generate Cheatsheet controller
bin/rails generate controller Cheatsheet index show

# Generate Snippet model
bin/rails generate model Snippet \
  title:string \
  description:text \
  code:text \
  language:string \
  category:string \
  tags:text \
  published_at:datetime

# Run migrations
bin/rails db:migrate
```

### Step 4.6: Generate Dakwa Resources

```bash
# Generate Dakwa controller
bin/rails generate controller Dakwa index show

# Generate DakwaContent model
bin/rails generate model DakwaContent \
  title:string \
  content:text \
  category:string \
  tags:text \
  published_at:datetime

# Run migrations
bin/rails db:migrate
```

### Step 4.7: Generate Quran Resources

```bash
# Generate Quran controller
bin/rails generate controller Quran index show

# Generate QuranResource model (for bookmarks, notes, etc.)
bin/rails generate model QuranResource \
  surah_number:integer \
  ayah_number:integer \
  notes:text \
  bookmarked:boolean \
  user_id:integer

# Run migrations
bin/rails db:migrate
```

---

## Phase 5: Configure Routes

### Step 5.1: Update `config/routes.rb`

```ruby
Rails.application.routes.draw do
  # Homepage
  root "pages#home"

  # Pages
  get "about", to: "pages#about"
  get "contact", to: "pages#contact"

  # Portfolio section
  resources :portfolio, only: [:index, :show], path: "portfolio"

  # Labs section
  resources :labs, only: [:index, :show], path: "labs"

  # Journal section (Ghost CMS integration)
  resources :journal, only: [:index, :show], path: "journal"

  # Cheatsheet section
  resources :cheatsheet, only: [:index, :show], path: "cheatsheet"

  # Dakwa section
  resources :dakwa, only: [:index, :show], path: "dakwa"

  # Quran section
  resources :quran, only: [:index, :show], path: "quran"

  # Health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check
end
```

### Step 5.2: Verify Routes

```bash
bin/rails routes

# Expected output:
# root GET  /                   pages#home
# portfolio_index GET /portfolio      portfolio#index
# portfolio GET /portfolio/:id        portfolio#show
# labs_index GET /labs                labs#index
# ...
```

---

## Phase 6: Setup External Services Integration

### Step 6.1: Install HTTP Client Gems

Add to `Gemfile`:

```ruby
# External API integrations
gem 'faraday'           # HTTP client
gem 'faraday-retry'     # Retry failed requests
gem 'oj'                # Fast JSON parser
```

Then run:

```bash
bundle install
```

### Step 6.2: Create Ghost CMS Service

```bash
# Create services directory
mkdir -p app/services

# Create Ghost API service
touch app/services/ghost_api_service.rb
```

Edit `app/services/ghost_api_service.rb`:

```ruby
class GhostApiService
  include HTTParty
  base_uri ENV.fetch('GHOST_API_URL', 'https://your-ghost-site.com')

  def initialize
    @api_key = ENV.fetch('GHOST_API_KEY', '')
  end

  def fetch_posts(limit: 10)
    self.class.get('/ghost/api/content/posts/',
      query: { key: @api_key, limit: limit, include: 'tags,authors' }
    )
  end

  def fetch_post(slug)
    self.class.get("/ghost/api/content/posts/slug/#{slug}/",
      query: { key: @api_key, include: 'tags,authors' }
    )
  end
end
```

### Step 6.3: Create GitHub API Service

```bash
touch app/services/github_api_service.rb
```

Edit `app/services/github_api_service.rb`:

```ruby
class GithubApiService
  include HTTParty
  base_uri 'https://api.github.com'

  def initialize(username = 'rz1989s')
    @username = username
    @token = ENV.fetch('GITHUB_TOKEN', '')
    @headers = {
      'Authorization' => "token #{@token}",
      'Accept' => 'application/vnd.github.v3+json'
    }
  end

  def fetch_repos
    self.class.get("/users/#{@username}/repos", headers: @headers)
  end

  def fetch_pinned_repos
    # GitHub GraphQL API for pinned repos
    # Implementation depends on your needs
  end
end
```

---

## Phase 7: Environment Variables

### Step 7.1: Create `.env` file (Development)

```bash
# Create .env file (gitignored)
touch .env
```

Edit `.env`:

```env
# Database
DATABASE_URL=postgresql://localhost/core_development

# Ghost CMS
GHOST_API_URL=https://your-ghost-site.com
GHOST_API_KEY=your_ghost_content_api_key

# GitHub API
GITHUB_TOKEN=your_github_personal_access_token

# Quran API (if needed)
QURAN_API_KEY=your_quran_api_key
```

**IMPORTANT:** Ensure `.env` is in `.gitignore` (Rails adds this by default).

### Step 7.2: Setup Rails Credentials (Production)

```bash
# Edit production credentials
EDITOR=nano bin/rails credentials:edit --environment production

# Add:
# ghost_api_url: https://your-ghost-site.com
# ghost_api_key: your_key
# github_token: your_token
# database_password: your_db_password
```

---

## Phase 8: First Run

### Step 8.1: Start Development Server

```bash
# Start Rails server
bin/rails server

# Or with specific port
bin/rails server -p 3000
```

### Step 8.2: Visit Application

Open browser: `http://localhost:3000`

Expected: Rails welcome page or homepage (depending on routes)

### Step 8.3: Verify Tailwind CSS

Check that Tailwind CSS is loading:
- Inspect page elements
- Verify Tailwind classes are applied
- Check browser console for CSS errors

---

## Phase 9: Seed Sample Data

### Step 9.1: Create Seed Data

Edit `db/seeds.rb`:

```ruby
# Clear existing data
Project.destroy_all
Experiment.destroy_all
Snippet.destroy_all
DakwaContent.destroy_all

# Portfolio Projects
Project.create([
  {
    title: "Example Project 1",
    description: "A sample portfolio project",
    url: "https://example.com",
    github_url: "https://github.com/rz1989s/example",
    featured: true,
    category: "Web Development",
    tech_stack: "Rails, React, PostgreSQL",
    published_at: Time.now
  }
])

# Labs Experiments
Experiment.create([
  {
    title: "Example Experiment",
    description: "A quick prototype",
    github_url: "https://github.com/rz1989s/experiment",
    status: "in_progress",
    tags: "rails,api,prototype",
    published_at: Time.now
  }
])

puts "✅ Seeded sample data successfully!"
```

### Step 9.2: Run Seeds

```bash
bin/rails db:seed
```

---

## Phase 10: Testing

### Step 10.1: Run Test Suite

```bash
# Run all tests
bin/rails test

# Or with RSpec (if using RSpec)
bundle exec rspec
```

### Step 10.2: Manual Testing Checklist

- [ ] Homepage loads at `/`
- [ ] Portfolio section loads at `/portfolio`
- [ ] Labs section loads at `/labs`
- [ ] Journal section loads at `/journal`
- [ ] Cheatsheet section loads at `/cheatsheet`
- [ ] Dakwa section loads at `/dakwa`
- [ ] Quran section loads at `/quran`
- [ ] Tailwind CSS styles applied correctly
- [ ] Brand colors working (gradient text, backgrounds)
- [ ] Custom fonts loaded (Space Grotesk, Inter, JetBrains Mono)

---

## Phase 11: Git Commit

### Step 11.1: Review Changes

```bash
git status
git diff
```

### Step 11.2: Commit Rails Initialization

```bash
git add .
git commit -m "feat: initialize Rails 8 monolith with Tailwind v4

- Initialize Rails 8 application with PostgreSQL
- Add Tailwind CSS v4 with RECTOR LABS brand colors
- Generate controllers and models for 7 sections (portfolio, labs, journal, cheatsheet, dakwa, quran)
- Setup routes for all sections
- Create Ghost CMS and GitHub API services
- Add environment variables configuration
- Seed sample data

This transforms CORE from documentation hub to production Rails application."
```

### Step 11.3: Push to Remote

```bash
git push origin dev
```

---

## Post-Initialization Tasks

### Optional Enhancements

1. **Authentication:**
   ```bash
   bundle add devise
   bin/rails generate devise:install
   bin/rails generate devise User
   bin/rails db:migrate
   ```

2. **Background Jobs (Sidekiq):**
   ```bash
   bundle add sidekiq
   bundle add redis
   ```

3. **Testing Framework (RSpec):**
   ```bash
   bundle add rspec-rails --group "development,test"
   bin/rails generate rspec:install
   ```

4. **Code Quality:**
   ```bash
   bundle add rubocop --group "development,test"
   bundle add rubocop-rails --group "development,test"
   ```

5. **Deployment Setup:**
   - Configure Capistrano for VPS deployment
   - Setup GitHub Actions CI/CD
   - Configure Nginx + Puma/Passenger

---

## Troubleshooting

### Issue: Rails command not found
**Solution:** Install Rails gem: `gem install rails`

### Issue: PostgreSQL connection refused
**Solution:**
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### Issue: Tailwind CSS not compiling
**Solution:**
```bash
bin/rails assets:clobber
bin/rails assets:precompile
bin/rails restart
```

### Issue: Node modules missing
**Solution:**
```bash
rm -rf node_modules
npm install
```

---

## Resources

- [Rails 8 Release Notes](https://edgeguides.rubyonrails.org/8_0_release_notes.html)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Rails + Tailwind Guide](https://tailwindcss.com/docs/guides/ruby-on-rails)
- [Ghost Content API](https://ghost.org/docs/content-api/)
- [GitHub REST API](https://docs.github.com/en/rest)

---

**Maintainer:** RECTOR | **Updated:** 2025-11-03

**May Allah make this initialization smooth and successful. Aamiin.**

**RECTOR LABS** | Building for Eternity | 2025
