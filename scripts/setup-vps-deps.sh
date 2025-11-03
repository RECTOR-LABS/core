#!/bin/bash
# Install dependencies on VPS for RECTOR LABS CORE
# Run this script AS 'core' USER on VPS

set -e

echo "📦 Installing system dependencies..."

# Update system
sudo apt update
sudo apt upgrade -y

# Install all dependencies
sudo apt install -y \
  git curl libssl-dev libreadline-dev zlib1g-dev \
  autoconf bison build-essential libyaml-dev \
  libncurses5-dev libffi-dev libgdbm-dev \
  nodejs npm \
  postgresql postgresql-contrib libpq-dev \
  nginx \
  certbot python3-certbot-nginx

echo "✅ System dependencies installed!"
echo ""
echo "🔨 Installing rbenv and Ruby..."

# Install rbenv
if [ ! -d "$HOME/.rbenv" ]; then
    curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash

    # Add to .bashrc if not already there
    if ! grep -q "rbenv init" ~/.bashrc; then
        echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
        echo 'eval "$(rbenv init -)"' >> ~/.bashrc
    fi

    export PATH="$HOME/.rbenv/bin:$PATH"
    eval "$(rbenv init -)"
else
    echo "✅ rbenv already installed"
fi

# Install Ruby 3.3.6
echo "📥 Installing Ruby 3.3.6 (this may take a few minutes)..."
rbenv install -s 3.3.6
rbenv global 3.3.6

# Install bundler
gem install bundler

echo ""
echo "✅ Ruby installation complete!"
ruby -v
echo ""

echo "📋 Next steps:"
echo "1. Exit and re-login (or run: source ~/.bashrc)"
echo "2. Run: ./scripts/setup-postgres.sh"
echo ""
