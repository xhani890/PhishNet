#!/bin/bash

# PhishNet Universal Deployment Script
# This script handles the complete setup and deployment of PhishNet
# Compatible with Linux, macOS, and Windows (via WSL/Git Bash)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running on Windows
is_windows() {
    [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || -n "$WINDIR" ]]
}

# Check if running in WSL
is_wsl() {
    [[ -n "$WSL_DISTRO_NAME" || -f /proc/version && $(grep -i microsoft /proc/version) ]]
}

# Detect package manager
detect_package_manager() {
    if command -v apt-get >/dev/null 2>&1; then
        echo "apt"
    elif command -v yum >/dev/null 2>&1; then
        echo "yum"
    elif command -v dnf >/dev/null 2>&1; then
        echo "dnf"
    elif command -v pacman >/dev/null 2>&1; then
        echo "pacman"
    elif command -v brew >/dev/null 2>&1; then
        echo "brew"
    elif is_windows; then
        if command -v choco >/dev/null 2>&1; then
            echo "choco"
        elif command -v winget >/dev/null 2>&1; then
            echo "winget"
        else
            echo "none"
        fi
    else
        echo "none"
    fi
}

# Install dependencies based on package manager
install_dependencies() {
    local pm=$(detect_package_manager)
    log "Detected package manager: $pm"
    
    case $pm in
        "apt")
            log "Installing dependencies with apt..."
            sudo apt update
            sudo apt install -y nodejs npm postgresql postgresql-contrib redis-server curl git
            ;;
        "yum"|"dnf")
            log "Installing dependencies with $pm..."
            sudo $pm update -y
            sudo $pm install -y nodejs npm postgresql postgresql-server postgresql-contrib redis curl git
            ;;
        "pacman")
            log "Installing dependencies with pacman..."
            sudo pacman -Syu --noconfirm nodejs npm postgresql redis git curl
            ;;
        "brew")
            log "Installing dependencies with Homebrew..."
            brew update
            brew install node postgresql redis git curl
            ;;
        "choco")
            log "Installing dependencies with Chocolatey..."
            choco install -y nodejs postgresql redis-64 git curl
            ;;
        "winget")
            log "Installing dependencies with winget..."
            winget install -e --id OpenJS.NodeJS
            winget install -e --id PostgreSQL.PostgreSQL
            winget install -e --id Redis.Redis
            winget install -e --id Git.Git
            ;;
        *)
            warn "No package manager detected. Please install manually:"
            warn "- Node.js (18+)"
            warn "- PostgreSQL (13+)"
            warn "- Redis"
            warn "- Git"
            read -p "Press Enter after installing dependencies..."
            ;;
    esac
}

# Create project directories
create_directories() {
    log "Creating project directories..."
    mkdir -p logs backups uploads public/assets shared/types
    
    # Create logs directory with proper permissions
    chmod 755 logs backups uploads
}

# Setup environment file
setup_environment() {
    log "Setting up environment configuration..."
    
    if [[ ! -f .env ]]; then
        if [[ -f .env.example ]]; then
            cp .env.example .env
            log "Created .env file from .env.example"
        else
            error ".env.example not found!"
            exit 1
        fi
    else
        warn ".env file already exists, skipping creation"
    fi
    
    # Generate secure secrets if using defaults
    if grep -q "your-super-secure-session-secret" .env; then
        local session_secret=$(openssl rand -base64 48 2>/dev/null || head -c 48 /dev/urandom | base64)
        sed -i.bak "s/your-super-secure-session-secret-change-this-in-production-min-32-chars/$session_secret/" .env
        log "Generated secure session secret"
    fi
    
    if grep -q "your-jwt-secret-key" .env; then
        local jwt_secret=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
        sed -i.bak "s/your-jwt-secret-key-change-this-in-production/$jwt_secret/" .env
        log "Generated secure JWT secret"
    fi
    
    # Remove backup files
    rm -f .env.bak
}

# Setup database
setup_database() {
    log "Setting up PostgreSQL database..."
    
    # Start PostgreSQL service
    if is_windows; then
        net start postgresql-x64-14 2>/dev/null || true
    elif command -v systemctl >/dev/null 2>&1; then
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    elif command -v service >/dev/null 2>&1; then
        sudo service postgresql start
    elif is_wsl; then
        sudo service postgresql start
    fi
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE phishnet_db;" 2>/dev/null || warn "Database may already exist"
    sudo -u postgres psql -c "CREATE USER phishnet_user WITH PASSWORD 'secure_password_123';" 2>/dev/null || warn "User may already exist"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE phishnet_db TO phishnet_user;" 2>/dev/null || true
    sudo -u postgres psql -c "ALTER USER phishnet_user CREATEDB;" 2>/dev/null || true
    
    log "Database setup completed"
}

# Setup Redis
setup_redis() {
    log "Setting up Redis..."
    
    # Start Redis service
    if is_windows; then
        net start Redis 2>/dev/null || true
    elif command -v systemctl >/dev/null 2>&1; then
        sudo systemctl start redis
        sudo systemctl enable redis
    elif command -v service >/dev/null 2>&1; then
        sudo service redis-server start
    elif is_wsl; then
        sudo service redis-server start
    fi
    
    log "Redis setup completed"
}

# Install Node.js dependencies
install_node_dependencies() {
    log "Installing Node.js dependencies..."
    
    # Check Node.js version
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $node_version -lt 18 ]]; then
            warn "Node.js version 18+ recommended. Current version: $(node --version)"
        fi
    else
        error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    # Install dependencies
    npm install
    
    # Install global tools if needed
    if ! command -v pm2 >/dev/null 2>&1; then
        npm install -g pm2
        log "Installed PM2 for process management"
    fi
    
    log "Node.js dependencies installed"
}

# Build the application
build_application() {
    log "Building application..."
    
    # Build client
    if [[ -d "client" ]]; then
        cd client
        npm install
        npm run build
        cd ..
        log "Client built successfully"
    fi
    
    # Build server
    npm run build
    log "Server built successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    npm run db:migrate
    log "Database migrations completed"
}

# Create systemd service (Linux only)
create_systemd_service() {
    if [[ "$OSTYPE" == "linux-gnu"* ]] && command -v systemctl >/dev/null 2>&1; then
        log "Creating systemd service..."
        
        cat > /tmp/phishnet.service << EOF
[Unit]
Description=PhishNet Application
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
ExecStart=$(which npm) start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
        
        sudo mv /tmp/phishnet.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable phishnet
        
        log "Systemd service created and enabled"
    fi
}

# Setup PM2 ecosystem
setup_pm2() {
    log "Setting up PM2 ecosystem..."
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'phishnet',
    script: './dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
EOF
    
    log "PM2 ecosystem configuration created"
}

# Setup nginx (optional)
setup_nginx() {
    read -p "Do you want to setup nginx reverse proxy? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Setting up nginx..."
        
        # Install nginx
        local pm=$(detect_package_manager)
        case $pm in
            "apt") sudo apt install -y nginx ;;
            "yum"|"dnf") sudo $pm install -y nginx ;;
            "pacman") sudo pacman -S --noconfirm nginx ;;
            "brew") brew install nginx ;;
            *) warn "Please install nginx manually" ;;
        esac
        
        # Create nginx config
        cat > /tmp/phishnet-nginx.conf << EOF
server {
    listen 80;
    server_name localhost;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        if [[ -d "/etc/nginx/sites-available" ]]; then
            sudo mv /tmp/phishnet-nginx.conf /etc/nginx/sites-available/phishnet
            sudo ln -sf /etc/nginx/sites-available/phishnet /etc/nginx/sites-enabled/
        else
            sudo mv /tmp/phishnet-nginx.conf /etc/nginx/conf.d/phishnet.conf
        fi
        
        sudo nginx -t && sudo systemctl restart nginx
        log "Nginx configured and restarted"
    fi
}

# Setup SSL certificate
setup_ssl() {
    read -p "Do you want to setup SSL with Let's Encrypt? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your domain name: " domain
        if [[ -n "$domain" ]]; then
            log "Setting up SSL certificate for $domain..."
            
            # Install certbot
            local pm=$(detect_package_manager)
            case $pm in
                "apt") 
                    sudo apt install -y certbot python3-certbot-nginx
                    sudo certbot --nginx -d "$domain" --non-interactive --agree-tos --email admin@"$domain"
                    ;;
                *)
                    warn "Please install certbot manually and run: certbot --nginx -d $domain"
                    ;;
            esac
        fi
    fi
}

# Create backup script
create_backup_script() {
    log "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash
# PhishNet Backup Script

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="phishnet_db"
DB_USER="phishnet_user"

mkdir -p "$BACKUP_DIR"

# Backup database
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" uploads/

# Backup configuration
cp .env "$BACKUP_DIR/env_backup_$DATE"

# Cleanup old backups (keep last 30 days)
find "$BACKUP_DIR" -name "*backup*" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF
    
    chmod +x backup.sh
    log "Backup script created"
}

# Main deployment function
main() {
    log "Starting PhishNet deployment..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        error "package.json not found. Please run this script from the PhishNet root directory."
        exit 1
    fi
    
    # Parse command line arguments
    SKIP_DEPS=false
    SKIP_BUILD=false
    PRODUCTION=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --production)
                PRODUCTION=true
                shift
                ;;
            --help)
                echo "PhishNet Deployment Script"
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-deps     Skip dependency installation"
                echo "  --skip-build    Skip application build"
                echo "  --production    Setup for production deployment"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                warn "Unknown option: $1"
                shift
                ;;
        esac
    done
    
    # Create directories
    create_directories
    
    # Install system dependencies
    if [[ "$SKIP_DEPS" != true ]]; then
        install_dependencies
    fi
    
    # Setup services
    setup_database
    setup_redis
    
    # Setup application
    setup_environment
    install_node_dependencies
    
    # Build application
    if [[ "$SKIP_BUILD" != true ]]; then
        build_application
    fi
    
    # Run migrations
    run_migrations
    
    # Setup process management
    setup_pm2
    
    # Create backup script
    create_backup_script
    
    # Production setup
    if [[ "$PRODUCTION" == true ]]; then
        create_systemd_service
        setup_nginx
        setup_ssl
    fi
    
    log "Deployment completed successfully!"
    info "Next steps:"
    info "1. Review and update .env file with your settings"
    info "2. Start the application with: npm start"
    info "3. Or use PM2: pm2 start ecosystem.config.js"
    info "4. Access the application at: http://localhost:3000"
    
    if [[ "$PRODUCTION" == true ]]; then
        info "5. Configure your domain DNS to point to this server"
        info "6. Update FRONTEND_URL in .env to your domain"
    fi
    
    warn "Important: Change default passwords in .env file!"
}

# Run main function
main "$@"
