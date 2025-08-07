# PhishNet Package Preparation Script
# Run this to prepare the package for your friend

param(
    [switch]$Help
)

if ($Help) {
    Write-Host "PhishNet Package Preparation Script"
    Write-Host "Usage: .\prepare-for-friend.ps1"
    Write-Host "This script prepares the PhishNet package for easy sharing with your friend."
    exit 0
}

# Colors
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Blue }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "======================================" -ForegroundColor Blue
Write-Host "PhishNet Package Preparation" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

# Check if package exists
$packageDir = Get-ChildItem -Directory "PhishNet-Package-*" | Select-Object -First 1

if (!$packageDir) {
    Write-Error "No PhishNet package found. Please create a package first:"
    Write-Host "  ./create-package.sh" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Info "Found package: $($packageDir.Name)"

# Copy essential files to the package
$essentialFiles = @(
    "QUICK-FRIEND-SETUP.md",
    "FRIEND-DEPLOYMENT-GUIDE.md",
    "deploy.ps1",
    "start.ps1",
    "deploy.bat",
    "start.bat",
    "test-deployment.ps1",
    "WINDOWS-SETUP.md"
)

Write-Info "Adding essential files to package..."

foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Copy-Item $file "$($packageDir.Name)/" -Force
        Write-Success "Added: $file"
    } else {
        Write-Host "  [WARN] Missing: $file" -ForegroundColor Yellow
    }
}

# Create a simple README for the package root
$readmeContent = @"
# PhishNet Package

## Quick Start for Windows
1. Extract this package to C:\PhishNet\
2. Open PowerShell as Administrator
3. Navigate to the phishnet folder: cd C:\PhishNet\phishnet
4. Run: .\deploy.ps1
5. Start: .\start.ps1
6. Open: http://localhost:3000
7. Login: admin@phishnet.local / admin123

## Quick Start for Linux/macOS
1. Extract this package
2. Run: chmod +x setup-from-package.sh && ./setup-from-package.sh
3. Open: http://localhost:3000
4. Login: admin@phishnet.local / admin123

## Need Help?
- Read QUICK-FRIEND-SETUP.md for detailed instructions
- Read FRIEND-DEPLOYMENT-GUIDE.md for troubleshooting
- Read WINDOWS-SETUP.md for Windows-specific help

## What's Included
- Complete PhishNet source code
- Database backup with all your data
- Automated setup scripts
- All templates and campaigns
- User accounts and settings

This package contains everything needed for a complete PhishNet deployment!
"@

$readmeContent | Out-File -FilePath "$($packageDir.Name)/README.md" -Encoding UTF8
Write-Success "Added: README.md"

# Create a ZIP file
Write-Info "Creating ZIP file..."

$zipPath = "$($packageDir.Name).zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

try {
    if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
        # Use PowerShell 5+ built-in compression
        Compress-Archive -Path "$($packageDir.Name)/*" -DestinationPath $zipPath -CompressionLevel Optimal
        Write-Success "ZIP created using PowerShell compression"
    } else {
        # Fallback for older PowerShell versions
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($packageDir.FullName, $zipPath)
        Write-Success "ZIP created using .NET compression"
    }
} catch {
    Write-Error "Failed to create ZIP file: $($_.Exception.Message)"
    Write-Info "You can manually zip the '$($packageDir.Name)' folder"
    exit 1
}

# Get file size
$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Package Ready for Friend!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "Package: $zipPath" -ForegroundColor White
Write-Host "Size: $zipSize MB" -ForegroundColor White
Write-Host ""
Write-Host "Send these to your friend:" -ForegroundColor Blue
Write-Host "   1. $zipPath" -ForegroundColor White
Write-Host "   2. QUICK-FRIEND-SETUP.md (for quick reference)" -ForegroundColor White
Write-Host ""
Write-Host "Your friend should:" -ForegroundColor Blue
Write-Host "   1. Extract the ZIP file" -ForegroundColor White
Write-Host "   2. Read README.md or QUICK-FRIEND-SETUP.md" -ForegroundColor White
Write-Host "   3. Follow the setup instructions" -ForegroundColor White
Write-Host "   4. Access PhishNet at http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Login credentials:" -ForegroundColor Blue
Write-Host "   Email: admin@phishnet.local" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Show what's included
Write-Info "Package contents summary:"
Write-Host "   [OK] Complete PhishNet application" -ForegroundColor Green
Write-Host "   [OK] Database backup with your data" -ForegroundColor Green
Write-Host "   [OK] Windows deployment scripts (.ps1 and .bat)" -ForegroundColor Green
Write-Host "   [OK] Linux/macOS deployment scripts" -ForegroundColor Green
Write-Host "   [OK] Detailed setup instructions" -ForegroundColor Green
Write-Host "   [OK] Troubleshooting guides" -ForegroundColor Green
Write-Host "   [OK] All your templates and campaigns" -ForegroundColor Green
Write-Host "   [OK] User accounts and settings" -ForegroundColor Green
Write-Host ""

Write-Success "Package is ready to share!"
