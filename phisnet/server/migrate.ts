import { db, pool } from './db';
import { users } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * This migration script adds new columns to the users table for improved security and profile features
 */
async function runMigration() {
  console.log('Starting migration...');
  
  try {
    // 1) Users table security/profile columns (idempotent)
    // Check if columns already exist
    const checkResult = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_picture'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add the new columns if they don't exist
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS profile_picture TEXT,
        ADD COLUMN IF NOT EXISTS position TEXT,
        ADD COLUMN IF NOT EXISTS bio TEXT,
        ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS account_locked BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL
      `);
      
      // Update existing users
      await pool.query(`UPDATE users SET is_active = TRUE WHERE is_active IS NULL`);
      
      console.log('Migration completed successfully - added new columns to users table.');
    } else {
      console.log('Migration not needed - columns already exist.');
    }

    // 2) campaign_results.organization_id (idempotent)
    console.log('Checking campaign_results.organization_id...');
    const colCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'campaign_results' AND column_name = 'organization_id'
    `);

    if (colCheck.rows.length === 0) {
      console.log('Adding organization_id to campaign_results...');
      await pool.query(`ALTER TABLE campaign_results ADD COLUMN organization_id INTEGER`);

      console.log('Backfilling organization_id using campaigns.organization_id...');
      await pool.query(`
        UPDATE campaign_results cr
        SET organization_id = c.organization_id
        FROM campaigns c
        WHERE cr.campaign_id = c.id AND cr.organization_id IS NULL
      `);

      console.log('Setting NOT NULL on campaign_results.organization_id...');
      await pool.query(`ALTER TABLE campaign_results ALTER COLUMN organization_id SET NOT NULL`);

      console.log('Adding FK constraint to organizations (if missing)...');
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            WHERE tc.constraint_name = 'campaign_results_organization_id_fkey'
              AND tc.table_name = 'campaign_results'
          ) THEN
            ALTER TABLE campaign_results
            ADD CONSTRAINT campaign_results_organization_id_fkey
            FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
          END IF;
        END$$;
      `);

      console.log('Creating index on campaign_results.organization_id (if missing)...');
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_campaign_results_org ON campaign_results(organization_id)`);
      console.log('campaign_results.organization_id migration completed.');
    } else {
      console.log('campaign_results.organization_id already exists. Ensuring backfill and constraints...');
      // Best-effort backfill for any NULLs (if any)
      await pool.query(`
        UPDATE campaign_results cr
        SET organization_id = c.organization_id
        FROM campaigns c
        WHERE cr.campaign_id = c.id AND cr.organization_id IS NULL
      `);
      // Ensure NOT NULL (will no-op if already set and no NULLs)
      try {
        await pool.query(`ALTER TABLE campaign_results ALTER COLUMN organization_id SET NOT NULL`);
      } catch (e) {
        console.log('NOT NULL already enforced or pending NULLs present; continuing.');
      }
      // Ensure FK exists
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            WHERE tc.constraint_name = 'campaign_results_organization_id_fkey'
              AND tc.table_name = 'campaign_results'
          ) THEN
            ALTER TABLE campaign_results
            ADD CONSTRAINT campaign_results_organization_id_fkey
            FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
          END IF;
        END$$;
      `);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_campaign_results_org ON campaign_results(organization_id)`);
      console.log('campaign_results.organization_id verified.');
    }

    // 3) landing_pages capture flags (idempotent)
    console.log('Checking landing_pages.capture_data and capture_passwords...');
    const lpCols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'landing_pages' AND column_name IN ('capture_data','capture_passwords')
    `);
    const hasCaptureData = lpCols.rows.some(r => r.column_name === 'capture_data');
    const hasCapturePw = lpCols.rows.some(r => r.column_name === 'capture_passwords');

    if (!hasCaptureData) {
      console.log('Adding capture_data to landing_pages...');
      await pool.query(`ALTER TABLE landing_pages ADD COLUMN capture_data BOOLEAN`);
      console.log('Backfilling capture_data to TRUE...');
      await pool.query(`UPDATE landing_pages SET capture_data = TRUE WHERE capture_data IS NULL`);
      console.log('Setting NOT NULL and DEFAULT TRUE on capture_data...');
      await pool.query(`ALTER TABLE landing_pages ALTER COLUMN capture_data SET DEFAULT TRUE`);
      await pool.query(`ALTER TABLE landing_pages ALTER COLUMN capture_data SET NOT NULL`);
    }
    if (!hasCapturePw) {
      console.log('Adding capture_passwords to landing_pages...');
      await pool.query(`ALTER TABLE landing_pages ADD COLUMN capture_passwords BOOLEAN`);
      console.log('Backfilling capture_passwords to FALSE...');
      await pool.query(`UPDATE landing_pages SET capture_passwords = FALSE WHERE capture_passwords IS NULL`);
      console.log('Setting NOT NULL and DEFAULT FALSE on capture_passwords...');
      await pool.query(`ALTER TABLE landing_pages ALTER COLUMN capture_passwords SET DEFAULT FALSE`);
      await pool.query(`ALTER TABLE landing_pages ALTER COLUMN capture_passwords SET NOT NULL`);
    }
    console.log('landing_pages capture flags verified.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration();