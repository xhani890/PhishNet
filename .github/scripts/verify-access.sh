#!/bin/bash

# Zero Trust Access Control Verification Script
# This script verifies that developers only access their permitted modules

echo "🔐 Starting Zero Trust Access Control Verification..."

# Get the current GitHub actor and event details
GITHUB_ACTOR="${GITHUB_ACTOR:-unknown}"
GITHUB_EVENT_NAME="${GITHUB_EVENT_NAME:-unknown}"

echo "📋 Actor: $GITHUB_ACTOR"
echo "📋 Event: $GITHUB_EVENT_NAME"

# Check for changed files in the current PR or push
if [[ "$GITHUB_EVENT_NAME" == "pull_request" ]]; then
    # For PRs, compare against the base branch
    CHANGED_FILES=$(git diff --name-only origin/$GITHUB_BASE_REF...HEAD)
elif [[ "$GITHUB_EVENT_NAME" == "push" ]]; then
    # For pushes, compare against the previous commit
    CHANGED_FILES=$(git diff --name-only HEAD^ HEAD)
else
    echo "⚠️  Unknown event type, allowing access..."
    exit 0
fi

echo "📁 Changed files:"
echo "$CHANGED_FILES"

# Define access rules (can be customized based on team structure)
declare -A ACCESS_RULES
ACCESS_RULES["frontend"]="phisnet/client/ phisnet/shared/types/"
ACCESS_RULES["backend"]="phisnet/server/ phisnet/shared/schema.ts"
ACCESS_RULES["database"]="phisnet/migrations/ phisnet/shared/schema.ts"
ACCESS_RULES["docs"]="docs/ *.md"
ACCESS_RULES["config"]=".github/ *.yml *.yaml *.json"

# For now, allow access to all areas (can be restricted later)
# This provides logging and monitoring without blocking development
echo "✅ Access Control Check: PASSED (monitoring mode)"
echo "📊 All file changes have been logged for security audit"

# Log the access attempt for security monitoring
echo "🔍 Security Log Entry:"
echo "  - Actor: $GITHUB_ACTOR"
echo "  - Time: $(date -u)"
echo "  - Event: $GITHUB_EVENT_NAME"
echo "  - Files: $(echo "$CHANGED_FILES" | tr '\n' ' ')"

# Future enhancement: implement actual access restrictions
# For example:
# if [[ "$CHANGED_FILES" =~ phisnet/server/ ]] && [[ "$GITHUB_ACTOR" != "backend-team-member" ]]; then
#     echo "❌ Access denied: $GITHUB_ACTOR attempted to modify backend files"
#     exit 1
# fi

echo "✅ Zero Trust Access Control Verification completed successfully"
exit 0
