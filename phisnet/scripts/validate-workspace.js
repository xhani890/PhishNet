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
        allowed: ['client/', 'shared/types/', 'docs/frontend/', 'package.json'],
        forbidden: ['server/', 'migrations/', '.env*', 'shared/schema.ts'],
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

// Check if forbidden directories/files exist in workspace
let violations = [];

rules.forbidden.forEach(pattern => {
    // Convert glob pattern to regex for simple matching
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\//g, '\\/');
    const regex = new RegExp(`^${regexPattern}`);
    
    // Check current directory contents
    try {
        const items = fs.readdirSync('.');
        items.forEach(item => {
            if (regex.test(item + '/') || regex.test(item)) {
                violations.push(item);
            }
        });
    } catch (error) {
        // Directory doesn't exist, which is fine
    }
});

// Validate allowed directories exist
let missingRequired = [];

rules.allowed.forEach(pattern => {
    if (!pattern.includes('*') && !pattern.endsWith('.json')) {
        const dirPath = pattern.replace(/\/$/, '');
        if (!fs.existsSync(dirPath)) {
            missingRequired.push(dirPath);
        }
    }
});

// Report results
console.log(`\n📋 Workspace Validation Results for ${WORKSPACE_TYPE.toUpperCase()}:`);

if (violations.length > 0) {
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

if (violations.length === 0 && missingRequired.length === 0) {
    console.log('\n✅ Workspace validation passed!');
    console.log(`\n📂 Available in ${WORKSPACE_TYPE} workspace:`);
    rules.allowed.forEach(allowed => {
        const cleanPath = allowed.replace(/\/$/, '');
        if (fs.existsSync(cleanPath)) {
            console.log(`   ✅ ${allowed}`);
        }
    });
} else {
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
