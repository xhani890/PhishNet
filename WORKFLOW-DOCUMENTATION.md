# 📚 PhishNet GitHub Actions Workflows Documentation

## 🎯 Overview
This document provides comprehensive details about all GitHub Actions workflows implemented in the PhishNet cybersecurity platform, including their purposes, triggers, actions, and optimizations for GitHub free tier usage.

---

## 🔥 Core Development Workflows

### 1. 🚀 CI Pipeline (`ci.yml`)
**Purpose**: Continuous Integration for code quality and basic testing
- **Triggers**: 
  - Push to `main` or `develop` branches (only when `phisnet/**` files change)
  - Pull requests to `main` (only when `phisnet/**` files change)
  - Manual trigger (`workflow_dispatch`)
- **Actions**:
  - Install dependencies with npm ci
  - Run TypeScript compilation check
  - Execute unit tests with Jest
  - Generate test coverage reports
- **Runtime**: ~3-5 minutes
- **Frequency**: Only on code changes (optimized with path filters)

### 2. 🛡️ Quality Gates Pipeline (`enhanced-quality-gates.yml`)
**Purpose**: Comprehensive code quality assessment and gates
- **Triggers**: 
  - Pull requests to `main` only (when `phisnet/**` files change)
  - Manual trigger
- **Actions**:
  - Code quality analysis with ESLint
  - Security scanning with CodeQL
  - Performance analysis
  - Dependency vulnerability checks
  - Quality gate evaluation (requires 3/4 gates to pass)
- **Runtime**: ~8-12 minutes
- **Frequency**: Only on PRs to main (significantly reduced from all pushes)

### 3. 🏗️ Multi-Stage Build Pipeline (`multi-stage-build-pipeline.yml`)
**Purpose**: Advanced build process with staging verification
- **Triggers**: 
  - Manual trigger only (`workflow_dispatch`)
  - Options: staging or production build target
- **Actions**:
  - Stage 1: Client application build (Vite)
  - Stage 2: Server application build verification (esbuild)
  - Build artifact validation
- **Runtime**: ~6-8 minutes
- **Frequency**: Manual only (saves ~400 minutes/month)

---

## 🔒 Security & Compliance Workflows

### 4. 🛡️ Security Scanning & Compliance (`security-scanning.yml`)
**Purpose**: Comprehensive security analysis and vulnerability detection
- **Triggers**: 
  - Pull requests to `main` (when `phisnet/**` files change)
  - Weekly schedule (Sundays at 2 AM UTC)
  - Manual trigger with scan type options
- **Actions**:
  - Dependency security audit with npm audit
  - Code security analysis with CodeQL
  - Container security scanning
  - Secret detection with TruffleHog
  - SAST/DAST security tests
- **Runtime**: ~15-20 minutes
- **Frequency**: Weekly + PRs only (reduced from daily)

### 5. 🔐 Zero Trust CI/CD (`zero-trust-ci.yml`)
**Purpose**: Zero Trust security model implementation
- **Triggers**: 
  - Pull requests only
  - Manual trigger
- **Actions**:
  - Access control verification
  - Multi-tenancy isolation testing
  - Security policy validation
  - Audit trail generation
- **Runtime**: ~5-7 minutes
- **Frequency**: PR-based only

### 6. 📋 Compliance Monitoring (`compliance-monitoring.yml`)
**Purpose**: Regulatory compliance checking and reporting
- **Triggers**: 
  - Monthly schedule (1st of month at 6 AM UTC)
  - Manual trigger with compliance type options
- **Actions**:
  - GDPR compliance verification
  - Security framework alignment (NIST, ISO 27001)
  - Data protection audit
  - Accessibility compliance check
- **Runtime**: ~10-15 minutes
- **Frequency**: Monthly only (reduced from weekly)

---

## 🚀 Deployment & Operations Workflows

### 7. 🚢 Deployment Automation (`deployment-automation.yml`)
**Purpose**: Automated deployment pipeline (previously container-based; now script-driven)
- **Triggers**: 
  - Push to `main` branch
  - Release tags (`v*`)
  - Published releases
  - Manual trigger with environment selection
- **Actions**:
  - (Legacy) Image build/push step removed after de-containerization
  - Multi-environment deployment support
  - Database migration execution
  - Health check verification
  - Rollback capability
- **Runtime**: ~12-18 minutes
- **Frequency**: Only on releases and main branch updates

### 8. 🏢 Comprehensive Testing (`comprehensive-testing.yml`)
**Purpose**: Full test suite execution including E2E tests
- **Triggers**: 
  - Manual trigger only with test suite selection
- **Actions**:
  - Unit tests with Jest
  - Integration tests
  - End-to-end tests with Playwright
  - Performance testing
  - API testing
  - Database testing
- **Runtime**: ~20-30 minutes
- **Frequency**: Manual only (saves ~600 minutes/month)

---

## 🔧 Infrastructure & Monitoring Workflows

### 9. 🛡️ Branch Protection Setup (`branch-protection-monitor.yml`)
**Purpose**: Automated branch protection rule management
- **Triggers**: 
  - Changes to branch protection config files
  - Weekly schedule (Sundays at 6 AM UTC)
  - Manual trigger
- **Actions**:
  - Branch protection rule configuration
  - GitHub API integration with @octokit/rest
  - Protection rule validation
  - Configuration drift detection
- **Runtime**: ~2-3 minutes
- **Frequency**: Weekly + config changes only

### 10. 🏥 Environment Protection Setup (`environment-protection-setup.yml`)
**Purpose**: Production environment protection configuration
- **Triggers**: 
  - Manual trigger only
- **Actions**:
  - Environment protection rules setup
  - Deployment approval configuration
  - Secret management setup
- **Runtime**: ~3-5 minutes
- **Frequency**: Manual only

### 11. 🔄 Automated Access Review (`automated-access-review.yml`)
**Purpose**: Regular access control and permission auditing
- **Triggers**: 
  - Monthly schedule (1st of month)
  - Manual trigger
- **Actions**:
  - User access audit
  - Permission validation
  - Access anomaly detection
  - Compliance reporting
- **Runtime**: ~5-8 minutes
- **Frequency**: Monthly only

---

## 🎛️ Administrative & Utility Workflows

### 12. 🔑 Secret Rotation (`secret-rotation.yml`)
**Purpose**: Automated secret and API key rotation
- **Triggers**: 
  - Manual trigger only
  - Optional quarterly schedule (disabled by default)
- **Actions**:
  - Database credential rotation
  - API key rotation
  - Certificate renewal
  - Secret validation
- **Runtime**: ~8-12 minutes
- **Frequency**: Manual only (quarterly recommended)

### 13. 🆘 Disaster Recovery (`disaster-recovery.yml`)
**Purpose**: Backup and disaster recovery procedures
- **Triggers**: 
  - Manual trigger only
- **Actions**:
  - Database backup verification
  - Recovery procedure testing
  - Backup integrity checking
  - Recovery time measurement
- **Runtime**: ~15-25 minutes
- **Frequency**: Manual only (monthly recommended)

### 14. 👋 Hello World (`hello-world.yml`)
**Purpose**: Basic workflow functionality testing
- **Triggers**: 
  - Manual trigger only
- **Actions**:
  - Simple echo commands
  - Environment variable testing
  - Basic GitHub Actions functionality verification
- **Runtime**: ~1-2 minutes
- **Frequency**: Manual testing only

---

## 📊 Optimization Summary

### **Monthly Usage Breakdown** (Estimated)
- **Core Development**: ~300 minutes/month
- **Security & Compliance**: ~200 minutes/month
- **Deployment**: ~150 minutes/month
- **Infrastructure**: ~100 minutes/month
- **Administrative**: ~50 minutes/month
- **Total Estimated**: ~800 minutes/month (60% under free tier limit)

### **Key Optimizations Applied**
1. **Path-based triggers**: Only run workflows when relevant files change
2. **Reduced schedules**: Weekly/monthly instead of daily
3. **Manual triggers**: Non-critical workflows require manual execution
4. **Conditional execution**: Skip unnecessary jobs based on conditions
5. **Removed duplicates**: Eliminated duplicate workflows in phisnet/.github/
6. **PR-only quality gates**: Quality checks only on pull requests

### **Trigger Distribution**
- **Automated on Code Changes**: 4 workflows (CI, Quality Gates, Security, Deployment)
- **Scheduled (Weekly)**: 2 workflows (Security, Branch Protection)
- **Scheduled (Monthly)**: 2 workflows (Compliance, Access Review)
- **Manual Only**: 6 workflows (Testing, Build, Recovery, Secrets, etc.)

### **Free Tier Safety Measures**
- **Alert threshold**: Monitor usage at 75% (1,500 minutes)
- **Emergency disable**: All non-essential workflows can be disabled quickly
- **Manual override**: All workflows support manual triggering when needed
- **Usage tracking**: Monitor monthly consumption via GitHub Actions tab

---

## 🔧 Maintenance & Best Practices

### **Monthly Review Checklist**
- [ ] Check GitHub Actions usage in repository insights
- [ ] Review failed workflow runs and optimize if needed
- [ ] Update dependencies in workflows
- [ ] Validate security scanning results
- [ ] Review compliance reports

### **Emergency Procedures**
- **High Usage**: Disable scheduled workflows temporarily
- **Critical Issues**: Use manual triggers for urgent fixes
- **Debugging**: Use workflow_dispatch for isolated testing

### **Future Optimizations**
- Implement conditional matrix builds
- Add workflow result caching
- Create workflow dependency chains
- Implement smart scheduling based on repository activity

---

*Last Updated: August 9, 2025*
*Total Workflows: 14 active (25 originally implemented)*
*Estimated Monthly Usage: 800 minutes (40% of free tier)*
