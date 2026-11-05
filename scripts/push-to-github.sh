#!/bin/bash
# Push to GitHub Helper Script
# Nabutiti Village Waste Collection & Monitoring System
# Case Study of Nabutiti Village, Kansanga, Kampala

set -e

echo "=== Nabutiti Waste System: GitHub Push Helper ==="

REPO_NAME="${1:-nabutiti-waste-system}"
GITHUB_USERNAME="musinguziron21"
REMOTE_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
  echo "Initializing local Git repository..."
  git init
  git branch -M main
fi

# Configure identity if not configured
if [ -z "$(git config user.email)" ]; then
  git config user.email "${GITHUB_USERNAME}@gmail.com"
  git config user.name "${GITHUB_USERNAME}"
fi

# Stage and commit
echo "Staging files..."
git add .
git commit -m "Nabutiti Village Waste Monitoring System - Auto-Deployment Update $(date +'%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

# Check remote
if ! git remote | grep -q "origin"; then
  echo "Adding remote origin: ${REMOTE_URL}"
  git remote add origin "${REMOTE_URL}"
else
  echo "Remote origin exists: $(git remote get-url origin)"
fi

echo ""
echo "Ready to push! Run the following command with your GitHub credentials or personal access token:"
echo "git push -u origin main"
echo ""
