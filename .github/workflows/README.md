# PhishNet GitHub Actions CI/CD Pipeline

This repository includes a comprehensive CI/CD pipeline using GitHub Actions to automate testing, building, security scanning, and deployment of the PhishNet application.

## 🚀 Workflows Overview

### 1. **PR Quick Check** (`pr-check.yml`) - ~3 minutes
- **Triggers**: Pull Requests only
- **Features**:
  - Fast TypeScript and build checks
  - Basic linting validation
  - Lightweight security audit
  - **Cost-optimized for frequent PRs**

### 2. **Main CI/CD Pipeline** (`ci-cd.yml`) - ~12 minutes
- **Triggers**: Push to `main` branch only
- **Features**:
  - Full application testing and building
  - Database integration tests
  - E2E testing (Chromium only)
  - Docker image building and pushing
  - **Comprehensive testing for production**

### 3. **Docker Security & Multi-Platform Build** (`docker-security.yml`)
- **Triggers**: Dockerfile changes, Tags, Manual
- **Features**:
  - Container vulnerability scanning
  - Multi-platform builds when needed
  - **Conditional execution to save minutes**

### 4. **Code Quality & Analysis** (`code-quality.yml`)
- **Triggers**: Weekly schedule, Code changes
- **Features**:
  - CodeQL security analysis
  - Performance monitoring
  - **Reduced frequency for cost control**

### 5. **Dependency Updates & Maintenance** (`maintenance.yml`)
- **Triggers**: Weekly schedule, Manual dispatch
- **Features**:
  - Automated dependency updates
  - **Weekly instead of daily to save minutes**

## � Cost Optimization Features

### **70% Cost Reduction Achieved Through:**
- ✅ **Path-based triggers** - Only run when relevant files change
- ✅ **Concurrency controls** - Auto-cancel duplicate runs  
- ✅ **Conditional execution** - E2E tests only on main branch
- ✅ **Optimized caching** - NPM, Docker, and build caches
- ✅ **Artifact management** - Short retention periods
- ✅ **Browser optimization** - Chromium only for E2E tests

### **Estimated Monthly Usage: ~186 minutes** (vs 2000 limit)
- **PR Reviews**: ~30 minutes (10 PRs × 3 min each)
- **Main Branch**: ~120 minutes (10 pushes × 12 min each)  
- **Maintenance**: ~36 minutes (weekly automated tasks)

📊 **See [OPTIMIZATION.md](.github/OPTIMIZATION.md) for detailed breakdown**

## �🔧 Setup Instructions

### 1. Configure Repository Secrets
Add the following secrets in your GitHub repository settings:

```
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub password/token
DB_PASSWORD             # Database password for testing
CODECOV_TOKEN           # (Optional) Codecov token
```

See [SECRETS.md](.github/SECRETS.md) for complete details.

### 2. Environment Configuration
- `docker-compose.staging.yml` - Staging environment configuration
- `docker-compose.prod.yml` - Production environment configuration

### 3. Required Files
Ensure these files exist in your `phisnet/` directory:
- `package.json` with proper scripts
- `Dockerfile` for containerization
- `playwright.config.ts` for E2E testing
- `.env.example` for environment variables

## 📊 Workflow Status Badges

Add these badges to your main README:

```markdown
![CI/CD Pipeline](https://github.com/xhani890/PhishNet/actions/workflows/ci-cd.yml/badge.svg)
![Docker Security](https://github.com/xhani890/PhishNet/actions/workflows/docker-security.yml/badge.svg)
![Code Quality](https://github.com/xhani890/PhishNet/actions/workflows/code-quality.yml/badge.svg)
```

## 🎯 Deployment Strategies

### Staging Deployment
- Automatically triggered by pre-release tags (e.g., `v1.0.0-beta`)
- Manual deployment via workflow dispatch
- Environment: `staging`
- URL: `https://staging.phishnet.app`

### Production Deployment
- Automatically triggered by release tags (e.g., `v1.0.0`)
- Requires manual approval
- Environment: `production`
- URL: `https://phishnet.app`

### Manual Deployment
Use GitHub's workflow dispatch feature:
1. Go to **Actions** → **Release & Deployment**
2. Click **Run workflow**
3. Select environment and version
4. Click **Run workflow**

## 🔒 Security Features

### Automated Security Scanning
- **Trivy**: Container vulnerability scanning
- **CodeQL**: Static code analysis
- **Semgrep**: SAST security rules
- **npm audit**: Dependency vulnerability checking
- **Hadolint**: Dockerfile best practices

### Security Reporting  
- SARIF reports uploaded to GitHub Security tab
- Security advisories for critical vulnerabilities
- Dependency review on pull requests

## 🧪 Testing Strategy

### Automated Testing Levels
1. **Unit Tests**: Component-level testing
2. **Integration Tests**: Database and API testing  
3. **E2E Tests**: Full application testing with Playwright
4. **Container Tests**: Docker image structure validation
5. **Security Tests**: Vulnerability and compliance scanning

### Test Environments
- **Development**: Local development environment
- **Testing**: GitHub Actions test environment with PostgreSQL
- **Staging**: Pre-production environment
- **Production**: Live environment with monitoring

## 📈 Monitoring & Observability

### Performance Monitoring
- Bundle size analysis
- Lighthouse performance audits
- Application performance metrics
- Database performance monitoring

### Health Checks
- Application health endpoints
- Database connectivity checks
- Service dependency verification
- Resource utilization monitoring

## 🔄 Maintenance & Updates

### Automated Maintenance
- **Daily**: Dependency security audits
- **Daily**: Performance monitoring
- **Weekly**: Code quality analysis
- **Monthly**: Comprehensive health checks

### Manual Maintenance
- Dependency updates (patch/minor/major)
- Security patch deployment
- Performance optimization
- Infrastructure updates

## 🚨 Troubleshooting

### Common Issues

#### 1. Docker Build Failures
```bash
# Check Dockerfile syntax
docker build --no-cache -t phishnet:test ./phisnet

# Review build logs in GitHub Actions
```

#### 2. Test Failures
```bash
# Run tests locally
cd phisnet
npm test
npx playwright test

# Check test reports in GitHub Actions artifacts
```

#### 3. Deployment Issues
```bash
# Check deployment logs
# Verify environment variables
# Test database connectivity
```

### Getting Help
1. Check workflow logs in GitHub Actions
2. Review error messages and artifacts
3. Consult documentation in `/docs` directory
4. Create an issue with detailed error information

## 🤝 Contributing

### Workflow Contributions
1. Test changes in a fork first
2. Update documentation for new features
3. Follow security best practices
4. Add appropriate tests for new workflows

### Code Contributions
All code changes trigger the CI/CD pipeline automatically:
1. **Pull Request**: Full testing and quality checks
2. **Merge to main**: Deploy to staging
3. **Release tag**: Deploy to production

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Docker Guide](https://hub.docker.com/_/postgres)
- [Playwright Testing Guide](https://playwright.dev/)
- [Security Best Practices](.github/SECURITY.md)
