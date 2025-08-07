#!/bin/bash
# 🔧 Kali Linux Docker Compose Fix
# Fixes the segmentation fault issue with docker-compose on Kali

echo "🔧 Fixing Docker Compose segmentation fault on Kali..."

# Remove broken docker-compose
sudo apt-get remove -y docker-compose 2>/dev/null || true

# Install pipx if not present (better than pip for isolated packages)
if ! command -v pipx >/dev/null 2>&1; then
    echo "📦 Installing pipx..."
    sudo apt-get update
    sudo apt-get install -y pipx python3-venv
fi

# Install docker-compose via pipx (isolated environment)
echo "📦 Installing docker-compose via pipx..."
if pipx install docker-compose; then
    echo "✅ Docker Compose installed via pipx"
    
    # Ensure pipx bin is in PATH
    export PATH="$HOME/.local/bin:$PATH"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc 2>/dev/null || true
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc 2>/dev/null || true
    
else
    echo "⚠️ pipx failed, trying pip with --break-system-packages..."
    sudo pip3 install docker-compose --break-system-packages
fi

# Fix Docker permissions
echo "🔧 Fixing Docker permissions..."
if ! groups | grep -q docker; then
    sudo usermod -aG docker "$USER"
    echo "⚠️ Added to docker group. Please log out and back in, or run: newgrp docker"
fi

# Fix Docker socket permissions temporarily
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

# Verify installation
echo "🔍 Testing Docker Compose installation..."

# Check pipx version first
if command -v "$HOME/.local/bin/docker-compose" >/dev/null 2>&1; then
    echo "✅ Docker Compose (pipx) installed successfully:"
    "$HOME/.local/bin/docker-compose" --version
elif docker-compose --version >/dev/null 2>&1; then
    echo "✅ Docker Compose installed successfully:"
    docker-compose --version
else
    echo "❌ Docker Compose installation failed"
fi

# Test alternative 'docker compose' command
echo "🔄 Testing alternative 'docker compose' command..."
if docker compose version >/dev/null 2>&1; then
    echo "✅ Alternative 'docker compose' command available:"
    docker compose version
    echo "💡 Recommended: Use 'docker compose' instead of 'docker-compose'"
else
    echo "⚠️ Alternative 'docker compose' not available"
fi

# Test Docker permissions
echo "🔍 Testing Docker permissions..."
if docker ps >/dev/null 2>&1; then
    echo "✅ Docker permissions working"
else
    echo "⚠️ Docker permission issues detected"
    echo "🔧 Run these commands:"
    echo "   newgrp docker"
    echo "   # OR log out and back in"
    echo "   # OR run with sudo: sudo docker compose up -d"
fi

echo "🎉 Docker Compose fix completed!"
echo ""
echo "📋 Usage options:"
echo "   docker compose up -d      (recommended - new syntax)"
echo "   ~/.local/bin/docker-compose up -d   (pipx version)"
echo "   sudo docker compose up -d (if permission issues persist)"
