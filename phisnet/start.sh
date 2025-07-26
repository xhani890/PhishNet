#!/bin/bash

# 🎣 PhishNet Universal Start Script
# Starts PhishNet with automatic service management

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] $1${NC}"; }
info() { echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"; }

# Parse arguments
PRODUCTION=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --prod|--production) PRODUCTION=true; shift ;;
        --help)
            echo "Usage: $0 [--prod]"
            echo "  --prod    Start in production mode"
            exit 0
            ;;
        *) shift ;;
    esac
done

# Banner
echo -e "${BLUE}"
echo "================================"
echo "🎣 Starting PhishNet 🎣"
echo "================================"
echo -e "${NC}"

# Check if in correct directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Run from PhishNet directory"
    exit 1
fi

# Auto-start services
log "🔧 Starting services..."

# Start Redis (multiple methods)
if ! redis-cli ping >/dev/null 2>&1; then
    if command -v systemctl >/dev/null 2>&1; then
        sudo systemctl start redis-server 2>/dev/null || sudo systemctl start redis 2>/dev/null || sudo redis-server --daemonize yes
    else
        sudo redis-server --daemonize yes 2>/dev/null || true
    fi
    sleep 1
fi

# Start PostgreSQL
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl start postgresql 2>/dev/null || true
elif command -v service >/dev/null 2>&1; then
    sudo service postgresql start 2>/dev/null || true
elif command -v brew >/dev/null 2>&1; then
    brew services start postgresql 2>/dev/null || true
fi

# Verify services
if redis-cli ping >/dev/null 2>&1; then
    log "✅ Redis running"
else
    warn "⚠️ Redis may not be running"
fi

# Create .env if missing
if [[ ! -f .env ]]; then
    log "📝 Creating environment file..."
    cat > .env << 'EOF'
DATABASE_URL=postgresql://phishnet_user:phishnet_password@localhost:5432/phishnet_db
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
SESSION_SECRET=dev-secret-key
APP_URL=http://localhost:3000
EOF
fi

# Install dependencies if missing
if [[ ! -d "node_modules" ]]; then
    log "📦 Installing dependencies..."
    npm install
fi

# Show startup info
echo ""
echo "======================================"
echo "🎣 PhishNet Server Starting 🎣"
echo "======================================"
echo "🌐 URL: http://localhost:3000"
echo "📧 Login: admin@phishnet.local"
echo "🔑 Password: admin123"
echo "======================================"
echo "🛑 Press Ctrl+C to stop"
echo ""

# Start application
if [[ "$PRODUCTION" == true ]]; then
    log "🚀 Starting in production mode..."
    NODE_ENV=production npx tsx server/index.ts
else
    log "🚀 Starting in development mode..."
    NODE_ENV=development npx tsx server/index.ts
fi
