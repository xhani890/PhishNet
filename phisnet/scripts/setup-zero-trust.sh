#!/bin/bash

# PhishNet Zero Trust DevOps Setup Script
# Configures GitHub repository with Zero Trust security policies

set -e

echo "🔐 Setting up Zero Trust DevOps for PhishNet..."

# Configuration
REPO_OWNER="gh0st-bit"
REPO_NAME="PhishNet"
REPO_URL="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"

# Function to create branch protection rule
create_branch_protection() {
    local branch=$1
    local restrictions=$2
    
    echo "🛡️  Setting up branch protection for: $branch"
    
    gh api repos/$REPO_OWNER/$REPO_NAME/branches/$branch/protection \
        --method PUT \
        --raw-field required_status_checks='{"strict":true,"contexts":["security-scan","access-control-check"]}' \
        --raw-field enforce_admins=$restrictions \
        --raw-field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"require_last_push_approval":true}' \
        --raw-field restrictions='null' \
        || echo "⚠️  Branch protection might already exist for $branch"
}

# Function to create environment
create_environment() {
    local env_name=$1
    local protection_rules=$2
    
    echo "🌍 Creating environment: $env_name"
    
    gh api repos/$REPO_OWNER/$REPO_NAME/environments/$env_name \
        --method PUT \
        --raw-field protection_rules="$protection_rules" \
        || echo "⚠️  Environment might already exist: $env_name"
}

# Function to create team
create_team() {
    local team_name=$1
    local description=$2
    local privacy=${3:-"closed"}
    
    echo "👥 Creating team: $team_name"
    
    gh api orgs/$REPO_OWNER/teams \
        --method POST \
        --field name="$team_name" \
        --field description="$description" \
        --field privacy="$privacy" \
        || echo "⚠️  Team might already exist: $team_name"
}

# Create teams
echo "👥 Setting up development teams..."

create_team "team-leads" "Project leads and senior developers"
create_team "frontend-team" "Frontend/UI developers"
create_team "backend-team" "Backend/API developers"
create_team "database-team" "Database administrators and developers"
create_team "security-team" "Security specialists"
create_team "devops-team" "DevOps and infrastructure engineers"
create_team "qa-team" "Quality assurance engineers"
create_team "ui-team" "UI/UX designers"
create_team "api-team" "API architects"
create_team "tech-writers" "Technical documentation team"
create_team "architects" "System architects"

# Set up branch protection rules
echo "🛡️  Configuring branch protection rules..."

# Main branch - Maximum protection
create_branch_protection "main" "true"

# Develop branch - Team lead protection
create_branch_protection "develop" "false"

# Create environments
echo "🌍 Setting up deployment environments..."

# Production environment - Maximum security
create_environment "production" '[{"type":"required_reviewers","reviewers":[{"type":"User","id":"admin"},{"type":"Team","id":"team-leads"}]},{"type":"wait_timer","minutes":60}]'

# Staging environment - Team lead approval
create_environment "staging" '[{"type":"required_reviewers","reviewers":[{"type":"Team","id":"team-leads"}]}]'

# Development environments - Module-specific
create_environment "frontend-dev" '[{"type":"required_reviewers","reviewers":[{"type":"Team","id":"frontend-team"}]}]'
create_environment "backend-dev" '[{"type":"required_reviewers","reviewers":[{"type":"Team","id":"backend-team"}]}]'

# Repository settings
echo "⚙️  Configuring repository settings..."

gh api repos/$REPO_OWNER/$REPO_NAME \
    --method PATCH \
    --field allow_squash_merge=true \
    --field allow_merge_commit=false \
    --field allow_rebase_merge=false \
    --field delete_branch_on_merge=true \
    --field allow_auto_merge=true

# Security settings
echo "🔐 Configuring security settings..."

# Enable security features
gh api repos/$REPO_OWNER/$REPO_NAME \
    --method PATCH \
    --field security_and_analysis='{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"},"dependency_graph":{"status":"enabled"},"dependabot_security_updates":{"status":"enabled"}}'

# Repository secrets (environment variables)
echo "🔑 Setting up repository secrets..."

# Production secrets
gh secret set DATABASE_URL_PROD --env production --body "postgresql://prod_user:prod_pass@prod_host:5432/phishnet_prod"
gh secret set SESSION_SECRET_PROD --env production --body "$(openssl rand -base64 32)"

# Staging secrets  
gh secret set DATABASE_URL_STAGING --env staging --body "postgresql://staging_user:staging_pass@staging_host:5432/phishnet_staging"
gh secret set SESSION_SECRET_STAGING --env staging --body "$(openssl rand -base64 32)"

# Create repository ruleset
echo "📋 Creating repository ruleset..."

gh api repos/$REPO_OWNER/$REPO_NAME/rulesets \
    --method POST \
    --raw-field name="Zero Trust Policy" \
    --raw-field target="branch" \
    --raw-field enforcement="active" \
    --raw-field conditions='{"ref_name":{"include":["refs/heads/main","refs/heads/develop"],"exclude":[]}}' \
    --raw-field rules='[{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":true,"required_status_checks":[{"context":"security-scan"},{"context":"access-control-check"}]}},{"type":"pull_request","parameters":{"required_approving_review_count":2,"dismiss_stale_reviews_on_push":true,"require_code_owner_review":true,"require_last_push_approval":true}},{"type":"deletion"},{"type":"force_push"}]' \
    || echo "⚠️  Ruleset might already exist"

# Webhook for external monitoring (optional)
echo "🔗 Setting up security webhook..."

# gh api repos/$REPO_OWNER/$REPO_NAME/hooks \
#     --method POST \
#     --field name="web" \
#     --field active=true \
#     --raw-field config='{"url":"https://security-monitor.phishnet.dev/github-webhook","content_type":"json","secret":"webhook-secret"}' \
#     --raw-field events='["push","pull_request","security_advisory"]'

# Create issue templates for access requests
echo "📝 Creating issue templates..."

mkdir -p .github/ISSUE_TEMPLATE

cat > .github/ISSUE_TEMPLATE/access-request.yml << 'EOF'
name: Access Request
description: Request additional module access
title: "[ACCESS REQUEST] "
labels: ["access-request", "security"]
assignees:
  - gh0st-bit
body:
  - type: markdown
    attributes:
      value: |
        ## Zero Trust Access Request
        Use this template to request additional access to PhishNet modules.
  - type: input
    id: requester
    attributes:
      label: Requester
      description: Your GitHub username
      placeholder: "@username"
    validations:
      required: true
  - type: dropdown
    id: access-type
    attributes:
      label: Access Type
      description: What type of access do you need?
      options:
        - Frontend module access
        - Backend module access  
        - Database module access
        - Cross-module integration access
        - Temporary elevated access
    validations:
      required: true
  - type: textarea
    id: justification
    attributes:
      label: Business Justification
      description: Why do you need this access?
      placeholder: Explain the business need and duration required
    validations:
      required: true
  - type: textarea
    id: scope
    attributes:
      label: Scope of Work
      description: What specific files/folders do you need to modify?
      placeholder: List specific paths and what changes you plan to make
    validations:
      required: true
  - type: input
    id: duration
    attributes:
      label: Duration
      description: How long do you need this access?
      placeholder: "e.g., 2 weeks, until feature completion"
    validations:
      required: true
EOF

cat > .github/ISSUE_TEMPLATE/security-incident.yml << 'EOF'
name: Security Incident
description: Report a security incident or policy violation
title: "[SECURITY] "
labels: ["security-incident", "urgent"]
assignees:
  - gh0st-bit
body:
  - type: markdown
    attributes:
      value: |
        ## 🚨 Security Incident Report
        **This is for security incidents only. For general bugs, use the bug report template.**
  - type: dropdown
    id: severity
    attributes:
      label: Severity Level
      description: How severe is this incident?
      options:
        - Critical (Data breach, unauthorized access)
        - High (Security vulnerability, policy violation)
        - Medium (Suspicious activity, compliance issue)
        - Low (Security enhancement suggestion)
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: Incident Description
      description: Detailed description of the security incident
      placeholder: What happened? When did it occur? What systems were affected?
    validations:
      required: true
  - type: textarea
    id: impact
    attributes:
      label: Impact Assessment
      description: What is the potential or actual impact?
      placeholder: Data exposure, system compromise, service disruption, etc.
    validations:
      required: true
  - type: textarea
    id: timeline
    attributes:
      label: Timeline
      description: When was this discovered and what actions have been taken?
      placeholder: Discovery time, initial response, current status
    validations:
      required: true
EOF

echo "✅ Zero Trust DevOps setup completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Review team memberships in GitHub Teams"
echo "2. Add team members to appropriate teams"
echo "3. Test branch protection by creating a test PR"
echo "4. Configure any additional environment secrets"
echo "5. Train team members on Zero Trust workflows"
echo ""
echo "📚 Documentation:"
echo "- Zero Trust DevOps Guide: docs/zero-trust-devops.md"
echo "- CODEOWNERS file: CODEOWNERS"
echo "- CI/CD Pipeline: .github/workflows/zero-trust-ci.yml"
echo ""
echo "🔐 Zero Trust DevOps is now active!"
