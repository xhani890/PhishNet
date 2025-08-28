#!/bin/bash
# 🚨 Kali Linux Quick Fix Script
# Addresses the specific issues encountered in deployment

echo "🚨 Kali Linux Quick Fix - Addressing deployment issues..."

echo "Native services quick fix (containers not used)"

# (legacy permission and daemon steps removed)

# 4. Fix .env file issue
echo "🔧 Step 4: Checking .env file..."
if [[ ! -f ".env" ]]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
DATABASE_URL=postgresql://phishnet_user:phishnet_password@localhost:5432/phishnet_db
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
SESSION_SECRET=dev-secret-key-change-in-production
APP_URL=http://localhost:3000
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# (legacy build file adjustments removed)

# 6. Test fixes
echo "🔍 Step 6: Testing fixes..."

echo "Skipping container tests (not applicable)"

echo "📋 Testing .env file..."
if [[ -f ".env" ]] && grep -q "DATABASE_URL" .env; then
    echo "✅ .env file looks good"
else
    echo "❌ .env file issue"
fi

# 7. Instructions for user
echo ""
echo "🎯 Next steps:"
echo "1. Ensure system packages updated: sudo apt-get update && sudo apt-get upgrade -y"
echo "2. Run ./deploy.sh to (re)install dependencies"
echo "3. Use ./start.sh to launch the app"
echo ""
echo "🎉 Quick fix (native mode) completed!"
