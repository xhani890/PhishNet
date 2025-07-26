#!/bin/bash
# 🔧 Kali Linux Docker Compose Fix
# Fixes the segmentation fault issue with docker-compose on Kali

echo "🔧 Fixing Docker Compose segmentation fault on Kali..."

# Remove broken docker-compose
sudo apt-get remove -y docker-compose 2>/dev/null || true

# Install pip3 if not present
if ! command -v pip3 >/dev/null 2>&1; then
    echo "📦 Installing pip3..."
    sudo apt-get update
    sudo apt-get install -y python3-pip
fi

# Install docker-compose via pip
echo "📦 Installing docker-compose via pip..."
sudo pip3 install docker-compose

# Verify installation
if docker-compose --version >/dev/null 2>&1; then
    echo "✅ Docker Compose installed successfully:"
    docker-compose --version
else
    echo "❌ Docker Compose installation failed"
    exit 1
fi

# Alternative: use docker compose (newer syntax)
echo "🔄 Testing alternative 'docker compose' command..."
if docker compose version >/dev/null 2>&1; then
    echo "✅ Alternative 'docker compose' command available:"
    docker compose version
    echo "💡 Use 'docker compose' instead of 'docker-compose'"
else
    echo "⚠️ Alternative 'docker compose' not available"
fi

echo "🎉 Docker Compose fix completed!"
