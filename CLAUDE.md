# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and learning platform for matt-dev.com. This project serves multiple purposes:
- Portfolio of web projects and experiments
- Learning DevOps practices (GitHub Actions, VPS management, environment separation)
- Hobby coding and experimentation
- Potential microblogging platform
- Educational exploration with potential for future monetization

## Project Structure

```
matt-dev.com/
├── public/              # Website root
│   ├── index.html       # Homepage
│   ├── style.css
│   └── tuner/           # Guitar tuner web app
├── .github/workflows/   # CI/CD automation
├── docs/deployment/     # Infrastructure documentation
└── scripts/             # Deployment scripts
```

**Projects:**
- **Guitar Tuner** (`/tuner`) - Interactive web-based guitar tuner with keyboard controls and visual feedback

## Infrastructure

**VPS**: DigitalOcean droplet (single server)
**Domain**: matt-dev.com

### Environment Architecture

This project uses a **single VPS with multiple directories** approach for environment separation:

```
/var/www/matt-dev.com/
├── production/     # Production environment (prod branch)
└── dev/           # Development environment (main branch)
```

**Environments:**
- **Development** (`main` branch)
  - Directory: `/var/www/matt-dev.com/dev/`
  - URL: `dev.matt-dev.com`
  - Auto-deploys on push to `main`
  - For testing and active development

- **Production** (`prod` branch)
  - Directory: `/var/www/matt-dev.com/production/`
  - URL: `matt-dev.com`
  - Deploys on push to `prod` branch
  - Stable, user-facing code

**Deployment Flow:**
1. Develop and commit to `main` branch
2. Push → GitHub Action deploys to dev environment
3. Test at `dev.matt-dev.com`
4. When stable, create PR: `main` → `prod`
5. Merge → GitHub Action deploys to production

**DNS Configuration Required:**
- A record: `matt-dev.com` → VPS IP
- A record: `dev.matt-dev.com` → VPS IP
- Web server (nginx/Apache) routes based on domain

## Development Philosophy

This is a learning-focused project. When working with code here:
- Prioritize educational value - explain DevOps concepts and best practices
- Consider GitHub Actions workflows for CI/CD automation
- Think about environment separation (dev/test/prod) from the start
- Balance between best practices and pragmatic solutions for a hobby project
- Document deployment and infrastructure decisions for future reference

## Key Learning Areas

- Git and GitHub workflows (branching, PRs, Actions)
- VPS management and deployment
- Environment configuration and secrets management
- CI/CD pipelines
- Infrastructure as code concepts

## GitHub Configuration

**Repository**: https://github.com/mreedthings/matt-dev.com (public)

**Branch Protection**: Enabled on `main`
- Force pushes disabled
- Branch deletion disabled
- Admins not required to follow rules (for learning flexibility)

**GitHub Secrets Setup**

Secrets are used to store sensitive information for GitHub Actions. Add them via:
```bash
# Via CLI
gh secret set SECRET_NAME

# Or via web: Settings > Secrets and variables > Actions > New repository secret
```

**Common secrets for this project:**
- `VPS_HOST` - DigitalOcean droplet IP address
- `VPS_USER` - SSH username for deployment
- `VPS_SSH_KEY` - Private SSH key for VPS access
- `DOMAIN` - Domain name (matt-dev.com)
- Any API keys, database credentials, etc.

**Using secrets in GitHub Actions:**
```yaml
- name: Deploy to VPS
  env:
    HOST: ${{ secrets.VPS_HOST }}
    USER: ${{ secrets.VPS_USER }}
```
