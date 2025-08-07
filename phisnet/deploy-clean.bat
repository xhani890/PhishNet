@echo off
REM PhishNet Windows Quick Setup (Batch Version)

echo.
echo ======================================
echo    PhishNet Windows Quick Setup
echo ======================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run from PhishNet directory.
    pause
    exit /b 1
)

echo [INFO] Detected: Windows %OS%

REM Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [SUCCESS] Running with Administrator privileges
) else (
    echo [WARNING] Not running as Administrator. Some features may not work.
    echo [INFO] For best results, run as Administrator
)

REM Check if PowerShell is available
powershell -Command "Write-Host 'PowerShell Test'" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PowerShell not found. Please install PowerShell.
    pause
    exit /b 1
)

echo [INFO] PowerShell found, launching deployment script...
echo.

echo [INFO] Setting PowerShell execution policy for smooth deployment...
echo [INFO] This ensures the PowerShell scripts can run properly...
echo.

REM Launch PowerShell deployment with execution policy
powershell -ExecutionPolicy RemoteSigned -File "deploy.ps1"

REM Check if deployment was successful
if errorlevel 1 (
    echo.
    echo [ERROR] Deployment failed. Check the output above for errors.
    echo.
    echo [TIP] Troubleshooting tips:
    echo - Ensure you have internet connection
    echo - Run as Administrator
    echo - Check if PostgreSQL service is running
    echo - Verify Node.js is installed
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Deployment completed successfully!
echo.
echo [TEST] Test your deployment:
echo   .\verify-setup.ps1
echo.
echo [START] To start PhishNet:
echo   .\start.ps1   or   .\start.bat
echo.
pause
