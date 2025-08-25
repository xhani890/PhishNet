import 'dotenv/config';
import { pool } from '../server/db';
import { sendCampaignEmails } from '../server/services/email-service';

async function main() {
  // Get the most recent campaign directly from DB
  const { rows } = await pool.query(
    `SELECT id, organization_id AS "organizationId", name FROM campaigns ORDER BY created_at DESC LIMIT 1`
  );
  if (!rows || rows.length === 0) {
    console.log('No campaigns found to launch.');
    process.exit(0);
  }
  const latest = rows[0] as { id: number; organizationId: number; name: string };
  console.log(`Launching latest campaign id=${latest.id} org=${latest.organizationId} name="${latest.name}"`);
  const result = await sendCampaignEmails(latest.id, latest.organizationId);
  console.log('Launch result:', result);
}

main()
  .catch((e) => {
    console.error('Launch script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
