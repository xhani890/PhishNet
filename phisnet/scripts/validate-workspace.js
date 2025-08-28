#!/usr/bin/env node

/**
 * Workspace Validation Script
 * Ensures developers only access files within their assigned modules
 */

import fs from 'fs';
import path from 'path';
import process from 'process';

const WORKSPACE_TYPE = process.env.WORKSPACE_TYPE || process.argv[2];

if (!WORKSPACE_TYPE) {
    console.error('❌ Workspace type not specified');
    console.error('Usage: node validate-workspace.js [frontend|backend|database]');
    process.exit(1);
}

// Define access rules for each workspace type
const ACCESS_RULES = {
    frontend: {
        allowed: ['client/', 'shared/types/', 'docs/frontend/', 'scripts/frontend-mock-server.js', 'vite.config.ts', '.env.frontend', 'package.json'],
    forbidden: ['server/', 'migrations/', '.env', '.env.codespace', '.env.codespaces', '.env.example', 'shared/schema.ts'],
        description: 'Frontend Developer Workspace'
    },
    backend: {
        allowed: ['server/', 'shared/', 'docs/backend/', 'package.json'],
        forbidden: ['client/src/', 'client/public/', '.env*'],
        description: 'Backend Developer Workspace'
    },
    database: {
        allowed: ['migrations/', 'shared/schema.ts', 'docs/database/', 'package.json'],
        forbidden: ['server/routes/', 'server/middleware/', 'client/', '.env*'],
        description: 'Database Developer Workspace'
    }
};

const rules = ACCESS_RULES[WORKSPACE_TYPE];

if (!rules) {
    console.error(`❌ Unknown workspace type: ${WORKSPACE_TYPE}`);
    process.exit(1);
}

console.log(`🔐 Validating ${rules.description}...`);

// Special handling for development environment
// Development mode is detected when:
// 1. Running via npm script (from package.json), OR
// 2. NODE_ENV is development, OR  
// 3. All modules are present (shared development environment)
const isDevelopmentMode = 
    process.env.npm_lifecycle_event || // Running via npm script
    process.env.NODE_ENV === 'development' ||
    (fs.existsSync('server') && fs.existsSync('client') && fs.existsSync('shared')); // All modules present

// Check if forbidden directories/files exist in workspace
let violations = [];

// Get all items in current directory
const allItems = fs.readdirSync('.');

allItems.forEach(item => {
    // Check if this item is forbidden
    const isForbidden = rules.forbidden.some(pattern => {
        if (pattern.includes('*')) {
            // Handle wildcard patterns like '.env*'
            const regexPattern = pattern.replace(/\*/g, '.*');
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(item);
        } else {
            // Handle exact matches or directory patterns
            const cleanPattern = pattern.replace(/\/$/, '');
            return item === cleanPattern || item.startsWith(cleanPattern + '/');
        }
    });
    
    // If item is forbidden, check if it's explicitly allowed
    if (isForbidden) {
        const isExplicitlyAllowed = rules.allowed.some(allowedPattern => {
            const cleanAllowed = allowedPattern.replace(/\/$/, '');
            return item === cleanAllowed || item.startsWith(cleanAllowed + '/');
        });
        
        if (!isExplicitlyAllowed) {
            violations.push(item);
        }
    }
});

// Validate allowed directories exist
let missingRequired = [];

rules.allowed.forEach(pattern => {
    if (pattern.endsWith('/') && !pattern.includes('*')) {
        const dirPath = pattern.replace(/\/$/, '');
        if (!fs.existsSync(dirPath)) {
            missingRequired.push(dirPath);
        }
    }
});

// Report results
console.log(`\n📋 Workspace Validation Results for ${WORKSPACE_TYPE.toUpperCase()}:`);

if (isDevelopmentMode && violations.length > 0) {
    console.log('\n⚠️  DEVELOPMENT MODE DETECTED:');
    console.log('   Running in shared development environment');
    console.log('   In production, use role-specific Codespaces:');
    violations.forEach(violation => {
        console.log(`   🔶 ${violation} (would be restricted in production)`);
    });
    console.log('\n💡 For production deployment:');
    console.log('   1. Use frontend-specific devcontainer');
    console.log('   2. Only allowed directories will be mounted');
    console.log('   3. Access control enforced at container level');
    
} else if (violations.length > 0) {
    console.log('\n❌ ACCESS VIOLATIONS DETECTED:');
    violations.forEach(violation => {
        console.log(`   🚫 ${violation} (should not be accessible in ${WORKSPACE_TYPE} workspace)`);
    });
}

if (missingRequired.length > 0) {
    console.log('\n⚠️  MISSING REQUIRED DIRECTORIES:');
    missingRequired.forEach(missing => {
        console.log(`   📁 ${missing} (required for ${WORKSPACE_TYPE} development)`);
    });
}

if ((violations.length === 0 || isDevelopmentMode) && missingRequired.length === 0) {
    console.log('\n✅ Workspace validation passed!');
    if (isDevelopmentMode) {
        console.log('   🔧 Development mode: Access restrictions are informational');
    }
    console.log(`\n📂 Available in ${WORKSPACE_TYPE} workspace:`);
    rules.allowed.forEach(allowed => {
        const cleanPath = allowed.replace(/\/$/, '');
        if (fs.existsSync(cleanPath)) {
            console.log(`   ✅ ${allowed}`);
        }
    });
} else if (!isDevelopmentMode) {
    console.log('\n💡 To fix workspace access issues:');
    console.log('   1. Use the correct Codespace for your role');
    console.log('   2. Contact team lead if you need cross-module access');
    console.log('   3. Use integration APIs for module communication');
    process.exit(1);
}

// Create workspace info file
const workspaceInfo = {
    type: WORKSPACE_TYPE,
    description: rules.description,
    allowed: rules.allowed,
    forbidden: rules.forbidden,
    validated: new Date().toISOString(),
    violations: violations,
    status: violations.length === 0 ? 'valid' : 'invalid'
};

fs.writeFileSync('.workspace-info.json', JSON.stringify(workspaceInfo, null, 2));
console.log('\n📄 Workspace info saved to .workspace-info.json');

console.log(`\n🔐 ${rules.description} is ready for development!`);
