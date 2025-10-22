# matt-dev.com

Personal website and DevOps learning platform. Portfolio of web projects with automated deployment pipeline.

## Live Sites

- **Production**: https://matt-dev.com
- **Development**: https://dev.matt-dev.com

## Projects

- **[Guitar Tuner](/public/tuner)** - Interactive web-based guitar tuner ([live demo](https://matt-dev.com/tuner))

## Architecture

Single DigitalOcean VPS with multi-environment setup:
- `/var/www/matt-dev.com/production/` - Production environment
- `/var/www/matt-dev.com/dev/` - Development environment

## Deployment

Automated CI/CD via GitHub Actions:
- Push to `main` → auto-deploys to dev.matt-dev.com
- Push to `prod` → auto-deploys to matt-dev.com

## Project Structure

```
matt-dev.com/
├── public/              # Website root
│   ├── index.html       # Homepage
│   ├── style.css
│   └── tuner/           # Guitar tuner web app
├── .github/workflows/   # CI/CD automation
├── docs/deployment/     # Infrastructure documentation
├── scripts/             # Deployment scripts
└── CLAUDE.md           # Development guidance
```

## Tech Stack

- Static HTML/CSS/JavaScript
- nginx web server
- GitHub Actions for CI/CD
- DigitalOcean VPS hosting

## Documentation

- [VPS Setup](docs/deployment/VPS_SETUP.md) - Server configuration
- [DNS Setup](docs/deployment/DNS_SETUP.md) - Domain configuration
- [Deployment Overview](docs/deployment/README.md) - Architecture and workflows

## Learning Goals

- Git and GitHub workflows (branching, PRs, Actions)
- VPS management and deployment
- CI/CD pipelines
- Environment separation (dev/prod)
- Infrastructure as code concepts
- Web server configuration

## Getting Started

### Local Development

```bash
# Clone the repository
git clone https://github.com/mreedthings/matt-dev.com.git
cd matt-dev.com

# Open in browser
open public/index.html
```

### Deployment Setup

1. Set up VPS following [VPS_SETUP.md](docs/deployment/VPS_SETUP.md)
2. Configure DNS following [DNS_SETUP.md](docs/deployment/DNS_SETUP.md)
3. Add GitHub Secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
4. Push to `main` or `prod` to trigger deployment

## License

Personal project for learning purposes.
