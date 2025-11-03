# Deployment Scripts - RECTOR LABS CORE

Automated scripts for deploying Rails 8 monolith to production VPS.

## Quick Start - Complete Deployment

Follow these scripts **in order** for a fresh VPS deployment:

### 1️⃣ Setup VPS User (Run as root on VPS)

```bash
# SSH as root
ssh root@176.222.53.185

# Copy and run setup script
curl -fsSL https://raw.githubusercontent.com/RECTOR-LABS/core/main/scripts/setup-vps-user.sh | bash

# Test SSH access
ssh core@176.222.53.185
```

**What it does:**
- Creates `core` user
- Sets up SSH access
- Configures sudoers for deployments

---

### 2️⃣ Install Dependencies (Run as core user)

```bash
# SSH as core user
ssh core@176.222.53.185

# Download and run
curl -fsSL https://raw.githubusercontent.com/RECTOR-LABS/core/main/scripts/setup-vps-deps.sh | bash

# Re-login to activate rbenv
exit
ssh core@176.222.53.185

# Verify Ruby
ruby -v  # Should show 3.3.6
```

**What it does:**
- Installs system dependencies (build tools, PostgreSQL, Nginx)
- Installs rbenv + Ruby 3.3.6
- Installs bundler

---

### 3️⃣ Setup PostgreSQL Database

```bash
# Run as core user
./core/scripts/setup-postgres.sh

# IMPORTANT: Save the database password shown!
```

**What it does:**
- Creates PostgreSQL user `core`
- Creates database `core_production`
- Generates secure random password
- **Save the password displayed!**

---

### 4️⃣ Generate GitHub Deploy Key

```bash
# Run as core user
./core/scripts/setup-github-deploy-key.sh

# This will display the private key
# Copy it for the next step
```

**What it does:**
- Generates SSH key for GitHub Actions
- Adds public key to authorized_keys
- Displays private key to copy

**On your local machine:**
```bash
# Save the private key to a file, then:
gh secret set VPS_SSH_KEY --repo RECTOR-LABS/core < /path/to/private/key

# Or use the GitHub web interface:
# Settings → Secrets → New secret → VPS_SSH_KEY
```

---

### 5️⃣ Deploy Application

```bash
# Run as core user (still on VPS)
./core/scripts/deploy-app.sh

# You'll be prompted for:
# - GitHub token (your existing token)
# - PostgreSQL password (from step 3)
```

**What it does:**
- Clones repository
- Installs gems
- Creates `.env` file with secrets
- Precompiles assets
- Runs database migrations
- Initial GitHub sync

---

### 6️⃣ Setup systemd Services

```bash
# Run WITH SUDO
sudo ./core/scripts/setup-services.sh
```

**What it does:**
- Installs Puma service
- Installs Solid Queue service
- Enables auto-start on boot
- Starts both services
- Tests application health

---

### 7️⃣ Configure Nginx

```bash
# Run WITH SUDO
sudo ./core/scripts/setup-nginx.sh
```

**What it does:**
- Creates Nginx config for rectorspace.com
- Sets up reverse proxy to Puma
- Enables site
- Restarts Nginx

---

### 8️⃣ Setup SSL Certificate

```bash
# Run WITH SUDO
sudo ./core/scripts/setup-ssl.sh
```

**What it does:**
- Obtains Let's Encrypt SSL certificate
- Configures auto-renewal
- Enables HTTPS redirect
- Tests certificate renewal

---

## ✅ Deployment Complete!

After running all scripts, your site will be live at:
**https://rectorspace.com**

### Verify Deployment

```bash
# Check services
sudo systemctl status core-puma
sudo systemctl status core-solidqueue
sudo systemctl status nginx

# Check logs
journalctl -u core-puma -f

# Test site
curl https://rectorspace.com/up
```

### Future Deployments

Just push to main branch - GitHub Actions will automatically deploy! 🚀

```bash
git push origin main
# Watch: https://github.com/RECTOR-LABS/core/actions
```

---

## Script Reference

| Script | Purpose | Run As | When |
|--------|---------|--------|------|
| `setup-vps-user.sh` | Create core user | root | Once (initial) |
| `setup-vps-deps.sh` | Install dependencies | core | Once (initial) |
| `setup-postgres.sh` | Setup database | core | Once (initial) |
| `setup-github-deploy-key.sh` | Generate SSH key | core | Once (initial) |
| `deploy-app.sh` | Deploy application | core | Once (initial) |
| `setup-services.sh` | Setup systemd | sudo | Once (initial) |
| `setup-nginx.sh` | Configure Nginx | sudo | Once (initial) |
| `setup-ssl.sh` | Setup SSL | sudo | Once (initial) |

---

## Troubleshooting

### Script fails with permission denied
```bash
chmod +x scripts/*.sh
```

### Can't SSH as core user
```bash
# Check from local machine
ssh -v core@176.222.53.185

# Check SSH config
cat ~/.ssh/config | grep -A 3 "Host core"
```

### Service won't start
```bash
# Check logs
journalctl -u core-puma -n 50 --no-pager

# Check .env file
cat ~/core/.env

# Verify database connection
cd ~/core
RAILS_ENV=production bin/rails runner "puts ActiveRecord::Base.connection.active?"
```

### GitHub Actions deployment fails
```bash
# Verify secrets are set
gh secret list --repo RECTOR-LABS/core

# Should see: VPS_HOST, VPS_USER, VPS_SSH_KEY

# Test SSH from local machine
ssh core@176.222.53.185 "whoami"
```

---

## Manual Deployment (Alternative)

If you prefer manual deployment without scripts:

See: `docs/DEPLOYMENT.md` for step-by-step manual instructions.

---

## Security Notes

- All scripts use secure defaults
- Database password is randomly generated
- SSH keys are properly permissioned
- systemd services run as non-root
- Sudo is restricted to specific commands
- SSL certificates auto-renew

---

**May Allah bless this deployment! Bismillah, let's go! 🚀**

**RECTOR LABS** | Building for Eternity | 2025
