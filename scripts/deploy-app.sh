#!/bin/bash
# Deploy RECTOR LABS CORE application
# Run this script AS 'core' USER on VPS

set -e

echo "🚀 Deploying RECTOR LABS CORE..."

# Clone repository if not exists
if [ ! -d "$HOME/core" ]; then
    echo "📥 Cloning repository..."
    cd ~
    git clone https://github.com/RECTOR-LABS/core.git
    cd core
else
    echo "📁 Repository already exists, pulling latest..."
    cd ~/core
    git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
bundle install --deployment --without development test

# Generate Rails secret if needed
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    RAILS_SECRET=$(bundle exec rails secret)

    echo "Please enter your GitHub token:"
    read -r GITHUB_TOKEN

    echo "Please enter your PostgreSQL password (from previous step):"
    read -sr DB_PASSWORD
    echo ""

    cat > .env << EOF
RAILS_ENV=production
RACK_ENV=production

# GitHub API
GITHUB_TOKEN=$GITHUB_TOKEN

# Database
CORE_DATABASE_PASSWORD=$DB_PASSWORD

# Rails secret
SECRET_KEY_BASE=$RAILS_SECRET

# Database URL
DATABASE_URL=postgresql://core:$DB_PASSWORD@localhost/core_production
EOF

    chmod 600 .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Precompile assets
echo "🎨 Precompiling assets..."
RAILS_ENV=production bundle exec rails assets:precompile

# Setup database
echo "🗄️  Setting up database..."
RAILS_ENV=production bundle exec rails db:create
RAILS_ENV=production bundle exec rails db:migrate

# Initial GitHub sync
echo "📡 Running initial GitHub sync..."
RAILS_ENV=production bundle exec rails github:sync

# Verify
echo "🔍 Verifying setup..."
RAILS_ENV=production bundle exec rails github:tech_stack

echo ""
echo "✅ Application deployed!"
echo ""
echo "📋 Next steps:"
echo "1. Setup systemd services: sudo ./scripts/setup-services.sh"
echo "2. Configure Nginx: sudo ./scripts/setup-nginx.sh"
echo "3. Setup SSL: sudo ./scripts/setup-ssl.sh"
echo ""
