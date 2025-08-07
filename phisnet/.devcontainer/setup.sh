#!/bin/bash

# PhishNet Codespaces Setup Script
# This script sets up the development environment in GitHub Codespaces

echo "🚀 Setting up PhishNet development environment..."

# Copy environment template
if [ ! -f .env ]; then
    echo "📋 Creating environment configuration..."
    cp .env.codespaces .env
    echo "✅ Environment file created"
else
    echo "ℹ️ Environment file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Wait for database to be ready
echo "🔄 Waiting for database to be ready..."
until pg_isready -h database -p 5432 -U phishnet_user; do
    echo "⏳ Waiting for database..."
    sleep 2
done

# Run database setup
echo "🗄️ Setting up database..."
npm run setup

echo "✅ PhishNet development environment setup complete!"
echo ""
echo "🌟 Your application should be available at:"
echo "   Frontend: https://$CODESPACE_NAME-3001.preview.app.github.dev"
echo ""
echo "📚 Useful commands:"
echo "   npm run dev     - Start development server"
echo "   npm run setup   - Reset database with sample data"
echo "   npm run check   - Type check"
echo ""
echo "🎉 Happy coding!"
