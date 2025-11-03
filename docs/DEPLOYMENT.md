# Deployment Guide - RECTOR LABS CORE

Complete guide for deploying Rails 8 monolith to production VPS with GitHub Actions auto-deploy.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Initial Setup](#initial-setup)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Manual Deployment](#manual-deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Strategy:** GitHub Actions auto-deploy with zero-downtime restarts

**Stack:**
- Rails 8 (Ruby 3.3+)
- PostgreSQL (database)
- Puma (web server with workers)
- Solid Queue (background jobs)
- Nginx (reverse proxy)
- Let's Encrypt (SSL)
- systemd (process management)

**Deployment Flow:**
```
git push origin main
  → GitHub Actions triggered
  → SSH to VPS
  → Pull code + Bundle + Assets + Migrate
  → Zero-downtime reload (Puma phased restart)
  → Health check
  → ✅ Live at https://rectorspace.com
```

---

## Architecture

```
                    ┌─────────────────────┐
                    │   GitHub Actions    │
                    │   (Auto-Deploy)     │
                    └──────────┬──────────┘
                               │ SSH
                               ▼
┌──────────────────────────────────────────────────────────┐
│                    VPS (176.222.53.185)                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐         ┌──────────────┐              │
│  │   Nginx     │ ──────> │ Puma Workers │              │
│  │  (Port 80)  │         │  (Port 3000) │              │
│  │  (Port 443) │         │   2 Workers  │              │
│  └─────────────┘         └──────┬───────┘              │
│                                  │                       │
│  ┌─────────────────┐            │                       │
│  │  Solid Queue    │            │                       │
│  │  (Background)   │ <──────────┘                       │
│  └─────────────────┘                                    │
│                                  │                       │
│  ┌─────────────────────────────────────┐               │
│  │         PostgreSQL                   │               │
│  │     (core_production)                │               │
│  └─────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────┘
```

---

## Initial Setup

### 1. Create VPS User Account

**SSH as root or sudo user:**
```bash
ssh root@176.222.53.185

# Create user 'core'
adduser core --disabled-password --gecos ""
usermod -aG sudo core

# Setup SSH key
mkdir -p /home/core/.ssh
cp ~/.ssh/authorized_keys /home/core/.ssh/
chown -R core:core /home/core/.ssh
chmod 700 /home/core/.ssh
chmod 600 /home/core/.ssh/authorized_keys
```

**Add to your local ~/.ssh/config:**
```
Host core
  HostName 176.222.53.185
  User core
```

**Test:** `ssh core`

### 2. Install Dependencies

**SSH as core user:**
```bash
ssh core

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y git curl libssl-dev libreadline-dev zlib1g-dev \
  autoconf bison build-essential libyaml-dev libreadline-dev \
  libncurses5-dev libffi-dev libgdbm-dev nodejs npm postgresql \
  postgresql-contrib libpq-dev nginx certbot python3-certbot-nginx
```

### 3. Install Ruby 3.3+ via rbenv

```bash
# Install rbenv
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash

# Add to ~/.bashrc
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc

# Install Ruby 3.3.6
rbenv install 3.3.6
rbenv global 3.3.6

# Install bundler
gem install bundler

# Verify
ruby -v  # Should show 3.3.6
```

### 4. Setup PostgreSQL Database

```bash
# Create database and user
sudo -u postgres psql << 'EOSQL'
CREATE USER core WITH PASSWORD 'your_secure_password';
CREATE DATABASE core_production OWNER core;
GRANT ALL PRIVILEGES ON DATABASE core_production TO core;
\q
EOSQL
```

**Save password - you'll need it for .env**

### 5. Clone Repository and Configure

```bash
cd ~
git clone https://github.com/RECTOR-LABS/core.git
cd core

# Install dependencies
bundle install --deployment --without development test

# Generate Rails secret
bin/rails secret  # Copy output

# Create .env file
nano .env
```

**Add to .env:**
```bash
RAILS_ENV=production
RACK_ENV=production

# GitHub API
GITHUB_TOKEN=your_github_token

# Database
CORE_DATABASE_PASSWORD=your_postgres_password

# Rails secret (from bin/rails secret)
SECRET_KEY_BASE=your_secret_key_base

# Optional: Database URL
DATABASE_URL=postgresql://core:your_password@localhost/core_production
```

**Secure it:**
```bash
chmod 600 .env
```

### 6. Initialize Database

```bash
# Precompile assets
RAILS_ENV=production bin/rails assets:precompile

# Create and migrate database
RAILS_ENV=production bin/rails db:create
RAILS_ENV=production bin/rails db:migrate

# Initial GitHub sync
RAILS_ENV=production bin/rails github:sync
```

### 7. Setup systemd Services

```bash
# Copy service files
sudo cp ~/core/docs/systemd/core-puma.service /etc/systemd/system/
sudo cp ~/core/docs/systemd/core-solidqueue.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable services (start on boot)
sudo systemctl enable core-puma
sudo systemctl enable core-solidqueue

# Start services
sudo systemctl start core-puma
sudo systemctl start core-solidqueue

# Check status
sudo systemctl status core-puma
sudo systemctl status core-solidqueue
```

### 8. Configure Nginx

**Create site config:**
```bash
sudo nano /etc/nginx/sites-available/rectorspace.com
```

**Add:**
```nginx
upstream puma_core {
  server localhost:3000 fail_timeout=0;
}

server {
  listen 80;
  listen [::]:80;
  server_name rectorspace.com www.rectorspace.com;

  location /.well-known/acme-challenge/ {
    root /var/www/html;
  }

  location / {
    return 301 https://$host$request_uri;
  }
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name rectorspace.com www.rectorspace.com;

  # SSL certificates (will be added by certbot)
  ssl_certificate /etc/letsencrypt/live/rectorspace.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/rectorspace.com/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

  root /home/core/core/public;

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "no-referrer-when-downgrade" always;
  add_header Strict-Transport-Security "max-age=31536000" always;

  try_files $uri @puma_core;

  location @puma_core {
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    proxy_pass http://puma_core;
  }

  location /up {
    access_log off;
    proxy_pass http://puma_core;
  }

  location ~* ^/assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  error_page 500 502 503 504 /500.html;
  client_max_body_size 10M;
  keepalive_timeout 10;
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/rectorspace.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Setup SSL with Let's Encrypt

```bash
# Obtain certificate
sudo certbot --nginx -d rectorspace.com -d www.rectorspace.com

# Follow prompts:
# Email: rheza10@gmail.com
# Agree to terms: Yes
# Redirect HTTP to HTTPS: Yes

# Test auto-renewal
sudo certbot renew --dry-run
```

### 10. Setup sudoers for Deployments

**Allow `core` user to reload services without password:**
```bash
sudo visudo
```

**Add at the end:**
```
# Allow core user to manage deployment services
core ALL=(ALL) NOPASSWD: /bin/systemctl reload core-puma
core ALL=(ALL) NOPASSWD: /bin/systemctl restart core-puma
core ALL=(ALL) NOPASSWD: /bin/systemctl restart core-solidqueue
core ALL=(ALL) NOPASSWD: /bin/systemctl status core-puma
core ALL=(ALL) NOPASSWD: /bin/systemctl status core-solidqueue
```

**Test:**
```bash
sudo systemctl status core-puma  # Should work without password
```

---

## GitHub Actions CI/CD

### Setup Secrets

**1. Generate Deploy Key on VPS:**
```bash
ssh core
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions_deploy  # Copy private key
```

**2. Add Secrets to GitHub:**

Go to: `https://github.com/RECTOR-LABS/core/settings/secrets/actions`

Add these secrets:
- `VPS_SSH_KEY`: Private key from above
- `VPS_HOST`: `176.222.53.185`
- `VPS_USER`: `core`

### Workflow File

Already created at: `.github/workflows/deploy.yml`

**Trigger:**
- Push to `main` branch
- Manual trigger via Actions tab

**What it does:**
1. Checkout code
2. Setup Ruby
3. Install SSH key
4. SSH to VPS and:
   - Pull latest code
   - Bundle install
   - Precompile assets
   - Run migrations
   - Reload Puma (zero-downtime)
   - Restart Solid Queue
5. Verify deployment (health check)

### Testing Auto-Deploy

```bash
# Make a change
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: Trigger auto-deploy"
git push origin main

# Watch deployment
# Visit: https://github.com/RECTOR-LABS/core/actions
```

---

## Manual Deployment

**If you need to deploy manually:**

```bash
ssh core
cd ~/core

# Pull changes
git pull origin main

# Install dependencies
bundle install --deployment --without development test

# Precompile assets
RAILS_ENV=production bundle exec rails assets:precompile

# Run migrations
RAILS_ENV=production bundle exec rails db:migrate

# Zero-downtime reload
sudo systemctl reload core-puma

# Restart background jobs
sudo systemctl restart core-solidqueue

# Verify
sudo systemctl status core-puma
sudo systemctl status core-solidqueue
```

---

## Troubleshooting

### Check Service Status

```bash
# Services
sudo systemctl status core-puma
sudo systemctl status core-solidqueue
sudo systemctl status nginx
sudo systemctl status postgresql

# Logs
tail -f ~/core/log/production.log
tail -f ~/core/log/puma.stdout.log
tail -f ~/core/log/solid_queue.stdout.log
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Common Issues

**1. Puma won't start:**
```bash
# Check logs
journalctl -u core-puma -n 50 --no-pager

# Common fixes:
# - Check .env file exists and has correct permissions
# - Verify database connection
# - Check port 3000 is not in use
```

**2. Asset issues:**
```bash
# Recompile assets
RAILS_ENV=production bin/rails assets:precompile
RAILS_ENV=production bin/rails assets:clean
sudo systemctl reload core-puma
```

**3. Database connection failed:**
```bash
# Test PostgreSQL connection
psql -U core -d core_production -h localhost

# Check credentials in .env
# Verify PostgreSQL is running:
sudo systemctl status postgresql
```

**4. GitHub Actions deployment fails:**
```bash
# Check SSH connection from local machine
ssh core "cd ~/core && git pull origin main"

# Verify sudoers configuration
ssh core "sudo systemctl status core-puma"  # Should work without password
```

### Emergency Rollback

**If deployment breaks the site:**

```bash
ssh core
cd ~/core

# Rollback to previous commit
git log --oneline -n 5  # Find previous working commit
git reset --hard <commit-hash>

# Reload services
sudo systemctl reload core-puma
sudo systemctl restart core-solidqueue
```

### Health Monitoring

**Check site health:**
```bash
# Health endpoint
curl https://rectorspace.com/up

# Full homepage
curl -I https://rectorspace.com

# GitHub sync status
ssh core "cd ~/core && RAILS_ENV=production bin/rails runner 'puts GithubRepo.count'"
```

---

## Maintenance

### Update Dependencies

```bash
ssh core
cd ~/core

# Update gems
bundle update
git add Gemfile.lock
git commit -m "chore: Update dependencies"
git push origin main

# Auto-deploy will handle the rest
```

### Database Backup

```bash
# Backup database
ssh core
pg_dump -U core core_production > ~/backup_$(date +%Y%m%d).sql

# Restore (if needed)
psql -U core core_production < ~/backup_20251103.sql
```

### Log Rotation

Already configured in systemd services. Logs rotate automatically.

**Manual cleanup:**
```bash
# Clean old logs
ssh core
cd ~/core
find log/ -name "*.log" -mtime +30 -delete
```

---

## Performance Tuning

### Puma Workers

**Adjust in .env on VPS:**
```bash
# For 2GB RAM VPS
WEB_CONCURRENCY=2

# For 4GB+ RAM VPS
WEB_CONCURRENCY=4
```

**Reload after change:**
```bash
sudo systemctl reload core-puma
```

### Database Connection Pool

**Edit config/database.yml:**
```yaml
production:
  pool: <%= ENV.fetch("RAILS_MAX_THREADS", 5) * ENV.fetch("WEB_CONCURRENCY", 2).to_i %>
```

---

## Summary

**Initial Setup:** ~30-45 minutes
**Subsequent Deploys:** ~2-3 minutes (automatic)
**Zero-downtime:** ✅ Yes (Puma phased restart)
**Auto-deploy:** ✅ Yes (GitHub Actions)
**SSL:** ✅ Let's Encrypt (auto-renewal)
**Background Jobs:** ✅ Solid Queue (hourly GitHub sync)

**May Allah bless this deployment and make it beneficial. Aamiin.**

---

**RECTOR LABS** | Building for Eternity | 2025
