#!/bin/bash
# 🎣 PhishNet Universal Linux/macOS Deployment
# Auto-detects environment and installs all dependencies

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Help message
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "PhishNet Universal Deployment Script"
    echo "Usage: ./deploy.sh [--production] [--skip-deps] [--help]"
    echo "  --production   Deploy for production"
    echo "  --skip-deps    Skip dependency installation"
    echo "  --help         Show this help"
    exit 0
fi

# Parse arguments
PRODUCTION=false
SKIP_DEPS=false
for arg in "$@"; do
    case $arg in
        --production) PRODUCTION=true ;;
        --skip-deps) SKIP_DEPS=true ;;
    esac
done

# Banner
echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}🎣 PhishNet Universal Deployment 🎣${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}🚀 Auto-installs all dependencies${NC}"
echo -e "${BLUE}🔧 Configures services automatically${NC}"
echo -e "${BLUE}🐳 Includes Docker support${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Verify we're in the right directory
if [[ ! -f "package.json" ]]; then
    error "package.json not found. Please run from PhishNet directory."
    exit 1
fi

# Detect OS and distribution
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
        DISTRO="macOS"
    elif [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS="Linux"
        DISTRO="$ID"
    else
        OS="Linux"
        DISTRO="unknown"
    fi
    
    info "📍 Detected: $OS ($DISTRO)"
}

# Check if Docker is installed
check_docker() {
    info "🐳 Checking Docker installation..."
    
    if command -v docker >/dev/null 2>&1; then
        if docker --version >/dev/null 2>&1; then
            DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
            success "Docker is installed (version $DOCKER_VERSION)"
            
            # Check if Docker daemon is running
            if docker info >/dev/null 2>&1; then
                success "Docker daemon is running"
                return 0
            else
                warning "Docker is installed but daemon is not running"
                start_docker_daemon
                return 0
            fi
        else
            warning "Docker command found but not working properly"
            return 1
        fi
    else
        warning "Docker is not installed"
        return 1
    fi
}

# Start Docker daemon
start_docker_daemon() {
    info "Starting Docker daemon..."
    
    case "$DISTRO" in
        ubuntu|debian)
            sudo systemctl start docker || sudo service docker start
            sudo systemctl enable docker
            ;;
        centos|rhel|fedora)
            sudo systemctl start docker
            sudo systemctl enable docker
            ;;
        arch)
            sudo systemctl start docker
            sudo systemctl enable docker
            ;;
        *)
            warning "Unknown distribution, trying generic Docker start..."
            sudo systemctl start docker 2>/dev/null || sudo service docker start 2>/dev/null || true
            ;;
    esac
    
    # Add user to docker group if not already
    if ! groups | grep -q docker; then
        info "Adding user to docker group..."
        sudo usermod -aG docker "$USER"
        warning "You may need to log out and back in for Docker group changes to take effect"
    fi
}

# Install Docker
install_docker() {
    info "🐳 Installing Docker..."
    
    case "$DISTRO" in
        ubuntu|debian)
            # Update package index
            sudo apt-get update
            
            # Install prerequisites
            sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
            
            # Add Docker's official GPG key
            curl -fsSL https://download.docker.com/linux/$DISTRO/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            # Set up repository
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$DISTRO $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # Install Docker Engine
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
            
        centos|rhel)
            # Install required packages
            sudo yum install -y yum-utils
            
            # Add Docker repository
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            
            # Install Docker Engine
            sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
            
        fedora)
            # Install required packages
            sudo dnf -y install dnf-plugins-core
            
            # Add Docker repository
            sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            
            # Install Docker Engine
            sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
            
        arch)
            sudo pacman -S --noconfirm docker docker-compose
            ;;
            
        *)
            warning "Unsupported distribution for automatic Docker installation: $DISTRO"
            warning "Please install Docker manually from: https://docs.docker.com/engine/install/"
            return 1
            ;;
    esac
    
    # Start and enable Docker service
    start_docker_daemon
    
    success "Docker installation completed"
}

# Install dependencies based on OS
install_dependencies() {
    if [[ "$SKIP_DEPS" == true ]]; then
        info "Skipping dependency installation"
        return
    fi
    
    info "📦 Installing dependencies..."
    
    case "$DISTRO" in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y curl wget git build-essential postgresql postgresql-contrib redis-server nodejs npm
            
            # Install Node.js 18+ if needed
            if ! node --version | grep -q "v1[89]\|v[2-9][0-9]"; then
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
            fi
            ;;
            
        centos|rhel)
            sudo yum update -y
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y curl wget git postgresql-server postgresql-contrib redis nodejs npm
            
            # Initialize PostgreSQL if needed
            if [[ ! -d "/var/lib/pgsql/data/postgresql.conf" ]]; then
                sudo postgresql-setup initdb
            fi
            ;;
            
        fedora)
            sudo dnf update -y
            sudo dnf groupinstall -y "Development Tools"
            sudo dnf install -y curl wget git postgresql-server postgresql-contrib redis nodejs npm
            ;;
            
        arch)
            sudo pacman -Syu --noconfirm
            sudo pacman -S --noconfirm base-devel curl wget git postgresql redis nodejs npm
            ;;
            
        macOS)
            # Install Homebrew if not present
            if ! command -v brew >/dev/null 2>&1; then
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            
            brew update
            brew install postgresql redis node git
            ;;
            
        *)
            warning "Unknown distribution: $DISTRO. Please install dependencies manually."
            ;;
    esac
    
    success "Dependencies installed"
}

# Main execution
detect_os

# Check and install Docker if needed
if ! check_docker; then
    read -p "🐳 Docker is not installed or not working. Install Docker? (Y/n): " install_docker_choice
    if [[ "$install_docker_choice" != "n" && "$install_docker_choice" != "N" ]]; then
        install_docker
        
        # Verify installation
        if check_docker; then
            success "Docker is now installed and running"
        else
            error "Docker installation failed or is not working"
            warning "You can continue without Docker, but some features may not work"
        fi
    else
        warning "Skipping Docker installation"
    fi
fi

# Install other dependencies
install_dependencies

# Setup PostgreSQL
info "🗄️ Setting up PostgreSQL..."
case "$DISTRO" in
    ubuntu|debian|kali)
        # Handle Kali Redis service naming
        if [[ "$DISTRO" == "kali" ]]; then
            sudo systemctl start redis-server || sudo systemctl start redis
            sudo systemctl enable redis-server || sudo systemctl enable redis
        else
            sudo systemctl start redis-server
            sudo systemctl enable redis-server
        fi
        
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        ;;
    centos|rhel|fedora)
        sudo systemctl start redis postgresql
        sudo systemctl enable redis postgresql
        ;;
    macOS)
        brew services start postgresql
        brew services start redis
        ;;
esac

# Database setup
sudo -u postgres psql -c "DROP DATABASE IF EXISTS phishnet_db;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS phishnet_user;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER phishnet_user WITH PASSWORD 'phishnet_password';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE phishnet_db OWNER phishnet_user;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE phishnet_db TO phishnet_user;" 2>/dev/null || true

success "Database setup complete"

# Environment setup
info "📝 Setting up environment..."
if [[ ! -f ".env" ]]; then
    cat > .env << EOF
DATABASE_URL=postgresql://phishnet_user:phishnet_password@localhost:5432/phishnet_db
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
SESSION_SECRET=dev-secret-key-change-in-production
APP_URL=http://localhost:3000
EOF
    success "Environment file created"
fi

# Install npm dependencies
info "🚀 Setting up PhishNet application..."
npm install

# Database schema
npm run db:push 2>/dev/null || warning "Database schema setup had issues"

# Sample data
npm run import-data 2>/dev/null || warning "Sample data import had issues"

# Production build
if [[ "$PRODUCTION" == true ]]; then
    info "🔨 Building for production..."
    npm run build
fi

# Completion
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}🎉 PhishNet Deployment Complete! 🎉${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "🌐 URL: http://localhost:3000"
echo -e "📧 Email: admin@phishnet.local"
echo -e "🔑 Password: admin123"
if command -v docker >/dev/null 2>&1; then
    echo -e "🐳 Docker: Available"
else
    echo -e "🐳 Docker: Not installed"
fi
echo -e "${GREEN}======================================${NC}"
echo ""

if [[ "$PRODUCTION" != true ]]; then
    read -p "🚀 Start PhishNet development server now? (Y/n): " start_choice
    if [[ "$start_choice" != "n" && "$start_choice" != "N" ]]; then
        info "Starting PhishNet..."
        export NODE_ENV=development
        npx tsx server/index.ts
    else
        info "To start later: ./start.sh"
    fi
fi
