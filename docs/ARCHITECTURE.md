# RECTOR LABS Ecosystem - Technical Architecture

**Version:** 1.0
**Last Updated:** 2025-11-02
**Status:** Foundation Phase

---

## 1. Architecture Overview

### 1.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        rectorspace.com                          │
│                    (Identity Hub - Homepage)                    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Portfolio │  │   Labs   │  │ Journal  │  │Cheatsheet│      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐                                   │
│  │  Dakwa   │  │  Quran   │                                   │
│  └──────────┘  └──────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VPS Infrastructure                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Nginx Reverse Proxy                       │   │
│  │  SSL Termination + Domain Routing                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ User:    │  │ User:    │  │ User:    │  │ User:    │      │
│  │ homepage │  │portfolio │  │  labs    │  │cheatsheet│      │
│  │ (pm2)    │  │ (pm2)    │  │ (pm2)    │  │ (pm2)    │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ User:    │  │ User:    │  │ Ghost    │                    │
│  │  dakwa   │  │  quran   │  │(journal) │                    │
│  │ (pm2)    │  │ (pm2)    │  │(systemd) │                    │
│  └──────────┘  └──────────┘  └──────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                            ▲
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ GitHub   │  │  Quran   │  │  Ghost   │                     │
│  │   API    │  │   API    │  │   CDN    │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Repository Architecture

### 2.1 Monorepo + Submodules Strategy

**Core Repository (RECTOR-LABS/core):**
- 🔒 **PRIVATE** repository
- Central planning and documentation
- Shared design system and components
- Infrastructure as Code
- Internal strategies and sensitive configs
- Git submodules pointing to individual projects

**Individual Repositories:**
Each subdomain has its own repository under `RECTOR-LABS` organization:

```
RECTOR-LABS/
├── core                    🔒 PRIVATE (this repo - foundation & planning)
├── homepage                🌐 PUBLIC → rectorspace.com
├── portfolio               🌐 PUBLIC → portfolio.rectorspace.com
├── labs                    🌐 PUBLIC → labs.rectorspace.com
├── cheatsheet              🌐 PUBLIC → cheatsheet.rectorspace.com
├── dakwa                   🌐 PUBLIC → dakwa.rectorspace.com
└── quran                   🌐 PUBLIC → quran.rectorspace.com
```

**Repository Visibility Strategy:**
- **CORE:** 🔒 PRIVATE - Contains comprehensive planning, internal docs, ecosystem overview
- **Public Platforms:** 🌐 Portfolio showcase, open-source projects, da'wah content
- **Private Platforms:** 🔒 Proprietary features, early development, sensitive business logic

**Benefits:**
- ✅ Independent development and deployment
- ✅ Clear separation of concerns
- ✅ Easy to showcase in portfolio (public repos)
- ✅ Flexible tech stack per project
- ✅ Centralized planning via core repo (private)
- ✅ Control over what's public vs. proprietary

### 2.2 Core Repository Structure

```
core/
├── docs/
│   ├── PRD.md                      # Product Requirements
│   ├── ARCHITECTURE.md             # This file
│   ├── BRAND_GUIDELINES.md         # Visual identity
│   └── IMPLEMENTATION_PLAN.md      # Progress tracking
│
├── design-system/
│   ├── colors.json                 # Brand colors
│   ├── typography.json             # Font system
│   ├── components/                 # Shared UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Button.tsx
│   │   └── ...
│   └── assets/
│       ├── logos/                  # RECTOR LABS logos
│       └── icons/                  # Icon library
│
├── infrastructure/
│   ├── dns/
│   │   └── cloudflare-config.yaml  # DNS configuration
│   ├── hosting/
│   │   ├── nginx/
│   │   │   ├── homepage.conf
│   │   │   ├── portfolio.conf
│   │   │   └── ...
│   │   ├── ssl/
│   │   │   └── letsencrypt-setup.sh
│   │   └── users/
│   │       └── create-project-user.sh
│   └── ci-cd/
│       ├── github-actions/
│       │   ├── deploy-homepage.yml
│       │   ├── deploy-portfolio.yml
│       │   └── ...
│       └── scripts/
│           └── deploy.sh
│
├── prototypes/
│   ├── homepage-v1/                # Experiments
│   └── portfolio-mockup/
│
├── projects/                        # Git Submodules
│   ├── homepage/                   (submodule → rector-labs/homepage)
│   ├── portfolio/                  (submodule → rector-labs/portfolio)
│   ├── labs/                       (submodule → rector-labs/labs)
│   ├── cheatsheet/                 (submodule → rector-labs/cheatsheet)
│   ├── dakwa/                      (submodule → rector-labs/dakwa)
│   └── quran/                      (submodule → rector-labs/quran)
│
├── assets/                          # Legacy assets (for reference)
│   └── images/
│
├── README.md                        # Core repo overview
└── .gitmodules                      # Submodule configuration
```

---

## 3. Infrastructure Architecture

### 3.1 VPS Setup

**Server Specifications:**
- OS: Ubuntu 22.04 LTS (or latest stable)
- Location: Based on rectorspace.com VPS
- SSH Config: `~/.ssh/config` (existing setup)

**Security:**
- Firewall: UFW (ports 80, 443, 22)
- SSH: Key-based authentication only
- Fail2ban: Prevent brute force
- Regular security updates

### 3.2 User Isolation Strategy

**Principle:** 1 Project = 1 User Account

Each subdomain runs under dedicated user account:
```
users:
  - homepage      → runs rectorspace.com
  - portfolio     → runs portfolio.rectorspace.com
  - labs          → runs labs.rectorspace.com
  - cheatsheet    → runs cheatsheet.rectorspace.com
  - dakwa         → runs dakwa.rectorspace.com
  - quran         → runs quran.rectorspace.com
  - ghost         → runs journal.rectorspace.com
```

**Benefits:**
- Security isolation
- Permission management
- Independent process control
- Clean file organization

**User Creation Template:**
```bash
# Create dedicated user
sudo useradd -m -s /bin/bash {project-name}

# Setup home directory
sudo mkdir -p /home/{project-name}/app
sudo chown -R {project-name}:{project-name} /home/{project-name}

# Grant minimal sudo privileges if needed
# (generally not needed for app users)
```

### 3.3 Nginx Reverse Proxy

**Configuration Structure:**
```
/etc/nginx/
├── nginx.conf                      # Main config
├── sites-available/
│   ├── rectorspace.com.conf
│   ├── portfolio.rectorspace.com.conf
│   ├── labs.rectorspace.com.conf
│   ├── journal.rectorspace.com.conf
│   ├── cheatsheet.rectorspace.com.conf
│   ├── dakwa.rectorspace.com.conf
│   └── quran.rectorspace.com.conf
└── sites-enabled/                  # Symlinks
```

**Example Config (homepage):**
```nginx
server {
    listen 80;
    server_name rectorspace.com www.rectorspace.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rectorspace.com www.rectorspace.com;

    ssl_certificate /etc/letsencrypt/live/rectorspace.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rectorspace.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;  # Next.js/Astro dev server
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.4 SSL/TLS

**Certificate Management:**
- Provider: Let's Encrypt (free)
- Tool: Certbot
- Auto-renewal: cron job

**Setup:**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d rectorspace.com -d www.rectorspace.com
sudo certbot --nginx -d portfolio.rectorspace.com
# ... repeat for all subdomains

# Auto-renewal (certbot creates cron automatically)
sudo systemctl status certbot.timer
```

### 3.5 Process Management

**PM2 (for Node.js apps):**
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "homepage" -- start
pm2 start npm --name "portfolio" -- start

# Save process list
pm2 save

# Setup startup script
pm2 startup systemd
```

**systemd (for Ghost CMS):**
```ini
# /etc/systemd/system/ghost-journal.service
[Unit]
Description=Ghost CMS - journal.rectorspace.com
After=network.target

[Service]
Type=simple
User=ghost
WorkingDirectory=/home/ghost/journal
ExecStart=/usr/bin/ghost run
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 4. Technology Stack

### 4.1 Frontend Technologies

| Subdomain | Framework | Styling | Deployment |
|-----------|-----------|---------|------------|
| Homepage | Next.js 15 | Tailwind CSS v4 | SSG/ISR |
| Portfolio | Next.js 15 | Tailwind CSS v4 | SSR/ISR |
| Labs | Next.js 15 | Tailwind CSS v4 | SSG/ISR |
| Journal | Ghost CMS | Ghost Themes | Self-hosted |
| Cheatsheet | Next.js 15 | Tailwind CSS v4 | SSG/ISR |
| Dakwa | Next.js 15 | Tailwind CSS v4 | SSR/ISR |
| Quran | Next.js 15 | Tailwind CSS v4 | SSR/ISR |

**Framework Choice Rationale:**
- **Next.js 15:** Unified stack leveraging developer expertise, App Router with Server Components for optimal performance, ISR for fresh data, excellent DX
- **Tailwind CSS v4:** Utility-first styling with CSS-based configuration, consistent design system
- **Ghost:** Mature CMS, excellent blogging experience for journal

### 4.2 Backend & APIs

**GitHub API Integration (Portfolio):**
- Fetch repositories from `rz1989s` and `RECTOR-LABS`
- Cache responses (reduce API calls)
- Enrich with manual metadata

**Quran API:**
- Third-party service (e.g., Quran.com API, alquran.cloud)
- Local caching for performance
- Support multiple translations

**Ghost API (Journal):**
- Content API for headless integration if needed
- Admin API for programmatic posting

### 4.3 Database Strategy

**Minimal Database Usage (Phase 1):**
- Most sites are static or use external APIs
- Ghost has built-in SQLite/MySQL
- Consider database only for:
  - User-generated content (future)
  - Analytics (self-hosted Plausible/Umami)
  - Cheatsheet search index

**Potential Databases:**
- SQLite: Simple, embedded (Ghost default)
- PostgreSQL: If complex queries needed
- MongoDB: For flexible JSON documents

---

## 5. Deployment Architecture

### 5.1 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy-homepage.yml
name: Deploy Homepage

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: homepage
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/app
            git pull origin main
            npm ci --production
            npm run build
            pm2 restart homepage
```

### 5.2 Deployment Strategy

**Branches:**
- `main`: Production (auto-deploy)
- `dev`: Development (manual deploy for testing)
- `feature/*`: Feature branches (PR to dev)

**Deployment Steps:**
1. Push to GitHub
2. GitHub Actions triggers
3. Build application
4. SSH into VPS (user account)
5. Pull latest code
6. Install dependencies
7. Build production assets
8. Restart PM2/systemd service
9. Verify health check

### 5.3 Rollback Strategy

**PM2 Rollback:**
```bash
# Keep previous version
pm2 save --force  # Before deployment

# Rollback if needed
git reset --hard HEAD~1
npm ci --production
npm run build
pm2 restart homepage
```

---

## 6. Data Flow Architecture

### 6.1 Portfolio Data Flow

```
GitHub API (rz1989s + RECTOR-LABS)
          ↓
    Fetch Repositories
          ↓
     Cache (Redis/File)
          ↓
  Enrich with Metadata (manual JSON)
          ↓
   Render Portfolio Page
          ↓
    Incremental Static Regeneration (ISR)
```

### 6.2 Quran Data Flow

```
Quran API (Third-party)
          ↓
     Initial Fetch
          ↓
  Local Cache (JSON files)
          ↓
   Build Time Pre-rendering
          ↓
  Client-side Search/Filter
```

### 6.3 Journal Data Flow

```
Ghost CMS (Self-hosted)
          ↓
  Ghost Content API
          ↓
  Render on journal.rectorspace.com
     (or)
  Headless mode → Next.js frontend
```

---

## 7. Security Architecture

### 7.1 Security Layers

1. **Network Layer:**
   - Firewall (UFW)
   - Fail2ban (intrusion prevention)
   - DDoS protection (Cloudflare optional)

2. **Application Layer:**
   - HTTPS everywhere (Let's Encrypt)
   - Secure headers (HSTS, CSP, X-Frame-Options)
   - Input validation
   - Rate limiting (Nginx)

3. **Access Layer:**
   - SSH key-based auth only
   - User isolation per project
   - Least privilege principle

### 7.2 Secrets Management

**Environment Variables:**
```bash
# /home/{user}/app/.env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
QURAN_API_KEY=xxxxxxxxxxxxx
GHOST_API_KEY=xxxxxxxxxxxxx
```

**Never commit to git:**
- `.env` files
- API keys
- Certificates
- Database credentials

**GitHub Secrets:**
- VPS_HOST
- VPS_SSH_KEY
- Deployment credentials

---

## 8. Monitoring & Observability

### 8.1 Logging Strategy

**Application Logs:**
- PM2 logs: `/home/{user}/.pm2/logs/`
- Nginx logs: `/var/log/nginx/`
- Ghost logs: `/home/ghost/journal/logs/`

**Centralized Logging (Future):**
- Consider: Loki + Grafana
- Or: Simple log aggregation script

### 8.2 Monitoring

**System Monitoring:**
- CPU, Memory, Disk usage
- Tools: htop, netdata, Grafana

**Application Monitoring:**
- Uptime checks (external service)
- Response time tracking
- Error rate monitoring

**Analytics:**
- Privacy-focused: Plausible/Umami (self-hosted)
- Avoid Google Analytics (privacy)

---

## 9. Scalability Considerations

### 9.1 Current Architecture (Phase 1)
- Single VPS
- Static sites + simple dynamic apps
- Expected traffic: <10k monthly visitors

### 9.2 Future Scaling Options

**Horizontal Scaling:**
- Add more VPS instances
- Load balancer (Nginx/HAProxy)
- CDN for static assets (Cloudflare)

**Vertical Scaling:**
- Upgrade VPS resources
- Optimize application code
- Database optimization

**Caching:**
- Redis for API responses
- Nginx caching for static assets
- Browser caching headers

---

## 10. Disaster Recovery

### 10.1 Backup Strategy

**What to Backup:**
- Application code (git repositories)
- Database (Ghost SQLite/MySQL)
- User-generated content
- Configuration files
- SSL certificates

**Backup Frequency:**
- Code: Continuous (git)
- Database: Daily
- Configs: Weekly
- Full system: Weekly

**Backup Storage:**
- Remote location (not same VPS)
- Cloud storage (S3, Backblaze B2)
- Encrypted backups

### 10.2 Recovery Plan

**RTO (Recovery Time Objective):** <4 hours
**RPO (Recovery Point Objective):** <24 hours

**Recovery Steps:**
1. Provision new VPS if needed
2. Restore system configs
3. Clone git repositories
4. Restore databases
5. Restore SSL certificates
6. Update DNS if needed
7. Verify all services

---

## 11. Development Workflow

### 11.1 Local Development

**Setup:**
```bash
# Clone core repository
git clone git@github.com:RECTOR-LABS/core.git
cd core

# Initialize submodules
git submodule update --init --recursive

# Work on specific project
cd projects/homepage
npm install
npm run dev
```

### 11.2 Feature Development

1. Create feature branch: `git checkout -b feature/new-feature`
2. Develop and test locally
3. Commit changes (meaningful messages)
4. Push to GitHub
5. Create Pull Request to `dev`
6. Review and merge
7. Deploy to production when ready

---

## 12. Documentation Strategy

### 12.1 Documentation Types

- **Planning Docs:** PRD, Architecture (this repo)
- **Code Docs:** README per repository, inline comments
- **API Docs:** OpenAPI/Swagger for APIs
- **User Docs:** Help pages on websites

### 12.2 Maintenance

- Update ARCHITECTURE.md when infrastructure changes
- Update PRD when scope changes
- Update IMPLEMENTATION_PLAN.md weekly
- Keep README.md synchronized with actual state

---

## 13. Appendix

### 13.1 Port Assignments

| Service | Port | User | Subdomain |
|---------|------|------|-----------|
| Nginx | 80, 443 | root | All |
| Homepage | 3000 | homepage | rectorspace.com |
| Portfolio | 3001 | portfolio | portfolio.rectorspace.com |
| Labs | 3002 | labs | labs.rectorspace.com |
| Journal (Ghost) | 2368 | ghost | journal.rectorspace.com |
| Cheatsheet | 3003 | cheatsheet | cheatsheet.rectorspace.com |
| Dakwa | 3004 | dakwa | dakwa.rectorspace.com |
| Quran | 3005 | quran | quran.rectorspace.com |

### 13.2 DNS Configuration

```
# A Records
rectorspace.com                 → VPS_IP
*.rectorspace.com               → VPS_IP (wildcard)

# Or individual CNAME
portfolio.rectorspace.com       → rectorspace.com
labs.rectorspace.com            → rectorspace.com
journal.rectorspace.com         → rectorspace.com
cheatsheet.rectorspace.com      → rectorspace.com
dakwa.rectorspace.com           → rectorspace.com
quran.rectorspace.com           → rectorspace.com
```

### 13.3 Useful Commands Reference

**Git Submodules:**
```bash
# Add submodule
git submodule add git@github.com:RECTOR-LABS/homepage.git projects/homepage

# Update all submodules
git submodule update --remote --merge

# Clone with submodules
git clone --recurse-submodules git@github.com:RECTOR-LABS/core.git
```

**PM2:**
```bash
pm2 list                    # List all processes
pm2 logs homepage           # View logs
pm2 restart homepage        # Restart app
pm2 delete homepage         # Remove from PM2
pm2 monit                   # Monitor resources
```

**Nginx:**
```bash
sudo nginx -t               # Test config
sudo systemctl reload nginx # Reload config
sudo systemctl restart nginx # Restart nginx
```

---

**Document Metadata:**
- Created: 2025-11-02
- Last Updated: 2025-11-02
- Next Review: Weekly during Phase 1
- Owner: RECTOR
