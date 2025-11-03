#!/bin/bash
# Generate SSH deploy key for GitHub Actions
# Run this script AS 'core' USER on VPS

set -e

echo "🔑 Generating SSH deploy key for GitHub Actions..."

# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy -N ""

# Add to authorized_keys
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys

echo ""
echo "✅ SSH deploy key generated!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Copy the PRIVATE key below and add it to GitHub secrets:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat ~/.ssh/github_actions_deploy
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "2. Run this command on your LOCAL machine:"
echo ""
echo "   gh secret set VPS_SSH_KEY --repo RECTOR-LABS/core < /path/to/saved/private/key"
echo ""
echo "   Or manually: Copy the key above → GitHub → Settings → Secrets → New secret"
echo "   Secret name: VPS_SSH_KEY"
echo ""
echo "3. After adding the secret, run: ./scripts/deploy-app.sh"
echo ""
