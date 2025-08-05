@echo off
REM 🎣 PhishNet Windows Quick Setup (Batch Version)
REM For users who prefer .bat files over PowerShell

echo.
echo ======================================
echo 🎣 PhishNet Windows Quick Setup 🎣
echo ======================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run from PhishNet directory.
    pause
    exit /b 1
)

echo ℹ️ Detected: Windows %OS%

REM Check for administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running with Administrator privileges
) else (
    echo ⚠️ Not running as Administrator. Some features may not work.
    echo   Right-click Command Prompt and "Run as Administrator" for best results.
    echo.
)

REM Check for PowerShell
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo ❌ PowerShell not found. Please install PowerShell.
    pause
    exit /b 1
)

echo ℹ️ PowerShell found, launching deployment script...
echo.

REM Run the PowerShell deployment script with execution policy bypass
powershell -ExecutionPolicy Bypass -File "deploy.ps1" %*

if errorlevel 1 (
    echo.
    echo ❌ Deployment failed. Check the output above for errors.
    echo.
    echo 💡 Troubleshooting tips:
    echo    1. Run as Administrator
    echo    2. Check internet connection
    echo    3. Verify antivirus isn't blocking installation
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Deployment completed successfully!
echo.
echo 🧪 Test your deployment:
echo    .\test-deployment.ps1
echo.
echo 🚀 To start PhishNet:
echo    start.bat          (this batch file)
echo    .\start.ps1        (PowerShell script)
echo.
pause
