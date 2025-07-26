-- ===============================================
-- PhishNet Sample Data
-- Version: 1.0
-- Created: July 25, 2025
-- Description: Sample data for PhishNet phishing simulation platform
-- ===============================================

-- ===============================================
-- ORGANIZATIONS SAMPLE DATA
-- ===============================================

INSERT INTO organizations (id, name, industry, address, settings, created_at, updated_at) VALUES
(1, 'Demo Corporation', 'Technology', '123 Business Ave, Tech City, TC 12345', '{"theme": "blue", "allowSelfRegistration": false}', NOW(), NOW()),
(2, 'Riphah International University', 'Education', 'Lahore, Pakistan', '{"theme": "green", "allowSelfRegistration": true}', NOW(), NOW()),
(3, 'Healthcare Solutions Inc', 'Healthcare', '456 Medical Dr, Health City, HC 67890', '{"theme": "red", "allowSelfRegistration": false}', NOW(), NOW());

-- ===============================================
-- ADMIN USERS SAMPLE DATA
-- ===============================================

-- Password for all demo users: 'password123' (hashed with bcrypt)
INSERT INTO users (id, email, password, first_name, last_name, position, is_admin, organization_id, organization_name, created_at, updated_at) VALUES
(1, 'admin@democorp.com', '$2b$12$LQv3c1yqBwEHAc.PkYrOl.ZbJdqBD5GGI1WlM8HyqBdWy6UJT1WqG', 'John', 'Doe', 'IT Security Manager', TRUE, 1, 'Demo Corporation', NOW(), NOW()),
(2, 'admin@riphah.edu.pk', '$2b$12$LQv3c1yqBwEHAc.PkYrOl.ZbJdqBD5GGI1WlM8HyqBdWy6UJT1WqG', 'Dr. Sarah', 'Ahmed', 'Cybersecurity Professor', TRUE, 2, 'Riphah International University', NOW(), NOW()),
(3, 'admin@healthsolutions.com', '$2b$12$LQv3c1yqBwEHAc.PkYrOl.ZbJdqBD5GGI1WlM8HyqBdWy6UJT1WqG', 'Michael', 'Johnson', 'CISO', TRUE, 3, 'Healthcare Solutions Inc', NOW(), NOW());

-- Regular users
INSERT INTO users (id, email, password, first_name, last_name, position, is_admin, organization_id, organization_name, created_at, updated_at) VALUES
(4, 'jane.smith@democorp.com', '$2b$12$LQv3c1yqBwEHAc.PkYrOl.ZbJdqBD5GGI1WlM8HyqBdWy6UJT1WqG', 'Jane', 'Smith', 'Marketing Manager', FALSE, 1, 'Demo Corporation', NOW(), NOW()),
(5, 'bob.wilson@democorp.com', '$2b$12$LQv3c1yqBwEHAc.PkYrOl.ZbJdqBD5GGI1WlM8HyqBdWy6UJT1WqG', 'Bob', 'Wilson', 'Sales Representative', FALSE, 1, 'Demo Corporation', NOW(), NOW()),
(6, 'student1@riphah.edu.pk', '$2b$12$LQv3c1yqBwEHAc.PkYrOl.ZbJdqBD5GGI1WlM8HyqBdWy6UJT1WqG', 'Ali', 'Hassan', 'Student', FALSE, 2, 'Riphah International University', NOW(), NOW()),
(7, 'nurse1@healthsolutions.com', '$2b$12$LQv3c1yqBwEHAc.PkYrOl.ZbJdqBD5GGI1WlM8HyqBdWy6UJT1WqG', 'Emily', 'Davis', 'Registered Nurse', FALSE, 3, 'Healthcare Solutions Inc', NOW(), NOW());

-- ===============================================
-- GROUPS SAMPLE DATA
-- ===============================================

INSERT INTO groups (id, name, description, organization_id, created_at, updated_at) VALUES
(1, 'IT Department', 'Information Technology staff', 1, NOW(), NOW()),
(2, 'Marketing Team', 'Marketing and communications staff', 1, NOW(), NOW()),
(3, 'Sales Team', 'Sales representatives and managers', 1, NOW(), NOW()),
(4, 'Computer Science Students', 'CS department students', 2, NOW(), NOW()),
(5, 'Faculty Members', 'Teaching staff', 2, NOW(), NOW()),
(6, 'Medical Staff', 'Doctors and nurses', 3, NOW(), NOW()),
(7, 'Administrative Staff', 'Administrative personnel', 3, NOW(), NOW());

-- ===============================================
-- TARGETS SAMPLE DATA
-- ===============================================

INSERT INTO targets (id, first_name, last_name, email, position, department, group_id, organization_id, created_at, updated_at) VALUES
-- Demo Corporation targets
(1, 'Alice', 'Johnson', 'alice.johnson@democorp.com', 'Developer', 'IT', 1, 1, NOW(), NOW()),
(2, 'David', 'Brown', 'david.brown@democorp.com', 'System Admin', 'IT', 1, 1, NOW(), NOW()),
(3, 'Lisa', 'Garcia', 'lisa.garcia@democorp.com', 'Marketing Specialist', 'Marketing', 2, 1, NOW(), NOW()),
(4, 'Tom', 'Miller', 'tom.miller@democorp.com', 'Sales Manager', 'Sales', 3, 1, NOW(), NOW()),

-- University targets
(5, 'Ahmad', 'Khan', 'ahmad.khan@riphah.edu.pk', 'Student', 'Computer Science', 4, 2, NOW(), NOW()),
(6, 'Fatima', 'Ali', 'fatima.ali@riphah.edu.pk', 'Student', 'Computer Science', 4, 2, NOW(), NOW()),
(7, 'Dr. Hassan', 'Sheikh', 'hassan.sheikh@riphah.edu.pk', 'Professor', 'Computer Science', 5, 2, NOW(), NOW()),

-- Healthcare targets
(8, 'Dr. Jennifer', 'Lee', 'jennifer.lee@healthsolutions.com', 'Physician', 'Emergency', 6, 3, NOW(), NOW()),
(9, 'Robert', 'Taylor', 'robert.taylor@healthsolutions.com', 'Nurse', 'ICU', 6, 3, NOW(), NOW()),
(10, 'Sandra', 'White', 'sandra.white@healthsolutions.com', 'Administrator', 'Admin', 7, 3, NOW(), NOW());

-- ===============================================
-- SMTP PROFILES SAMPLE DATA
-- ===============================================

INSERT INTO smtp_profiles (id, name, host, port, username, password, from_name, from_email, organization_id, created_at, updated_at) VALUES
(1, 'Demo Corp SMTP', 'smtp.gmail.com', 587, 'noreply@democorp.com', 'demo_password', 'Demo Corporation', 'noreply@democorp.com', 1, NOW(), NOW()),
(2, 'Riphah SMTP', 'smtp.gmail.com', 587, 'security@riphah.edu.pk', 'riphah_password', 'Riphah IT Security', 'security@riphah.edu.pk', 2, NOW(), NOW()),
(3, 'Healthcare SMTP', 'smtp.gmail.com', 587, 'it@healthsolutions.com', 'health_password', 'Healthcare IT', 'it@healthsolutions.com', 3, NOW(), NOW());

-- ===============================================
-- EMAIL TEMPLATES SAMPLE DATA
-- ===============================================

INSERT INTO email_templates (id, name, subject, html_content, text_content, sender_name, sender_email, type, complexity, description, category, organization_id, created_by_id, created_at, updated_at) VALUES
(1, 'Banking Security Alert', 'Urgent: Verify Your Account', 
'<html><body><h2>Security Alert</h2><p>Dear Customer,</p><p>We have detected suspicious activity on your account. Please verify your identity immediately by clicking the link below:</p><a href="{{.URL}}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Verify Account</a><p>If you do not verify within 24 hours, your account will be temporarily suspended.</p><p>Best regards,<br>Security Team</p></body></html>',
'Security Alert - We have detected suspicious activity on your account. Please verify your identity by visiting: {{.URL}}',
'Bank Security', 'security@democorp.com', 'phishing-business', 'medium', 'Banking phishing simulation', 'banking', 1, 1, NOW(), NOW()),

(2, 'IT Support Ticket', 'Action Required: Update Your Password', 
'<html><body><h2>IT Support Notification</h2><p>Hello {{.FirstName}},</p><p>As part of our security compliance, all users must update their passwords. Please click below to update:</p><a href="{{.URL}}" style="background-color: #008CBA; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Update Password</a><p>This must be completed by end of business today.</p><p>IT Support Team</p></body></html>',
'IT Support - Please update your password: {{.URL}}',
'IT Support', 'support@democorp.com', 'phishing-business', 'easy', 'IT support password update phishing', 'it-support', 1, 1, NOW(), NOW()),

(3, 'University Portal Access', 'Student Portal Maintenance', 
'<html><body><h2>Riphah University</h2><p>Dear {{.FirstName}},</p><p>The student portal will undergo maintenance. To ensure continued access, please verify your credentials:</p><a href="{{.URL}}" style="background-color: #FF6B6B; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Verify Credentials</a><p>Academic Office</p></body></html>',
'University Portal - Verify your credentials: {{.URL}}',
'Academic Office', 'admin@riphah.edu.pk', 'phishing-business', 'medium', 'University portal access phishing', 'education', 2, 2, NOW(), NOW()),

(4, 'Healthcare System Alert', 'Critical: Patient Data Access', 
'<html><body><h2>Healthcare Alert</h2><p>Dr. {{.FirstName}},</p><p>There is an urgent issue with patient data access. Immediate verification required:</p><a href="{{.URL}}" style="background-color: #DC143C; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Access Patient System</a><p>Medical Records Team</p></body></html>',
'Healthcare Alert - Verify patient data access: {{.URL}}',
'Medical Records', 'records@healthsolutions.com', 'phishing-business', 'hard', 'Healthcare system access phishing', 'healthcare', 3, 3, NOW(), NOW());

-- ===============================================
-- LANDING PAGES SAMPLE DATA
-- ===============================================

INSERT INTO landing_pages (id, name, description, html_content, redirect_url, page_type, thumbnail, organization_id, created_by_id, created_at, updated_at) VALUES
(1, 'Banking Login Page', 'Fake banking login page', 
'<!DOCTYPE html><html><head><title>Secure Banking</title><style>body{font-family:Arial;background:#f5f5f5;margin:0;padding:20px}.container{max-width:400px;margin:0 auto;background:white;padding:30px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}.logo{text-align:center;color:#0066cc;font-size:24px;margin-bottom:30px}.form-group{margin-bottom:20px}label{display:block;margin-bottom:5px;color:#333}input{width:100%;padding:12px;border:1px solid #ddd;border-radius:4px;font-size:14px}.btn{background:#0066cc;color:white;padding:12px 20px;border:none;border-radius:4px;width:100%;cursor:pointer;font-size:16px}</style></head><body><div class="container"><div class="logo">🏦 SecureBank</div><form method="post" action="/capture"><div class="form-group"><label>Username:</label><input type="text" name="username" required></div><div class="form-group"><label>Password:</label><input type="password" name="password" required></div><button type="submit" class="btn">Sign In</button></form></div></body></html>',
'https://democorp.com/security-awareness', 'login', null, 1, 1, NOW(), NOW()),

(2, 'IT Portal', 'Corporate IT portal clone', 
'<!DOCTYPE html><html><head><title>IT Portal</title><style>body{font-family:Arial;background:#f8f9fa;margin:0;padding:20px}.header{background:#007bff;color:white;padding:15px;text-align:center;margin-bottom:30px}.container{max-width:500px;margin:0 auto;background:white;padding:30px;border-radius:8px}.form-group{margin-bottom:20px}label{display:block;margin-bottom:5px}input{width:100%;padding:10px;border:1px solid #ddd;border-radius:4px}.btn{background:#28a745;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer}</style></head><body><div class="header"><h2>Corporate IT Portal</h2></div><div class="container"><h3>Password Update Required</h3><form method="post" action="/capture"><div class="form-group"><label>Current Password:</label><input type="password" name="current_password" required></div><div class="form-group"><label>New Password:</label><input type="password" name="new_password" required></div><div class="form-group"><label>Confirm Password:</label><input type="password" name="confirm_password" required></div><button type="submit" class="btn">Update Password</button></form></div></body></html>',
'https://democorp.com/it-training', 'credential-harvest', null, 1, 1, NOW(), NOW()),

(3, 'University Portal', 'Student portal maintenance page', 
'<!DOCTYPE html><html><head><title>Riphah Portal</title><style>body{font-family:Arial;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);margin:0;padding:20px;min-height:100vh}.container{max-width:450px;margin:50px auto;background:white;padding:40px;border-radius:12px;box-shadow:0 8px 25px rgba(0,0,0,0.15)}.logo{text-align:center;margin-bottom:30px}.logo img{width:100px}.form-group{margin-bottom:20px}label{display:block;margin-bottom:8px;color:#333;font-weight:500}input{width:100%;padding:12px;border:2px solid #e1e8ed;border-radius:6px;font-size:14px;transition:border-color 0.3s}input:focus{border-color:#667eea;outline:none}.btn{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:14px;border:none;border-radius:6px;width:100%;cursor:pointer;font-size:16px;font-weight:500}</style></head><body><div class="container"><div class="logo"><h2 style="color:#667eea">🎓 Riphah University</h2></div><h3 style="text-align:center;color:#333">Portal Maintenance</h3><p style="color:#666;text-align:center">Please verify your credentials to continue accessing the portal during maintenance.</p><form method="post" action="/capture"><div class="form-group"><label>Student ID / Email:</label><input type="text" name="username" required></div><div class="form-group"><label>Password:</label><input type="password" name="password" required></div><button type="submit" class="btn">Verify & Continue</button></form></div></body></html>',
'https://riphah.edu.pk/student-resources', 'credential-harvest', null, 2, 2, NOW(), NOW()),

(4, 'Medical Records System', 'Healthcare system login', 
'<!DOCTYPE html><html><head><title>MedRecord System</title><style>body{font-family:Arial;background:#f0f8ff;margin:0;padding:20px}.header{background:#dc143c;color:white;padding:20px;text-align:center}.container{max-width:400px;margin:30px auto;background:white;padding:30px;border-radius:8px;border-left:4px solid #dc143c}.alert{background:#ffe6e6;border:1px solid #dc143c;color:#dc143c;padding:15px;border-radius:4px;margin-bottom:20px}.form-group{margin-bottom:20px}label{display:block;margin-bottom:5px;color:#333}input{width:100%;padding:12px;border:1px solid #ddd;border-radius:4px}.btn{background:#dc143c;color:white;padding:12px;border:none;border-radius:4px;width:100%;cursor:pointer;font-size:16px}</style></head><body><div class="header"><h2>🏥 MedRecord System</h2></div><div class="container"><div class="alert"><strong>URGENT:</strong> Patient data access issue detected. Immediate verification required.</div><form method="post" action="/capture"><div class="form-group"><label>Medical ID:</label><input type="text" name="medical_id" required></div><div class="form-group"><label>System Password:</label><input type="password" name="password" required></div><div class="form-group"><label>Department Code:</label><input type="text" name="department" required></div><button type="submit" class="btn">Access Patient Records</button></form></div></body></html>',
'https://healthsolutions.com/compliance-training', 'credential-harvest', null, 3, 3, NOW(), NOW());

-- ===============================================
-- NOTIFICATION PREFERENCES SAMPLE DATA
-- ===============================================

INSERT INTO notification_preferences (user_id, email_notifications, push_notifications, campaign_alerts, security_alerts, system_updates, weekly_reports, created_at, updated_at) VALUES
(1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, NOW(), NOW()),
(2, TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, NOW(), NOW()),
(3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, NOW(), NOW()),
(4, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE, NOW(), NOW()),
(5, TRUE, FALSE, TRUE, FALSE, FALSE, TRUE, NOW(), NOW()),
(6, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, NOW(), NOW()),
(7, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, NOW(), NOW());

-- ===============================================
-- SAMPLE NOTIFICATIONS
-- ===============================================

INSERT INTO notifications (user_id, organization_id, type, title, message, is_read, priority, action_url, metadata, created_at) VALUES
(1, 1, 'campaign_completed', 'Campaign Completed', 'Your phishing campaign "Banking Security Test" has completed successfully with 15 targets engaged.', FALSE, 'medium', '/campaigns/1', '{"campaign_id": 1, "completion_rate": "85%"}', NOW() - INTERVAL '2 hours'),
(2, 2, 'security_alert', 'Security Alert', 'Multiple failed login attempts detected from IP address 192.168.1.100', FALSE, 'high', '/security/alerts', '{"ip": "192.168.1.100", "attempts": 5}', NOW() - INTERVAL '1 hour'),
(3, 3, 'system_update', 'System Maintenance', 'Scheduled maintenance will occur tonight from 2 AM to 4 AM EST.', TRUE, 'low', null, '{"maintenance_window": "2AM-4AM EST"}', NOW() - INTERVAL '6 hours'),
(1, 1, 'campaign_alert', 'High Risk User Detected', 'User jane.smith@democorp.com has clicked on 3 consecutive phishing emails.', FALSE, 'high', '/users/4', '{"user_id": 4, "risk_score": "high"}', NOW() - INTERVAL '30 minutes');

-- ===============================================
-- UPDATE SEQUENCES
-- ===============================================

-- Reset all sequences to prevent conflicts
SELECT setval('organizations_id_seq', (SELECT MAX(id) FROM organizations));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('groups_id_seq', (SELECT MAX(id) FROM groups));
SELECT setval('targets_id_seq', (SELECT MAX(id) FROM targets));
SELECT setval('smtp_profiles_id_seq', (SELECT MAX(id) FROM smtp_profiles));
SELECT setval('email_templates_id_seq', (SELECT MAX(id) FROM email_templates));
SELECT setval('landing_pages_id_seq', (SELECT MAX(id) FROM landing_pages));
SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));
SELECT setval('notification_preferences_id_seq', (SELECT MAX(id) FROM notification_preferences));

-- ===============================================
-- COMPLETION MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE 'PhishNet sample data imported successfully!';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - 3 Organizations';
    RAISE NOTICE '  - 7 Users (3 admins, 4 regular users)';
    RAISE NOTICE '  - 7 Groups';
    RAISE NOTICE '  - 10 Targets';
    RAISE NOTICE '  - 3 SMTP Profiles';
    RAISE NOTICE '  - 4 Email Templates';
    RAISE NOTICE '  - 4 Landing Pages';
    RAISE NOTICE '  - 7 Notification Preferences';
    RAISE NOTICE '  - 4 Sample Notifications';
    RAISE NOTICE '';
    RAISE NOTICE 'Default admin accounts:';
    RAISE NOTICE '  - admin@democorp.com / password123';
    RAISE NOTICE '  - admin@riphah.edu.pk / password123';
    RAISE NOTICE '  - admin@healthsolutions.com / password123';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for phishing simulation campaigns!';
END $$;
