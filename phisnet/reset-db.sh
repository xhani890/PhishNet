#!/bin/bash

# PhishNet Database Reset Script
echo "🗄️ Resetting PhishNet Database..."

# Function to prompt for confirmation
confirm() {
    read -p "⚠️ This will DELETE all data. Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operation cancelled."
        exit 1
    fi
}

# Confirm the action
confirm

echo "🔧 Stopping any running PhishNet processes..."
pkill -f "tsx server/index.ts" 2>/dev/null || true
pm2 stop phishnet 2>/dev/null || true

echo "🗑️ Dropping and recreating database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS phishnet_db;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS phishnet_user;" 2>/dev/null || true

echo "👤 Creating database user..."
sudo -u postgres psql -c "CREATE USER phishnet_user WITH PASSWORD 'phishnet_password';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE phishnet_db OWNER phishnet_user;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE phishnet_db TO phishnet_user;" 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER phishnet_user CREATEDB;" 2>/dev/null || true

echo "🏗️ Setting up database schema..."
npm run db:push

echo "📊 Importing sample data..."
npm run import-data

echo ""
echo "✅ Database reset completed!"
echo "🌐 You can now start PhishNet with: ./start-dev.sh"
echo "📧 Default login: admin@phishnet.local / admin123"
