@echo off
REM 🎣 PhishNet Windows Startup (Batch Version)

echo.
echo ======================================
echo 🎣 PhishNet Starting Up 🎣
echo ======================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run from PhishNet directory.
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo ⚠️ No .env file found. Running deployment first...
    call deploy.bat
    if errorlevel 1 (
        echo ❌ Deployment failed
        pause
        exit /b 1
    )
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ℹ️ Installing dependencies...
    npm install
)

echo.
echo ======================================
echo 🚀 Starting PhishNet Application 🚀
echo ======================================
echo 🌐 URL: http://localhost:3000
echo 📧 Email: admin@phishnet.local
echo 🔑 Password: admin123
echo ======================================
echo.

REM Set environment and start
set NODE_ENV=development
echo ℹ️ Starting in development mode...
npx tsx server/index.ts

pause
