#!/usr/bin/env powershell
# 🎣 PhishNet Universal Startup Script for Windows

param(
    [switch]$Production,
    [switch]$Help
)

# Colors (PowerShell compatible)
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "⚠️ $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "ℹ️ $msg" -ForegroundColor Blue }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }

if ($Help) {
    Write-Host "PhishNet Windows Startup Script"
    Write-Host "Usage: .\start.ps1 [-Production] [-Help]"
    Write-Host "  -Production    Start in production mode"
    Write-Host "  -Help          Show this help"
    exit 0
}

# Banner
Write-Host ""
Write-Host "======================================" -ForegroundColor Blue
Write-Host "🎣 PhishNet Starting Up 🎣" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

# Verify directory
if (!(Test-Path "package.json")) {
    Write-Error "package.json not found. Run from PhishNet directory."
    exit 1
}

Write-Info "📍 Detected: Windows $(if ($env:OS) { $env:OS } else { 'Unknown' })"

# Check services and dependencies
Write-Info "🔍 Checking services..."

# PostgreSQL
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        if ($pgService.Status -ne "Running") {
            Write-Info "Starting PostgreSQL..."
            Start-Service $pgService.Name
        }
        Write-Success "PostgreSQL running"
    } else {
        Write-Warning "PostgreSQL service not found - may need deployment"
    }
} catch {
    Write-Warning "PostgreSQL check failed"
}

# Redis
try {
    $redisService = Get-Service -Name "Redis" -ErrorAction SilentlyContinue
    if ($redisService) {
        if ($redisService.Status -ne "Running") {
            Write-Info "Starting Redis..."
            Start-Service "Redis"
        }
        Write-Success "Redis running"
    } else {
        Write-Warning "Redis service not found - may need deployment"
    }
} catch {
    Write-Warning "Redis check failed"
}

# Environment file
if (!(Test-Path ".env")) {
    Write-Warning "No .env file found - run deploy.ps1 first"
    $deploy = Read-Host "🚀 Run deployment now? (Y/n)"
    if ($deploy -ne "n" -and $deploy -ne "N") {
        .\deploy.ps1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Deployment failed"
            exit 1
        }
    } else {
        Write-Error "Cannot start without deployment"
        exit 1
    }
}

# Node modules
if (!(Test-Path "node_modules")) {
    Write-Info "Installing dependencies..."
    npm install
}

# Start application
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "🚀 Starting PhishNet Application 🚀" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "🌐 URL: http://localhost:3000" -ForegroundColor White
Write-Host "📧 Email: admin@phishnet.local" -ForegroundColor White
Write-Host "🔑 Password: admin123" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

if ($Production) {
    $env:NODE_ENV = "production"
    Write-Info "Starting in production mode..."
    npx tsx server/index.ts
} else {
    $env:NODE_ENV = "development"
    Write-Info "Starting in development mode..."
    npx tsx server/index.ts
}
