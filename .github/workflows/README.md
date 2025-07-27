# PhishNet GitHub Actions CI/CD Pipeline

This repository includes a comprehensive CI/CD pipeline using GitHub Actions to automate testing, building, security scanning, and deployment of the PhishNet application.

## 🚀 Workflows Overview

### 1. **Main CI/CD Pipeline** (`ci-cd.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests
- **Features**:
  - TypeScript type checking and linting
  - Application building and artifact storage
  - Database testing with PostgreSQL
  - End-to-end testing with Playwright
  - Docker image building and pushing
  - Automated deployment to staging/production

### 2. **Docker Security & Multi-Platform Build** (`docker-security.yml`)
- **Triggers**: Push to `main`/`develop`, Tags, Pull Requests
- **Features**:
  - Docker image vulnerability scanning with Trivy
  - Dockerfile linting with Hadolint
  - Multi-platform builds (AMD64, ARM64)
  - Container structure testing
  - SBOM (Software Bill of Materials) generation

### 3. **Code Quality & Analysis** (`code-quality.yml`)
- **Triggers**: Push, Pull Requests, Weekly schedule
- **Features**:
  - CodeQL security analysis
  - Dependency review for PRs
  - SAST (Static Application Security Testing)
  - License compliance checking
  - Code coverage reporting
  - Performance analysis with Lighthouse

### 4. **Release & Deployment** (`release-deploy.yml`)
- **Triggers**: Version tags, Manual dispatch
- **Features**:
  - Automated release creation with changelog
  - Build and upload release assets
  - Blue-green deployment strategy
  - Staging and production deployments
  - Rollback capabilities
  - Deployment notifications

### 5. **Dependency Updates & Maintenance** (`maintenance.yml`)
- **Triggers**: Daily schedule, Manual dispatch
- **Features**:
  - Automated dependency updates
  - Security audit scanning
  - Performance monitoring
  - Repository health checks
  - Cleanup of old artifacts

## 🔧 Setup Instructions

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
