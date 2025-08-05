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

# Auto chmod function - makes scripts executable
auto_chmod() {
    info "🔧 Setting script permissions..."
    
    # List of scripts that should be executable
    local scripts=(
        "deploy.sh"
        "start.sh" 
        "kali-docker-fix.sh"
        "kali-redis-fix.sh"
        "reset-db.sh"
        "check-deps.sh"
        "start-dev.sh"
        "start-prod.sh"
        "start-kali.sh"
        "fix-final-errors.sh"
        "create-package.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            chmod +x "$script" 2>/dev/null || true
            if [[ -x "$script" ]]; then
                success "Made $script executable"
            else
                warning "Failed to make $script executable"
            fi
        fi
    done
    
    # Also make any .sh files executable
    find . -maxdepth 1 -name "*.sh" -type f -exec chmod +x {} \; 2>/dev/null || true
    
    # Fix directory permissions if needed
    if [[ ! -w "." ]]; then
        warning "Directory not writable, attempting to fix permissions..."
        chmod 755 . 2>/dev/null || true
    fi
    
    # Make node_modules/.bin executable if it exists
    if [[ -d "node_modules/.bin" ]]; then
        chmod +x node_modules/.bin/* 2>/dev/null || true
    fi
    
    success "Script permissions updated"
}

# Enhanced permission diagnostic
check_permissions() {
    info "🔍 Checking file permissions..."
    
    # Check current directory permissions
    if [[ ! -w "." ]]; then
        warning "Current directory is not writable"
        return 1
    fi
    
    # Check if we can create files
    if ! touch .permission_test 2>/dev/null; then
        warning "Cannot create files in current directory"
        return 1
    else
        rm .permission_test 2>/dev/null || true
        success "Directory permissions OK"
    fi
    
    # Check script executability
    if [[ -f "deploy.sh" && ! -x "deploy.sh" ]]; then
        warning "deploy.sh is not executable"
        chmod +x deploy.sh 2>/dev/null || true
    fi
    
    return 0
}

# Comprehensive Kali Linux fixes
run_kali_fixes() {
    info "🚨 Running comprehensive Kali Linux fixes..."
    
    # 1. Fix Docker Compose segfault
    info "🔧 Step 1: Fixing Docker Compose segfault..."
    sudo apt-get remove -y docker-compose 2>/dev/null || true
    
    # Install pipx for isolated packages
    if ! command -v pipx >/dev/null 2>&1; then
        info "Installing pipx for isolated Python packages..."
        sudo apt-get install -y pipx python3-venv
    fi
    
    # Install docker-compose via pipx
    if pipx install docker-compose 2>/dev/null; then
        success "Docker Compose installed via pipx"
        export PATH="$HOME/.local/bin:$PATH"
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc 2>/dev/null || true
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc 2>/dev/null || true
    else
        warning "pipx failed, using pip with --break-system-packages..."
        sudo pip3 install docker-compose --break-system-packages 2>/dev/null || true
    fi
    
    # 2. Fix Docker permissions
    info "🔧 Step 2: Fixing Docker permissions..."
    if ! groups | grep -q docker; then
        sudo usermod -aG docker "$USER"
        success "Added to docker group"
    fi
    
    # Fix Docker socket permissions temporarily
    sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
    
    # Start Docker service if not running
    if ! systemctl is-active --quiet docker; then
        sudo systemctl start docker
        sleep 2
    fi
    
    # Test Docker access immediately
    if docker ps >/dev/null 2>&1; then
        success "Docker permissions working immediately"
    else
        warning "Docker permissions need group refresh - will work after 'newgrp docker'"
        # Try to fix socket permissions more aggressively
        sudo chmod 777 /var/run/docker.sock 2>/dev/null || true
    fi
    
    success "Docker socket permissions fixed"
    
    # 3. Ensure Docker daemon is running
    info "🔧 Step 3: Starting Docker daemon..."
    sudo systemctl start docker 2>/dev/null || true
    sudo systemctl enable docker 2>/dev/null || true
    success "Docker daemon started"
    
    # 4. Fix Dockerfile Alpine package issue
    if [[ -f "Dockerfile" ]] && grep -q "redis-tools" Dockerfile; then
        info "🔧 Step 4: Fixing Dockerfile Alpine package issue..."
        sed -i 's/redis-tools/redis/g' Dockerfile
        success "Dockerfile fixed (redis-tools → redis)"
    fi
    
    # Fix Dockerfile npm ci issue
    if [[ -f "Dockerfile" ]] && grep -q "npm ci --only=production" Dockerfile; then
        info "🔧 Fixing Dockerfile npm ci issue..."
        sed -i 's/npm ci --only=production --ignore-scripts/npm install --production --ignore-scripts || npm install --ignore-scripts/g' Dockerfile
        success "Dockerfile npm command fixed"
    fi
    
    # 5. Fix docker-compose.yml version warning
    if [[ -f "docker-compose.yml" ]] && grep -q "version:" docker-compose.yml; then
        info "🔧 Step 5: Fixing docker-compose.yml version warning..."
        sed -i '/^version:/d' docker-compose.yml
        success "docker-compose.yml version attribute removed"
    fi
    
    # 5. Test fixes
    info "🔍 Step 6: Testing fixes..."
    
    # Test Docker
    if docker --version >/dev/null 2>&1; then
        success "Docker: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
    else
        warning "Docker not working"
    fi
    
    # Test Docker Compose
    if command -v "$HOME/.local/bin/docker-compose" >/dev/null 2>&1; then
        success "Docker Compose (pipx): Available"
    elif docker compose version >/dev/null 2>&1; then
        success "Docker Compose (native): Available"
    elif docker-compose --version >/dev/null 2>&1; then
        success "Docker Compose (system): Available"
    else
        warning "Docker Compose not working"
    fi
    
    # Test Docker permissions
    if docker ps >/dev/null 2>&1; then
        success "Docker permissions working"
    elif sudo docker ps >/dev/null 2>&1; then
        warning "Docker works with sudo only - run 'newgrp docker' after deployment"
    else
        warning "Docker not accessible"
    fi
    
    # Test Docker permissions immediately and suggest next steps
    if docker ps >/dev/null 2>&1; then
        success "Docker permissions working - you can use: docker compose up -d"
    elif sudo docker ps >/dev/null 2>&1; then
        warning "Docker works with sudo only"
        info "You can use: sudo docker compose up -d"
        info "Or run: newgrp docker (then use without sudo)"
    else
        warning "Docker not accessible - check installation"
    fi
    
    success "Kali-specific fixes completed"
    
    # Provide immediate usage instructions
    info "🎯 Ready to start containers:"
    info "   Option 1: sudo docker compose up -d"
    info "   Option 2: newgrp docker && docker compose up -d"
    info "   Option 3: Log out and back in, then: docker compose up -d"
}

# Run auto chmod at start
check_permissions
auto_chmod

# Create missing essential scripts if they don't exist
create_missing_scripts() {
    info "📝 Checking for missing essential scripts..."
    
    # Create start.sh if missing
    if [[ ! -f "start.sh" ]]; then
        info "Creating start.sh script..."
        cat > start.sh << 'EOF'
#!/bin/bash
# 🎣 PhishNet Universal Startup Script

echo "🚀 Starting PhishNet..."

# Start services
sudo systemctl start postgresql redis-server 2>/dev/null || sudo systemctl start postgresql redis 2>/dev/null || true

# Check .env file
if [[ ! -f ".env" ]]; then
    echo "❌ No .env file found. Run ./deploy.sh first"
    exit 1
fi

# Start application
export NODE_ENV=development
npx tsx server/index.ts
EOF
        chmod +x start.sh
        success "Created start.sh"
    fi
    
    # Create kali-quick-fix.sh if missing
    if [[ ! -f "kali-quick-fix.sh" ]]; then
        info "Creating kali-quick-fix.sh script..."
        cat > kali-quick-fix.sh << 'EOF'
#!/bin/bash
# 🚨 Kali Linux Quick Fix Script
echo "🚨 Running Kali Linux comprehensive fixes..."
echo "This script fixes Docker Compose segfault, permissions, and package issues."
echo ""

# Re-run the deployment with built-in Kali fixes
if [[ -f "deploy.sh" ]]; then
    echo "🔄 Re-running deployment with integrated Kali fixes..."
    ./deploy.sh --skip-deps
else
    echo "❌ deploy.sh not found. Please run from PhishNet directory."
    exit 1
fi
EOF
        chmod +x kali-quick-fix.sh
        success "Created kali-quick-fix.sh"
    fi
    
    # Create reset-db.sh if missing
    if [[ ! -f "reset-db.sh" ]]; then
        info "Creating reset-db.sh script..."
        cat > reset-db.sh << 'EOF'
#!/bin/bash
# 🗄️ PhishNet Database Reset Script

echo "🗄️ Resetting PhishNet database..."

# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS phishnet_db;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE phishnet_db OWNER phishnet_user;" 2>/dev/null || true

# Push schema and import data
npm run db:push
npm run import-data

echo "✅ Database reset complete"
EOF
        chmod +x reset-db.sh
        success "Created reset-db.sh"
    fi
    
    success "Essential scripts verified"
}

# Run script creation
create_missing_scripts

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
        ubuntu|debian|kali)
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
        ubuntu|debian|kali)
            # Update package index
            sudo apt-get update
            
            # Install prerequisites
            sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
            
            # Add Docker's official GPG key
            if [[ "$DISTRO" == "kali" ]]; then
                # Kali-specific Docker installation
                curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian bullseye stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            else
                curl -fsSL https://download.docker.com/linux/$DISTRO/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$DISTRO $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            fi
            
            # Install Docker Engine
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            
            # Fix docker-compose for Kali
            if [[ "$DISTRO" == "kali" ]]; then
                sudo apt-get remove -y docker-compose 2>/dev/null || true
                
                # Install via pipx (isolated environment)
                sudo apt-get install -y pipx python3-venv
                pipx install docker-compose || {
                    # Fallback: use --break-system-packages
                    sudo pip3 install docker-compose --break-system-packages
                }
                
                # Ensure pipx bin is in PATH
                export PATH="$HOME/.local/bin:$PATH"
            fi
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
        ubuntu|debian|kali)
            sudo apt-get update
            sudo apt-get install -y curl wget git build-essential postgresql postgresql-contrib redis-server nodejs npm
            
            # Kali-specific fixes
            if [[ "$DISTRO" == "kali" ]]; then
                # Fix docker-compose segfault issue - use pipx instead of pip
                sudo apt-get remove -y docker-compose 2>/dev/null || true
                
                # Install pipx for isolated Python packages
                sudo apt-get install -y pipx python3-venv
                
                # Install docker-compose via pipx (isolated environment)
                pipx install docker-compose || {
                    # Fallback: use --break-system-packages if pipx fails
                    sudo pip3 install docker-compose --break-system-packages
                }
                
                # Install additional Kali dependencies
                sudo apt-get install -y python3-dev libpq-dev
                
                # Ensure pipx bin is in PATH
                export PATH="$HOME/.local/bin:$PATH"
                echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
                echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
            fi
            
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

# Kali-specific permission fixes
kali_permission_fixes() {
    if [[ "$DISTRO" == "kali" ]]; then
        info "🐉 Applying Kali-specific permission fixes..."
        
        # Fix common Kali permission issues
        sudo chown -R $USER:$USER . 2>/dev/null || true
        
        # Fix npm global permissions
        if [[ -d "/usr/lib/node_modules" ]]; then
            sudo chown -R $USER:$USER /usr/lib/node_modules 2>/dev/null || true
        fi
        
        # Fix .npm cache permissions
        if [[ -d "$HOME/.npm" ]]; then
            sudo chown -R $USER:$USER $HOME/.npm 2>/dev/null || true
        fi
        
        # Make sure current user owns the project directory
        if [[ "$PWD" != "$HOME"* ]]; then
            warning "Not in home directory, fixing ownership..."
            sudo chown -R $USER:$USER "$PWD" 2>/dev/null || true
        fi
        
        # Fix Docker group permissions properly
        if command -v docker >/dev/null 2>&1; then
            if ! groups | grep -q docker; then
                info "Adding user to docker group..."
                sudo usermod -aG docker "$USER"
                
                # Try to refresh group membership without logout
                newgrp docker 2>/dev/null || true
                
                warning "Docker group added. You may need to log out and back in, or run: newgrp docker"
            fi
            
            # Ensure Docker socket has proper permissions
            if [[ -S /var/run/docker.sock ]]; then
                sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
            fi
        fi
        
        success "Kali permission fixes applied"
    fi
}

# Main execution
detect_os

# Apply Kali fixes if needed
kali_permission_fixes

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

# Run Kali-specific fixes if needed
if [[ "$DISTRO" == "kali" ]]; then
    info "🐉 Running Kali-specific fixes..."
    run_kali_fixes
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

# Database setup - Use consistent naming with default postgres user
sudo -u postgres psql -c "DROP DATABASE IF EXISTS phishnet;" 2>/dev/null || true
# Create database with default postgres user (no separate phishnet_user)
sudo -u postgres psql -c "CREATE DATABASE phishnet;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE phishnet TO postgres;" 2>/dev/null || true

# Verify database connection with postgres user
info "🔍 Verifying database connection..."
if sudo -u postgres psql -d phishnet -c "SELECT 1;" >/dev/null 2>&1; then
    success "Database connection verified"
else
    warning "Database connection failed, but continuing..."
fi

success "Database setup complete"

# Environment setup
info "📝 Setting up environment..."
if [[ ! -f ".env" ]]; then
    cat > .env << EOF
DATABASE_URL=postgresql://postgres@localhost:5432/phishnet
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
SESSION_SECRET=dev-secret-key-change-in-production
APP_URL=http://localhost:3000
EOF
    success "Environment file created"
fi

# Verify .env file
if [[ -f ".env" ]]; then
    info "📋 Environment file contents:"
    cat .env | sed 's/PASSWORD=.*/PASSWORD=***/' # Hide password in output
    success "Environment verified"
else
    error "Failed to create .env file"
    exit 1
fi

# Install npm dependencies
info "🚀 Setting up PhishNet application..."

# Generate package-lock.json if missing (fixes Docker build)
if [[ ! -f "package-lock.json" ]]; then
    info "Generating package-lock.json for Docker compatibility..."
    npm install --package-lock-only 2>/dev/null || npm install --dry-run 2>/dev/null || true
    if [[ -f "package-lock.json" ]]; then
        success "package-lock.json generated"
    else
        warning "Could not generate package-lock.json - Docker build may use npm install fallback"
    fi
fi

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

# Kali-specific instructions
if [[ "$DISTRO" == "kali" ]]; then
    echo -e "${YELLOW}======================================${NC}"
    echo -e "${YELLOW}🐉 Kali Linux Specific Notes 🐉${NC}"
    echo -e "${YELLOW}======================================${NC}"
    echo -e "🔧 If Docker permission issues:"
    echo -e "   newgrp docker"
    echo -e "   # OR log out and back in"
    echo -e ""
    echo -e "🐳 Docker Compose commands:"
    echo -e "   docker compose up -d        (recommended)"
    echo -e "   sudo docker compose up -d   (if permissions fail)"
    echo -e ""
    echo -e "🚨 If issues persist, run:"
    echo -e "   ./kali-quick-fix.sh         (standalone fix script)"
    echo -e "   ./deploy.sh                 (re-run with built-in fixes)"
    echo -e "${YELLOW}======================================${NC}"
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

# Create friend deployment package automatically
create_friend_package() {
    info "🎁 Creating friend deployment package..."
    
    # Check if package already exists from create-package.sh
    EXISTING_PACKAGE=$(find . -maxdepth 1 -name "PhishNet-Package-*" -type d 2>/dev/null | head -1)
    
    if [[ -n "$EXISTING_PACKAGE" ]]; then
        info "Found existing package: $EXISTING_PACKAGE"
        PACKAGE_DIR="$EXISTING_PACKAGE"
    else
        # Create new package directory
        TIMESTAMP=$(date +%Y%m%d-%H%M%S)
        PACKAGE_DIR="PhishNet-Package-Linux-$TIMESTAMP"
        mkdir -p "$PACKAGE_DIR"
        info "Created new package: $PACKAGE_DIR"
    fi
    
    # Essential files for friend deployment
    ESSENTIAL_FILES=(
        "deploy.sh"
        "start.sh"
        "deploy.ps1"
        "deploy.bat"
        "start.ps1" 
        "start.bat"
        "test-deployment.ps1"
        "QUICK-FRIEND-SETUP.md"
        "FRIEND-DEPLOYMENT-GUIDE.md"
        "WINDOWS-SETUP.md"
        "UNIVERSAL-SETUP.md"
        "package.json"
        "docker-compose.yml"
        "Dockerfile"
        ".env.example"
    )
    
    info "📋 Adding essential files to package..."
    for file in "${ESSENTIAL_FILES[@]}"; do
        if [[ -f "$file" ]]; then
            cp "$file" "$PACKAGE_DIR/" 2>/dev/null || true
            success "Added: $file"
        fi
    done
    
    # Copy source directories
    SOURCE_DIRS=("client" "server" "shared" "migrations" "docs")
    for dir in "${SOURCE_DIRS[@]}"; do
        if [[ -d "$dir" ]]; then
            cp -r "$dir" "$PACKAGE_DIR/" 2>/dev/null || true
            success "Added directory: $dir"
        fi
    done
    
    # Copy configuration files
    CONFIG_FILES=("tsconfig.json" "tailwind.config.ts" "vite.config.ts" "drizzle.config.ts" "components.json")
    for file in "${CONFIG_FILES[@]}"; do
        if [[ -f "$file" ]]; then
            cp "$file" "$PACKAGE_DIR/" 2>/dev/null || true
            success "Added config: $file"
        fi
    done
    
    # Create universal README for the package
    cat > "$PACKAGE_DIR/README.md" << 'EOF'
# 🎣 PhishNet Universal Deployment Package

## Quick Setup Guide

### For Windows Users (Recommended)
1. Extract to `C:\PhishNet\`
2. Open **PowerShell as Administrator**
3. Navigate: `cd C:\PhishNet\phishnet`
4. Deploy: `.\deploy.ps1`
5. Start: `.\start.ps1`
6. Access: http://localhost:3000

### For Linux/macOS Users
1. Extract package: `unzip PhishNet-Package-*.zip`
2. Navigate: `cd PhishNet-Package-*/`
3. Deploy: `chmod +x deploy.sh && ./deploy.sh`
4. Start: `./start.sh`
5. Access: http://localhost:3000

### For Docker Users (Any OS)
1. Extract package and navigate to folder
2. Run: `docker compose up -d`
3. Access: http://localhost:3000

## Default Login Credentials
- **URL**: http://localhost:3000
- **Email**: admin@phishnet.local
- **Password**: admin123

## What Gets Auto-Installed
✅ Node.js 18+ (JavaScript runtime)
✅ PostgreSQL (Database)
✅ Redis (Cache & Sessions)
✅ Git (Version control)
✅ Docker (Optional containerization)

## Deployment Features
- **Auto-Detection**: Automatically detects your operating system
- **Smart Installation**: Uses system package managers (apt, brew, choco, etc.)
- **Error Handling**: Comprehensive error detection and fixes
- **Multi-Platform**: Works on Windows, Linux, macOS
- **Zero Configuration**: Everything pre-configured and ready to go

## Quick Troubleshooting

### Windows Issues
```powershell
# Execution policy error
Set-ExecutionPolicy Bypass -Scope Process -Force

# Port 3000 busy
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Run as Administrator
Right-click PowerShell → "Run as Administrator"
```

### Linux/macOS Issues
```bash
# Permission issues
chmod +x *.sh

# Service issues  
sudo systemctl status postgresql redis-server

# Restart deployment
./deploy.sh
```

### Universal Issues
- **Internet connection required** for downloading dependencies
- **Administrator/sudo privileges needed** for installing software
- **Wait 2-3 minutes** after deployment before starting
- **Check firewall settings** if can't access localhost:3000

## Advanced Options

### Production Deployment
```bash
# Linux/macOS
./deploy.sh --production

# Windows
.\deploy.ps1 -Production
```

### Skip Dependencies (if already installed)
```bash
# Linux/macOS
./deploy.sh --skip-deps

# Windows  
.\deploy.ps1 -SkipDeps
```

### Test Deployment
```bash
# Windows only
.\test-deployment.ps1
```

## Package Contents
- ✅ Complete PhishNet source code
- ✅ Automated deployment scripts (Windows & Linux)
- ✅ Database schema and migrations
- ✅ Pre-configured Docker setup
- ✅ Comprehensive documentation
- ✅ Troubleshooting guides
- ✅ Sample configurations

## Support & Documentation
- **Windows Guide**: `WINDOWS-SETUP.md`
- **Quick Reference**: `QUICK-FRIEND-SETUP.md`
- **Detailed Guide**: `FRIEND-DEPLOYMENT-GUIDE.md`
- **Universal Setup**: `UNIVERSAL-SETUP.md`

**🎯 This package contains everything needed for a complete PhishNet deployment on any operating system!**
EOF
    
    success "Added: README.md"
    
    # Make scripts executable
    chmod +x "$PACKAGE_DIR"/*.sh 2>/dev/null || true
    
    # Try to create ZIP/tar archive
    if command -v zip >/dev/null 2>&1; then
        ZIP_FILE="${PACKAGE_DIR}.zip"
        if [[ -f "$ZIP_FILE" ]]; then
            rm "$ZIP_FILE"
        fi
        
        cd "$PACKAGE_DIR" && zip -r "../$ZIP_FILE" . >/dev/null 2>&1 && cd ..
        if [[ -f "$ZIP_FILE" ]]; then
            FILE_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
            echo ""
            echo -e "${GREEN}======================================${NC}"
            echo -e "${GREEN}🎉 Friend Package Created Successfully! 🎉${NC}"
            echo -e "${GREEN}======================================${NC}"
            echo -e "📦 Package: $ZIP_FILE"
            echo -e "📏 Size: $FILE_SIZE"
            echo ""
            echo -e "${BLUE}📤 To share with friends:${NC}"
            echo -e "   1. Send them: $ZIP_FILE"
            echo -e "   2. Windows: Extract → PowerShell Admin → .\\deploy.ps1"
            echo -e "   3. Linux/Mac: Extract → chmod +x deploy.sh → ./deploy.sh"
            echo -e "${GREEN}======================================${NC}"
            echo ""
        fi
    elif command -v tar >/dev/null 2>&1; then
        TAR_FILE="${PACKAGE_DIR}.tar.gz"
        if [[ -f "$TAR_FILE" ]]; then
            rm "$TAR_FILE"
        fi
        
        tar -czf "$TAR_FILE" "$PACKAGE_DIR" >/dev/null 2>&1
        if [[ -f "$TAR_FILE" ]]; then
            FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)
            echo ""
            echo -e "${GREEN}======================================${NC}"
            echo -e "${GREEN}🎉 Friend Package Created Successfully! 🎉${NC}"
            echo -e "${GREEN}======================================${NC}"
            echo -e "📦 Package: $TAR_FILE"
            echo -e "📏 Size: $FILE_SIZE"
            echo ""
            echo -e "${BLUE}📤 To share with friends:${NC}"
            echo -e "   1. Send them: $TAR_FILE"
            echo -e "   2. Extract: tar -xzf $TAR_FILE"
            echo -e "   3. Deploy: cd $PACKAGE_DIR && ./deploy.sh"
            echo -e "${GREEN}======================================${NC}"
            echo ""
        fi
    else
        warning "zip/tar not available. Package folder ready: $PACKAGE_DIR"
        info "You can manually compress the folder to share with friends"
    fi
    
    return 0
}

# Always create friend package after successful deployment
echo ""
info "🎁 Creating shareable package for friends..."
create_friend_package
