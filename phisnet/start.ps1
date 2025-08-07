# PhishNet Windows Startup Script
# Starts the PhishNet application with proper environment setup

param(
    [switch]$Production,
    [switch]$Help
)

# Color functions with ASCII characters for PowerShell compatibility
function Write-Success { param($msg) Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Blue }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

if ($Help) {
    Write-Host "PhishNet Windows Startup Script"
    Write-Host "Usage: .\start.ps1 [-Production] [-Help]"
    Write-Host "  -Production    Start in production mode"
    Write-Host "  -Help          Show this help"
    exit 0
}

# Set execution policy for current session
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
} catch {
    Write-Warning "Could not set execution policy. You may need to run PowerShell as Administrator."
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "    PhishNet Startup for Windows" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Error "package.json not found. Are you in the PhishNet directory?"
    Write-Info "Please run this script from the PhishNet root directory"
    exit 1
}

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Warning "node_modules not found. Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Warning ".env file not found. Creating default configuration..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Success ".env file created from .env.example"
    } else {
        Write-Warning "No .env.example found. Please run deploy.ps1 first"
    }
}

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Success "Node.js version: $nodeVersion"
    } else {
        Write-Error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    }
} catch {
    Write-Error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
}

# Check if database is accessible (optional check)
Write-Info "Checking database connection..."
try {
    npm run db:push >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Database connection verified"
    } else {
        Write-Warning "Database connection failed. PhishNet may not work properly."
        Write-Info "Run '.\deploy.ps1' to set up the database"
    }
} catch {
    Write-Warning "Could not verify database connection"
}

# Create required directories
$directories = @("logs", "uploads", "temp")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Info "Created directory: $dir"
    }
}

# Start the application
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "       Starting PhishNet Server" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "URL: http://localhost:3000" -ForegroundColor White
Write-Host "Email: admin@phishnet.local" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

if ($Production) {
    $env:NODE_ENV = "production"
    Write-Info "Starting in production mode..."
    npx tsx server/index.ts
} else {
    $env:NODE_ENV = "development"
    Write-Info "Starting in development mode..."
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    npx tsx watch server/index.ts
}

# Check exit code
if ($LASTEXITCODE -ne 0) {
    Write-Error "PhishNet failed to start (exit code: $LASTEXITCODE)"
    Write-Info "Common solutions:"
    Write-Info "1. Run '.\deploy.ps1' to set up dependencies"
    Write-Info "2. Check if PostgreSQL is running"
    Write-Info "3. Verify .env configuration"
    exit $LASTEXITCODE
} else {
    Write-Success "PhishNet stopped successfully"
}
