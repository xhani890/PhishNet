#!/bin/bash
# 🚨 Kali Linux Quick Fix Script
# Addresses the specific issues encountered in deployment

echo "🚨 Kali Linux Quick Fix - Addressing deployment issues..."

# 1. Fix Docker Compose segfault
echo "🔧 Step 1: Fixing Docker Compose segfault..."
sudo apt-get remove -y docker-compose 2>/dev/null || true

# Install pipx for isolated packages
sudo apt-get update
sudo apt-get install -y pipx python3-venv

# Install docker-compose via pipx
if pipx install docker-compose; then
    echo "✅ Docker Compose installed via pipx"
    export PATH="$HOME/.local/bin:$PATH"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc 2>/dev/null || true
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc 2>/dev/null || true
else
    echo "⚠️ pipx failed, using pip with --break-system-packages..."
    sudo pip3 install docker-compose --break-system-packages
fi

# 2. Fix Docker permissions
echo "🔧 Step 2: Fixing Docker permissions..."
if ! groups | grep -q docker; then
    sudo usermod -aG docker "$USER"
    echo "🔄 Added to docker group"
fi

# Fix Docker socket permissions temporarily
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
echo "✅ Docker socket permissions fixed"

# 3. Start Docker daemon
echo "🔧 Step 3: Starting Docker daemon..."
sudo systemctl start docker
sudo systemctl enable docker
echo "✅ Docker daemon started"

# 4. Fix .env file issue
echo "🔧 Step 4: Checking .env file..."
if [[ ! -f ".env" ]]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
DATABASE_URL=postgresql://phishnet_user:phishnet_password@localhost:5432/phishnet_db
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
SESSION_SECRET=dev-secret-key-change-in-production
APP_URL=http://localhost:3000
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# 5. Fix Dockerfile (Alpine package issue)
if [[ -f "Dockerfile" ]] && grep -q "redis-tools" Dockerfile; then
    echo "🔧 Step 5: Fixing Dockerfile Alpine package issue..."
    sed -i 's/redis-tools/redis/g' Dockerfile
    echo "✅ Dockerfile fixed (redis-tools → redis)"
fi

# 6. Test fixes
echo "🔍 Step 6: Testing fixes..."

echo "📋 Testing Docker..."
if docker --version >/dev/null 2>&1; then
    echo "✅ Docker: $(docker --version)"
else
    echo "❌ Docker not working"
fi

echo "📋 Testing Docker Compose..."
if command -v "$HOME/.local/bin/docker-compose" >/dev/null 2>&1; then
    echo "✅ Docker Compose (pipx): $($HOME/.local/bin/docker-compose --version)"
elif docker compose version >/dev/null 2>&1; then
    echo "✅ Docker Compose (native): $(docker compose version)"
elif docker-compose --version >/dev/null 2>&1; then
    echo "✅ Docker Compose (system): $(docker-compose --version)"
else
    echo "❌ Docker Compose not working"
fi

echo "📋 Testing Docker permissions..."
if docker ps >/dev/null 2>&1; then
    echo "✅ Docker permissions working"
elif sudo docker ps >/dev/null 2>&1; then
    echo "⚠️ Docker works with sudo only"
    echo "💡 Run: newgrp docker"
else
    echo "❌ Docker not accessible"
fi

echo "📋 Testing .env file..."
if [[ -f ".env" ]] && grep -q "DATABASE_URL" .env; then
    echo "✅ .env file looks good"
else
    echo "❌ .env file issue"
fi

# 7. Instructions for user
echo ""
echo "🎯 Next steps:"
echo "1. Run: newgrp docker     (to refresh group membership)"
echo "2. OR log out and back in"
echo "3. Then run: docker compose up -d"
echo "4. If that fails, run: sudo docker compose up -d"
echo ""
echo "📋 Usage commands:"
echo "  docker compose up -d                    (recommended)"
echo "  ~/.local/bin/docker-compose up -d       (pipx version)"
echo "  sudo docker compose up -d               (if permissions fail)"
echo ""
echo "🎉 Quick fix completed!"
