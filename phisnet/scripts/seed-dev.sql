-- Minimal development seed (sanitized / synthetic)
BEGIN;

-- Organizations
INSERT INTO organizations (name, created_at, updated_at) VALUES
  ('Demo Org', now(), now())
ON CONFLICT DO NOTHING;

-- Users (passwords should be replaced by application hash process if needed)
-- Use a known bcrypt hash placeholder if your auth expects hashed passwords.
-- Example bcrypt for 'DevPassword123!' (replace with actual hash if required)
-- $2b$12$abcdefghijklmnopqrstuvC7G7z2YpAo0w7K5kS9fYzq8b1h2l3m4n5o6

INSERT INTO users (email, password, first_name, last_name, organization_id, organization_name, created_at, updated_at, is_admin)
SELECT 'admin@example.com', 'DevPassword123!', 'Admin', 'User', o.id, o.name, now(), now(), true
FROM organizations o WHERE o.name='Demo Org'
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, first_name, last_name, organization_id, organization_name, created_at, updated_at)
SELECT 'user@example.com', 'DevPassword123!', 'Regular', 'User', o.id, o.name, now(), now()
FROM organizations o WHERE o.name='Demo Org'
ON CONFLICT (email) DO NOTHING;

-- SMTP profile placeholder (non-functional)
INSERT INTO smtp_profiles (name, host, port, username, password, from_name, from_email, organization_id)
SELECT 'Demo SMTP', 'smtp.example.com', 587, 'demo', 'password', 'Demo Sender', 'no-reply@example.com', o.id
FROM organizations o WHERE o.name='Demo Org'
ON CONFLICT DO NOTHING;

-- Email template
INSERT INTO email_templates (name, subject, html_content, text_content, sender_name, sender_email, organization_id, type, complexity, description)
SELECT 'Welcome Template', 'Welcome!', '<h1>Welcome!</h1>', 'Welcome!', 'Demo Sender', 'no-reply@example.com', o.id, 'phishing-business', 'low', 'Sample template'
FROM organizations o WHERE o.name='Demo Org'
ON CONFLICT DO NOTHING;

-- Landing page
INSERT INTO landing_pages (name, description, html_content, page_type, organization_id)
SELECT 'Demo Landing', 'Sample landing page', '<html><body>Demo</body></html>', 'standard', o.id
FROM organizations o WHERE o.name='Demo Org'
ON CONFLICT DO NOTHING;

-- Group
INSERT INTO groups (name, description, organization_id)
SELECT 'Demo Group', 'Sample target group', o.id
FROM organizations o WHERE o.name='Demo Org'
ON CONFLICT DO NOTHING;

COMMIT;
