# PhishNet - Installation & Setup Guide

## 📋 Prerequisites

Before installing PhishNet, ensure your system meets the following requirements:

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: At least 2GB free space
- **Network**: Internet connection for package downloads

### Required Software

#### 1. Node.js (v18.0.0 or higher)
**Download & Install:**
- Visit [nodejs.org](https://nodejs.org/)
- Download the LTS version
- Run the installer and follow the setup wizard

**Verify Installation:**
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show npm version
```

#### 2. PostgreSQL (v15.0 or higher)
**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run the installer and remember your password
- Default port: 5432

**macOS:**
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Verify Installation:**
```bash
psql --version  # Should show PostgreSQL 15.x
```

#### 3. Git
**Download & Install:**
- Visit [git-scm.com](https://git-scm.com/)
- Download and install for your operating system

**Verify Installation:**
```bash
git --version  # Should show git version
```

#### 4. Code Editor (Recommended)
- **Visual Studio Code**: [code.visualstudio.com](https://code.visualstudio.com/)
- **WebStorm**: [jetbrains.com/webstorm](https://www.jetbrains.com/webstorm/)

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
# Clone the project
git clone https://github.com/your-username/phishnet.git
cd phishnet/phisnet

# Or if using SSH
git clone git@github.com:your-username/phishnet.git
cd phishnet/phisnet
```

### Step 2: Database Setup

#### Create Database
```bash
# Connect to PostgreSQL (Windows/Linux)
psql -U postgres

# Create database and user
CREATE DATABASE phishnet;
CREATE USER phishnet_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE phishnet TO phishnet_user;

# Exit PostgreSQL
\q
```

#### Alternative: Using pgAdmin
1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `phishnet`
4. Owner: Create or select a user
5. Click "Save"

### Step 3: Environment Configuration

#### Create Environment Files
```bash
# Copy environment template
cp .env.example .env
```

#### Configure .env File
```env
# Database Configuration
DATABASE_URL=postgresql://phishnet_user:your_secure_password@localhost:5432/phishnet
DB_HOST=localhost
DB_PORT=5432
DB_NAME=phishnet
DB_USER=phishnet_user
DB_PASSWORD=your_secure_password

# Server Configuration
PORT=3001
NODE_ENV=development
SESSION_SECRET=generate-a-very-long-random-string-here

# Email Configuration (Optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,text/csv

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_MAX_AGE=86400000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Development Configuration
CORS_ORIGIN=http://localhost:5173
```

### Step 4: Install Dependencies

#### Install Backend Dependencies
```bash
# Install server dependencies
cd server
npm install

# Or using yarn
yarn install
```

#### Install Frontend Dependencies
```bash
# Install client dependencies
cd ../client
npm install

# Or using yarn
yarn install
```

### Step 5: Database Migration

#### Run Database Migrations
```bash
# Go back to project root
cd ..

# Run database migrations
npm run db:migrate

# Or manually run migrations
cd server
npx drizzle-kit push:pg
```

#### Seed Database (Optional)
```bash
# Run database seeding
npm run db:seed

# This will create:
# - Default organization
# - Admin user (admin@phishnet.com / admin123)
# - Sample templates
# - Sample campaigns
```

### Step 6: Build and Start the Application

#### Development Mode
```bash
# Start both frontend and backend in development mode
npm run dev

# Or start them separately:
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

#### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Step 7: Verify Installation

#### Check Application Status
1. **Backend Server**: [http://localhost:3001](http://localhost:3001)
2. **Frontend Application**: [http://localhost:5173](http://localhost:5173)
3. **Database Connection**: Check server logs for successful connection

#### Default Login Credentials
- **Email**: `admin@phishnet.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## 🔧 Development Setup

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Git Hooks Setup
```bash
# Install husky for git hooks
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint:fix && npm run format"

# Add commit-msg hook
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```

### Database Development Tools

#### pgAdmin Setup
1. Install pgAdmin from [pgadmin.org](https://www.pgadmin.org/)
2. Add new server:
   - Name: PhishNet Local
   - Host: localhost
   - Port: 5432
   - Username: phishnet_user
   - Password: your_secure_password

#### Drizzle Studio (Database GUI)
```bash
# Start Drizzle Studio
cd server
npx drizzle-kit studio

# Access at: http://localhost:4983
```

## 🐳 Docker Setup (Alternative)

### Using Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: phishnet
      POSTGRES_USER: phishnet_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3001:3001"
      - "5173:5173"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://phishnet_user:your_secure_password@postgres:5432/phishnet
    depends_on:
      - postgres
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### Docker Commands
```bash
# Build and start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Error
**Error**: `ECONNREFUSED` or `database does not exist`

**Solutions**:
```bash
# Check PostgreSQL service
# Windows
net start postgresql-x64-15

# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Verify database exists
psql -U postgres -l
```

#### 2. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::3001`

**Solutions**:
```bash
# Find process using port
# Windows
netstat -ano | findstr :3001

# macOS/Linux
lsof -ti:3001

# Kill process
# Windows
taskkill /PID <process_id> /F

# macOS/Linux
kill -9 <process_id>
```

#### 3. Node.js Version Issues
**Error**: `Unsupported Node.js version`

**Solutions**:
```bash
# Check current version
node --version

# Install Node Version Manager (nvm)
# Windows: Install nvm-windows
# macOS/Linux: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 18
nvm install 18
nvm use 18
```

#### 4. Permission Errors
**Error**: Permission denied or EACCES

**Solutions**:
```bash
# Windows: Run as Administrator
# macOS/Linux: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

#### 5. TypeScript Compilation Errors
**Error**: TypeScript compilation failures

**Solutions**:
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version
```

### Debug Mode

#### Enable Debug Logging
```env
# Add to .env file
DEBUG=phishnet:*
LOG_LEVEL=debug
```

#### Server Debugging
```bash
# Start server in debug mode
cd server
npm run debug

# Or with Node.js inspector
node --inspect src/app.ts
```

#### Database Debugging
```bash
# Enable SQL query logging
DEBUG_SQL=true npm run dev

# View migration status
cd server
npx drizzle-kit introspect:pg
```

## 🔐 Security Setup

### SSL Certificate (Production)
```bash
# Generate self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# For production, use Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

### Environment Security
```bash
# Generate secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use strong database password
# Minimum 12 characters with mixed case, numbers, and symbols
```

### Firewall Configuration
```bash
# Allow only necessary ports
# Windows Firewall: Configure through Windows Security
# Linux UFW:
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📊 Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_campaigns_organization_id ON campaigns(organization_id);
CREATE INDEX idx_events_campaign_id ON events(campaign_id);
CREATE INDEX idx_events_created_at ON events(created_at);

-- Analyze tables
ANALYZE users;
ANALYZE campaigns;
ANALYZE events;
```

### Node.js Optimization
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable Node.js clustering
npm install pm2 -g
pm2 start ecosystem.config.js
```

## 🧪 Testing Setup

### Test Database Setup
```sql
-- Create test database
CREATE DATABASE phishnet_test;
GRANT ALL PRIVILEGES ON DATABASE phishnet_test TO phishnet_user;
```

### Environment for Testing
```env
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://phishnet_user:your_secure_password@localhost:5432/phishnet_test
```

### Running Tests
```bash
# Install test dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📝 Development Workflow

### Recommended Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create pull request
git push origin feature/new-feature
```

### Code Quality Checks
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Database Changes
```bash
# Create new migration
cd server
npx drizzle-kit generate:pg

# Apply migration
npx drizzle-kit push:pg

# Reset database (development only)
npm run db:reset
```

---

**Next Steps**: After successful installation, refer to the User Manual for application usage or the Development Guide for contributing to the project.

**Support**: If you encounter issues not covered in this guide, please check the project's GitHub issues or contact the development team.

---

**Document Version:** 1.0
**Last Updated:** July 25, 2025
**Author:** PhishNet Project Team
**Project:** PhishNet Advanced Phishing Simulation Platform
