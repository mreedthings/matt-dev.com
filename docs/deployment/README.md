# Deployment Documentation

This directory contains all documentation related to deploying matt-dev.com.

## Quick Start

1. **[VPS_SETUP.md](./VPS_SETUP.md)** - Complete VPS configuration guide
   - Directory structure
   - Web server setup (nginx/Apache)
   - SSH keys for GitHub Actions
   - Security hardening
   - SSL/TLS with Let's Encrypt

2. **[DNS_SETUP.md](./DNS_SETUP.md)** - DNS configuration guide
   - DigitalOcean DNS setup
   - Domain registrar configuration
   - Verification and troubleshooting

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              GitHub Repository                   │
│                                                  │
│  ┌──────────┐              ┌──────────┐        │
│  │   main   │──────────────│   prod   │        │
│  │  branch  │   Merge PR   │  branch  │        │
│  └────┬─────┘              └────┬─────┘        │
└───────┼──────────────────────────┼──────────────┘
        │                          │
        │ GitHub Actions           │ GitHub Actions
        │ (auto-deploy)            │ (auto-deploy)
        ▼                          ▼
┌─────────────────────────────────────────────────┐
│          DigitalOcean VPS (Single Server)       │
│                                                  │
│  /var/www/matt-dev.com/                         │
│  ├── dev/                                       │
│  │   └── [main branch code]                    │
│  │                                              │
│  └── production/                                │
│      └── [prod branch code]                    │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │         nginx/Apache Web Server          │   │
│  │                                          │   │
│  │  dev.matt-dev.com  →  /dev/            │   │
│  │  matt-dev.com      →  /production/     │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Deployment Workflow

### Development Deployment
1. Make changes locally
2. Commit to `main` branch
3. Push to GitHub
4. GitHub Action automatically deploys to `/var/www/matt-dev.com/dev/`
5. Test at `dev.matt-dev.com`

### Production Deployment
1. Test thoroughly on dev environment
2. Create PR: `main` → `prod`
3. Review and merge PR
4. GitHub Action automatically deploys to `/var/www/matt-dev.com/production/`
5. Live at `matt-dev.com`

## Files Created

- `.github/workflows/deploy-dev.yml` - Auto-deploy to dev on push to main
- `.github/workflows/deploy-prod.yml` - Auto-deploy to prod on push to prod
- `scripts/deploy.sh` - Reusable deployment script (optional)

## Required GitHub Secrets

Before deployment works, configure these secrets in GitHub:

```bash
gh secret set VPS_HOST      # Your VPS IP address
gh secret set VPS_USER      # SSH username (e.g., root)
gh secret set VPS_SSH_KEY   # Private SSH key for deployment
```

## Next Steps

1. ✅ Complete VPS setup using VPS_SETUP.md
2. ✅ Configure DNS using DNS_SETUP.md
3. ✅ Add GitHub Secrets
4. ✅ Create production branch: `git checkout -b prod && git push -u origin prod`
5. ✅ Push some code and watch it auto-deploy!
