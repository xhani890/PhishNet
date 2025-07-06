-- Create: phisnet/fix-missing-columns.sql
-- Add missing columns to email_templates table
ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS complexity TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add missing columns to campaign_results table
ALTER TABLE campaign_results 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add missing columns to targets table (if not exists)
ALTER TABLE targets 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Update email_templates to use consistent column names with your schema
-- Your schema expects these columns but they might be named differently
UPDATE email_templates SET 
  type = COALESCE(type, 'phishing-business'),
  complexity = COALESCE(complexity, 'medium'),
  description = COALESCE(description, 'Standard phishing template'),
  category = COALESCE(category, 'business');

-- Update campaign_results to have proper status values
UPDATE campaign_results SET 
  status = CASE 
    WHEN sent = true AND clicked = true AND submitted = true THEN 'submitted'
    WHEN sent = true AND clicked = true THEN 'clicked'
    WHEN sent = true AND opened = true THEN 'opened'
    WHEN sent = true THEN 'sent'
    ELSE 'pending'
  END
WHERE status IS NULL OR status = '';

-- Update targets to have default department if null
UPDATE targets SET 
  department = COALESCE(department, 'General')
WHERE department IS NULL;

-- Make sure we have proper NOT NULL constraints where needed
ALTER TABLE campaign_results 
ALTER COLUMN status SET NOT NULL,
ALTER COLUMN status SET DEFAULT 'pending';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_results_status ON campaign_results(status);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_targets_department ON targets(department);

-- Ensure all tables have proper constraints
ALTER TABLE email_templates 
ALTER COLUMN type SET DEFAULT 'phishing-business',
ALTER COLUMN complexity SET DEFAULT 'medium';