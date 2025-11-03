#!/bin/bash
# Setup PostgreSQL database for RECTOR LABS CORE
# Run this script AS 'core' USER on VPS

set -e

echo "🗄️  Setting up PostgreSQL database..."

# Generate a secure random password
DB_PASSWORD=$(openssl rand -base64 32)

# Create database and user
sudo -u postgres psql << EOSQL
-- Create user and database
CREATE USER core WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE core_production OWNER core;
GRANT ALL PRIVILEGES ON DATABASE core_production TO core;

-- Display connection info
\c core_production
\conninfo
EOSQL

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "🔐 IMPORTANT: Save this database password!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Database Password: $DB_PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You'll need this for the .env file in the next step."
echo ""
echo "📋 Next step: Run ./scripts/setup-github-deploy-key.sh"
echo ""
