# DNS Setup Guide - rectorspace.com

Complete guide for configuring DNS records to point to your VPS.

---

## Current Status

**Domain:** rectorspace.com
**Registrar:** Hostinger
**Current Nameservers:** NS1/NS2.DNS-PARKING.COM (parking)
**Target VPS:** 176.222.53.185

---

## Option 1: Use Hostinger DNS (Recommended - Simplest)

### Step 1: Login to Hostinger

1. Go to: https://www.hostinger.com/
2. Click "Login" (top right)
3. Enter your credentials

### Step 2: Access DNS Management

1. Go to **Domains** section
2. Find **rectorspace.com**
3. Click **Manage** or **DNS / Nameservers**

### Step 3: Configure DNS Records

**Delete existing records** (if any) and add these:

#### Required DNS Records

| Type | Name | Value | TTL |
|------|------|-------|-----|
| **A** | @ | 176.222.53.185 | 3600 |
| **A** | www | 176.222.53.185 | 3600 |
| **CNAME** | * | rectorspace.com | 3600 |

**Explanation:**
- `@` = Root domain (rectorspace.com)
- `www` = www subdomain (www.rectorspace.com)
- `*` = Wildcard (catches all subdomains)

#### Visual Guide for Hostinger DNS Panel

```
┌─────────────────────────────────────────────────────────┐
│ DNS Records for rectorspace.com                         │
├──────┬────────┬────────────────────┬───────────────────┤
│ Type │ Name   │ Points to          │ TTL               │
├──────┼────────┼────────────────────┼───────────────────┤
│  A   │   @    │ 176.222.53.185     │ 3600 (1 hour)    │
│  A   │  www   │ 176.222.53.185     │ 3600 (1 hour)    │
│ CNAME│   *    │ rectorspace.com    │ 3600 (1 hour)    │
└──────┴────────┴────────────────────┴───────────────────┘

[Add Record] [Save Changes]
```

### Step 4: Save Changes

1. Click **Save** or **Update DNS**
2. Wait for confirmation message

### Step 5: Verify Nameservers

Make sure nameservers are set to Hostinger's default:
- **NS1:** ns1.dns-parking.com (current - OK)
- **NS2:** ns2.dns-parking.com (current - OK)

**Or use Hostinger's active nameservers:**
- Check Hostinger panel for their current nameservers
- Common ones: ns1.hostinger.com, ns2.hostinger.com

---

## Option 2: Use Cloudflare DNS (Advanced - Better Features)

### Benefits of Cloudflare:
- ✅ Free SSL proxy
- ✅ DDoS protection
- ✅ CDN (faster loading)
- ✅ Better analytics
- ✅ Faster DNS propagation

### Step 1: Create Cloudflare Account

1. Go to: https://www.cloudflare.com/
2. Click **Sign Up** (free plan)
3. Enter email: rheza10@gmail.com
4. Verify email

### Step 2: Add Domain to Cloudflare

1. Click **+ Add a Site**
2. Enter: `rectorspace.com`
3. Click **Add Site**
4. Select **Free Plan**
5. Click **Continue**

### Step 3: Review DNS Records

Cloudflare will scan your existing DNS. Add/modify these:

| Type | Name | Value | Proxy Status |
|------|------|-------|--------------|
| **A** | @ | 176.222.53.185 | Proxied (orange) |
| **A** | www | 176.222.53.185 | Proxied (orange) |

**Proxy Status:**
- **Orange cloud (Proxied):** Traffic goes through Cloudflare (recommended)
- **Gray cloud (DNS only):** Direct to your VPS

### Step 4: Update Nameservers at Hostinger

Cloudflare will show you nameservers like:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**Update at Hostinger:**
1. Go to Hostinger → Domains → rectorspace.com
2. Find **Nameservers** section
3. Select **Custom Nameservers**
4. Enter Cloudflare's nameservers:
   - Nameserver 1: `ns1.cloudflare.com`
   - Nameserver 2: `ns2.cloudflare.com`
5. Click **Save** or **Update**

### Step 5: Wait for Activation

1. Go back to Cloudflare
2. Click **Done, check nameservers**
3. Wait for email confirmation (usually 5-30 minutes)

### Step 6: Configure Cloudflare SSL

**After activation:**

1. Go to **SSL/TLS** tab
2. Select **Full (strict)** mode
3. This works with Let's Encrypt on your VPS

**SSL Modes:**
- ❌ **Off:** No SSL (don't use)
- ⚠️ **Flexible:** Cloudflare to visitor (not recommended)
- ✅ **Full:** Cloudflare to visitor + visitor to VPS
- ✅ **Full (strict):** Full + certificate validation (use this!)

---

## DNS Record Explanations

### A Record
Points domain to IP address.

**Example:**
```
rectorspace.com → 176.222.53.185
```

### CNAME Record
Creates an alias to another domain.

**Example:**
```
www.rectorspace.com → rectorspace.com
```

### Wildcard (*)
Catches all subdomains.

**Example:**
```
*.rectorspace.com → rectorspace.com
```

This means:
- `api.rectorspace.com` → VPS
- `blog.rectorspace.com` → VPS
- `anything.rectorspace.com` → VPS

---

## Verification Steps

### 1. Check DNS Propagation

**Wait time:** 5 minutes to 48 hours (usually 10-30 minutes)

**Check online:**
- https://www.whatsmydns.net/#A/rectorspace.com
- Enter: `rectorspace.com`
- Should show: `176.222.53.185` worldwide

**Check via command line:**

```bash
# Check A record
dig rectorspace.com +short
# Should show: 176.222.53.185

# Check www
dig www.rectorspace.com +short
# Should show: 176.222.53.185

# Check nameservers
dig NS rectorspace.com +short
# Should show Hostinger or Cloudflare nameservers
```

**Mac alternative (if dig not available):**
```bash
nslookup rectorspace.com
# Should show: 176.222.53.185
```

### 2. Test HTTP Access

```bash
# Test if VPS responds
curl -I http://176.222.53.185

# Test domain (after DNS propagates)
curl -I http://rectorspace.com
```

### 3. Ping Test

```bash
ping rectorspace.com
# Should show: 176.222.53.185
```

---

## Troubleshooting

### Issue: DNS not propagating

**Check:**
```bash
# 1. Verify DNS records are saved
dig rectorspace.com +short

# 2. Check what DNS server says
dig rectorspace.com @8.8.8.8 +short

# 3. Clear local DNS cache (Mac)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Wait:** DNS can take up to 48 hours, but usually 10-30 minutes.

### Issue: Shows old parking page

**Solutions:**
1. Clear browser cache (Cmd+Shift+R on Mac)
2. Try incognito/private mode
3. Try different browser
4. Wait for DNS propagation
5. Flush DNS cache (command above)

### Issue: SSL certificate error

**Before SSL setup:**
- This is normal! You haven't run `setup-ssl.sh` yet
- HTTP will work, HTTPS won't

**After SSL setup:**
- Wait 2-3 minutes for Let's Encrypt
- If still failing, check logs: `journalctl -u core-puma -n 50`

### Issue: Connection refused

**Check:**
1. VPS is running: `ssh core@176.222.53.185`
2. Nginx is running: `sudo systemctl status nginx`
3. Firewall allows port 80/443:
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

---

## DNS Propagation Checklist

Use this to track DNS setup:

- [ ] Logged into Hostinger
- [ ] Found rectorspace.com domain
- [ ] Added A record: @ → 176.222.53.185
- [ ] Added A record: www → 176.222.53.185
- [ ] Added CNAME: * → rectorspace.com (optional)
- [ ] Saved DNS changes
- [ ] Waited 10-30 minutes
- [ ] Verified with: `dig rectorspace.com +short`
- [ ] Verified with: https://www.whatsmydns.net
- [ ] Tested: `ping rectorspace.com`
- [ ] Tested: `curl -I http://rectorspace.com`

---

## Recommended: Use Cloudflare

**Why Cloudflare is better:**

| Feature | Hostinger DNS | Cloudflare |
|---------|---------------|------------|
| **Speed** | Standard | ✅ Faster (CDN) |
| **Security** | Basic | ✅ DDoS protection |
| **SSL** | Let's Encrypt only | ✅ Free proxy SSL |
| **Analytics** | None | ✅ Traffic insights |
| **Cache** | None | ✅ Auto caching |
| **Propagation** | Slower | ✅ Faster |
| **Cost** | Included | ✅ Free |

**Recommendation:** Start with Hostinger DNS (simpler), migrate to Cloudflare later if needed.

---

## Quick Start Commands

**After DNS is configured, verify everything:**

```bash
# 1. Check DNS resolution
dig rectorspace.com +short
# Expected: 176.222.53.185

# 2. Check website responds
curl -I http://rectorspace.com
# Expected: HTTP 200 or 301 (redirect to HTTPS)

# 3. Check from multiple locations
# Visit: https://www.whatsmydns.net/#A/rectorspace.com
# Expected: Green checkmarks worldwide showing 176.222.53.185

# 4. Test on browser
# Visit: http://rectorspace.com
# Expected: Your Rails app homepage (or Nginx default if app not deployed yet)
```

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Add DNS records | 5 minutes | Manual |
| DNS propagation | 10-30 mins | Automatic |
| Verify propagation | 2 minutes | Manual |
| Deploy VPS (if not done) | 20 minutes | Manual |
| SSL setup | 5 minutes | Manual |
| **Total** | **45 mins** | |

---

## Summary

**Simplest path (recommended for you):**

1. Login to Hostinger
2. Go to DNS settings for rectorspace.com
3. Add A records:
   - `@` → 176.222.53.185
   - `www` → 176.222.53.185
4. Save and wait 10-30 minutes
5. Verify with: `dig rectorspace.com +short`
6. Deploy to VPS (run the 8 scripts)
7. Visit: http://rectorspace.com
8. Setup SSL (run setup-ssl.sh)
9. Visit: https://rectorspace.com

**Need help?** Screenshots of Hostinger DNS panel will help me guide you better!

---

**May Allah make this process smooth and easy. Bismillah! 🚀**

**RECTOR LABS** | Building for Eternity | 2025
