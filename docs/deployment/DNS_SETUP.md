# DNS Configuration Guide

This guide covers DNS setup for matt-dev.com to work with both production and development environments.

## Overview

You need to point your domain to your DigitalOcean droplet's IP address using DNS records.

## Prerequisites

- Your DigitalOcean droplet IP address
- Access to your domain registrar or DigitalOcean DNS management

## Option 1: Using DigitalOcean DNS (Recommended)

If you registered your domain elsewhere, you can use DigitalOcean's DNS servers for easier integration.

### Step 1: Add Domain to DigitalOcean

1. Go to DigitalOcean Dashboard → Networking → Domains
2. Enter `matt-dev.com` and click "Add Domain"
3. Select your droplet from the list

### Step 2: Configure DNS Records

DigitalOcean will auto-create some records. Add/verify these:

**A Records:**
```
Type: A
Hostname: @
Value: [Your Droplet IP]
TTL: 3600

Type: A
Hostname: dev
Value: [Your Droplet IP]
TTL: 3600

Type: A
Hostname: www
Value: [Your Droplet IP]
TTL: 3600
```

### Step 3: Update Nameservers at Domain Registrar

Update your domain registrar to use DigitalOcean's nameservers:

```
ns1.digitalocean.com
ns2.digitalocean.com
ns3.digitalocean.com
```

**Note:** DNS propagation can take 24-48 hours, but often completes in 1-2 hours.

## Option 2: Using Your Domain Registrar's DNS

If you prefer to manage DNS at your registrar:

### Add A Records

| Type | Name/Host | Value | TTL |
|------|-----------|-------|-----|
| A | @ | [Your Droplet IP] | 3600 |
| A | dev | [Your Droplet IP] | 3600 |
| A | www | [Your Droplet IP] | 3600 |

**Common Registrars:**
- **Namecheap:** Advanced DNS → Add New Record
- **GoDaddy:** DNS Management → Add Record
- **Cloudflare:** DNS → Add Record
- **Google Domains:** DNS → Custom Records

## Verify DNS Configuration

After adding records, verify they're working:

```bash
# Check production domain
dig matt-dev.com +short
nslookup matt-dev.com

# Check dev subdomain
dig dev.matt-dev.com +short
nslookup dev.matt-dev.com

# Check from different DNS servers
dig @8.8.8.8 matt-dev.com +short
dig @1.1.1.1 dev.matt-dev.com +short
```

All should return your VPS IP address.

## Testing Before DNS Propagation

You can test your setup before DNS propagates by editing your local hosts file:

**macOS/Linux:** `/etc/hosts`
**Windows:** `C:\Windows\System32\drivers\etc\hosts`

Add these lines:
```
[YOUR_VPS_IP] matt-dev.com
[YOUR_VPS_IP] dev.matt-dev.com
```

Then visit `http://matt-dev.com` and `http://dev.matt-dev.com` in your browser.

**Remember to remove these lines after DNS propagates!**

## Expected Results

After DNS propagation and VPS setup:

- `http://matt-dev.com` → Production environment
- `http://dev.matt-dev.com` → Development environment
- `http://www.matt-dev.com` → Production (redirects to matt-dev.com)

## Troubleshooting

**DNS not resolving:**
- Wait for propagation (up to 48 hours)
- Verify A records are correct
- Check TTL hasn't cached old values
- Try `dig` commands to see what DNS returns

**"This site can't be reached":**
- Check VPS firewall allows port 80/443
- Verify nginx/Apache is running: `sudo systemctl status nginx`
- Check nginx config: `sudo nginx -t`

**Wrong site showing:**
- Verify nginx server_name matches domain
- Check nginx sites-enabled symlinks exist
- Reload nginx: `sudo systemctl reload nginx`
