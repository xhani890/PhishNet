# 🧪 PhishNet Windows Deployment Test
# Tests all components to ensure deployment worked correctly

param(
    [switch]$Verbose,
    [switch]$Help
)

if ($Help) {
    Write-Host "PhishNet Windows Deployment Test"
    Write-Host "Usage: .\test-deployment.ps1 [-Verbose] [-Help]"
    Write-Host "  -Verbose    Show detailed test information"
    Write-Host "  -Help       Show this help"
    exit 0
}

# Colors
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "⚠️ $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "ℹ️ $msg" -ForegroundColor Blue }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "======================================" -ForegroundColor Blue
Write-Host "🧪 PhishNet Deployment Test 🧪" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

$tests = @()
$passed = 0
$failed = 0

# Test 1: Directory structure
Write-Info "Test 1: Checking directory structure..."
$requiredFiles = @("package.json", "deploy.ps1", "start.ps1", ".env")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        if ($Verbose) { Write-Host "  ✓ $file exists" -ForegroundColor Green }
    } else {
        $missingFiles += $file
        if ($Verbose) { Write-Host "  ✗ $file missing" -ForegroundColor Red }
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Success "Directory structure OK"
    $passed++
} else {
    Write-Error "Missing files: $($missingFiles -join ', ')"
    $failed++
}

# Test 2: Node.js
Write-Info "Test 2: Checking Node.js..."
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $versionNumber = [version]($nodeVersion -replace 'v', '')
        if ($versionNumber.Major -ge 18) {
            Write-Success "Node.js $nodeVersion (compatible)"
            $passed++
        } else {
            Write-Warning "Node.js $nodeVersion (version too old, need 18+)"
            $failed++
        }
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Error "Node.js not installed or not working"
    $failed++
}

# Test 3: npm dependencies
Write-Info "Test 3: Checking npm dependencies..."
if (Test-Path "node_modules") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $requiredDeps = @("express", "tsx", "@types/node")
    $missingDeps = @()
    
    foreach ($dep in $requiredDeps) {
        $depPath = "node_modules/$dep"
        if (!(Test-Path $depPath)) {
            $missingDeps += $dep
        }
    }
    
    if ($missingDeps.Count -eq 0) {
        Write-Success "npm dependencies installed"
        $passed++
    } else {
        Write-Warning "Missing dependencies: $($missingDeps -join ', ')"
        $failed++
    }
} else {
    Write-Error "node_modules folder not found"
    $failed++
}

# Test 4: PostgreSQL
Write-Info "Test 4: Checking PostgreSQL..."
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        if ($pgService.Status -eq "Running") {
            Write-Success "PostgreSQL service running ($($pgService.Name))"
            
            # Test database connection
            try {
                $env:PGPASSWORD = "postgres"
                $dbTest = psql -U postgres -d phishnet -c "SELECT 1;" 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Database connection OK"
                } else {
                    Write-Warning "Database connection failed"
                }
            } catch {
                Write-Warning "Could not test database connection"
            }
            $passed++
        } else {
            Write-Warning "PostgreSQL service found but not running"
            $failed++
        }
    } else {
        Write-Error "PostgreSQL service not found"
        $failed++
    }
} catch {
    Write-Error "PostgreSQL check failed: $($_.Exception.Message)"
    $failed++
}

# Test 5: Redis
Write-Info "Test 5: Checking Redis..."
try {
    $redisService = Get-Service -Name "Redis" -ErrorAction SilentlyContinue
    if ($redisService) {
        if ($redisService.Status -eq "Running") {
            Write-Success "Redis service running"
            $passed++
        } else {
            Write-Warning "Redis service found but not running"
            $failed++
        }
    } else {
        Write-Warning "Redis service not found (may use alternative)"
        $passed++  # Not critical for basic functionality
    }
} catch {
    Write-Warning "Redis check failed: $($_.Exception.Message)"
    $passed++  # Not critical for basic functionality
}

# Test 6: Environment file
Write-Info "Test 6: Checking environment configuration..."
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    $requiredVars = @("DATABASE_URL", "PORT", "NODE_ENV")
    $missingVars = @()
    
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch "$var=") {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -eq 0) {
        Write-Success "Environment configuration complete"
        $passed++
    } else {
        Write-Warning "Missing environment variables: $($missingVars -join ', ')"
        $failed++
    }
} else {
    Write-Error "Environment file (.env) not found"
    $failed++
}

# Test 7: Docker (optional)
Write-Info "Test 7: Checking Docker (optional)..."
try {
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            try {
                $dockerInfo = docker info 2>$null
                if ($dockerInfo) {
                    Write-Success "Docker available and running"
                } else {
                    Write-Warning "Docker installed but not running"
                }
            } catch {
                Write-Warning "Docker installed but status unknown"
            }
        } else {
            Write-Warning "Docker command found but not working"
        }
    } else {
        Write-Info "Docker not installed (optional)"
    }
    $passed++  # Docker is optional
} catch {
    Write-Info "Docker check skipped"
    $passed++
}

# Test 8: Port availability
Write-Info "Test 8: Checking port availability..."
try {
    $portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Warning "Port 3000 is already in use"
        if ($Verbose) {
            $processes = Get-Process -Id $portInUse.OwningProcess -ErrorAction SilentlyContinue
            if ($processes) {
                Write-Host "  Used by: $($processes.ProcessName -join ', ')" -ForegroundColor Yellow
            }
        }
        $failed++
    } else {
        Write-Success "Port 3000 is available"
        $passed++
    }
} catch {
    Write-Success "Port 3000 appears to be available"
    $passed++
}

# Summary
Write-Host ""
Write-Host "======================================" -ForegroundColor Blue
Write-Host "📊 Test Results Summary" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue

$total = $passed + $failed
$successRate = [math]::Round(($passed / $total) * 100, 1)

Write-Host "Tests Passed: $passed" -ForegroundColor Green
Write-Host "Tests Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 All tests passed! PhishNet is ready to use." -ForegroundColor Green
    Write-Host ""
    Write-Host "To start PhishNet:" -ForegroundColor Blue
    Write-Host "  .\start.ps1" -ForegroundColor White
} elseif ($successRate -ge 80) {
    Write-Host "✅ Most tests passed. PhishNet should work with minor issues." -ForegroundColor Green
    Write-Host ""
    Write-Host "To start PhishNet:" -ForegroundColor Blue
    Write-Host "  .\start.ps1" -ForegroundColor White
} elseif ($successRate -ge 60) {
    Write-Host "⚠️ Some tests failed. PhishNet may have limited functionality." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Consider re-running deployment:" -ForegroundColor Blue
    Write-Host "  .\deploy.ps1" -ForegroundColor White
} else {
    Write-Host "❌ Many tests failed. PhishNet deployment needs attention." -ForegroundColor Red
    Write-Host ""
    Write-Host "Re-run deployment with admin privileges:" -ForegroundColor Blue
    Write-Host "  .\deploy.ps1" -ForegroundColor White
}

Write-Host "======================================"
Write-Host ""

exit $failed
