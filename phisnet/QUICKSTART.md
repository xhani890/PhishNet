# ⚡ PhishNet Quick Start Guide
## Get Up and Running in 5 Minutes

**Perfect for:** Demo, Testing, Development  
**Time Required:** 5-10 minutes  
**Difficulty:** Beginner

---

## 🎯 Choose Your Setup Method

### � Kali Linux (Special Instructions)

If you're using Kali Linux, PostgreSQL might need special configuration:

```bash
# 1. Clone the repository  
git clone https://github.com/gh0st-bit/PhishNet.git
cd PhishNet/phisnet

# 2. Fix PostgreSQL issues first (Kali Linux specific)
chmod +x scripts/fix-postgresql-kali.sh
./scripts/fix-postgresql-kali.sh

# 3. Run main setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**🔐 Database Credentials:** `phishnet_user` / `kali` (password will be displayed during setup)

### �🐳 Option 1: Docker (Recommended)
**Best for:** Production, Testing, Easy Setup

```bash
git clone https://github.com/gh0st-bit/PhishNet.git
cd PhishNet/phisnet
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

### ⚙️ Option 2: Manual Setup  
**Best for:** Development, Custom Configuration

```bash
git clone https://github.com/gh0st-bit/PhishNet.git
cd PhishNet/phisnet
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 🪟 Option 3: Windows
**For Windows PowerShell:**

```powershell
git clone https://github.com/gh0st-bit/PhishNet.git
cd PhishNet\phisnet
.\scripts\docker-setup.ps1
```

---

## 🚀 What Happens During Setup

### Automated Setup Process:
1. ✅ **System Check** - Verifies requirements
2. ✅ **Database Setup** - Creates PostgreSQL database with sample data
3. ✅ **Dependencies** - Installs all required packages
4. ✅ **Configuration** - Generates secure environment settings
5. ✅ **Application Build** - Compiles and optimizes the application
6. ✅ **Service Start** - Launches all services with health checks

### Sample Data Included:
- **3 Organizations:** Corporate, Education, Healthcare
- **7 User Accounts:** Various roles (admin, manager, user)
- **4 Email Templates:** Professional phishing templates
- **2 Landing Pages:** Credential harvesting pages
- **Admin Access:** Ready-to-use administrative accounts

---

## 🔐 Default Access Credentials

### Main Admin Account
- **URL:** `http://localhost`
- **Email:** `admin@phishnet.local`
- **Password:** `admin123`
- **Role:** Super Administrator

### Sample Organization Accounts

#### Corporate Organization
- **Admin:** `corp.admin@corporate.example.com` / `admin123`
- **Manager:** `security.manager@corporate.example.com` / `manager123`
- **User:** `john.doe@corporate.example.com` / `user123`

#### Education Organization  
- **Admin:** `it.admin@university.edu` / `admin123`
- **User:** `jane.smith@university.edu` / `user123`

#### Healthcare Organization
- **Admin:** `security@hospital.org` / `admin123`
- **User:** `mike.johnson@hospital.org` / `user123`

**⚠️ IMPORTANT:** Change all default passwords immediately after first login!

---

## 🎯 First Steps After Installation

### 1. Access the Application (2 minutes)
```bash
# Open your browser and navigate to:
http://localhost

# Login with default admin credentials
# Email: admin@phishnet.local
# Password: admin123
```

### 2. Change Admin Password (1 minute)
1. Click your profile icon (top right)
2. Select "Account Settings"  
3. Change password to something secure
4. Save changes

### 3. Configure Email Settings (2 minutes)
1. Go to **Settings** → **Email Configuration**
2. Enter your SMTP details:
   ```
   SMTP Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: your-app-password
   ```
3. Click **Test Connection**
4. Save settings

### 4. Test the System (3 minutes)
1. Navigate to **Campaigns** → **Create Campaign**
2. Select a template (e.g., "Business Email Compromise")
3. Add your email as a test target
4. Set to send immediately
5. Launch campaign and check your email

### 5. Explore Sample Data (5 minutes)
- **Dashboard:** View analytics and metrics
- **Organizations:** See sample corporate, education, healthcare setups
- **Users:** Browse different user roles and permissions
- **Templates:** Explore pre-built phishing templates
- **Reports:** Check sample campaign results

---

## 🛠️ Quick Commands Reference

### Docker Management
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Start services
docker-compose up -d

# Update application
git pull && docker-compose up -d --build
```

### Manual Installation
```bash
# Start application
npm start

# Development mode (hot reload)
npm run dev

# View logs
npm run logs

# Run tests
npm test

# Build for production
npm run build
```

### Health Checks
```bash
# Application health
curl http://localhost/health

# Database health
curl http://localhost/api/health/database

# Full system status
curl http://localhost/api/health/all
```

---

## 📊 Quick Demo Scenarios

### Scenario 1: Basic Phishing Test (5 minutes)
1. **Login** as admin
2. **Create Campaign:**
   - Template: "Password Reset Request"
   - Target: Your email address
   - Schedule: Send immediately
3. **Launch** and check your inbox
4. **Click** the phishing link (safe in test mode)
5. **View Results** in the dashboard

### Scenario 2: Multi-User Organization (10 minutes)
1. **Switch** to Corporate organization
2. **Login** as security manager
3. **Create Training Campaign:**
   - Select multiple users
   - Use "Fake Invoice" template
   - Schedule for next hour
4. **Monitor** user interactions
5. **Generate** compliance report

### Scenario 3: Landing Page Test (5 minutes)
1. **Go to** Landing Pages section
2. **Select** "Office 365 Login" template
3. **Customize** with your organization branding
4. **Test** the credential capture functionality
5. **Review** captured data (safely stored)

---

## 🔍 Verification Checklist

After setup, verify these components are working:

### ✅ Core System
- [ ] Application loads at `http://localhost`
- [ ] Admin login successful
- [ ] Dashboard displays sample data
- [ ] Navigation works across all sections

### ✅ Database Integration
- [ ] User accounts visible in Users section
- [ ] Organizations display with sample data
- [ ] Campaign history shows sample campaigns
- [ ] Reports generate successfully

### ✅ Email System
- [ ] SMTP settings save successfully
- [ ] Test email sends without errors
- [ ] Email templates load correctly
- [ ] Campaign emails deliver to targets

### ✅ Security Features
- [ ] Password change works
- [ ] User roles enforce permissions
- [ ] Session timeout functions
- [ ] Audit logs record activities

---

## 🚨 Troubleshooting Quick Fixes

### Kali Linux PostgreSQL Issues

If you see errors like:
- `collation version mismatch`
- `password authentication failed`
- `database "phishnet" does not exist`

**🔧 Quick Fix:**
```bash
# Run the PostgreSQL fix script first
chmod +x scripts/fix-postgresql-kali.sh
./scripts/fix-postgresql-kali.sh

# Then run main setup
./scripts/setup.sh
```

### Wrong Directory Error
```bash
# If you see: cd: no such file or directory: PhishNet/phisnet
# You're already in the right directory, just run:
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Application Won't Load
```bash
# Check if services are running
docker-compose ps
# or
ps aux | grep node

# Check logs for errors
docker-compose logs app
# or
tail -f logs/phishnet.log
```

### Database Connection Failed
```bash
# Test database connection
docker-compose exec database psql -U phishnet_user -d phishnet
# or
psql -h localhost -U phishnet_user -d phishnet

# Restart database
docker-compose restart database
```

### Email Not Sending
1. **Check SMTP settings** in Settings → Email Configuration
2. **For Gmail:** Use app-specific password
3. **Test connection** with the built-in test feature
4. **Check logs** for specific error messages

### Port Already in Use
```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill the process
sudo kill -9 <PID>

# Or use different port in .env
PORT=3002
```

---

## 🎓 Next Steps

### For Development
1. **Read** [INSTALLATION.md](./INSTALLATION.md) for detailed setup
2. **Explore** the API documentation
3. **Check out** the development guidelines
4. **Run** the test suite: `npm test`

### For Production
1. **Review** [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
2. **Configure** SSL certificates
3. **Set up** automated backups
4. **Configure** monitoring and alerting

### For Learning
1. **Complete** all demo scenarios
2. **Create** your own phishing templates
3. **Test** different attack vectors
4. **Generate** various reports

---

## 📚 Additional Resources

### Documentation
- 📖 [README.md](./README.md) - Complete project overview
- 🔧 [INSTALLATION.md](./INSTALLATION.md) - Detailed installation guide
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- 📊 [User Guide](./docs/user-guide/) - End-user documentation

### Sample Data Details
- **Organizations:** Pre-configured with realistic settings
- **Users:** Various roles with appropriate permissions
- **Templates:** Industry-standard phishing scenarios
- **Campaigns:** Example phishing test results

### Support
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/gh0st-bit/PhishNet/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/gh0st-bit/PhishNet/discussions)
- 📧 **Support:** support@phishnet.com

---

## ⏱️ Time Estimates

| Task | Time Required |
|------|---------------|
| **Docker Setup** | 5-10 minutes |
| **Manual Setup** | 10-15 minutes |
| **First Login & Password Change** | 2 minutes |
| **Email Configuration** | 3-5 minutes |
| **First Phishing Test** | 5 minutes |
| **Explore Sample Data** | 10 minutes |
| **Total Getting Started** | 25-40 minutes |

---

## 🎉 You're Ready!

Congratulations! You now have a fully functional PhishNet installation with:

- ✅ **Complete phishing simulation platform**
- ✅ **Sample data for immediate testing**
- ✅ **Multiple user accounts and organizations**
- ✅ **Professional email templates**
- ✅ **Analytics and reporting dashboards**
- ✅ **Security best practices implemented**

**Happy Phishing! 🎣**

---

*Need help? Check our [troubleshooting guide](./INSTALLATION.md#troubleshooting) or [open an issue](https://github.com/gh0st-bit/PhishNet/issues).*
