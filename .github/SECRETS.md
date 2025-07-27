# GitHub Actions Secrets Configuration

This document outlines the required secrets for the PhishNet GitHub Actions workflows.

## Required Secrets

### Docker Registry Secrets
- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub password or access token

### Database Secrets (for testing/staging)
- `DB_PASSWORD` - PostgreSQL database password for testing environments

### Deployment Secrets (Optional - for production deployment)
- `STAGING_SERVER_HOST` - Staging server hostname/IP
- `STAGING_SERVER_USER` - SSH username for staging server
- `STAGING_SERVER_KEY` - SSH private key for staging server
- `PROD_SERVER_HOST` - Production server hostname/IP
- `PROD_SERVER_USER` - SSH username for production server  
- `PROD_SERVER_KEY` - SSH private key for production server

### Notification Secrets (Optional)
- `SLACK_WEBHOOK_URL` - Slack webhook URL for notifications
- `DISCORD_WEBHOOK_URL` - Discord webhook URL for notifications

### Third-party Service Secrets (Optional)
- `CODECOV_TOKEN` - Codecov token for code coverage reporting
- `SONAR_TOKEN` - SonarCloud token for code quality analysis

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the secret name and value
5. Click **Add secret**

## Environment-Specific Secrets

For staging and production deployments, you may also want to configure environment-specific secrets:

### Staging Environment
- Database connection strings
- API keys for staging services
- Feature flags

### Production Environment  
- Production database credentials
- Production API keys
- SSL certificates
- CDN configurations

## Security Best Practices

1. **Rotate secrets regularly** - Update passwords and tokens periodically
2. **Use least privilege** - Grant only necessary permissions to tokens
3. **Monitor usage** - Review secret usage in workflow logs
4. **Use environment protection** - Require approvals for production deployments
5. **Separate environments** - Use different secrets for staging vs production

## Automatic Secret Detection

The workflows include automatic detection for:
- Missing required secrets
- Expired tokens
- Invalid credentials

If a secret is missing or invalid, the workflow will fail with a clear error message.
