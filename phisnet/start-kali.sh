#!/bin/bash

# PhishNet Quick Start Script for Kali Linux
echo "🎣 Starting PhishNet services..."

# Start Redis if not running
if ! redis-cli ping >/dev/null 2>&1; then
    echo "Starting Redis..."
    sudo redis-server --daemonize yes
    sleep 2
fi

# Start PostgreSQL if not running
sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start

# Start PhishNet
echo "🚀 Launching PhishNet..."
echo "🌐 Access at: http://localhost:3000"
echo "📧 Login: admin@phishnet.local / admin123"
echo ""

# Run PhishNet
npm run start:prod
