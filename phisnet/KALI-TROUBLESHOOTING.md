# 🐉 Kali Linux Deployment Troubleshooting

## 🚨 **Common Kali Issues & Fixes**

### **1. Legacy Container Issues (Removed)**
Container tooling was removed. Use native deployment via `./deploy.sh` and system services (PostgreSQL, Redis, Node.js). Optional cleanup: remove any old container packages if still installed.

### **2. Database Configuration Missing**
**Problem:** `Database configuration missing. Check your .env file.`

**Solution:**
```bash
# Verify .env file exists and has correct content
cat .env

# If missing, create manually:
cat > .env << EOF
DATABASE_URL=postgresql://phishnet_user:phishnet_password@localhost:5432/phishnet_db
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
SESSION_SECRET=dev-secret-key-change-in-production
APP_URL=http://localhost:3000
EOF
```

### **3. Directory Nesting Issue**
**Problem:** Cloning creates nested directories (`PhishNet/phisnet/PhishNet/phisnet`)

**Solution:**
```bash
# Clone and navigate properly:
git clone https://github.com/gh0st-bit/PhishNet.git
cd PhishNet/phisnet  # Go to the correct directory
./deploy.sh
```

### **4. PostgreSQL Password Prompts**
**Problem:** Script keeps asking for postgres password

**Solution:**
```bash
# Set postgres user password first:
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# OR run deployment with auto-password:
export PGPASSWORD=postgres
./deploy.sh
```

### **5. Redis Service Not Starting**
**Problem:** Redis service fails to start on Kali

**Solution:**
```bash
# Kali uses different Redis service names:
sudo systemctl start redis-server
sudo systemctl enable redis-server

# OR:
sudo systemctl start redis
sudo systemctl enable redis
```

## 🔧 **Quick Fix Commands for Kali**

### **Complete Kali Setup (Native Only):**
```bash
# 1. Clone repository
git clone https://github.com/gh0st-bit/PhishNet.git
cd PhishNet/phisnet

# 2. Fix permissions
chmod +x deploy.sh

# 3. Run deployment
./deploy.sh
# 4. If database issues, manually verify:
cat .env
sudo systemctl status postgresql redis-server
```

### **Manual Service Start:**
```bash
# Start all required services:
sudo systemctl start postgresql redis-server
sudo systemctl enable postgresql redis-server

# Verify services:
sudo systemctl status postgresql redis-server
```

### **Database Manual Setup:**
```bash
# If database setup fails:
sudo -u postgres createuser -P phishnet_user  # Enter: phishnet_password
sudo -u postgres createdb -O phishnet_user phishnet_db
```

## Legacy Container Stack (Removed)
Former container-based workflow was deprecated. Ensure only native services run.

## 🎯 **Testing Fixes**

### **Verify Everything Works:**
```bash
sudo systemctl status postgresql redis-server

# Check database connection:
PGPASSWORD=phishnet_password psql -h localhost -U phishnet_user -d phishnet_db -c "SELECT 1;"

# Check Redis:
redis-cli ping

# Check Node.js:
node --version
npm --version
```

### **Start PhishNet:**
```bash
# After successful deployment:
cd PhishNet/phisnet
npm start
# OR
npx tsx server/index.ts
```

## 🆘 **If All Else Fails**

### **Clean Installation:**
```bash
# Remove and reinstall everything:
sudo apt-get remove -y postgresql redis-server nodejs npm
sudo apt-get autoremove -y
sudo apt-get update

# Run deployment again:
./deploy.sh
```

### **Manual Dependencies:**
```bash
# Install manually:
sudo apt-get update
sudo apt-get install -y curl wget git build-essential
sudo apt-get install -y postgresql postgresql-contrib
sudo apt-get install -y redis-server
sudo apt-get install -y nodejs npm
```

## 📞 **Get Help**

If issues persist:
1. Check the deployment logs carefully
2. Verify each service status individually
3. Ensure you're in the correct directory (`PhishNet/phisnet`)
4. Try the manual installation steps above

**Success Indicators:**
- ✅ All services show "active (running)" status
- ✅ Database connection test passes
- ✅ .env file exists with correct content
- ✅ PhishNet starts without errors on http://localhost:3000
