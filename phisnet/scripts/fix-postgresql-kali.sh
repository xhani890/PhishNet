#!/bin/bash

# ===============================================
# PhishNet PostgreSQL Fix Script for Kali Linux
# Version: 1.0
# Created: July 25, 2025
# Description: Fixes common PostgreSQL issues in Kali Linux
# ===============================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Database credentials
DB_USER="phishnet_user"
DB_PASSWORD="kali"
DB_NAME="phishnet"

print_header "PhishNet PostgreSQL Fix for Kali Linux"

print_status "This script will fix common PostgreSQL issues in Kali Linux:"
print_status "1. Fix collation version warnings"
print_status "2. Configure authentication properly"
print_status "3. Create database and user correctly"
print_status "4. Test the connection"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Setup cancelled by user"
    exit 0
fi

# Step 1: Start PostgreSQL service
print_header "Step 1: Starting PostgreSQL Service"

if sudo systemctl start postgresql; then
    print_success "PostgreSQL service started"
else
    print_error "Failed to start PostgreSQL service"
    exit 1
fi

# Step 2: Fix collation warnings
print_header "Step 2: Fixing Collation Warnings"

print_status "Fixing template1 collation..."
sudo -u postgres psql -c "ALTER DATABASE template1 REFRESH COLLATION VERSION;" 2>/dev/null || print_warning "Could not fix template1 collation"

print_status "Fixing postgres database collation..."
sudo -u postgres psql -c "ALTER DATABASE postgres REFRESH COLLATION VERSION;" 2>/dev/null || print_warning "Could not fix postgres collation"

print_success "Collation warnings fixed"

# Step 3: Clean setup - drop existing database and user
print_header "Step 3: Clean Database Setup"

print_status "Dropping existing database and user (if they exist)..."
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
EOF

print_status "Creating new user: $DB_USER"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

print_status "Creating new database: $DB_NAME"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

print_status "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

print_success "Database and user created successfully"

# Step 4: Configure authentication
print_header "Step 4: Configuring Authentication"

# Find PostgreSQL version and config file
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oE '[0-9]+\.[0-9]+' | head -1 || echo "15")
PG_HBA_FILE="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

print_status "PostgreSQL version: $PG_VERSION"
print_status "Config file: $PG_HBA_FILE"

if [ -f "$PG_HBA_FILE" ]; then
    # Backup original file
    sudo cp "$PG_HBA_FILE" "$PG_HBA_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    print_status "Backed up original pg_hba.conf"
    
    # Update authentication method
    print_status "Configuring password authentication..."
    sudo sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_HBA_FILE"
    
    # Add specific line for our user if not exists
    if ! sudo grep -q "local   $DB_NAME         $DB_USER                                md5" "$PG_HBA_FILE"; then
        sudo sed -i "/^local   all             all                                     md5/i local   $DB_NAME         $DB_USER                                md5" "$PG_HBA_FILE"
    fi
    
    print_success "Authentication configured"
    
    # Restart PostgreSQL
    print_status "Restarting PostgreSQL..."
    sudo systemctl restart postgresql
    sleep 3
    
    if sudo systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL restarted successfully"
    else
        print_error "Failed to restart PostgreSQL"
        exit 1
    fi
else
    print_warning "Could not find pg_hba.conf file, using default authentication"
fi

# Step 5: Test connection
print_header "Step 5: Testing Database Connection"

print_status "Testing connection with password authentication..."
export PGPASSWORD="$DB_PASSWORD"

if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 'Connection successful!' as status;" 2>/dev/null; then
    print_success "Database connection successful!"
    print_success "Connection details:"
    print_success "  Host: localhost"
    print_success "  Port: 5432"
    print_success "  Database: $DB_NAME"
    print_success "  Username: $DB_USER"
    print_success "  Password: $DB_PASSWORD"
else
    print_warning "Password authentication failed, trying peer authentication..."
    
    if sudo -u postgres psql -d "$DB_NAME" -c "SELECT 'Connection successful with postgres user!' as status;"; then
        print_success "Database accessible via postgres user"
        print_warning "You may need to use: sudo -u postgres psql -d $DB_NAME"
    else
        print_error "All connection attempts failed"
        exit 1
    fi
fi

unset PGPASSWORD

# Step 6: Create schema and data (if migration files exist)
print_header "Step 6: Database Schema Setup"

if [ -f "migrations/00_phishnet_schema.sql" ]; then
    print_status "Found schema migration file, applying..."
    
    export PGPASSWORD="$DB_PASSWORD"
    if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -f migrations/00_phishnet_schema.sql; then
        print_success "Schema created successfully"
        
        if [ -f "migrations/01_sample_data.sql" ]; then
            print_status "Found sample data file, applying..."
            if psql -h localhost -U "$DB_USER" -d "$DB_NAME" -f migrations/01_sample_data.sql; then
                print_success "Sample data loaded successfully"
            else
                print_warning "Failed to load sample data"
            fi
        fi
    else
        print_warning "Failed to create schema with password auth, trying postgres user..."
        sudo -u postgres psql -d "$DB_NAME" -f migrations/00_phishnet_schema.sql
        
        if [ -f "migrations/01_sample_data.sql" ]; then
            sudo -u postgres psql -d "$DB_NAME" -f migrations/01_sample_data.sql
        fi
    fi
    unset PGPASSWORD
else
    print_warning "No migration files found in migrations/ directory"
    print_status "You can manually create them later or run the main setup script"
fi

print_header "Setup Complete!"

print_success "PostgreSQL setup completed successfully!"
print_status ""
print_status "Next steps:"
print_status "1. Run the main setup script: ./scripts/setup.sh"
print_status "2. Or manually start the application with: npm start"
print_status ""
print_status "Database connection details:"
print_status "  Host: localhost"
print_status "  Port: 5432"  
print_status "  Database: $DB_NAME"
print_status "  Username: $DB_USER"
print_status "  Password: $DB_PASSWORD"
print_status ""
print_status "Test connection manually:"
print_status "  PGPASSWORD='$DB_PASSWORD' psql -h localhost -U $DB_USER -d $DB_NAME"
