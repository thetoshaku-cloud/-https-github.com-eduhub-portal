#!/bin/bash

# EduHub GitHub Setup Script
# This script helps you connect and push to GitHub

echo "🚀 EduHub GitHub Setup"
echo "===================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the eduhub-deployment directory"
    exit 1
fi

echo "✅ Git repository already initialized"
echo ""

# Get GitHub username
echo "📝 Enter your GitHub username:"
read -r GITHUB_USERNAME

# Get repository name
echo ""
echo "📝 Enter your repository name (default: eduhub-portal):"
read -r REPO_NAME
REPO_NAME=${REPO_NAME:-eduhub-portal}



# Construct GitHub URL
GITHUB_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo ""
echo "🔗 GitHub URL: $GITHUB_URL"
echo ""
echo "⚠️  IMPORTANT: Make sure you've created this repository on GitHub first!"
echo "   Go to: https://github.com/new"
echo "   Create a repository named: $REPO_NAME"
echo ""
read -p "Have you created the repository? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please create the repository first, then run this script again"
    exit 1
fi

# Add remote
echo "🔗 Adding GitHub remote..."
git remote add origin "$GITHUB_URL" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "⚠️  Remote 'origin' already exists. Updating..."
    git remote set-url origin "$GITHUB_URL"
fi

# Verify remote
echo ""
echo "✅ Remote configured:"
git remote -v

echo ""
echo "🚀 Pushing to GitHub..."
echo ""
echo "⚠️  You'll be asked for credentials:"
echo "   Username: Your GitHub username"
echo "   Password: Use a Personal Access Token (not your password!)"
echo ""
echo "   Get a token at: https://github.com/settings/tokens"
echo "   Required scope: 'repo' (full control of private repositories)"
echo ""
read -p "Press Enter to continue..."

# Push to GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Code pushed to GitHub!"
    echo ""
    echo "🎉 Next Steps:"
    echo "1. Go to: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "2. Verify all files are there"
    echo "3. Deploy to Netlify: https://app.netlify.com"
    echo ""
    echo "📚 See DEPLOYMENT.md for Netlify setup instructions"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "1. Repository doesn't exist - create it at https://github.com/new"
    echo "2. Wrong credentials - use Personal Access Token, not password"
    echo "3. No write access - check repository permissions"
    echo ""
    echo "See GIT_PUSH_GUIDE.md for detailed troubleshooting"
fi
