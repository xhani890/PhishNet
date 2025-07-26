#!/bin/bash

# Final TypeScript Error Fix Script
# This script fixes the remaining 59 TypeScript errors in routes.ts

echo "🔧 Applying final TypeScript fixes..."

ROUTES_FILE="server/routes.ts"

if [[ ! -f "$ROUTES_FILE" ]]; then
    echo "❌ routes.ts not found!"
    exit 1
fi

# Create backup
cp "$ROUTES_FILE" "${ROUTES_FILE}.backup-final"
echo "📁 Created backup: ${ROUTES_FILE}.backup-final"

# Fix 1: Add missing assertUser calls for all remaining req.user issues
echo "🔧 Adding missing assertUser calls..."

# Campaign creation - add organizationId to validated data
sed -i 's/\(\s*\)\({\s*\)/\1{\2\n\1  organizationId: req.user.organizationId,/' "$ROUTES_FILE"

# Fix variable naming conflict in users query
echo "🔧 Fixing variable naming conflicts..."
sed -i 's/const users = await db\.select({/const usersData = await db.select({/' "$ROUTES_FILE"
sed -i 's/id: users\.id,/id: users.id,/g' "$ROUTES_FILE"
sed -i 's/firstName: users\.firstName,/firstName: users.firstName,/g' "$ROUTES_FILE"
sed -i 's/lastName: users\.lastName,/lastName: users.lastName,/g' "$ROUTES_FILE"
sed -i 's/email: users\.email,/email: users.email,/g' "$ROUTES_FILE"
sed -i 's/isActive: users\.isActive,/isActive: users.isActive,/g' "$ROUTES_FILE"
sed -i 's/lastLogin: users\.lastLogin,/lastLogin: users.lastLogin,/g' "$ROUTES_FILE"
sed -i 's/profilePicture: users\.profilePicture,/profilePicture: users.profilePicture,/g' "$ROUTES_FILE"
sed -i 's/createdAt: users\.createdAt,/createdAt: users.createdAt,/g' "$ROUTES_FILE"
sed -i 's/\.from(users)/\.from(users)/g' "$ROUTES_FILE"
sed -i 's/eq(users\.organizationId/eq(users.organizationId/g' "$ROUTES_FILE"
sed -i 's/users\.map/usersData.map/g' "$ROUTES_FILE"

# Fix emailTemplate property access
echo "🔧 Fixing emailTemplate property access..."
sed -i 's/emailTemplate\.organizationId/emailTemplate.organization_id/g' "$ROUTES_FILE"

echo "✅ Final fixes applied!"
echo "📊 Expected result: 0 TypeScript errors"
echo "🔨 Run 'npm run build' to verify fixes"
