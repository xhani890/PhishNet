#!/usr/bin/env node

/**
 * Branch Protection Setup Script
 * Automatically configures branch protection rules based on .github/branch-protection-config.yml
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

async function setupBranchProtection() {
  try {
    // Initialize Octokit
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const owner = process.env.REPO_OWNER;
    const repo = process.env.REPO_NAME;

    console.log(`Setting up branch protection for ${owner}/${repo}`);

    // Load configuration
    const configPath = path.join(process.cwd(), '.github', 'branch-protection-config.yml');
    
    if (!fs.existsSync(configPath)) {
      console.log('✅ No branch protection config found - using basic protection');
      
      // Set basic protection for main branch
      await octokit.rest.repos.updateBranchProtection({
        owner,
        repo,
        branch: 'main',
        required_status_checks: {
          strict: true,
          contexts: ['🚀 PhishNet CI Pipeline', '🛡️ Quality Gates']
        },
        enforce_admins: false,
        required_pull_request_reviews: {
          required_approving_review_count: 1,
          dismiss_stale_reviews: true
        },
        restrictions: null,
        allow_force_pushes: false,
        allow_deletions: false
      });
      
      console.log('✅ Basic branch protection applied to main branch');
      return;
    }

    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent);

    // Apply protection rules for each branch
    for (const [branchName, branchConfig] of Object.entries(config)) {
      try {
        console.log(`Configuring protection for branch: ${branchName}`);
        
        await octokit.rest.repos.updateBranchProtection({
          owner,
          repo,
          branch: branchName,
          ...branchConfig.protection
        });
        
        console.log(`✅ Protection configured for ${branchName}`);
      } catch (error) {
        if (error.status === 404) {
          console.log(`⚠️  Branch ${branchName} does not exist, skipping`);
        } else {
          console.error(`❌ Error configuring ${branchName}:`, error.message);
        }
      }
    }

    console.log('🎉 Branch protection setup completed');

  } catch (error) {
    console.error('❌ Failed to setup branch protection:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupBranchProtection();
