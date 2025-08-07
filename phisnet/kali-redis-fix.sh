#!/bin/bash

# Quick Redis fix for Kali Linux
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Fixing Redis on Kali Linux..."

# Start Redis manually since systemd service has issues
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Redis server manually..."
sudo redis-server --daemonize yes

# Wait a moment for Redis to start
sleep 2

# Test Redis connection
if redis-cli ping >/dev/null 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Redis is running successfully"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ Redis may have issues, but continuing..."
fi

# Continue with the rest of the deployment
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Continuing PhishNet deployment..."

# Install Node.js dependencies
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Installing Node.js dependencies..."
npm install

# Build the application
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Building PhishNet..."
npm run build

# Setup environment file
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Setting up environment configuration..."
if [ ! -f .env ]; then
    cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://phishnet_user:phishnet_password@localhost:5432/phishnet_db"

# Redis Configuration  
REDIS_URL="redis://localhost:6379"

# Server Configuration
PORT=3000
NODE_ENV=production

# Session Secret (change this in production)
SESSION_SECRET="your-super-secret-key-change-this-in-production"

# SMTP Configuration (optional)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""

# Application URL
APP_URL="http://localhost:3000"
EOF
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Environment file created"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Environment file already exists"
fi

# Run database migrations
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running database migrations..."
npm run db:migrate

# Start the application
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Starting PhishNet..."
echo ""
echo "======================================"
echo "🎣 PhishNet Deployment Complete! 🎣"
echo "======================================"
echo "🌐 URL: http://localhost:3000"
echo "📧 Email: admin@phishnet.local"
echo "🔑 Password: admin123"
echo "🔧 Debug: http://localhost:3000/debug"
echo "======================================"
echo ""
echo "Starting PhishNet server..."

# Start in production mode
npm run start:prod
