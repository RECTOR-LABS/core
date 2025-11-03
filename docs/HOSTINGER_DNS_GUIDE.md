# Hostinger DNS Setup - Step by Step

Visual guide for setting up DNS for rectorspace.com on Hostinger.

---

## 🎯 Goal

Point `rectorspace.com` → VPS IP: `176.222.53.185`

---

## 📋 Step-by-Step Instructions

### Step 1: Login to Hostinger

1. Go to: **https://hpanel.hostinger.com/**
2. Enter your email and password
3. Click **Login**

---

### Step 2: Navigate to Domain Management

**Option A: From Dashboard**
```
Dashboard → Domains → Click on "rectorspace.com"
```

**Option B: Direct Link**
```
Look for "Domains" in left sidebar → Click "rectorspace.com"
```

You should see something like:
```
┌─────────────────────────────────────────┐
│ rectorspace.com                         │
├─────────────────────────────────────────┤
│ [Manage]  [DNS / Nameservers]  [...]    │
└─────────────────────────────────────────┘
```

---

### Step 3: Click "DNS / Nameservers" or "Manage DNS"

This opens the DNS management panel.

---

### Step 4: Delete Old Records (If Any)

**Look for existing records and delete:**
- Any A records pointing to parking IPs
- Any old CNAME records
- Keep only essential records (like MX for email if you have it)

**How to delete:**
- Find the record
- Click the **trash icon** or **X** button
- Confirm deletion

---

### Step 5: Add New DNS Records

Click **"Add New Record"** or **"+ Add Record"** button.

#### Record 1: Root Domain (A Record)

```
┌──────────────────────────────────────────┐
│ Add DNS Record                           │
├──────────────────────────────────────────┤
│ Type: [A ▼]                              │
│ Name: [@]  or leave empty                │
│ Points to: [176.222.53.185]              │
│ TTL: [3600] or [1 Hour]                  │
│                                          │
│ [Cancel]  [Add Record]                   │
└──────────────────────────────────────────┘
```

**Fill in:**
- **Type:** A
- **Name:** `@` (or leave empty)
- **Points to:** `176.222.53.185`
- **TTL:** `3600` (1 hour)

Click **Add Record**

---

#### Record 2: WWW Subdomain (A Record)

Click **"Add Record"** again:

```
┌──────────────────────────────────────────┐
│ Add DNS Record                           │
├──────────────────────────────────────────┤
│ Type: [A ▼]                              │
│ Name: [www]                              │
│ Points to: [176.222.53.185]              │
│ TTL: [3600]                              │
│                                          │
│ [Cancel]  [Add Record]                   │
└──────────────────────────────────────────┘
```

**Fill in:**
- **Type:** A
- **Name:** `www`
- **Points to:** `176.222.53.185`
- **TTL:** `3600`

Click **Add Record**

---

#### Record 3: Wildcard Subdomain (CNAME) - Optional

**This is optional but recommended for future subdomains.**

Click **"Add Record"** again:

```
┌──────────────────────────────────────────┐
│ Add DNS Record                           │
├──────────────────────────────────────────┤
│ Type: [CNAME ▼]                          │
│ Name: [*]                                │
│ Points to: [rectorspace.com]             │
│ TTL: [3600]                              │
│                                          │
│ [Cancel]  [Add Record]                   │
└──────────────────────────────────────────┘
```

**Fill in:**
- **Type:** CNAME
- **Name:** `*`
- **Points to:** `rectorspace.com` (or `@`)
- **TTL:** `3600`

Click **Add Record**

---

### Step 6: Review Your DNS Records

Your DNS panel should now show:

```
┌──────────────────────────────────────────────────────────┐
│ DNS Records for rectorspace.com                          │
├──────┬────────┬────────────────────┬──────────────┬──────┤
│ Type │ Name   │ Points to          │ TTL          │      │
├──────┼────────┼────────────────────┼──────────────┼──────┤
│  A   │   @    │ 176.222.53.185     │ 3600 (1h)    │ [×]  │
│  A   │  www   │ 176.222.53.185     │ 3600 (1h)    │ [×]  │
│ CNAME│   *    │ rectorspace.com    │ 3600 (1h)    │ [×]  │
└──────┴────────┴────────────────────┴──────────────┴──────┘
```

✅ Perfect! All records are set.

---

### Step 7: Save Changes

**Look for:**
- **"Save"** button
- **"Save Changes"** button
- **"Apply"** button

**Click it!**

You should see a confirmation message like:
```
✅ DNS records updated successfully
```

---

### Step 8: Check Nameservers (Important!)

**Still in Hostinger DNS panel**, find the **Nameservers** section.

**It should show:**
```
Nameservers: Hostinger nameservers
• ns1.dns-parking.com
• ns2.dns-parking.com
```

**If it shows "Custom nameservers" (like Cloudflare):**
1. Click **"Change Nameservers"**
2. Select **"Use Hostinger nameservers"**
3. Click **Save**

---

## ⏱️ Wait for DNS Propagation

**Time:** 10-30 minutes (sometimes up to 48 hours, but usually quick)

**What happens:**
- DNS servers worldwide update their cache
- Your domain starts pointing to your VPS IP

**While you wait:**
- ✅ You can proceed with VPS deployment (run the 8 scripts)
- ✅ By the time VPS is ready, DNS will be propagated

---

## 🔍 Verify DNS is Working

### Method 1: Online Tool (Easiest)

1. Go to: **https://www.whatsmydns.net/**
2. Enter: `rectorspace.com`
3. Select: **A** (from dropdown)
4. Click **Search**

**You should see:**
- Green checkmarks worldwide
- IP showing: `176.222.53.185`

**Example:**
```
┌──────────────────────────────────────────────────────┐
│ DNS Propagation Checker                              │
├──────────────────────────────────────────────────────┤
│ Domain: rectorspace.com                              │
│ Record Type: A                                       │
├──────────────┬───────────────────────────────────────┤
│ Location     │ IP Address                            │
├──────────────┼───────────────────────────────────────┤
│ 🇺🇸 USA       │ ✅ 176.222.53.185                     │
│ 🇬🇧 UK        │ ✅ 176.222.53.185                     │
│ 🇩🇪 Germany   │ ✅ 176.222.53.185                     │
│ 🇯🇵 Japan     │ ✅ 176.222.53.185                     │
│ 🇸🇬 Singapore │ ✅ 176.222.53.185                     │
│ 🇦🇺 Australia │ ✅ 176.222.53.185                     │
└──────────────┴───────────────────────────────────────┘
```

All green = DNS propagated! ✅

---

### Method 2: Terminal Command (Mac/Linux)

```bash
# Check DNS resolution
dig rectorspace.com +short
```

**Expected output:**
```
176.222.53.185
```

**If you get this, DNS is working!** ✅

---

### Method 3: Ping Test

```bash
ping rectorspace.com
```

**Expected output:**
```
PING rectorspace.com (176.222.53.185): 56 data bytes
64 bytes from 176.222.53.185: icmp_seq=0 ttl=54 time=45.2 ms
64 bytes from 176.222.53.185: icmp_seq=1 ttl=54 time=44.8 ms
...
```

**If you see `176.222.53.185`, DNS is working!** ✅

---

### Method 4: Browser Test

**After VPS deployment is complete:**

1. Open browser
2. Go to: `http://rectorspace.com`
3. You should see your Rails app!

**If you see:**
- ✅ Your Rails app → Perfect!
- ✅ Nginx default page → VPS connected, app not deployed yet
- ⏳ "This site can't be reached" → DNS not propagated yet (wait more)
- ❌ Parking page → DNS not updated or cache issue (clear browser cache)

---

## ⚠️ Troubleshooting

### Issue 1: Still Shows Parking Page

**Solutions:**
1. **Clear browser cache:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Try incognito mode:** Cmd+Shift+N (Mac) or Ctrl+Shift+N (Windows)
3. **Flush DNS cache (Mac):**
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```
4. **Wait longer:** DNS can take up to 48 hours

---

### Issue 2: dig command shows wrong IP

**Check:**
```bash
# Check specific DNS server
dig rectorspace.com @8.8.8.8 +short

# If this shows correct IP but local doesn't:
# Your local DNS cache is stale
# Solution: Flush DNS cache (see above)
```

---

### Issue 3: Can't Find DNS Settings in Hostinger

**Try these locations:**
1. **Dashboard** → **Domains** → Click on domain → **DNS / Nameservers**
2. **Dashboard** → **Domains** → Three dots (...) → **Manage DNS**
3. **Dashboard** → **Hosting** → Select hosting → **Advanced** → **DNS Zone Editor**

**If still can't find:**
- Contact Hostinger support (they respond quickly)
- Or try their search bar: Type "DNS"

---

### Issue 4: DNS Records Won't Save

**Possible causes:**
- TTL too low (minimum is usually 300 or 600)
- Invalid IP format (make sure no spaces: `176.222.53.185`)
- Domain locked (check domain status in Hostinger)

**Solution:**
- Use TTL: `3600` (safe value)
- Double-check IP has no typos
- Check domain isn't locked or expired

---

## 📸 Visual Reference

**What to look for in Hostinger panel:**

### DNS Management Section
```
┌─────────────────────────────────────────────────────────┐
│  🏠 Dashboard  /  Domains  /  rectorspace.com           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Overview]  [DNS / Nameservers]  [Email]  [Settings]  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ DNS Records                         [+ Add Record] │ │
│  ├───────┬──────┬──────────────────┬─────────────────┤ │
│  │ Type  │ Name │ Points to        │ TTL             │ │
│  ├───────┼──────┼──────────────────┼─────────────────┤ │
│  │   A   │  @   │ 176.222.53.185   │ 3600 (1 hour)  │ │
│  │   A   │ www  │ 176.222.53.185   │ 3600 (1 hour)  │ │
│  │ CNAME │  *   │ rectorspace.com  │ 3600 (1 hour)  │ │
│  └───────┴──────┴──────────────────┴─────────────────┘ │
│                                                         │
│  [Save Changes]                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ DNS Setup Checklist

Track your progress:

- [ ] Logged into Hostinger (hpanel.hostinger.com)
- [ ] Found rectorspace.com in Domains section
- [ ] Opened DNS / Nameservers management
- [ ] Deleted old/parking DNS records
- [ ] Added A record: @ → 176.222.53.185
- [ ] Added A record: www → 176.222.53.185
- [ ] Added CNAME: * → rectorspace.com (optional)
- [ ] Clicked "Save Changes"
- [ ] Verified nameservers are Hostinger's (not custom)
- [ ] Waited 10-30 minutes
- [ ] Checked https://www.whatsmydns.net
- [ ] Ran: `dig rectorspace.com +short`
- [ ] Saw: `176.222.53.185` ✅
- [ ] Tested: `ping rectorspace.com` works
- [ ] Ready to deploy VPS!

---

## 🚀 What's Next?

**After DNS is propagated:**

1. ✅ DNS is working: `dig rectorspace.com +short` shows `176.222.53.185`
2. 🚀 Deploy to VPS: Run the 8 deployment scripts
3. 🌐 Visit: http://rectorspace.com (should show your app)
4. 🔒 Setup SSL: Run `sudo ./scripts/setup-ssl.sh`
5. ✅ Visit: https://rectorspace.com (secure!)

**See:** `scripts/README.md` for VPS deployment steps.

---

## 💡 Pro Tips

1. **Use TTL 3600 (1 hour)** - Good balance between speed and flexibility
2. **Don't set TTL too low** - Can cause performance issues
3. **Check DNS before SSL** - Let's Encrypt needs DNS working first
4. **Clear browser cache often** - When testing DNS changes
5. **Use whatsmydns.net** - Best way to check global propagation

---

## 🆘 Need Help?

**If stuck:**

1. Take a screenshot of your Hostinger DNS panel
2. Run: `dig rectorspace.com +short`
3. Share the output/screenshot
4. I'll help troubleshoot!

**Hostinger Support:**
- Live chat available 24/7 in Hostinger panel
- Very helpful and quick to respond
- They can verify DNS settings for you

---

**Bismillah! May Allah make this DNS setup smooth and easy! 🤲**

**RECTOR LABS** | Building for Eternity | 2025
