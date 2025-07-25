# PhishNet Windows Deployment Script
# PowerShell script for complete setup on Windows

param(
    [switch]$SkipDeps,
    [switch]$SkipBuild,
    [switch]$Production,
    [switch]$Help
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-Log {
    param([string]$Message, [string]$Color = "Green")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Warning {
    param([string]$Message)
    Write-Log "WARNING: $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-Log "ERROR: $Message" "Red"
}

function Write-Info {
    param([string]$Message)
    Write-Log "INFO: $Message" "Blue"
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-Chocolatey {
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Log "Installing Chocolatey package manager..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        refreshenv
        Write-Log "Chocolatey installed successfully"
    } else {
        Write-Log "Chocolatey already installed"
    }
}

function Install-Dependencies {
    Write-Log "Installing system dependencies..."
    
    # Install Chocolatey if not present
    Install-Chocolatey
    
    # Install dependencies
    $packages = @(
        "nodejs",
        "postgresql13",
        "redis-64",
        "git"
    )
    
    foreach ($package in $packages) {
        Write-Log "Installing $package..."
        choco install $package -y
    }
    
    # Refresh environment variables
    refreshenv
    
    Write-Log "Dependencies installed successfully"
}

function New-ProjectDirectories {
    Write-Log "Creating project directories..."
    
    $directories = @("logs", "backups", "uploads", "public\assets", "shared\types")
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Log "Created directory: $dir"
        }
    }
}

function Set-Environment {
    Write-Log "Setting up environment configuration..."
    
    if (!(Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Log "Created .env file from .env.example"
        } else {
            Write-Error ".env.example not found!"
            exit 1
        }
    } else {
        Write-Warning ".env file already exists, skipping creation"
    }
    
    # Generate secure secrets
    $content = Get-Content ".env" -Raw
    
    if ($content -match "your-super-secure-session-secret") {
        $sessionSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(48))
        $content = $content -replace "your-super-secure-session-secret-change-this-in-production-min-32-chars", $sessionSecret
        Write-Log "Generated secure session secret"
    }
    
    if ($content -match "your-jwt-secret-key") {
        $jwtSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))
        $content = $content -replace "your-jwt-secret-key-change-this-in-production", $jwtSecret
        Write-Log "Generated secure JWT secret"
    }
    
    Set-Content ".env" $content -NoNewline
}

function Start-PostgreSQL {
    Write-Log "Starting PostgreSQL service..."
    
    $service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.Status -ne "Running") {
            Start-Service $service.Name
            Write-Log "PostgreSQL service started"
        } else {
            Write-Log "PostgreSQL service already running"
        }
    } else {
        Write-Warning "PostgreSQL service not found. Please install PostgreSQL manually."
    }
}

function Start-Redis {
    Write-Log "Starting Redis service..."
    
    $service = Get-Service -Name "Redis" -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.Status -ne "Running") {
            Start-Service "Redis"
            Write-Log "Redis service started"
        } else {
            Write-Log "Redis service already running"
        }
    } else {
        Write-Warning "Redis service not found. Starting Redis manually..."
        Start-Process "redis-server" -WindowStyle Hidden -ErrorAction SilentlyContinue
    }
}

function Set-Database {
    Write-Log "Setting up PostgreSQL database..."
    
    Start-PostgreSQL
    
    # Wait for PostgreSQL to start
    Start-Sleep -Seconds 5
    
    try {
        # Create database and user using psql
        $env:PGPASSWORD = "postgres"
        
        & psql -U postgres -h localhost -c "CREATE DATABASE phishnet_db;" 2>$null
        & psql -U postgres -h localhost -c "CREATE USER phishnet_user WITH PASSWORD 'phishnet_password';" 2>$null
        & psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE phishnet_db TO phishnet_user;" 2>$null
        & psql -U postgres -h localhost -c "ALTER USER phishnet_user CREATEDB;" 2>$null
        
        Write-Log "Database setup completed"
    } catch {
        Write-Warning "Database setup may have partially failed. Some resources might already exist."
    }
}

function Install-NodeDependencies {
    Write-Log "Installing Node.js dependencies..."
    
    # Check Node.js version
    try {
        $nodeVersion = (node --version) -replace "v", ""
        $majorVersion = [int]($nodeVersion.Split('.')[0])
        
        if ($majorVersion -lt 18) {
            Write-Warning "Node.js version 18+ recommended. Current version: v$nodeVersion"
        }
    } catch {
        Write-Error "Node.js not found. Please install Node.js 18+"
        exit 1
    }
    
    # Install dependencies
    npm install
    
    # Install PM2 globally
    if (!(Get-Command pm2 -ErrorAction SilentlyContinue)) {
        npm install -g pm2
        npm install -g pm2-windows-service
        Write-Log "Installed PM2 for process management"
    }
    
    Write-Log "Node.js dependencies installed"
}

function Build-Application {
    Write-Log "Building application..."
    
    # Build client if exists
    if (Test-Path "client") {
        Set-Location "client"
        npm install
        npm run build
        Set-Location ".."
        Write-Log "Client built successfully"
    }
    
    # Build server
    npm run build
    Write-Log "Server built successfully"
}

function Invoke-Migrations {
    Write-Log "Running database migrations..."
    npm run db:migrate
    Write-Log "Database migrations completed"
}

function Set-PM2Ecosystem {
    Write-Log "Setting up PM2 ecosystem..."
    
    $ecosystemConfig = @"
module.exports = {
  apps: [{
    name: 'phishnet',
    script: './dist/server/index.js',
    instances: 1,
    exec_mode: 'fork',
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
    min_uptime: '10s',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    env_file: '.env'
  }]
};
"@
    
    Set-Content "ecosystem.config.js" $ecosystemConfig
    Write-Log "PM2 ecosystem configuration created"
}

function New-BackupScript {
    Write-Log "Creating backup script..."
    
    $backupScript = @"
# PhishNet Windows Backup Script
param([string]`$BackupDir = ".\backups")

`$Date = Get-Date -Format "yyyyMMdd_HHmmss"
`$DBName = "phishnet_db"
`$DBUser = "phishnet_user"

# Create backup directory
New-Item -ItemType Directory -Path `$BackupDir -Force | Out-Null

# Backup database
`$env:PGPASSWORD = "phishnet_password"
pg_dump -U `$DBUser -h localhost `$DBName > "`$BackupDir\db_backup_`$Date.sql"

# Backup uploads
Compress-Archive -Path "uploads\*" -DestinationPath "`$BackupDir\uploads_backup_`$Date.zip" -Force

# Backup configuration
Copy-Item ".env" "`$BackupDir\env_backup_`$Date"

# Cleanup old backups (keep last 30 days)
Get-ChildItem `$BackupDir -Filter "*backup*" | Where-Object { `$_.CreationTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force

Write-Host "Backup completed: `$Date"
"@
    
    Set-Content "backup.ps1" $backupScript
    Write-Log "Backup script created"
}

function Set-WindowsService {
    if ($Production) {
        Write-Log "Setting up Windows service..."
        
        try {
            pm2-service-install
            pm2 start ecosystem.config.js
            pm2 save
            Write-Log "Windows service configured"
        } catch {
            Write-Warning "Failed to setup Windows service. You can start manually with: npm start"
        }
    }
}

function Show-Help {
    Write-Host @"
PhishNet Windows Deployment Script

USAGE:
    .\deploy.ps1 [options]

OPTIONS:
    -SkipDeps       Skip dependency installation
    -SkipBuild      Skip application build  
    -Production     Setup for production deployment
    -Help           Show this help message

EXAMPLES:
    .\deploy.ps1                    # Full development setup
    .\deploy.ps1 -Production        # Production setup
    .\deploy.ps1 -SkipDeps -SkipBuild  # Quick setup without deps/build

"@ -ForegroundColor White
}

function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Log "Starting PhishNet Windows deployment..."
    
    # Check if we're in the right directory
    if (!(Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from the PhishNet root directory."
        exit 1
    }
    
    # Check for administrator privileges for system dependencies
    if (!$SkipDeps -and !(Test-Administrator)) {
        Write-Warning "Administrator privileges recommended for dependency installation."
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -notmatch "^[Yy]") {
            Write-Info "Rerun as Administrator or use -SkipDeps flag"
            exit 1
        }
    }
    
    # Create directories
    New-ProjectDirectories
    
    # Install system dependencies
    if (!$SkipDeps) {
        Install-Dependencies
    }
    
    # Setup services
    Set-Database
    Start-Redis
    
    # Setup application
    Set-Environment
    Install-NodeDependencies
    
    # Build application
    if (!$SkipBuild) {
        Build-Application
    }
    
    # Run migrations
    Invoke-Migrations
    
    # Setup process management
    Set-PM2Ecosystem
    
    # Create backup script
    New-BackupScript
    
    # Production setup
    if ($Production) {
        Set-WindowsService
    }
    
    Write-Log "Deployment completed successfully!" "Green"
    Write-Info "Next steps:"
    Write-Info "1. Review and update .env file with your settings"
    Write-Info "2. Start the application with: npm start"
    Write-Info "3. Or use PM2: pm2 start ecosystem.config.js"
    Write-Info "4. Access the application at: http://localhost:3000"
    
    if ($Production) {
        Write-Info "5. Configure your domain and firewall rules"
        Write-Info "6. Update FRONTEND_URL in .env to your domain"
    }
    
    Write-Warning "Important: Change default passwords in .env file!"
}

# Run main function
Main
