# PhishNet Deployment Guide
## Complete Setup & Database Migration Documentation

**Version:** 1.0  
**Created:** July 25, 2025  
**Project:** PhishNet - Phishing Simulation Platform

---

## 📋 Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Deployment Options](#deployment-options)
3. [Database Setup](#database-setup)
4. [Docker Deployment](#docker-deployment)
5. [Manual Setup](#manual-setup)
6. [Environment Configuration](#environment-configuration)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

---

## 🚀 Quick Start Guide

### Option 1: Docker Deployment (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd phishnet

# Run Docker setup script
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

### Option 2: Manual Setup
```bash
# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Option 3: Windows Setup
```powershell
# Run PowerShell setup script
.\scripts\setup.ps1
```

---

## 🔧 Deployment Options

### 1. Docker Deployment (Production Ready)
- **Best for:** Production environments, easy scaling
- **Requirements:** Docker, Docker Compose
- **Setup time:** 5-10 minutes
- **Features:** Full isolation, reverse proxy, SSL ready

### 2. Manual Installation
- **Best for:** Development, custom configurations
- **Requirements:** Node.js 18+, PostgreSQL 15+
- **Setup time:** 10-15 minutes
- **Features:** Full control, custom database settings

### 3. Development Setup
- **Best for:** Local development, testing
- **Requirements:** Node.js, PostgreSQL (local or Docker)
- **Setup time:** 5-10 minutes
- **Features:** Hot reload, development tools

---

## 🗄️ Database Setup

### Complete Database Migration Files

The project includes comprehensive database setup files:

#### 1. Schema Migration (`migrations/00_phishnet_schema.sql`)
```sql
-- Complete database schema with all tables
-- Includes: organizations, users, campaigns, email_templates, 
-- landing_pages, notifications, sessions, and more
```

**Key Features:**
- Multi-tenant organization structure
- User role management (admin, manager, user)
- Campaign and email template management
- Landing page hosting system
- Comprehensive notification system
- Session management with Redis support
- Audit logging and tracking

#### 2. Sample Data (`migrations/01_sample_data.sql`)
```sql
-- Sample organizations, users, and templates
-- Ready-to-use phishing simulation data
```

**Includes:**
- 3 sample organizations (Corporate, Education, Healthcare)
- 7 user accounts with different roles
- 4 professional email templates
- 2 landing page templates
- Administrative accounts

### Database Connection Options

#### PostgreSQL (Production)
```bash
# Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/phishnet"

# Docker PostgreSQL
DATABASE_URL="postgresql://phishnet_user:password@localhost:5432/phishnet"

# Remote PostgreSQL
DATABASE_URL="postgresql://user:pass@hostname:5432/phishnet"
```

#### SQLite (Development)
```bash
# Local SQLite file
DATABASE_URL="sqlite:./database.sqlite"
```

---

## 🐳 Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

### Quick Docker Setup

1. **Clone and prepare:**
```bash
git clone <repository-url>
cd phishnet
```

2. **Run setup script:**
```bash
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

3. **Or manual Docker setup:**
```bash
# Copy environment file
cp .env.docker .env

# Build and start services
docker-compose up -d

# Check status
docker-compose ps
```

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| **app** | 3001 | PhishNet Application |
| **database** | 5432 | PostgreSQL Database |
| **redis** | 6379 | Redis Cache/Sessions |
| **nginx** | 80, 443 | Reverse Proxy |

### Docker Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Restart specific service
docker-compose restart app

# Update application
docker-compose pull && docker-compose up -d

# Backup database
docker-compose exec database pg_dump -U phishnet_user phishnet > backup.sql

# Restore database
docker-compose exec -T database psql -U phishnet_user phishnet < backup.sql
```

---

## ⚙️ Manual Setup

### Prerequisites
- Node.js 18+ with npm
- PostgreSQL 15+
- Redis 6+ (optional but recommended)
- Git

### Step-by-Step Installation

1. **System Dependencies:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm postgresql redis-server git

# CentOS/RHEL
sudo yum install nodejs npm postgresql-server redis git

# macOS
brew install node postgresql redis git
```

2. **Database Setup:**
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE phishnet;
CREATE USER phishnet_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE phishnet TO phishnet_user;
\q
```

3. **Application Setup:**
```bash
# Clone repository
git clone <repository-url>
cd phishnet

# Install dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# Build application
npm run build

# Start application
npm start
```

### Windows Setup

1. **Run PowerShell as Administrator:**
```powershell
# Set execution policy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run setup script
.\scripts\setup.ps1
```

2. **Manual Windows Setup:**
```powershell
# Install Node.js and PostgreSQL
# Download from official websites

# Install dependencies
npm install

# Setup database
# Use pgAdmin or command line

# Configure environment
Copy-Item .env.example .env
# Edit .env file

# Start application
npm start
```

---

## 🔐 Environment Configuration

### Core Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/phishnet"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="phishnet"
DB_USER="phishnet_user"
DB_PASSWORD="secure_password"

# Server Configuration
PORT="3001"
NODE_ENV="production"
SESSION_SECRET="your-very-long-random-session-secret"

# Redis Configuration (Optional)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="redis_password"

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_SECURE="false"

# Security Settings
BCRYPT_ROUNDS="12"
SESSION_MAX_AGE="86400000"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"

# File Upload
UPLOAD_MAX_SIZE="10485760"
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/gif,text/csv"

# CORS
CORS_ORIGIN="http://localhost"
```

### Email Provider Setup

#### Gmail
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Generate from Google Account settings
SMTP_SECURE="false"
```

#### Outlook/Hotmail
```bash
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
SMTP_SECURE="false"
```

#### SendGrid
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_SECURE="false"
```

---

## 🔒 Security Considerations

### Production Security Checklist

- [ ] **Change default passwords**
  - Admin account password
  - Database passwords
  - Redis password
  - Session secret

- [ ] **Enable HTTPS**
  - SSL certificates
  - Redirect HTTP to HTTPS
  - Secure cookie settings

- [ ] **Database Security**
  - Use strong passwords
  - Limit database access
  - Regular backups
  - Connection encryption

- [ ] **Application Security**
  - Update dependencies regularly
  - Enable rate limiting
  - Configure CORS properly
  - Validate file uploads

- [ ] **Server Security**
  - Use non-root user
  - Configure firewall
  - Regular security updates
  - Monitor logs

### SSL Configuration

1. **Obtain SSL Certificate:**
```bash
# Using Let's Encrypt
sudo certbot certonly --webroot -w /var/www/html -d yourdomain.com

# Using custom certificate
# Place cert.pem and key.pem in ssl directory
```

2. **Update Docker Compose:**
```yaml
nginx:
  volumes:
    - ./ssl:/etc/nginx/ssl
  ports:
    - "443:443"
```

3. **Update Nginx Configuration:**
```nginx
listen 443 ssl http2;
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

---

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U phishnet_user -d phishnet

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### Port Already in Use
```bash
# Find process using port 3001
sudo lsof -i :3001
sudo netstat -tulpn | grep :3001

# Kill process
sudo kill -9 <PID>
```

#### Permission Denied
```bash
# Fix upload directory permissions
sudo chown -R $USER:$USER uploads/
chmod 755 uploads/

# Fix script permissions
chmod +x scripts/*.sh
```

#### Docker Issues
```bash
# Check Docker daemon
sudo systemctl status docker

# View container logs
docker-compose logs app

# Restart containers
docker-compose restart

# Clean up containers
docker-compose down --volumes
docker system prune -a
```

### Log Locations

- **Application logs:** `logs/phishnet.log`
- **Nginx logs:** `/var/log/nginx/`
- **PostgreSQL logs:** `/var/log/postgresql/`
- **Docker logs:** `docker-compose logs`

---

## 🛠️ Maintenance

### Regular Maintenance Tasks

#### Daily
- Monitor application logs
- Check disk space usage
- Verify backup completion

#### Weekly
- Update dependencies
- Review security logs
- Clean temporary files

#### Monthly
- Database maintenance
- Security updates
- Performance review

### Backup Procedures

#### Database Backup
```bash
# PostgreSQL backup
pg_dump -h localhost -U phishnet_user phishnet > backup_$(date +%Y%m%d).sql

# Docker database backup
docker-compose exec database pg_dump -U phishnet_user phishnet > backup.sql
```

#### File Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Full application backup
tar -czf phishnet_backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  .
```

#### Automated Backup Script
```bash
#!/bin/bash
# Add to crontab: 0 2 * * * /path/to/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
pg_dump -h localhost -U phishnet_user phishnet > "$BACKUP_DIR/db_$DATE.sql"

# Files backup
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" uploads/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

### Update Procedures

#### Application Update
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Rebuild application
npm run build

# Restart services
docker-compose restart app
# or
sudo systemctl restart phishnet
```

#### Database Migration
```bash
# Backup current database
pg_dump phishnet > backup_before_migration.sql

# Run new migrations
npm run db:migrate

# Verify migration
npm run db:status
```

---

## 📞 Support

### Default Admin Account
- **Email:** `admin@phishnet.local`
- **Password:** `admin123`
- **Organization:** `PhishNet Admin`

**⚠️ Important:** Change the default admin password immediately after first login!

### Application URLs
- **Main Application:** `http://localhost`
- **Admin Panel:** `http://localhost/admin`
- **API Documentation:** `http://localhost/api/docs`
- **Health Check:** `http://localhost/health`

### Getting Help
1. Check the logs for error messages
2. Review the troubleshooting section
3. Verify environment configuration
4. Check network connectivity
5. Restart services if needed

---

**Last Updated:** July 25, 2025  
**Documentation Version:** 1.0
