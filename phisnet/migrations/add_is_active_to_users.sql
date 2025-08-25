-- Migration: add_is_active_to_users.sql
-- Adds missing is_active column to users table to align backend responses with code expectations.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Backfill any NULL values to TRUE for consistency
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Optional index if filtering by active status becomes common
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
