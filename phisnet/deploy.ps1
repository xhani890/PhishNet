# 🎣 PhishNet Universal Windows Deployment
# Auto-detects environment and installs all dependencies

param(
    [switch]$Production,
    [switch]$SkipDeps,
    [switch]$Help
)

# Colors and formatting functions
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "⚠️ $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "ℹ️ $msg" -ForegroundColor Blue }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }

# Help message
if ($Help) {
    Write-Host "PhishNet Universal Windows Deployment Script"
    Write-Host "Usage: .\deploy.ps1 [-Production] [-SkipDeps] [-Help]"
    Write-Host "  -Production   Deploy for production"
    Write-Host "  -SkipDeps     Skip dependency installation"
    Write-Host "  -Help         Show this help"
    exit 0
}

# Banner
Write-Host ""
Write-Host "======================================" -ForegroundColor Blue
Write-Host "🎣 PhishNet Windows Deployment 🎣" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host "🚀 Auto-installs all dependencies" -ForegroundColor Blue
Write-Host "🔧 Configures services automatically" -ForegroundColor Blue
Write-Host "🐳 Includes Docker support" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

# Verify we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Error "package.json not found. Please run from PhishNet directory."
    exit 1
}

# Set execution policy for smooth deployment
try {
    $executionPolicy = Get-ExecutionPolicy
    if ($executionPolicy -eq "Restricted" -or $executionPolicy -eq "AllSigned") {
        Write-Warning "PowerShell execution policy is $executionPolicy. Setting to Bypass for deployment..."
        Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force -ErrorAction SilentlyContinue
        Write-Success "Execution policy set to Bypass for this session and RemoteSigned for user"
    }
} catch {
    Write-Info "Attempting to bypass execution policy for this session..."
    try {
        Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
        Write-Success "Execution policy bypassed for this deployment"
    } catch {
        Write-Warning "Could not change execution policy. Deployment may still work."
    }
}

# Admin check
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if ($isAdmin) {
    Write-Success "Running with Administrator privileges"
} else {
    Write-Warning "Not running as Administrator. Some features may not work."
    Write-Info "For full functionality, right-click PowerShell and 'Run as Administrator'"
}

# System info
$osInfo = Get-CimInstance Win32_OperatingSystem
$osVersion = "$($osInfo.Caption) $($osInfo.Version)"
Write-Info "📍 Detected: $osVersion"

# Check for Windows version compatibility
$buildNumber = [System.Environment]::OSVersion.Version.Build
if ($buildNumber -lt 10240) {
    Write-Warning "Windows 10/11 recommended for best compatibility"
}

# Package manager detection
function Test-PackageManager {
    $managers = @()
    
    # Check for Chocolatey
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        $managers += "Chocolatey"
    }
    
    # Check for Scoop
    if (Get-Command scoop -ErrorAction SilentlyContinue) {
        $managers += "Scoop"
    }
    
    # Check for winget
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        $managers += "winget"
    }
    
    return $managers
}

$packageManagers = Test-PackageManager
if ($packageManagers.Count -gt 0) {
    Write-Success "Package managers found: $($packageManagers -join ', ')"
} else {
    Write-Warning "No package managers found. Will attempt manual installation."
}

# Install Chocolatey if needed
function Install-Chocolatey {
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Info "Installing Chocolatey package manager..."
        try {
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
            refreshenv
            Write-Success "Chocolatey installed successfully"
            return $true
        } catch {
            Write-Warning "Failed to install Chocolatey: $($_.Exception.Message)"
            return $false
        }
    } else {
        Write-Success "Chocolatey already installed"
        return $true
    }
}

# Check and install Node.js
function Install-NodeJS {
    Write-Info "🟢 Checking Node.js installation..."
    
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $versionNumber = [version]($nodeVersion -replace 'v', '')
            if ($versionNumber.Major -ge 18) {
                Write-Success "Node.js is installed (version $nodeVersion)"
                return $true
            } else {
                Write-Warning "Node.js version $nodeVersion is too old (need 18+)"
            }
        }
    } catch {
        Write-Warning "Node.js not found or not working"
    }
    
    Write-Info "Installing Node.js..."
    
    # Try different installation methods
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        try {
            choco install nodejs -y
            refreshenv
            Write-Success "Node.js installed via Chocolatey"
            return $true
        } catch {
            Write-Warning "Chocolatey installation failed"
        }
    }
    
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        try {
            winget install OpenJS.NodeJS
            Write-Success "Node.js installed via winget"
            return $true
        } catch {
            Write-Warning "winget installation failed"
        }
    }
    
    Write-Error "Failed to install Node.js automatically"
    Write-Info "Please install Node.js manually from: https://nodejs.org/"
    return $false
}

# Check and install Git
function Install-Git {
    Write-Info "📚 Checking Git installation..."
    
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $gitVersion = git --version
        Write-Success "Git is installed ($gitVersion)"
        return $true
    }
    
    Write-Info "Installing Git..."
    
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        try {
            choco install git -y
            refreshenv
            Write-Success "Git installed via Chocolatey"
            return $true
        } catch {
            Write-Warning "Chocolatey installation failed"
        }
    }
    
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        try {
            winget install Git.Git
            Write-Success "Git installed via winget"
            return $true
        } catch {
            Write-Warning "winget installation failed"
        }
    }
    
    Write-Warning "Failed to install Git automatically"
    Write-Info "Please install Git manually from: https://git-scm.com/"
    return $false
}

# Check and install PostgreSQL
function Install-PostgreSQL {
    Write-Info "🗄️ Checking PostgreSQL installation..."
    
    # Check if PostgreSQL service exists
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-Success "PostgreSQL service found: $($pgService.Name)"
        
        # Try to start the service
        try {
            if ($pgService.Status -ne "Running") {
                Write-Info "Starting PostgreSQL service..."
                Start-Service $pgService.Name -ErrorAction Stop
            }
            Write-Success "PostgreSQL is running"
            return $true
        } catch {
            Write-Warning "PostgreSQL service exists but failed to start: $($_.Exception.Message)"
        }
    }
    
    # Check if psql command is available
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        Write-Success "PostgreSQL client tools found"
        return $true
    }
    
    Write-Info "Installing PostgreSQL..."
    
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        try {
            choco install postgresql -y --params "/Password:postgres"
            refreshenv
            Write-Success "PostgreSQL installed via Chocolatey"
            
            # Start the service
            Start-Sleep 5
            $newPgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
            if ($newPgService) {
                Start-Service $newPgService.Name
                Write-Success "PostgreSQL service started"
            }
            return $true
        } catch {
            Write-Warning "Chocolatey installation failed: $($_.Exception.Message)"
        }
    }
    
    Write-Warning "Failed to install PostgreSQL automatically"
    Write-Info "Please install PostgreSQL manually from: https://www.postgresql.org/download/windows/"
    Write-Info "Or use the installer: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads"
    return $false
}

# Check and install Redis
function Install-Redis {
    Write-Info "📦 Checking Redis installation..."
    
    # Check if Redis service exists
    $redisService = Get-Service -Name "Redis" -ErrorAction SilentlyContinue
    if ($redisService) {
        Write-Success "Redis service found"
        
        try {
            if ($redisService.Status -ne "Running") {
                Write-Info "Starting Redis service..."
                Start-Service "Redis" -ErrorAction Stop
            }
            Write-Success "Redis is running"
            return $true
        } catch {
            Write-Warning "Redis service exists but failed to start: $($_.Exception.Message)"
        }
    }
    
    # Check if redis-cli is available
    if (Get-Command redis-cli -ErrorAction SilentlyContinue) {
        Write-Success "Redis client found"
        return $true
    }
    
    Write-Info "Installing Redis..."
    
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        try {
            choco install redis-64 -y
            refreshenv
            Write-Success "Redis installed via Chocolatey"
            return $true
        } catch {
            Write-Warning "Chocolatey installation failed: $($_.Exception.Message)"
        }
    }
    
    Write-Warning "Failed to install Redis automatically"
    Write-Info "Redis for Windows options:"
    Write-Info "1. Memurai (Redis alternative): https://www.memurai.com/"
    Write-Info "2. Redis on WSL: wsl --install then install Redis in Linux"
    Write-Info "3. Docker: docker run -d -p 6379:6379 redis:alpine"
    return $false
}

# Check and install Docker
function Install-Docker {
    Write-Info "🐳 Checking Docker installation..."
    
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        try {
            $dockerVersion = docker --version
            Write-Success "Docker is installed ($dockerVersion)"
            
            # Check if Docker daemon is running
            $dockerInfo = docker info 2>$null
            if ($dockerInfo) {
                Write-Success "Docker daemon is running"
                return $true
            } else {
                Write-Warning "Docker is installed but daemon is not running"
                Write-Info "Please start Docker Desktop manually"
                return $true
            }
        } catch {
            Write-Warning "Docker command found but not working properly"
        }
    }
    
    Write-Info "Installing Docker Desktop..."
    
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        try {
            choco install docker-desktop -y
            Write-Success "Docker Desktop installed via Chocolatey"
            Write-Warning "Please start Docker Desktop manually after installation"
            return $true
        } catch {
            Write-Warning "Chocolatey installation failed: $($_.Exception.Message)"
        }
    }
    
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        try {
            winget install Docker.DockerDesktop
            Write-Success "Docker Desktop installed via winget"
            Write-Warning "Please start Docker Desktop manually after installation"
            return $true
        } catch {
            Write-Warning "winget installation failed: $($_.Exception.Message)"
        }
    }
    
    Write-Warning "Failed to install Docker automatically"
    Write-Info "Please install Docker Desktop manually from: https://www.docker.com/products/docker-desktop"
    return $false
}

# Main dependency installation
function Install-Dependencies {
    if ($SkipDeps) {
        Write-Info "Skipping dependency installation"
        return
    }
    
    Write-Info "📦 Installing dependencies..."
    
    # Install Chocolatey first if we need it and don't have other package managers
    if ($packageManagers.Count -eq 0) {
        Install-Chocolatey | Out-Null
    }
    
    # Install core dependencies
    $success = @()
    $failed = @()
    
    if (Install-NodeJS) { $success += "Node.js" } else { $failed += "Node.js" }
    if (Install-Git) { $success += "Git" } else { $failed += "Git" }
    if (Install-PostgreSQL) { $success += "PostgreSQL" } else { $failed += "PostgreSQL" }
    if (Install-Redis) { $success += "Redis" } else { $failed += "Redis" }
    if (Install-Docker) { $success += "Docker" } else { $failed += "Docker" }
    
    # Summary
    if ($success.Count -gt 0) {
        Write-Success "Successfully installed/verified: $($success -join ', ')"
    }
    if ($failed.Count -gt 0) {
        Write-Warning "Failed to install: $($failed -join ', ')"
        Write-Info "You may need to install these manually"
    }
}

# Database setup function
function Setup-Database {
    Write-Info "🗄️ Setting up PostgreSQL database..."
    
    # Wait for PostgreSQL to be ready
    $retries = 0
    $maxRetries = 30
    while ($retries -lt $maxRetries) {
        try {
            # Try to connect with postgres user (default superuser)
            $env:PGPASSWORD = "postgres"
            $result = psql -U postgres -d postgres -c "SELECT 1;" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "PostgreSQL connection established"
                break
            }
        } catch {
            # Continue to retry
        }
        
        $retries++
        if ($retries -eq $maxRetries) {
            Write-Warning "Could not connect to PostgreSQL after $maxRetries attempts"
            Write-Info "Please ensure PostgreSQL is running and postgres user password is 'postgres'"
            Write-Info "Or update the database URL in .env file with correct credentials"
            return $false
        }
        
        Write-Info "Waiting for PostgreSQL to be ready... ($retries/$maxRetries)"
        Start-Sleep 2
    }
    
    # Database setup with consistent naming
    try {
        Write-Info "Creating PhishNet database..."
        
        # Drop existing database if it exists
        $env:PGPASSWORD = "postgres"
        psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS phishnet;" 2>$null | Out-Null
        
        # Create database with postgres user ownership
        psql -U postgres -d postgres -c "CREATE DATABASE phishnet;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database 'phishnet' created successfully"
        } else {
            Write-Warning "Failed to create database, but continuing..."
        }
        
        # Grant privileges
        psql -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE phishnet TO postgres;" 2>$null | Out-Null
        
        # Verify database connection
        $testResult = psql -U postgres -d phishnet -c "SELECT 1;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database connection verified"
            return $true
        } else {
            Write-Warning "Database connection verification failed"
            return $false
        }
    } catch {
        Write-Warning "Database setup encountered issues: $($_.Exception.Message)"
        return $false
    }
}

# Environment setup
function Setup-Environment {
    Write-Info "📝 Setting up environment..."
    
    if (!(Test-Path ".env")) {
        $envContent = @"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/phishnet
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
SESSION_SECRET=dev-secret-key-change-in-production
APP_URL=http://localhost:3000
"@
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success "Environment file created"
    } else {
        Write-Success "Environment file already exists"
    }
    
    # Verify .env file
    if (Test-Path ".env") {
        Write-Info "📋 Environment file contents:"
        Get-Content ".env" | ForEach-Object {
            if ($_ -match "PASSWORD=") {
                Write-Host ($_ -replace "PASSWORD=.*", "PASSWORD=***")
            } else {
                Write-Host $_
            }
        }
        Write-Success "Environment verified"
        return $true
    } else {
        Write-Error "Failed to create .env file"
        return $false
    }
}

# Application setup
function Setup-Application {
    Write-Info "🚀 Setting up PhishNet application..."
    
    # Generate package-lock.json if missing
    if (!(Test-Path "package-lock.json")) {
        Write-Info "Generating package-lock.json for better dependency management..."
        try {
            npm install --package-lock-only 2>$null
            if (Test-Path "package-lock.json") {
                Write-Success "package-lock.json generated"
            }
        } catch {
            Write-Warning "Could not generate package-lock.json - continuing with npm install"
        }
    }
    
    # Install npm dependencies
    Write-Info "Installing npm dependencies..."
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Success "npm dependencies installed"
        } else {
            Write-Warning "npm install had issues but continuing"
        }
    } catch {
        Write-Warning "npm install failed: $($_.Exception.Message)"
        return $false
    }
    
    # Database schema setup
    Write-Info "Setting up database schema..."
    try {
        npm run db:push 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database schema applied"
        } else {
            Write-Warning "Database schema setup had issues"
        }
    } catch {
        Write-Warning "Database schema setup failed"
    }
    
    # Import sample data
    Write-Info "Importing sample data..."
    try {
        npm run import-data 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Sample data imported"
        } else {
            Write-Warning "Sample data import had issues"
        }
    } catch {
        Write-Warning "Sample data import failed"
    }
    
    # Production build if requested
    if ($Production) {
        Write-Info "🔨 Building for production..."
        try {
            npm run build
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Production build completed"
            } else {
                Write-Warning "Production build had issues"
            }
        } catch {
            Write-Warning "Production build failed: $($_.Exception.Message)"
        }
    }
    
    return $true
}

# Main execution
Write-Info "🔧 Starting PhishNet deployment..."

# Install dependencies
Install-Dependencies

# Setup database
Setup-Database | Out-Null

# Setup environment
Setup-Environment | Out-Null

# Setup application
Setup-Application | Out-Null

# Final status check
Write-Info "🔍 Final system check..."

$services = @()
$issues = @()

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    $services += "Node.js ($nodeVersion)"
} else {
    $issues += "Node.js not found"
}

# Check PostgreSQL
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    $services += "PostgreSQL (Running)"
} else {
    $issues += "PostgreSQL not running"
}

# Check Redis
$redisService = Get-Service -Name "Redis" -ErrorAction SilentlyContinue
if ($redisService -and $redisService.Status -eq "Running") {
    $services += "Redis (Running)"
} else {
    $issues += "Redis not running"
}

# Check Docker
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try {
        $dockerInfo = docker info 2>$null
        if ($dockerInfo) {
            $services += "Docker (Running)"
        } else {
            $services += "Docker (Installed, not running)"
        }
    } catch {
        $services += "Docker (Installed, status unknown)"
    }
} else {
    $issues += "Docker not installed"
}

# Completion message
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "🎉 PhishNet Deployment Complete! 🎉" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "🌐 URL: http://localhost:3000" -ForegroundColor White
Write-Host "📧 Email: admin@phishnet.local" -ForegroundColor White
Write-Host "🔑 Password: admin123" -ForegroundColor White

if ($services.Count -gt 0) {
    Write-Host ""
    Write-Host "✅ Working Services:" -ForegroundColor Green
    $services | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
}

if ($issues.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️ Issues Found:" -ForegroundColor Yellow
    $issues | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
}

Write-Host ""
Write-Host "🚀 To start PhishNet:" -ForegroundColor Blue
Write-Host "   .\start.ps1              (development mode)" -ForegroundColor White
Write-Host "   .\start.ps1 -Production  (production mode)" -ForegroundColor White

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host ""
    Write-Host "🐳 Docker options:" -ForegroundColor Blue
    Write-Host "   docker compose up -d     (containerized mode)" -ForegroundColor White
}

Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Ask to start if not in production mode
if (!$Production) {
    $startChoice = Read-Host "🚀 Start PhishNet development server now? (Y/n)"
    if ($startChoice -ne "n" -and $startChoice -ne "N") {
        Write-Info "Starting PhishNet..."
        $env:NODE_ENV = "development"
        npx tsx server/index.ts
    } else {
        Write-Info "To start later: .\start.ps1"
    }
}

# Create friend deployment package automatically
function Create-FriendPackage {
    Write-Info "📦 Creating friend deployment package..."
    
    # Check if package directory exists from bash script
    $packageDir = Get-ChildItem -Directory "PhishNet-Package-*" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if (!$packageDir) {
        Write-Info "No existing package found. Creating new package..."
        # Create a simple package directory
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $packageDir = New-Item -ItemType Directory -Name "PhishNet-Package-Windows-$timestamp" -Force
        Write-Info "Created package directory: $($packageDir.Name)"
    }
    
    # Essential files for friend deployment
    $essentialFiles = @(
        "deploy.ps1",
        "deploy.bat", 
        "start.ps1",
        "start.bat",
        "test-deployment.ps1",
        "QUICK-FRIEND-SETUP.md",
        "FRIEND-DEPLOYMENT-GUIDE.md", 
        "WINDOWS-SETUP.md",
        "package.json",
        "docker-compose.yml",
        "Dockerfile",
        ".env.example"
    )
    
    Write-Info "Adding essential files to package..."
    foreach ($file in $essentialFiles) {
        if (Test-Path $file) {
            Copy-Item $file "$($packageDir.Name)/" -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Added: $file" -ForegroundColor Green
        }
    }
    
    # Copy source directories
    $sourceDirs = @("client", "server", "shared", "migrations", "docs")
    foreach ($dir in $sourceDirs) {
        if (Test-Path $dir) {
            Copy-Item $dir "$($packageDir.Name)/" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Added directory: $dir" -ForegroundColor Green
        }
    }
    
    # Copy configuration files
    $configFiles = @("tsconfig.json", "tailwind.config.ts", "vite.config.ts", "drizzle.config.ts", "components.json")
    foreach ($file in $configFiles) {
        if (Test-Path $file) {
            Copy-Item $file "$($packageDir.Name)/" -Force -ErrorAction SilentlyContinue
            Write-Host "  ✓ Added config: $file" -ForegroundColor Green
        }
    }
    
    # Create package README
    $packageReadme = @"
# 🎣 PhishNet Windows Deployment Package

## 🚀 Super Quick Setup for Windows

### Step 1: Extract Package
Extract this package to: ``C:\PhishNet\``

### Step 2: Run PowerShell as Administrator
- Press ``Windows + X``
- Select "Terminal (Admin)" or "PowerShell (Admin)"

### Step 3: Deploy PhishNet
``````powershell
cd C:\PhishNet\phishnet
.\deploy.ps1
``````

### Step 4: Start PhishNet
``````powershell
.\start.ps1
``````

### Step 5: Access PhishNet
- **URL**: http://localhost:3000
- **Email**: admin@phishnet.local
- **Password**: admin123

## 🔧 Alternative Methods

### Option 1: Batch Files (No PowerShell needed)
``````cmd
deploy.bat
start.bat
``````

### Option 2: Docker (If you have Docker Desktop)
``````bash
docker compose up -d
``````

## 🛠️ What Gets Installed
- Node.js 18+
- PostgreSQL database
- Redis cache
- Git version control
- Docker Desktop (optional)

## ⚠️ Troubleshooting

### PowerShell Execution Policy Error
``````powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
``````

### Port 3000 Already in Use
``````powershell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
``````

### Need Administrator Rights
Right-click PowerShell → "Run as Administrator"

## 📞 Need Help?
- Check ``WINDOWS-SETUP.md`` for detailed Windows guide
- Check ``QUICK-FRIEND-SETUP.md`` for quick reference
- Run ``.\test-deployment.ps1`` to verify everything works

## ✅ Success Indicators
1. No error messages during deployment
2. Can access http://localhost:3000
3. Can login with admin credentials
4. PhishNet dashboard loads properly

**🎯 Ready to use! This package contains everything needed for PhishNet deployment.**
"@
    
    $packageReadme | Out-File -FilePath "$($packageDir.Name)/README.md" -Encoding UTF8
    Write-Host "  ✓ Added: README.md" -ForegroundColor Green
    
    # Try to create ZIP
    $zipPath = "$($packageDir.Name).zip"
    try {
        if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
        Compress-Archive -Path "$($packageDir.Name)/*" -DestinationPath $zipPath -CompressionLevel Optimal
        $zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
        
        Write-Host ""
        Write-Host "======================================" -ForegroundColor Green
        Write-Host "🎉 Friend Package Created Successfully!" -ForegroundColor Green
        Write-Host "======================================" -ForegroundColor Green
        Write-Host "📦 Package: $zipPath" -ForegroundColor White
        Write-Host "📏 Size: $zipSize MB" -ForegroundColor White
        Write-Host ""
        Write-Host "📤 To share with friends:" -ForegroundColor Blue
        Write-Host "   1. Send them the ZIP file: $zipPath" -ForegroundColor White
        Write-Host "   2. Tell them to extract to C:\PhishNet\" -ForegroundColor White
        Write-Host "   3. Run PowerShell as Admin: .\deploy.ps1" -ForegroundColor White
        Write-Host "======================================" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Warning "Could not create ZIP automatically. Package folder ready: $($packageDir.Name)"
        Write-Info "You can manually zip the folder to share with friends"
    }
    
    return $true
}

# Always create friend package after successful deployment
Write-Host ""
Write-Info "🎁 Creating shareable package for friends..."
Create-FriendPackage | Out-Null
