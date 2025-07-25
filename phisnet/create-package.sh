#!/bin/bash

# PhishNet Complete Package Creator
# This script creates a production-ready package with all fixes and deployment tools

set -e

echo "📦 Creating PhishNet Complete Deployment Package..."

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo "❌ package.json not found. Please run from PhishNet root directory."
    exit 1
fi

# Create package directory
PACKAGE_DIR="phishnet-complete-package"
mkdir -p "$PACKAGE_DIR"

echo "📁 Created package directory: $PACKAGE_DIR"

# Copy all necessary files
echo "📋 Copying project files..."
rsync -av --exclude="node_modules" --exclude=".git" --exclude="dist" --exclude="*.log" . "$PACKAGE_DIR/"

# Create additional deployment files in package
cd "$PACKAGE_DIR"

# Create quick start script
cat > quick-start.sh << 'EOF'
#!/bin/bash
# PhishNet Quick Start Script

echo "🚀 Starting PhishNet Quick Setup..."

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh

echo "✅ Quick setup completed!"
echo "🌐 Access PhishNet at: http://localhost:3000"
echo "📧 Default admin: admin@yourcompany.com / AdminPassword123!"
echo "⚠️  Remember to change default passwords!"
EOF

chmod +x quick-start.sh

# Create Windows quick start
cat > quick-start.ps1 << 'EOF'
# PhishNet Windows Quick Start Script

Write-Host "🚀 Starting PhishNet Quick Setup..." -ForegroundColor Green

# Check execution policy
$policy = Get-ExecutionPolicy
if ($policy -eq "Restricted") {
    Write-Host "Setting execution policy..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
}

# Run deployment
.\deploy.ps1

Write-Host "✅ Quick setup completed!" -ForegroundColor Green
Write-Host "🌐 Access PhishNet at: http://localhost:3000" -ForegroundColor Blue
Write-Host "📧 Default admin: admin@yourcompany.com / AdminPassword123!" -ForegroundColor Blue
Write-Host "⚠️  Remember to change default passwords!" -ForegroundColor Yellow
EOF

# Create Docker Compose file
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://phishnet_user:secure_password_123@postgres:5432/phishnet_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=phishnet_db
      - POSTGRES_USER=phishnet_user
      - POSTGRES_PASSWORD=secure_password_123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./attached_assets/database.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Create necessary directories
RUN mkdir -p logs uploads backups

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/status || exit 1

# Start application
CMD ["npm", "start"]
EOF

# Create nginx configuration
mkdir -p nginx
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name localhost;

        client_max_body_size 10M;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF

# Create systemd service template
cat > phishnet.service << 'EOF'
[Unit]
Description=PhishNet Application
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=phishnet
Group=phishnet
WorkingDirectory=/opt/phishnet
Environment=NODE_ENV=production
EnvironmentFile=/opt/phishnet/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Create maintenance scripts
mkdir -p scripts

cat > scripts/backup.sh << 'EOF'
#!/bin/bash
# Automated backup script

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="phishnet_db"
DB_USER="phishnet_user"

mkdir -p "$BACKUP_DIR"

echo "Creating backup: $DATE"

# Backup database
pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" uploads/

# Backup configuration
cp .env "$BACKUP_DIR/env_backup_$DATE"

# Cleanup old backups (keep last 30 days)
find "$BACKUP_DIR" -name "*backup*" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

cat > scripts/restore.sh << 'EOF'
#!/bin/bash
# Restore from backup script

if [[ $# -ne 1 ]]; then
    echo "Usage: $0 <backup_date>"
    echo "Example: $0 20240125_143022"
    exit 1
fi

BACKUP_DATE="$1"
BACKUP_DIR="./backups"
DB_NAME="phishnet_db"
DB_USER="phishnet_user"

echo "Restoring from backup: $BACKUP_DATE"

# Restore database
if [[ -f "$BACKUP_DIR/db_backup_$BACKUP_DATE.sql" ]]; then
    psql -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_DIR/db_backup_$BACKUP_DATE.sql"
    echo "Database restored"
else
    echo "Database backup not found: $BACKUP_DIR/db_backup_$BACKUP_DATE.sql"
fi

# Restore uploads
if [[ -f "$BACKUP_DIR/uploads_backup_$BACKUP_DATE.tar.gz" ]]; then
    tar -xzf "$BACKUP_DIR/uploads_backup_$BACKUP_DATE.tar.gz"
    echo "Uploads restored"
fi

echo "Restore completed"
EOF

cat > scripts/update.sh << 'EOF'
#!/bin/bash
# Update script

echo "Updating PhishNet..."

# Stop services
pm2 stop phishnet || true

# Backup current version
./scripts/backup.sh

# Pull updates (if using git)
git pull || echo "Not a git repository"

# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Build application
npm run build

# Restart services
pm2 start ecosystem.config.js

echo "Update completed"
EOF

chmod +x scripts/*.sh

# Create monitoring script
cat > scripts/monitor.sh << 'EOF'
#!/bin/bash
# Monitoring script

echo "PhishNet System Status"
echo "====================="

# Check application status
if pgrep -f "node.*phishnet" > /dev/null; then
    echo "✅ Application: Running"
else
    echo "❌ Application: Not running"
fi

# Check database
if pg_isready -h localhost -p 5432 > /dev/null; then
    echo "✅ PostgreSQL: Running"
else
    echo "❌ PostgreSQL: Not running"
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Running"
else
    echo "❌ Redis: Not running"
fi

# Check disk space
echo ""
echo "Disk Usage:"
df -h | grep -E '/$|/opt|/var'

# Check logs for errors
echo ""
echo "Recent errors:"
tail -n 5 logs/err.log 2>/dev/null || echo "No error log found"
EOF

chmod +x scripts/monitor.sh

cd ..

# Create package archive
echo "📦 Creating archive..."
tar -czf "phishnet-complete-$(date +%Y%m%d).tar.gz" "$PACKAGE_DIR"

echo "✅ Package created successfully!"
echo ""
echo "📦 Package contents:"
echo "   - Complete PhishNet application"
echo "   - Automated deployment scripts (Linux/Windows)"
echo "   - Docker configuration"
echo "   - Environment template"
echo "   - Runtime error detection system"
echo "   - Backup and monitoring scripts"
echo "   - Complete documentation"
echo ""
echo "🚀 To deploy:"
echo "   1. Extract: tar -xzf phishnet-complete-$(date +%Y%m%d).tar.gz"
echo "   2. Enter directory: cd $PACKAGE_DIR"
echo "   3. Run setup:"
echo "      Linux/macOS: ./quick-start.sh"
echo "      Windows: .\\quick-start.ps1"
echo "      Docker: docker-compose up -d"
echo ""
echo "📋 Package location: $(pwd)/phishnet-complete-$(date +%Y%m%d).tar.gz"
