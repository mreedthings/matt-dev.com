#!/bin/bash

# Deployment script for matt-dev.com
# This script is executed by GitHub Actions to deploy code to the VPS

set -e  # Exit on any error

# Configuration
DEPLOY_DIR=$1
BRANCH=$2

if [ -z "$DEPLOY_DIR" ] || [ -z "$BRANCH" ]; then
    echo "Usage: $0 <deploy_dir> <branch>"
    echo "Example: $0 /var/www/matt-dev.com/production prod"
    exit 1
fi

echo "========================================="
echo "Deploying to: $DEPLOY_DIR"
echo "Branch: $BRANCH"
echo "========================================="

# Create directory if it doesn't exist
mkdir -p "$DEPLOY_DIR"

# Navigate to deployment directory
cd "$DEPLOY_DIR"

# Check if git repo exists
if [ -d ".git" ]; then
    echo "Updating existing repository..."
    git fetch origin
    git reset --hard "origin/$BRANCH"
else
    echo "Cloning repository for the first time..."
    git clone --branch "$BRANCH" https://github.com/mreedthings/matt-dev.com.git .
fi

# Install dependencies (if package.json exists)
if [ -f "package.json" ]; then
    echo "Installing Node.js dependencies..."
    npm ci --production
fi

# Build step (if needed - add your build command here)
# if [ -f "package.json" ]; then
#     echo "Building application..."
#     npm run build
# fi

# Set proper permissions
chmod -R 755 "$DEPLOY_DIR"

# Restart services if needed (uncomment as needed)
# sudo systemctl reload nginx
# pm2 restart all

echo "========================================="
echo "Deployment completed successfully!"
echo "========================================="
