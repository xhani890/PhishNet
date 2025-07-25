# ===============================================
# PhishNet Universal Windows Setup Script
# Version: 1.0
# Created: July 25, 2025
# Description: Adaptive setup script for Windows environments
# ===============================================

param(
    [switch]$Force,
    [switch]$NoInteraction
)

# Script configuration
$PROJECT_NAME = "PhishNet"
$DB_NAME = "phishnet"
$DB_USER = "phishnet_user"
$DB_PASSWORD = "kali"
$NODE_VERSION = "18"

# Environment detection
$WindowsVersion = ""
$HasChocolatey = $false
$HasScoop = $false
$HasWinget = $false
$PgVersion = ""
$PgService = ""

# Print colored output
function Write-Status($Message) {
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success($Message) {
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning($Message) {
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error($Message) {
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Header($Message) {
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
}

# Detect Windows environment
function Detect-Environment {
    Write-Header "Detecting Windows Environment"
    
    # Get Windows version
    $OSInfo = Get-WmiObject -Class Win32_OperatingSystem
    $script:WindowsVersion = $OSInfo.Caption
    Write-Status "Detected: $WindowsVersion"
    
    # Check package managers
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        $script:HasChocolatey = $true
        Write-Status "Chocolatey package manager found"
    }
    
    if (Get-Command scoop -ErrorAction SilentlyContinue) {
        $script:HasScoop = $true
        Write-Status "Scoop package manager found"
    }
    
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        $script:HasWinget = $true
        Write-Status "Winget package manager found"
    }
    
    if (-not ($HasChocolatey -or $HasScoop -or $HasWinget)) {
        Write-Warning "No package manager detected. Will attempt manual installation guidance."
        
        if (-not $NoInteraction) {
            $Install = Read-Host "Would you like to install Chocolatey for automatic dependency management? (y/N)"
            if ($Install -eq 'y' -or $Install -eq 'Y') {
                Install-Chocolatey
            }
        }
    }
    
    # Detect PostgreSQL
    Detect-PostgreSQL
}

# Install Chocolatey
function Install-Chocolatey {
    Write-Status "Installing Chocolatey package manager..."
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        $script:HasChocolatey = $true
        Write-Success "Chocolatey installed successfully"
    } catch {
        Write-Error "Failed to install Chocolatey: $_"
    }
}

# Detect PostgreSQL installation
function Detect-PostgreSQL {
    Write-Status "Detecting PostgreSQL installation..."
    
    # Check if PostgreSQL is installed
    $PgPaths = @(
        "C:\Program Files\PostgreSQL\*\bin\psql.exe",
        "C:\PostgreSQL\*\bin\psql.exe",
        "${env:ProgramFiles(x86)}\PostgreSQL\*\bin\psql.exe"
    )
    
    $PsqlPath = $null
    foreach ($Path in $PgPaths) {
        $Found = Get-ChildItem -Path $Path -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($Found) {
            $PsqlPath = $Found.FullName
            $script:PgVersion = ($Found.Directory.Parent.Name -replace '[^\d\.]', '')
            break
        }
    }
    
    if ($PsqlPath) {
        Write-Status "PostgreSQL $PgVersion found at: $PsqlPath"
        
        # Check for PostgreSQL service
        $PgServices = @("postgresql-x64-$PgVersion", "postgresql-$PgVersion", "PostgreSQL")
        foreach ($Service in $PgServices) {
            if (Get-Service -Name $Service -ErrorAction SilentlyContinue) {
                $script:PgService = $Service
                Write-Status "PostgreSQL service: $PgService"
                break
            }
        }
    } else {
        Write-Warning "PostgreSQL not found"
        $script:PgVersion = "15"  # Default version
    }
}

# Install dependencies using available package managers
function Install-Dependencies {
    Write-Header "Installing Dependencies"
    
    # Node.js installation
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Status "Installing Node.js..."
        if ($HasChocolatey) {
            choco install nodejs --version=$NODE_VERSION -y
        } elseif ($HasWinget) {
            winget install OpenJS.NodeJS
        } elseif ($HasScoop) {
            scoop install nodejs
        } else {
            Write-Warning "Please install Node.js manually from https://nodejs.org"
            Write-Warning "Required version: $NODE_VERSION or higher"
            if (-not $NoInteraction) {
                Read-Host "Press Enter after installing Node.js to continue..."
            }
        }
    } else {
        $NodeVer = (node --version) -replace 'v', '' -split '\.' | Select-Object -First 1
        if ([int]$NodeVer -ge [int]$NODE_VERSION) {
            Write-Success "Node.js $(node --version) is already installed"
        } else {
            Write-Warning "Node.js version $NODE_VERSION+ required. Found: $(node --version)"
        }
    }
    
    # PostgreSQL installation
    if (-not $PsqlPath) {
        Write-Status "Installing PostgreSQL..."
        if ($HasChocolatey) {
            choco install postgresql15 --params "/Password:$DB_PASSWORD" -y
        } elseif ($HasWinget) {
            winget install PostgreSQL.PostgreSQL
            Write-Warning "Please set PostgreSQL password to: $DB_PASSWORD"
        } elseif ($HasScoop) {
            scoop bucket add main
            scoop install postgresql
            Write-Warning "Please set PostgreSQL password to: $DB_PASSWORD"
        } else {
            Write-Warning "Please install PostgreSQL manually from https://www.postgresql.org/download/windows/"
            Write-Warning "During installation, set password to: $DB_PASSWORD"
            if (-not $NoInteraction) {
                Read-Host "Press Enter after installing PostgreSQL to continue..."
            }
        }
        
        # Re-detect after installation
        Start-Sleep -Seconds 5
        Detect-PostgreSQL
    }
    
    # Git installation
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Status "Installing Git..."
        if ($HasChocolatey) {
            choco install git -y
        } elseif ($HasWinget) {
            winget install Git.Git
        } elseif ($HasScoop) {
            scoop install git
        } else {
            Write-Warning "Please install Git manually from https://git-scm.com/download/win"
            if (-not $NoInteraction) {
                Read-Host "Press Enter after installing Git to continue..."
            }
        }
    } else {
        $GitVersion = git --version | Select-String '\d+\.\d+\.\d+' | ForEach-Object { $_.Matches.Value }
        Write-Success "Git $GitVersion found"
    }
}

# Start PostgreSQL service
function Start-PostgreSQLService {
    Write-Status "Starting PostgreSQL service..."
    
    if ($PgService) {
        try {
            $Service = Get-Service -Name $PgService
            if ($Service.Status -ne 'Running') {
                Start-Service -Name $PgService
                Write-Success "PostgreSQL service started"
            } else {
                Write-Success "PostgreSQL service is already running"
            }
        } catch {
            Write-Error "Failed to start PostgreSQL service: $_"
        }
    } else {
        Write-Warning "PostgreSQL service not found. Please start it manually from Services (services.msc)"
    }
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
    Write-Header "PhishNet Universal Windows Setup"
    Write-Host "This script will automatically detect your Windows environment and set up PhishNet including:" -ForegroundColor White
    Write-Host "- Environment detection (Windows version, package managers)" -ForegroundColor Gray
    Write-Host "- Automatic dependency installation" -ForegroundColor Gray
    Write-Host "- Database creation and schema" -ForegroundColor Gray
    Write-Host "- Sample data import" -ForegroundColor Gray
    Write-Host "- Environment configuration" -ForegroundColor Gray
    Write-Host "- Application build" -ForegroundColor Gray
    Write-Host ""
    
    if (-not $NoInteraction) {
        $continue = Read-Host "Continue with automatic setup? (y/N)"
        if ($continue -ne 'y' -and $continue -ne 'Y') {
            Write-Status "Setup cancelled"
            exit 0
        }
    }
    
    try {
        # Run setup steps with environment detection
        Detect-Environment
        Install-Dependencies
        Start-PostgreSQLService
        Setup-Database
        Setup-Environment
        Install-Dependencies
        Setup-Directories
        Build-Application
        Test-Database
        New-Scripts
        
        Write-Header "Setup Complete!"
        Write-Success "PhishNet has been set up successfully on Windows!"
        Write-Host ""
        Write-Host "Environment Details:" -ForegroundColor Cyan
        Write-Host "  - OS: $WindowsVersion" -ForegroundColor White
        Write-Host "  - PostgreSQL: $PgVersion" -ForegroundColor White
        if (Get-Command node -ErrorAction SilentlyContinue) {
            Write-Host "  - Node.js: $(node --version)" -ForegroundColor White
        }
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Update SMTP settings in .env file" -ForegroundColor White
        Write-Host "2. Start development server: .\start-dev.bat" -ForegroundColor White
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
        Write-Status "Please check the error above and try again"
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
