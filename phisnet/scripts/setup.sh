#!/bin/bash

# ===============================================
# PhishNet Complete Setup Script
# Version: 1.0
# Created: July 25, 2025
# Description: Universal setup script that adapts to different environments
# ===============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
PROJECT_NAME="PhishNet"
DB_NAME="phishnet"
DB_USER="phishnet_user"
DB_PASSWORD="kali"
NODE_VERSION="18"

# Environment detection
OS_TYPE=""
DISTRO=""
PG_VERSION=""
PG_SERVICE=""
PG_HBA_FILE=""

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "==============================================="
    echo "$1"
    echo "==============================================="
}

# Detect operating system and distribution
detect_environment() {
    print_header "Detecting Environment"
    
    # Detect OS type
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS_TYPE="linux"
        if [ -f /etc/os-release ]; then
            source /etc/os-release
            DISTRO="$ID"
            print_status "Detected Linux distribution: $NAME"
        elif [ -f /etc/debian_version ]; then
            DISTRO="debian"
            print_status "Detected Debian-based system"
        elif [ -f /etc/redhat-release ]; then
            DISTRO="redhat"
            print_status "Detected Red Hat-based system"
        else
            DISTRO="unknown"
            print_warning "Unknown Linux distribution"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS_TYPE="macos"
        DISTRO="macos"
        print_status "Detected macOS"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS_TYPE="windows"
        DISTRO="windows"
        print_status "Detected Windows (using $OSTYPE)"
    else
        OS_TYPE="unknown"
        DISTRO="unknown"
        print_warning "Unknown operating system: $OSTYPE"
    fi
    
    # Detect PostgreSQL configuration
    detect_postgresql_config
}

# Detect PostgreSQL configuration
detect_postgresql_config() {
    print_status "Detecting PostgreSQL configuration..."
    
    # Try to get PostgreSQL version
    if command -v psql >/dev/null 2>&1; then
        if sudo -u postgres psql -t -c "SELECT version();" 2>/dev/null | grep -q PostgreSQL; then
            PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' | head -1)
        elif psql --version >/dev/null 2>&1; then
            PG_VERSION=$(psql --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
        fi
    fi
    
    if [ -z "$PG_VERSION" ]; then
        PG_VERSION="15"  # Default fallback
        print_warning "Could not detect PostgreSQL version, using default: $PG_VERSION"
    else
        print_status "Detected PostgreSQL version: $PG_VERSION"
    fi
    
    # Determine PostgreSQL service name and config paths
    case "$DISTRO" in
        "kali"|"debian"|"ubuntu")
            PG_SERVICE="postgresql"
            PG_HBA_FILE="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
            ;;
        "centos"|"rhel"|"fedora"|"rocky"|"almalinux")
            PG_SERVICE="postgresql-$PG_VERSION"
            PG_HBA_FILE="/var/lib/pgsql/$PG_VERSION/data/pg_hba.conf"
            ;;
        "arch"|"manjaro")
            PG_SERVICE="postgresql"
            PG_HBA_FILE="/var/lib/postgres/data/pg_hba.conf"
            ;;
        "macos")
            PG_SERVICE="postgresql@$PG_VERSION"
            PG_HBA_FILE="/usr/local/var/postgres/pg_hba.conf"
            # Also check homebrew path
            if [ -f "/opt/homebrew/var/postgres/pg_hba.conf" ]; then
                PG_HBA_FILE="/opt/homebrew/var/postgres/pg_hba.conf"
            fi
            ;;
        *)
            PG_SERVICE="postgresql"
            # Try common locations
            for conf in "/etc/postgresql/$PG_VERSION/main/pg_hba.conf" \
                       "/var/lib/pgsql/$PG_VERSION/data/pg_hba.conf" \
                       "/var/lib/postgres/data/pg_hba.conf" \
                       "/usr/local/var/postgres/pg_hba.conf"; do
                if [ -f "$conf" ]; then
                    PG_HBA_FILE="$conf"
                    break
                fi
            done
            ;;
    esac
    
    print_status "PostgreSQL service: $PG_SERVICE"
    print_status "PostgreSQL config: $PG_HBA_FILE"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install system dependencies based on OS
install_system_dependencies() {
    print_header "Installing System Dependencies"
    
    case "$DISTRO" in
        "kali"|"debian"|"ubuntu")
            print_status "Installing dependencies for Debian-based system..."
            sudo apt-get update
            sudo apt-get install -y curl git build-essential software-properties-common \
                                  postgresql postgresql-contrib postgresql-client \
                                  redis-server nginx ca-certificates gnupg lsb-release
            ;;
        "centos"|"rhel"|"rocky"|"almalinux")
            print_status "Installing dependencies for RHEL-based system..."
            sudo dnf update -y
            sudo dnf install -y curl git gcc gcc-c++ make postgresql postgresql-server \
                              postgresql-contrib redis nginx ca-certificates
            # Initialize PostgreSQL if needed
            if [ ! -f "/var/lib/pgsql/$PG_VERSION/data/postgresql.conf" ]; then
                sudo postgresql-setup --initdb
            fi
            ;;
        "fedora")
            print_status "Installing dependencies for Fedora..."
            sudo dnf update -y
            sudo dnf install -y curl git gcc gcc-c++ make postgresql postgresql-server \
                              postgresql-contrib redis nginx
            # Initialize PostgreSQL if needed
            if [ ! -f "/var/lib/pgsql/data/postgresql.conf" ]; then
                sudo postgresql-setup --initdb
            fi
            ;;
        "arch"|"manjaro")
            print_status "Installing dependencies for Arch-based system..."
            sudo pacman -Sy --noconfirm curl git base-devel postgresql redis nginx
            # Initialize PostgreSQL if needed
            if [ ! -d "/var/lib/postgres/data" ]; then
                sudo -u postgres initdb -D /var/lib/postgres/data
            fi
            ;;
        "macos")
            print_status "Installing dependencies for macOS..."
            if ! command_exists brew; then
                print_error "Homebrew is required but not installed. Please install it first:"
                print_error "https://brew.sh"
                exit 1
            fi
            brew update
            brew install postgresql@$PG_VERSION redis nginx
            ;;
        *)
            print_warning "Unknown distribution. Attempting generic installation..."
            if command_exists apt-get; then
                sudo apt-get update
                sudo apt-get install -y curl git build-essential postgresql postgresql-contrib redis-server nginx
            elif command_exists dnf; then
                sudo dnf install -y curl git gcc gcc-c++ make postgresql postgresql-server redis nginx
            elif command_exists pacman; then
                sudo pacman -Sy --noconfirm curl git base-devel postgresql redis nginx
            else
                print_error "No supported package manager found. Please install dependencies manually:"
                print_error "- Node.js $NODE_VERSION+"
                print_error "- PostgreSQL 15+"
                print_error "- Redis"
                print_error "- Nginx"
                exit 1
            fi
            ;;
    esac
}

# Install Node.js with version detection
install_nodejs() {
    print_header "Installing Node.js"
    
    if command_exists node; then
        CURRENT_NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$CURRENT_NODE_VERSION" -ge "$NODE_VERSION" ]; then
            print_success "Node.js $(node --version) is already installed"
            return 0
        else
            print_warning "Node.js $CURRENT_NODE_VERSION is installed but version $NODE_VERSION+ is required"
        fi
    fi
    
    print_status "Installing Node.js $NODE_VERSION..."
    
    case "$DISTRO" in
        "macos")
            if command_exists brew; then
                brew install node@$NODE_VERSION
            else
                print_error "Homebrew required for Node.js installation on macOS"
                exit 1
            fi
            ;;
        *)
            # Use NodeSource repository for most Linux distributions
            if command_exists curl; then
                curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
                if command_exists apt-get; then
                    sudo apt-get install -y nodejs
                elif command_exists dnf; then
                    sudo dnf install -y nodejs npm
                elif command_exists pacman; then
                    sudo pacman -S --noconfirm nodejs npm
                fi
            else
                print_error "curl is required to install Node.js"
                exit 1
            fi
            ;;
    esac
    
    # Verify installation
    if command_exists node && command_exists npm; then
        print_success "Node.js $(node --version) and npm $(npm --version) installed successfully"
    else
        print_error "Failed to install Node.js"
        exit 1
    fi
}

# Start and enable services
start_services() {
    print_header "Starting Services"
    
    # PostgreSQL
    print_status "Starting PostgreSQL service..."
    case "$DISTRO" in
        "macos")
            if command_exists brew; then
                brew services start postgresql@$PG_VERSION || brew services restart postgresql@$PG_VERSION
            fi
            ;;
        *)
            sudo systemctl enable $PG_SERVICE 2>/dev/null || true
            sudo systemctl start $PG_SERVICE || sudo systemctl restart $PG_SERVICE
            ;;
    esac
    
    # Redis
    print_status "Starting Redis service..."
    case "$DISTRO" in
        "macos")
            if command_exists brew; then
                brew services start redis || brew services restart redis
            fi
            ;;
        *)
            sudo systemctl enable redis-server 2>/dev/null || sudo systemctl enable redis 2>/dev/null || true
            sudo systemctl start redis-server 2>/dev/null || sudo systemctl start redis 2>/dev/null || true
            ;;
    esac
    
    # Wait for services to start
    sleep 3
    
    # Verify services
    if pgrep -x "postgres" >/dev/null; then
        print_success "PostgreSQL is running"
    else
        print_error "Failed to start PostgreSQL"
        exit 1
    fi
    
    if pgrep -x "redis-server" >/dev/null || pgrep -x "redis" >/dev/null; then
        print_success "Redis is running"
    else
        print_warning "Redis may not be running properly"
    fi
}

# Check system requirements (for validation only)
check_requirements() {
    print_header "Checking System Requirements"
    
    local missing_deps=()
    
    # Check Node.js
    if command_exists node; then
        NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VER" -ge "$NODE_VERSION" ]; then
            print_success "Node.js $(node --version) found"
        else
            print_warning "Node.js version $NODE_VERSION or higher required. Found: $(node --version)"
            missing_deps+=("nodejs")
        fi
    else
        print_warning "Node.js not found"
        missing_deps+=("nodejs")
    fi
    
    # Check npm
    if command_exists npm; then
        print_success "npm $(npm --version) found"
    else
        print_warning "npm not found"
        missing_deps+=("npm")
    fi
    
    # Check PostgreSQL
    if command_exists psql; then
        print_success "PostgreSQL found"
    else
        print_warning "PostgreSQL not found"
        missing_deps+=("postgresql")
    fi
    
    # Check Git
    if command_exists git; then
        print_success "Git $(git --version | cut -d' ' -f3) found"
    else
        print_warning "Git not found"
        missing_deps+=("git")
    fi
    
    # If dependencies are missing, offer to install them
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_warning "Missing dependencies: ${missing_deps[*]}"
        echo ""
        read -p "Would you like to install missing dependencies automatically? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_system_dependencies
            install_nodejs
            start_services
        else
            print_error "Please install the missing dependencies manually and run this script again"
            exit 1
        fi
    fi
}

# Setup database
setup_database() {
    print_header "Setting up Database"
    
    print_status "Database credentials being used:"
    print_status "  Host: localhost"
    print_status "  Database: $DB_NAME"
    print_status "  Username: $DB_USER"
    print_status "  Password: $DB_PASSWORD"
    
    print_status "Creating database and user..."
    
    # Fix PostgreSQL collation version warnings (common in Kali Linux)
    print_status "Fixing PostgreSQL collation warnings..."
    sudo -u postgres psql -c "ALTER DATABASE template1 REFRESH COLLATION VERSION;" 2>/dev/null || true
    sudo -u postgres psql -c "ALTER DATABASE postgres REFRESH COLLATION VERSION;" 2>/dev/null || true
    
    # Create database setup SQL with proper error handling
    cat > /tmp/setup_db.sql << EOF
-- Drop database and user if they exist (for clean reinstall)
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create user with password
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
EOF

    # Execute database setup
    if sudo -u postgres psql < /tmp/setup_db.sql; then
        print_success "Database and user created successfully"
    else
        print_error "Failed to create database and user"
        rm -f /tmp/setup_db.sql
        exit 1
    fi
    
    # Clean up temp file
    rm -f /tmp/setup_db.sql
    
    # Configure PostgreSQL authentication if needed
    print_status "Configuring PostgreSQL authentication..."
    
    PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oE '[0-9]+\.[0-9]+' | head -1 || echo "15")
    PG_HBA_FILE="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
    
    if [ -f "$PG_HBA_FILE" ]; then
        # Backup original file
        sudo cp "$PG_HBA_FILE" "$PG_HBA_FILE.backup" 2>/dev/null || true
        
        # Ensure local connections work with password authentication
        if ! sudo grep -q "local.*all.*all.*md5" "$PG_HBA_FILE"; then
            print_status "Updating PostgreSQL authentication configuration..."
            sudo sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_HBA_FILE" 2>/dev/null || true
            
            # Restart PostgreSQL to apply changes
            print_status "Restarting PostgreSQL service..."
            sudo systemctl restart postgresql 2>/dev/null || sudo service postgresql restart 2>/dev/null || true
            sleep 3
        fi
    fi
    
    print_status "Testing database connection..."
    
    # Test connection with password
    export PGPASSWORD="$DB_PASSWORD"
    if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        print_success "Database connection successful"
        
        print_status "Running database schema migration..."
        if psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/00_phishnet_schema.sql; then
            print_success "Schema created successfully"
        else
            print_error "Failed to create database schema"
            unset PGPASSWORD
            exit 1
        fi
        
        print_status "Importing sample data..."
        if psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/01_sample_data.sql; then
            print_success "Sample data imported successfully"
        else
            print_warning "Failed to import sample data (continuing anyway)"
        fi
    else
        print_warning "Password authentication failed, trying with sudo postgres user..."
        
        # Try with sudo -u postgres for peer authentication
        if sudo -u postgres psql -d "$DB_NAME" -f migrations/00_phishnet_schema.sql; then
            print_success "Schema created successfully (using postgres user)"
            
            if sudo -u postgres psql -d "$DB_NAME" -f migrations/01_sample_data.sql; then
                print_success "Sample data imported successfully (using postgres user)"
            else
                print_warning "Failed to import sample data (continuing anyway)"
            fi
        else
            print_error "Failed to create database schema"
            unset PGPASSWORD
            exit 1
        fi
    fi
    
    # Unset password variable for security
    unset PGPASSWORD
    
    print_success "Database setup completed successfully"
}

# Setup environment files
setup_environment() {
    print_header "Setting up Environment"
    
    print_status "Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Server Configuration
PORT=3001
NODE_ENV=development
SESSION_SECRET=$(openssl rand -hex 32)

# Email Configuration (Update with your SMTP settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,text/csv

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_MAX_AGE=86400000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Development Configuration
CORS_ORIGIN=http://localhost:5173
EOF

    print_success "Environment file created"
    print_warning "Please update SMTP settings in .env file with your email provider details"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_status "Installing backend dependencies..."
    if npm install; then
        print_success "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    print_status "Installing frontend dependencies..."
    if cd client && npm install && cd ..; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
}

# Setup uploads directory
setup_directories() {
    print_header "Setting up Directories"
    
    print_status "Creating upload directories..."
    mkdir -p uploads/avatars
    mkdir -p uploads/templates
    mkdir -p uploads/campaigns
    mkdir -p uploads/imports
    mkdir -p uploads/exports
    
    # Set proper permissions
    chmod 755 uploads
    chmod 755 uploads/*
    
    print_success "Upload directories created"
}

# Build application
build_application() {
    print_header "Building Application"
    
    print_status "Building frontend..."
    if cd client && npm run build && cd ..; then
        print_success "Frontend built successfully"
    else
        print_error "Failed to build frontend"
        exit 1
    fi
    
    print_status "Checking TypeScript compilation..."
    if npm run check; then
        print_success "TypeScript compilation successful"
    else
        print_warning "TypeScript compilation warnings (continuing anyway)"
    fi
}

# Test database connection
test_database() {
    print_header "Testing Database Connection"
    
    print_status "Testing database connection..."
    if psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM organizations;" > /dev/null 2>&1; then
        print_success "Database connection successful"
        ORG_COUNT=$(psql -h localhost -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM organizations;" | xargs)
        USER_COUNT=$(psql -h localhost -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM users;" | xargs)
        print_status "Found $ORG_COUNT organizations and $USER_COUNT users in database"
    else
        print_error "Database connection failed"
        exit 1
    fi
}

# Create startup scripts
create_scripts() {
    print_header "Creating Startup Scripts"
    
    # Development startup script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "Starting PhishNet in development mode..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop"
npm run dev
EOF
    chmod +x start-dev.sh
    
    # Production startup script
    cat > start-prod.sh << 'EOF'
#!/bin/bash
echo "Building and starting PhishNet in production mode..."
npm run build
npm start
EOF
    chmod +x start-prod.sh
    
    # Database reset script
    cat > reset-db.sh << 'EOF'
#!/bin/bash
echo "Resetting database..."
psql -h localhost -U phishnet_user -d phishnet -f migrations/00_phishnet_schema.sql
psql -h localhost -U phishnet_user -d phishnet -f migrations/01_sample_data.sql
echo "Database reset complete"
EOF
    chmod +x reset-db.sh
    
    print_success "Startup scripts created"
}

# Main setup function
main() {
    print_header "PhishNet Universal Setup"
    echo "This script will automatically detect your environment and set up PhishNet including:"
    echo "- Environment detection (Linux/macOS/Windows)"
    echo "- Automatic dependency installation"
    echo "- Database creation and schema"
    echo "- Sample data import" 
    echo "- Environment configuration"
    echo "- Application build"
    echo ""
    
    read -p "Continue with automatic setup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Setup cancelled"
        exit 0
    fi
    
    # Run setup steps
    detect_environment
    check_requirements
    setup_database
    setup_environment
    install_dependencies
    setup_directories
    build_application
    test_database
    create_scripts
    
    print_header "Setup Complete!"
    print_success "PhishNet has been set up successfully on $OS_TYPE ($DISTRO)!"
    echo ""
    echo "Environment Details:"
    echo "  - OS: $OS_TYPE"
    echo "  - Distribution: $DISTRO"
    echo "  - PostgreSQL: $PG_VERSION"
    echo "  - Node.js: $(node --version 2>/dev/null || echo 'Not detected')"
    echo ""
    echo "Next steps:"
    echo "1. Update SMTP settings in .env file"
    echo "2. Start development server: ./start-dev.sh"
    echo "3. Open browser to: http://localhost:5173"
    echo ""
    echo "Default admin accounts:"
    echo "  - admin@democorp.com / password123"
    echo "  - admin@riphah.edu.pk / password123"
    echo "  - admin@healthsolutions.com / password123"
    echo ""
    echo "Useful commands:"
    echo "  - Development: ./start-dev.sh"
    echo "  - Production: ./start-prod.sh"
    echo "  - Reset DB: ./reset-db.sh"
    echo ""
    print_success "Happy phishing simulation! 🎣"
}

# Run main function
main "$@"
