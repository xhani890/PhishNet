# 📦 PhishNet Package Deployment Guide
## For Friend's Computer Setup

This guide helps your friend deploy the PhishNet package you've created on their computer.

---

## 📋 What You Need to Send Your Friend

### 1. Package Files
Send these files to your friend:
- `PhishNet-Package-20250805-180238.zip` (or similar name)
- This deployment guide

### 2. System Requirements
Your friend's computer needs:
- **Windows 10/11** (preferred) or **Linux/macOS**
- **Internet connection** for downloading dependencies
- **Administrator privileges** (for installing software)

---

## 🚀 Step-by-Step Deployment Instructions

### For Windows Users (Recommended)

#### Step 1: Extract the Package
1. Download the `PhishNet-Package-XXXXXX.zip` file
2. Extract it to a folder like `C:\PhishNet\`
3. Open **PowerShell as Administrator**:
   - Press `Windows + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

#### Step 2: Navigate to PhishNet Directory
```powershell
cd C:\PhishNet  # (or wherever you extracted it)
```

#### Step 3: Run Automated Deployment
```powershell
# Option 1: Use PowerShell script (Recommended)
.\deploy.ps1

# Option 2: Use Batch file (Alternative)
deploy.bat
```

The script will automatically:
- Install Node.js, PostgreSQL, Redis, Git
- Set up the database
- Import your data
- Configure the environment

#### Step 4: Start PhishNet
```powershell
.\start.ps1
```

### For Linux/macOS Users

#### Step 1: Extract and Navigate
```bash
unzip PhishNet-Package-XXXXXX.zip
cd PhishNet-Package-XXXXXX
```

#### Step 2: Run Deployment
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Step 3: Start PhishNet
```bash
./start.sh
```

---

## 🌐 Accessing PhishNet

Once deployed, your friend can access PhishNet at:
- **URL**: http://localhost:3000
- **Email**: admin@phishnet.local
- **Password**: admin123

---

## 🔧 If Something Goes Wrong

### Common Issues and Solutions

#### 1. "PowerShell execution policy" error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 2. "Port 3000 already in use"
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000
# Kill the process (replace PID with actual number)
taskkill /PID 1234 /F
```

#### 3. Database connection issues
```powershell
# Restart PostgreSQL service
Restart-Service postgresql*
```

#### 4. Missing dependencies
```powershell
# Re-run deployment to install missing items
.\deploy.ps1
```

### Test the Deployment
```powershell
# Run the test script to check everything
.\test-deployment.ps1
```

---

---

## 🎯 What Your Friend Gets

After successful deployment:

### ✅ Complete PhishNet Platform
- **Phishing Campaign Management**
- **Email Templates** (all your custom templates)
- **User Management System**
- **Analytics Dashboard**
- **Reporting Tools**

### ✅ Your Data Included
- **Database**: All your campaigns, users, and results
- **Templates**: All email templates you created
- **Uploads**: Any files you uploaded
- **Configuration**: All your settings

### ✅ All Credentials
- **Admin Login**: admin@phishnet.local / admin123
- **Database**: postgres / postgres
- **All your custom users and their data**

---

## 🔒 Security Notes

### For Your Friend:
1. **Change default passwords** after first login
2. **Update admin email** to their own
3. **Review user accounts** and remove/modify as needed
4. **Backup the database** regularly

### Important:
- This package contains **all your data**
- Your friend will have access to **all campaigns and results**
- Consider this when sharing sensitive information

---

## 🆘 Getting Help

### If your friend needs help:

#### 1. Check the logs
```powershell
# Look for error messages in:
Get-Content logs\error.log
```

#### 2. Restart services
```powershell
# Restart everything
.\deploy.ps1
.\start.ps1
```

#### 3. Contact Information
- **Your contact**: [Add your contact info here]
- **Documentation**: Check the `docs/` folder in the package
- **Troubleshooting**: See `WINDOWS-SETUP.md` for detailed Windows guide

---

## 🎉 Success Indicators

Your friend knows deployment worked when:
1. ✅ No error messages during deployment
2. ✅ Can access http://localhost:3000
3. ✅ Can login with admin@phishnet.local / admin123
4. ✅ Can see your campaigns and data
5. ✅ All features work (send test emails, view reports, etc.)

---

## 📞 Quick Reference Commands

### Windows PowerShell
```powershell
# Deploy
.\deploy.ps1

# Start
.\start.ps1

# Test
.\test-deployment.ps1

# Stop (Ctrl+C in the terminal)
```

### Batch Files (Alternative)
```cmd
deploy.bat    # Deploy
start.bat     # Start
```


---

**🎯 Ready to share! Send this guide along with your package file to your friend.**
