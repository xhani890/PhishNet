#!/bin/bash

# TypeScript Error Fix Script for PhishNet
# This script will apply systematic fixes to resolve all TypeScript compilation errors

echo "🔧 Fixing TypeScript errors in PhishNet server..."

# Define the routes file path
ROUTES_FILE="server/routes.ts"

if [ ! -f "$ROUTES_FILE" ]; then
    echo "❌ Routes file not found: $ROUTES_FILE"
    exit 1
fi

echo "📁 Backing up original routes file..."
cp "$ROUTES_FILE" "${ROUTES_FILE}.backup"

echo "🔍 Applying TypeScript fixes..."

# Fix 1: Add assertUser calls after isAuthenticated middleware
sed -i 's/app\.get.*isAuthenticated.*hasOrganization.*async (req, res) => {/&\n    try {\n      assertUser(req.user);/g' "$ROUTES_FILE"
sed -i 's/app\.post.*isAuthenticated.*hasOrganization.*async (req, res) => {/&\n    try {\n      assertUser(req.user);/g' "$ROUTES_FILE"
sed -i 's/app\.put.*isAuthenticated.*hasOrganization.*async (req, res) => {/&\n    try {\n      assertUser(req.user);/g' "$ROUTES_FILE"
sed -i 's/app\.delete.*isAuthenticated.*hasOrganization.*async (req, res) => {/&\n    try {\n      assertUser(req.user);/g' "$ROUTES_FILE"

# Fix 2: Replace database field access inconsistencies
sed -i 's/\.organizationId/\.organization_id/g' "$ROUTES_FILE"
sed -i 's/emailTemplate\.organizationId/emailTemplate\.organization_id/g' "$ROUTES_FILE"
sed -i 's/template\.organizationId/template\.organization_id/g' "$ROUTES_FILE"

# Fix 3: Fix property naming in validatedData
sed -i 's/validatedData\.htmlContent/validatedData\.html_content/g' "$ROUTES_FILE"
sed -i 's/validatedData\.textContent/validatedData\.text_content/g' "$ROUTES_FILE"
sed -i 's/validatedData\.senderName/validatedData\.sender_name/g' "$ROUTES_FILE"
sed -i 's/validatedData\.senderEmail/validatedData\.sender_email/g' "$ROUTES_FILE"

echo "✅ TypeScript fixes applied successfully!"
echo "📋 Summary of fixes:"
echo "   - Added assertUser() calls for authentication"
echo "   - Fixed database field naming consistency"
echo "   - Corrected property naming in validated data"
echo "   - Original file backed up as ${ROUTES_FILE}.backup"

echo "🔨 Attempting to compile TypeScript..."
if npm run build; then
    echo "✅ TypeScript compilation successful!"
else
    echo "⚠️  Some errors may remain. Check the output above."
fi

echo "🎉 Fix script completed!"
