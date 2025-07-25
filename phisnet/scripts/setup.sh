#!/bin/bash

# ===============================================
# PhishNet Complete Setup Script
# Version: 1.0
# Created: July 25, 2025
# Description: Complete setup script for PhishNet project
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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    print_header "Checking System Requirements"
    
    # Check Node.js
    if command_exists node; then
        NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VER" -ge "$NODE_VERSION" ]; then
            print_success "Node.js $(node --version) found"
        else
            print_error "Node.js version $NODE_VERSION or higher required. Found: $(node --version)"
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js $NODE_VERSION or higher"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        print_success "npm $(npm --version) found"
    else
        print_error "npm not found. Please install npm"
        exit 1
    fi
    
    # Check PostgreSQL
    if command_exists psql; then
        print_success "PostgreSQL found"
    else
        print_error "PostgreSQL not found. Please install PostgreSQL 15 or higher"
        exit 1
    fi
    
    # Check Git
    if command_exists git; then
        print_success "Git $(git --version | cut -d' ' -f3) found"
    else
        print_error "Git not found. Please install Git"
        exit 1
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
    print_header "PhishNet Complete Setup"
    echo "This script will set up the complete PhishNet project including:"
    echo "- Database creation and schema"
    echo "- Sample data import" 
    echo "- Environment configuration"
    echo "- Dependency installation"
    echo "- Application build"
    echo ""
    
    read -p "Continue with setup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Setup cancelled"
        exit 0
    fi
    
    # Run setup steps
    check_requirements
    setup_database
    setup_environment
    install_dependencies
    setup_directories
    build_application
    test_database
    create_scripts
    
    print_header "Setup Complete!"
    print_success "PhishNet has been set up successfully!"
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
