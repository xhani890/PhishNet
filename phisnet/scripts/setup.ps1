# ===============================================
# PhishNet Complete Setup Script (Windows)
# Version: 1.0
# Created: July 25, 2025
# Description: Complete setup script for PhishNet project on Windows
# ===============================================

param(
    [switch]$SkipDatabaseSetup,
    [switch]$SkipDependencies,
    [string]$DatabasePassword = "your_secure_password_here"
)

# Configuration
$ProjectName = "PhishNet"
$DatabaseName = "phishnet"
$DatabaseUser = "phishnet_user"
$NodeVersion = 18

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Info($message) {
    Write-ColorOutput Blue "[INFO] $message"
}

function Write-Success($message) {
    Write-ColorOutput Green "[SUCCESS] $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "[WARNING] $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "[ERROR] $message"
}

function Write-Header($message) {
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host $message -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
}

# Check if command exists
function Test-Command($command) {
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check system requirements
function Test-Requirements {
    Write-Header "Checking System Requirements"
    
    # Check Node.js
    if (Test-Command "node") {
        $nodeVersion = (node --version).Replace('v', '').Split('.')[0]
        if ([int]$nodeVersion -ge $NodeVersion) {
            Write-Success "Node.js $(node --version) found"
        } else {
            Write-Error "Node.js version $NodeVersion or higher required. Found: $(node --version)"
            exit 1
        }
    } else {
        Write-Error "Node.js not found. Please install Node.js $NodeVersion or higher"
        exit 1
    }
    
    # Check npm
    if (Test-Command "npm") {
        Write-Success "npm $(npm --version) found"
    } else {
        Write-Error "npm not found. Please install npm"
        exit 1
    }
    
    # Check PostgreSQL
    if (Test-Command "psql") {
        Write-Success "PostgreSQL found"
    } else {
        Write-Error "PostgreSQL not found. Please install PostgreSQL 15 or higher"
        exit 1
    }
    
    # Check Git
    if (Test-Command "git") {
        Write-Success "Git found"
    } else {
        Write-Error "Git not found. Please install Git"
        exit 1
    }
}

# Setup database
function Setup-Database {
    if ($SkipDatabaseSetup) {
        Write-Info "Skipping database setup as requested"
        return
    }
    
    Write-Header "Setting up Database"
    
    Write-Info "Creating database and user..."
    
    # Create database setup SQL
    $setupSql = @"
-- Create database
CREATE DATABASE $DatabaseName;

-- Create user
CREATE USER $DatabaseUser WITH PASSWORD '$DatabasePassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DatabaseName TO $DatabaseUser;

-- Connect to new database and grant schema privileges
\c $DatabaseName;
GRANT ALL ON SCHEMA public TO $DatabaseUser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DatabaseUser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DatabaseUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DatabaseUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DatabaseUser;
"@

    $setupSql | Out-File -FilePath "temp_setup.sql" -Encoding UTF8
    
    # Execute database setup
    try {
        $env:PGPASSWORD = "postgres"
        psql -h localhost -U postgres -f temp_setup.sql
        Write-Success "Database created successfully"
    } catch {
        Write-Warning "Database might already exist, continuing..."
    } finally {
        Remove-Item "temp_setup.sql" -ErrorAction SilentlyContinue
    }
    
    Write-Info "Running database schema migration..."
    try {
        $env:PGPASSWORD = $DatabasePassword
        psql -h localhost -U $DatabaseUser -d $DatabaseName -f "migrations\00_phishnet_schema.sql"
        Write-Success "Schema created successfully"
    } catch {
        Write-Error "Failed to create database schema"
        throw
    }
    
    Write-Info "Importing sample data..."
    try {
        psql -h localhost -U $DatabaseUser -d $DatabaseName -f "migrations\01_sample_data.sql"
        Write-Success "Sample data imported successfully"
    } catch {
        Write-Warning "Failed to import sample data (continuing anyway)"
    }
}

# Setup environment files
function Setup-Environment {
    Write-Header "Setting up Environment"
    
    Write-Info "Creating .env file..."
    
    # Generate random session secret
    $sessionSecret = -join ((1..64) | ForEach {'{0:X}' -f (Get-Random -Max 16)})
    
    $envContent = @"
# Database Configuration
DATABASE_URL=postgresql://$DatabaseUser`:$DatabasePassword@localhost:5432/$DatabaseName
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DatabaseName
DB_USER=$DatabaseUser
DB_PASSWORD=$DatabasePassword

# Server Configuration
PORT=3001
NODE_ENV=development
SESSION_SECRET=$sessionSecret

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
"@

    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Success "Environment file created"
    Write-Warning "Please update SMTP settings in .env file with your email provider details"
}

# Install dependencies
function Install-Dependencies {
    if ($SkipDependencies) {
        Write-Info "Skipping dependency installation as requested"
        return
    }
    
    Write-Header "Installing Dependencies"
    
    Write-Info "Installing backend dependencies..."
    try {
        npm install
        Write-Success "Backend dependencies installed"
    } catch {
        Write-Error "Failed to install backend dependencies"
        throw
    }
    
    Write-Info "Installing frontend dependencies..."
    try {
        Set-Location "client"
        npm install
        Set-Location ".."
        Write-Success "Frontend dependencies installed"
    } catch {
        Write-Error "Failed to install frontend dependencies"
        throw
    }
}

# Setup directories
function Setup-Directories {
    Write-Header "Setting up Directories"
    
    Write-Info "Creating upload directories..."
    @("uploads\avatars", "uploads\templates", "uploads\campaigns", "uploads\imports", "uploads\exports") | ForEach-Object {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
    }
    
    Write-Success "Upload directories created"
}

# Build application
function Build-Application {
    Write-Header "Building Application"
    
    Write-Info "Building frontend..."
    try {
        Set-Location "client"
        npm run build
        Set-Location ".."
        Write-Success "Frontend built successfully"
    } catch {
        Write-Error "Failed to build frontend"
        throw
    }
    
    Write-Info "Checking TypeScript compilation..."
    try {
        npm run check
        Write-Success "TypeScript compilation successful"
    } catch {
        Write-Warning "TypeScript compilation warnings (continuing anyway)"
    }
}

# Test database connection
function Test-Database {
    Write-Header "Testing Database Connection"
    
    Write-Info "Testing database connection..."
    try {
        $env:PGPASSWORD = $DatabasePassword
        $result = psql -h localhost -U $DatabaseUser -d $DatabaseName -t -c "SELECT COUNT(*) FROM organizations;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database connection successful"
            $orgCount = ($result | Out-String).Trim()
            $userResult = psql -h localhost -U $DatabaseUser -d $DatabaseName -t -c "SELECT COUNT(*) FROM users;" 2>$null
            $userCount = ($userResult | Out-String).Trim()
            Write-Info "Found $orgCount organizations and $userCount users in database"
        } else {
            throw "Connection test failed"
        }
    } catch {
        Write-Error "Database connection failed"
        throw
    }
}

# Create startup scripts
function New-Scripts {
    Write-Header "Creating Startup Scripts"
    
    # Development startup script
    $devScript = @'
@echo off
echo Starting PhishNet in development mode...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo Press Ctrl+C to stop
npm run dev
pause
'@
    $devScript | Out-File -FilePath "start-dev.bat" -Encoding ASCII
    
    # Production startup script
    $prodScript = @'
@echo off
echo Building and starting PhishNet in production mode...
npm run build
npm start
pause
'@
    $prodScript | Out-File -FilePath "start-prod.bat" -Encoding ASCII
    
    # Database reset script
    $resetScript = @"
@echo off
echo Resetting database...
set PGPASSWORD=$DatabasePassword
psql -h localhost -U $DatabaseUser -d $DatabaseName -f migrations\00_phishnet_schema.sql
psql -h localhost -U $DatabaseUser -d $DatabaseName -f migrations\01_sample_data.sql
echo Database reset complete
pause
"@
    $resetScript | Out-File -FilePath "reset-db.bat" -Encoding ASCII
    
    # PowerShell development script
    $devPsScript = @'
Write-Host "Starting PhishNet in development mode..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Red
npm run dev
'@
    $devPsScript | Out-File -FilePath "start-dev.ps1" -Encoding UTF8
    
    Write-Success "Startup scripts created"
}

# Main setup function
function Start-Setup {
    Write-Header "PhishNet Complete Setup"
    Write-Host "This script will set up the complete PhishNet project including:" -ForegroundColor White
    Write-Host "- Database creation and schema" -ForegroundColor Gray
    Write-Host "- Sample data import" -ForegroundColor Gray
    Write-Host "- Environment configuration" -ForegroundColor Gray
    Write-Host "- Dependency installation" -ForegroundColor Gray
    Write-Host "- Application build" -ForegroundColor Gray
    Write-Host ""
    
    if (-not $SkipDatabaseSetup -and -not $SkipDependencies) {
        $continue = Read-Host "Continue with setup? (y/N)"
        if ($continue -ne 'y' -and $continue -ne 'Y') {
            Write-Info "Setup cancelled"
            exit 0
        }
    }
    
    try {
        # Run setup steps
        Test-Requirements
        Setup-Database
        Setup-Environment
        Install-Dependencies
        Setup-Directories
        Build-Application
        Test-Database
        New-Scripts
        
        Write-Header "Setup Complete!"
        Write-Success "PhishNet has been set up successfully!"
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Update SMTP settings in .env file" -ForegroundColor White
        Write-Host "2. Start development server: .\start-dev.bat or .\start-dev.ps1" -ForegroundColor White
        Write-Host "3. Open browser to: http://localhost:5173" -ForegroundColor White
        Write-Host ""
        Write-Host "Default admin accounts:" -ForegroundColor Cyan
        Write-Host "  - admin@democorp.com / password123" -ForegroundColor Green
        Write-Host "  - admin@riphah.edu.pk / password123" -ForegroundColor Green
        Write-Host "  - admin@healthsolutions.com / password123" -ForegroundColor Green
        Write-Host ""
        Write-Host "Useful commands:" -ForegroundColor Cyan
        Write-Host "  - Development: .\start-dev.bat" -ForegroundColor White
        Write-Host "  - Production: .\start-prod.bat" -ForegroundColor White
        Write-Host "  - Reset DB: .\reset-db.bat" -ForegroundColor White
        Write-Host ""
        Write-Success "Happy phishing simulation! 🎣"
        
    } catch {
        Write-Error "Setup failed: $($_.Exception.Message)"
        Write-Info "Please check the error above and try again"
        exit 1
    }
}

# Check if running as administrator for database setup
if (-not $SkipDatabaseSetup) {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    $adminRole = [Security.Principal.WindowsBuiltInRole]::Administrator
    
    if (-not $principal.IsInRole($adminRole)) {
        Write-Warning "Database setup may require administrator privileges"
        Write-Info "If database creation fails, try running PowerShell as Administrator"
    }
}

# Run main function
Start-Setup
