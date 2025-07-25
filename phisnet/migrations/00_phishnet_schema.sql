-- ===============================================
-- PhishNet Database Schema
-- Version: 1.0
-- Created: July 25, 2025
-- Description: Complete database schema for PhishNet phishing simulation platform
-- ===============================================

-- Create database (uncomment if needed)
-- CREATE DATABASE phishnet;
-- \c phishnet;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS plpgsql;

-- Create enum types
DO $$ BEGIN
    CREATE TYPE "enum_Campaigns_type" AS ENUM ('phishing', 'awareness', 'training');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_Contents_type" AS ENUM ('email', 'sms', 'website', 'attachment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_Templates_type" AS ENUM ('email', 'sms', 'landing_page');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "enum_Users_role" AS ENUM ('admin', 'manager', 'user', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===============================================
-- CORE TABLES
-- ===============================================

-- Organizations table
CREATE TABLE IF NOT EXISTS "organizations" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    address TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Users table  
CREATE TABLE IF NOT EXISTS "users" (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    profile_picture TEXT,
    position TEXT,
    bio TEXT,
    failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
    last_failed_login TIMESTAMP,
    account_locked BOOLEAN DEFAULT FALSE NOT NULL,
    account_locked_until TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    organization_name TEXT DEFAULT 'None' NOT NULL,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Groups table
CREATE TABLE IF NOT EXISTS "groups" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Targets table
CREATE TABLE IF NOT EXISTS "targets" (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    position TEXT,
    department TEXT,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- SMTP Profiles table
CREATE TABLE IF NOT EXISTS "smtp_profiles" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    from_name TEXT NOT NULL,
    from_email TEXT NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Email Templates table
CREATE TABLE IF NOT EXISTS "email_templates" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    type TEXT DEFAULT 'phishing-business',
    complexity TEXT DEFAULT 'medium',
    description TEXT,
    category TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Landing Pages table
CREATE TABLE IF NOT EXISTS "landing_pages" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    html_content TEXT NOT NULL,
    redirect_url TEXT,
    page_type TEXT NOT NULL,
    thumbnail TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS "campaigns" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Draft' NOT NULL,
    target_group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
    smtp_profile_id INTEGER NOT NULL REFERENCES smtp_profiles(id) ON DELETE RESTRICT,
    email_template_id INTEGER NOT NULL REFERENCES email_templates(id) ON DELETE RESTRICT,
    landing_page_id INTEGER NOT NULL REFERENCES landing_pages(id) ON DELETE RESTRICT,
    scheduled_at TIMESTAMP,
    end_date TIMESTAMP,
    created_by_id INTEGER NOT NULL REFERENCES users(id),
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Campaign Results table
CREATE TABLE IF NOT EXISTS "campaign_results" (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    target_id INTEGER NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' NOT NULL,
    sent BOOLEAN DEFAULT FALSE NOT NULL,
    sent_at TIMESTAMP,
    opened BOOLEAN DEFAULT FALSE NOT NULL,
    opened_at TIMESTAMP,
    clicked BOOLEAN DEFAULT FALSE NOT NULL,
    clicked_at TIMESTAMP,
    submitted BOOLEAN DEFAULT FALSE NOT NULL,
    submitted_at TIMESTAMP,
    submitted_data JSONB,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Notification Preferences table
CREATE TABLE IF NOT EXISTS "notification_preferences" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    campaign_alerts BOOLEAN DEFAULT TRUE,
    security_alerts BOOLEAN DEFAULT TRUE,
    system_updates BOOLEAN DEFAULT TRUE,
    weekly_reports BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Organization Settings table
CREATE TABLE IF NOT EXISTS "organization_settings" (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    logo_url TEXT,
    theme JSONB,
    settings JSONB
);

-- Session table (for express-session)
CREATE TABLE IF NOT EXISTS "session" (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

-- ===============================================
-- LEGACY TABLES (for compatibility)
-- ===============================================

-- Keep legacy tables for backward compatibility
CREATE TABLE IF NOT EXISTS "Organizations" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    address VARCHAR(255),
    contactEmail VARCHAR(255),
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "Users" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role "enum_Users_role" NOT NULL,
    language VARCHAR(255) DEFAULT 'en',
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
    "OrganizationId" INTEGER REFERENCES "Organizations"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Campaigns" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type "enum_Campaigns_type" NOT NULL,
    status VARCHAR(255),
    scheduledAt TIMESTAMP WITH TIME ZONE,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
    "OrganizationId" INTEGER REFERENCES "Organizations"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Templates" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type "enum_Templates_type" NOT NULL,
    content TEXT,
    language VARCHAR(255) DEFAULT 'en',
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
    "OrganizationId" INTEGER REFERENCES "Organizations"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Contents" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type "enum_Contents_type" NOT NULL,
    url VARCHAR(255),
    language VARCHAR(255) DEFAULT 'en',
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "Results" (
    id SERIAL PRIMARY KEY,
    status VARCHAR(255),
    details JSONB,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
    "CampaignId" INTEGER REFERENCES "Campaigns"(id) ON DELETE SET NULL,
    "UserId" INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
    "ContentId" INTEGER REFERENCES "Contents"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "Languages" (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- Campaign Results indexes
CREATE INDEX IF NOT EXISTS idx_campaign_results_sent ON campaign_results(sent);
CREATE INDEX IF NOT EXISTS idx_campaign_results_opened ON campaign_results(opened);
CREATE INDEX IF NOT EXISTS idx_campaign_results_clicked ON campaign_results(clicked);
CREATE INDEX IF NOT EXISTS idx_campaign_results_status ON campaign_results(status);

-- Email Templates indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);

-- Targets indexes
CREATE INDEX IF NOT EXISTS idx_targets_email ON targets(email);
CREATE INDEX IF NOT EXISTS idx_targets_department ON targets(department);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Session indexes
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session(expire);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);

-- ===============================================
-- FUNCTIONS AND TRIGGERS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_smtp_profiles_updated_at BEFORE UPDATE ON smtp_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON landing_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_results_updated_at BEFORE UPDATE ON campaign_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- COMMENTS FOR DOCUMENTATION
-- ===============================================

COMMENT ON TABLE organizations IS 'Stores organization/tenant information';
COMMENT ON TABLE users IS 'Stores user accounts with role-based access';
COMMENT ON TABLE groups IS 'Stores user groups for targeting';
COMMENT ON TABLE targets IS 'Stores individual targets for campaigns';
COMMENT ON TABLE smtp_profiles IS 'Stores SMTP configuration for sending emails';
COMMENT ON TABLE email_templates IS 'Stores phishing email templates';
COMMENT ON TABLE landing_pages IS 'Stores landing page templates';
COMMENT ON TABLE campaigns IS 'Stores phishing campaigns';
COMMENT ON TABLE campaign_results IS 'Stores individual campaign results per target';
COMMENT ON TABLE notifications IS 'Stores system notifications';
COMMENT ON TABLE notification_preferences IS 'Stores user notification preferences';
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens';
COMMENT ON TABLE organization_settings IS 'Stores organization-specific settings';

-- ===============================================
-- COMPLETION MESSAGE
-- ===============================================

-- Output completion message
DO $$
BEGIN
    RAISE NOTICE 'PhishNet database schema created successfully!';
    RAISE NOTICE 'Tables created: organizations, users, groups, targets, smtp_profiles, email_templates, landing_pages, campaigns, campaign_results, notifications, and supporting tables';
    RAISE NOTICE 'Indexes and triggers created for optimal performance';
    RAISE NOTICE 'Ready for data import and application deployment';
END $$;
