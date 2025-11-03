#!/bin/bash
# Setup SSL with Let's Encrypt for RECTOR LABS CORE
# Run this script WITH SUDO (sudo ./scripts/setup-ssl.sh)

set -e

echo "🔒 Setting up SSL with Let's Encrypt..."

# Obtain SSL certificate
certbot --nginx -d rectorspace.com -d www.rectorspace.com --non-interactive --agree-tos --email rheza10@gmail.com --redirect

echo ""
echo "✅ SSL certificate installed!"
echo ""

# Test auto-renewal
echo "🔄 Testing SSL auto-renewal..."
certbot renew --dry-run

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Your site is now live at: https://rectorspace.com"
echo ""
echo "📊 Service status:"
systemctl status core-puma --no-pager | head -3
systemctl status core-solidqueue --no-pager | head -3
systemctl status nginx --no-pager | head -3
echo ""
echo "🔍 Verify deployment:"
echo "   Visit: https://rectorspace.com"
echo "   Health: https://rectorspace.com/up"
echo ""
echo "📝 Useful commands:"
echo "   View logs: journalctl -u core-puma -f"
echo "   Restart app: sudo systemctl reload core-puma"
echo "   View GitHub repos: cd ~/core && RAILS_ENV=production bin/rails runner 'puts GithubRepo.count'"
echo ""
echo "🚀 Future deployments:"
echo "   Just push to main branch - GitHub Actions will auto-deploy!"
echo ""
echo "May Allah bless this work! Alhamdulillah! 🤲"
echo ""
