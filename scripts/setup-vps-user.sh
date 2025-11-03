#!/bin/bash
# Setup VPS user account for RECTOR LABS CORE deployment
# Run this script AS ROOT on your VPS

set -e  # Exit on error

echo "🚀 Setting up VPS user 'core' for deployment..."

# Create user 'core' if doesn't exist
if id "core" &>/dev/null; then
    echo "✅ User 'core' already exists"
else
    echo "📝 Creating user 'core'..."
    adduser core --disabled-password --gecos ""
    echo "✅ User 'core' created"
fi

# Add to sudo group
echo "🔐 Adding 'core' to sudo group..."
usermod -aG sudo core

# Setup SSH directory
echo "🔑 Setting up SSH access..."
mkdir -p /home/core/.ssh
chmod 700 /home/core/.ssh

# Copy authorized_keys from root (if running as root)
if [ -f /root/.ssh/authorized_keys ]; then
    cp /root/.ssh/authorized_keys /home/core/.ssh/
    echo "✅ Copied SSH keys from root"
elif [ -f ~/.ssh/authorized_keys ]; then
    cp ~/.ssh/authorized_keys /home/core/.ssh/
    echo "✅ Copied SSH keys from current user"
fi

# Set correct permissions
chown -R core:core /home/core/.ssh
chmod 600 /home/core/.ssh/authorized_keys

# Setup sudoers for deployment (no password for service restarts)
echo "⚙️  Configuring sudoers for zero-downtime deployments..."
cat > /etc/sudoers.d/core-deploy << 'EOF'
# Allow core user to manage deployment services without password
core ALL=(ALL) NOPASSWD: /bin/systemctl reload core-puma
core ALL=(ALL) NOPASSWD: /bin/systemctl restart core-puma
core ALL=(ALL) NOPASSWD: /bin/systemctl restart core-solidqueue
core ALL=(ALL) NOPASSWD: /bin/systemctl status core-puma
core ALL=(ALL) NOPASSWD: /bin/systemctl status core-solidqueue
core ALL=(ALL) NOPASSWD: /bin/systemctl daemon-reload
EOF

chmod 440 /etc/sudoers.d/core-deploy

echo ""
echo "✅ VPS user setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test SSH: ssh core@176.222.53.185"
echo "2. Run: ./scripts/setup-vps-deps.sh"
echo ""
