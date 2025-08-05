# 🎣 PhishNet - Advanced Phishing Simulation Platform

<div align="center">

[![Node.js](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D15-blue)](https://www.postgresql.org/)

**🚀 One-Command Setup** • **🔒 Enterprise Grade** • **🐳 Docker Ready**

</div>

---

## 🌟 Overview

PhishNet is a professional phishing simulation platform designed for cybersecurity training and awareness. Features advanced templates, real-time analytics, and enterprise-grade security.

### ✨ Key Features
- 🎣 **Advanced Phishing Campaigns** with professional templates
- 📊 **Real-Time Analytics** and detailed reporting
- 🏢 **Multi-Tenant Support** for organizations
- 🔒 **Role-Based Access Control** and security features
- 🐳 **Docker Support** for easy deployment

---

## ⚡ Quick Setup

### 🚀 One-Command Deployment

#### Linux/macOS:
```bash
git clone https://github.com/gh0st-bit/PhishNet.git
cd PhishNet/phisnet
./deploy.sh
```

#### Windows PowerShell:
```powershell
git clone https://github.com/gh0st-bit/PhishNet.git
cd PhishNet\phisnet
.\deploy.ps1
```

#### Docker:
```bash
git clone https://github.com/gh0st-bit/PhishNet.git
cd PhishNet/phisnet
docker-compose up -d
```

---

## 🔑 Default Access

- **URL:** `http://localhost:3000`
- **Email:** `admin@phishnet.local`
- **Password:** `admin123`

**⚠️ Change the default password immediately after first login!**

---

## 🛠️ Manual Setup (If Needed)

If automatic deployment fails, you can set up manually:

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis
- Git

### Setup Steps
```bash
# 1. Clone repository
git clone https://github.com/gh0st-bit/PhishNet.git
cd PhishNet/phisnet

# 2. Install dependencies
npm install

# 3. Setup database
sudo -u postgres createdb phishnet

# 4. Configure environment
cp .env.example .env
# Edit .env with your database settings

# 5. Setup database schema
npm run db:push

# 6. Import sample data
npm run import-data

# 7. Start application
npm run dev
```

---

## 📦 Package for Friends

Create a complete package with your data for easy sharing:

```bash
./create-package.sh
```

This creates a package containing:
- Complete PhishNet source code
- Your database with campaigns and templates
- Automated setup scripts
- All configuration files

---

## 🐳 Docker Deployment

### Quick Start
```bash
docker-compose up -d
```

### Available Services
- **PhishNet App:** `http://localhost:3000`
- **PostgreSQL:** `localhost:5432`
- **Redis:** `localhost:6379`

---

## �️ Supported Platforms

### Automatically Detected:
- 🐉 **Kali Linux** (with auto-fixes)
- 🐧 **Ubuntu/Debian**
- 🎩 **CentOS/RHEL/Rocky**
- 🎁 **Fedora**
- ⚡ **Arch/Manjaro**
- 🪟 **Windows 10/11**
- 🍎 **macOS (Intel/ARM)**

### Database Configuration
- Uses `postgres` user with `phishnet` database
- No custom passwords required for local development
- Production-ready configuration included

---

## 📚 Quick Commands

```bash
# Start development server
./start.sh              # Linux/macOS
.\start.ps1             # Windows

# Deploy production
./deploy.sh --production

# Reset database
./reset-db.sh

# Create shareable package
./create-package.sh

# Fix Kali Linux issues
./kali-quick-fix.sh
```

---

## 🎯 Architecture

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Cache:** Redis for sessions
- **Deployment:** Docker + universal scripts

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ for the cybersecurity community**

[Report Issues](https://github.com/gh0st-bit/PhishNet/issues) • [Documentation](./docs/) • [Support](mailto:support@phishnet.local)

</div>
