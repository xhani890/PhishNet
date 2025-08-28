-- Migration: add roles and user_roles tables
-- Creates roles and user_roles tables and seeds default roles if not present

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default roles if they don't already exist
INSERT INTO roles (name, description, permissions)
SELECT 'Admin', 'Full system access and user management', '{"permissions": ["all"]}'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Admin');

INSERT INTO roles (name, description, permissions)
SELECT 'Manager', 'Campaign management and reporting', '{"permissions": ["campaigns", "reports", "users:read"]}'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Manager');

INSERT INTO roles (name, description, permissions)
SELECT 'User', 'Basic user access', '{"permissions": ["campaigns:read", "reports:read"]}'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'User');

-- Simple trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_roles_updated_at();
