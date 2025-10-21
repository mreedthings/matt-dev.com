# VPS Setup Guide

This guide walks through setting up your DigitalOcean droplet for the multi-environment architecture.

## Initial VPS Setup

### 1. Create Directory Structure

SSH into your VPS and create the deployment directories:

```bash
# Create base directory
sudo mkdir -p /var/www/matt-dev.com/{production,dev}

# Set ownership (replace 'username' with your VPS user)
sudo chown -R username:username /var/www/matt-dev.com

# Set permissions
chmod -R 755 /var/www/matt-dev.com
```

### 2. Install Web Server

Choose either nginx (recommended) or Apache.

**Option A: nginx**
```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

**Option B: Apache**
```bash
sudo apt update
sudo apt install apache2 -y
sudo systemctl enable apache2
sudo systemctl start apache2
```

### 3. Configure Virtual Hosts

**For nginx**, create two config files:

**Production** (`/etc/nginx/sites-available/matt-dev.com`):
```nginx
server {
    listen 80;
    server_name matt-dev.com www.matt-dev.com;

    root /var/www/matt-dev.com/production/public;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

**Development** (`/etc/nginx/sites-available/dev.matt-dev.com`):
```nginx
server {
    listen 80;
    server_name dev.matt-dev.com;

    root /var/www/matt-dev.com/dev/public;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Enable the sites:
```bash
sudo ln -s /etc/nginx/sites-available/matt-dev.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/dev.matt-dev.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Setup SSH Key for GitHub Actions

Generate a dedicated deployment key on your VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys
```

Copy the **private key** to add as GitHub Secret:
```bash
cat ~/.ssh/github_actions_deploy
```

### 5. Install Git

```bash
sudo apt install git -y
git --version
```

## DNS Configuration

In your domain registrar or DigitalOcean DNS:

1. **A Record** for production:
   - Type: A
   - Name: @ (or matt-dev.com)
   - Value: [Your VPS IP]
   - TTL: 3600

2. **A Record** for development:
   - Type: A
   - Name: dev
   - Value: [Your VPS IP]
   - TTL: 3600

3. **Optional www redirect**:
   - Type: CNAME
   - Name: www
   - Value: matt-dev.com
   - TTL: 3600

## GitHub Secrets to Configure

After VPS setup, add these secrets to your GitHub repository:

```bash
# Your VPS IP address
gh secret set VPS_HOST

# Your VPS username (e.g., root or your user)
gh secret set VPS_USER

# The private key you generated (paste full key including headers)
gh secret set VPS_SSH_KEY
```

## Security Hardening (Recommended)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Setup UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Disable root SSH (if using non-root user)
# Edit /etc/ssh/sshd_config and set: PermitRootLogin no
sudo systemctl restart sshd
```

## SSL/TLS Setup (Once DNS Propagates)

Install and configure Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx -y

# For both domains
sudo certbot --nginx -d matt-dev.com -d www.matt-dev.com
sudo certbot --nginx -d dev.matt-dev.com

# Auto-renewal is configured automatically
```

## Verification

Test your setup:

```bash
# Check nginx status
sudo systemctl status nginx

# Test connectivity
curl -I http://your-vps-ip

# Check permissions
ls -la /var/www/matt-dev.com
```
