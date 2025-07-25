# 🔧 Kali Linux PostgreSQL Setup Fix

If you're experiencing PostgreSQL issues in Kali Linux, this guide will help you resolve them quickly.

## 🚨 Common Issues in Kali Linux

1. **Collation version warnings**
2. **Database authentication failures**
3. **Connection refused errors**
4. **Template database issues**

## ⚡ Quick Fix (Recommended)

Run our automated fix script:

```bash
# Navigate to project directory
cd PhishNet/phisnet

# Make fix script executable
chmod +x scripts/fix-postgresql-kali.sh

# Run the fix script
./scripts/fix-postgresql-kali.sh
```

This script will:
- ✅ Fix collation version warnings
- ✅ Configure authentication properly
- ✅ Create database and user with correct permissions
- ✅ Test the connection
- ✅ Apply database schema (if files exist)

## 🔐 Default Credentials

The fix script uses these standardized credentials:

- **Database:** `phishnet`
- **Username:** `phishnet_user`
- **Password:** `kali`
- **Host:** `localhost`
- **Port:** `5432`

## 🛠️ Manual Fix Steps

If you prefer to fix manually:

### Step 1: Start PostgreSQL
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Fix Collation Warnings
```bash
sudo -u postgres psql -c "ALTER DATABASE template1 REFRESH COLLATION VERSION;"
sudo -u postgres psql -c "ALTER DATABASE postgres REFRESH COLLATION VERSION;"
```

### Step 3: Create Database and User
```bash
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS phishnet;
DROP USER IF EXISTS phishnet_user;
CREATE USER phishnet_user WITH PASSWORD 'kali';
CREATE DATABASE phishnet OWNER phishnet_user;
GRANT ALL PRIVILEGES ON DATABASE phishnet TO phishnet_user;
ALTER USER phishnet_user CREATEDB;
\q
EOF
```

### Step 4: Configure Authentication
```bash
# Find PostgreSQL version
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oE '[0-9]+\.[0-9]+' | head -1)

# Edit pg_hba.conf
sudo nano /etc/postgresql/$PG_VERSION/main/pg_hba.conf

# Change this line:
# local   all             all                                     peer
# To:
# local   all             all                                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Step 5: Test Connection
```bash
PGPASSWORD='kali' psql -h localhost -U phishnet_user -d phishnet -c "SELECT 'Success!' as status;"
```

## 🚀 After Fix - Run Setup

Once PostgreSQL is fixed, run the main setup:

```bash
# Run main setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## 🔍 Verification

Test that everything works:

```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Test database connection
PGPASSWORD='kali' psql -h localhost -U phishnet_user -d phishnet

# Check if tables exist
PGPASSWORD='kali' psql -h localhost -U phishnet_user -d phishnet -c "\dt"
```

## 🆘 Still Having Issues?

### Check PostgreSQL Logs
```bash
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Common Solutions

#### Port 5432 Already in Use
```bash
sudo lsof -i :5432
sudo kill -9 <PID>
sudo systemctl restart postgresql
```

#### Permission Denied
```bash
sudo chown -R postgres:postgres /var/lib/postgresql/
sudo systemctl restart postgresql
```

#### Service Won't Start
```bash
sudo systemctl stop postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql
```

## ✅ Success Indicators

You'll know it's working when:
- ✅ PostgreSQL service is active
- ✅ Database connection succeeds
- ✅ No collation warnings
- ✅ Tables are created in phishnet database
- ✅ Application starts without database errors

## 📞 Need Help?

If you're still having issues:
1. Run the fix script with verbose output
2. Check the error messages carefully
3. Ensure you're in the correct directory (`PhishNet/phisnet`)
4. Verify PostgreSQL is installed: `psql --version`

The fix script is designed specifically for Kali Linux PostgreSQL issues and should resolve most common problems automatically.
