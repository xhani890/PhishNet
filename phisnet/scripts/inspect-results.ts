import 'dotenv/config';
import { pool } from '../server/db';

async function main() {
  const latest = await pool.query(
    `SELECT id FROM campaigns ORDER BY created_at DESC LIMIT 1`
  );
  if (!latest.rows.length) {
    console.log('No campaigns found.');
    return;
  }
  const campaignId: number = latest.rows[0].id;
  const res = await pool.query(
    `SELECT id, campaign_id, target_id, organization_id, status, sent, sent_at
     FROM campaign_results WHERE campaign_id = $1 ORDER BY id DESC LIMIT 5`,
    [campaignId]
  );
  const count = await pool.query(
    `SELECT COUNT(*)::int AS count FROM campaign_results WHERE campaign_id = $1`,
    [campaignId]
  );
  console.log(`campaign_id=${campaignId} results count=${count.rows[0].count}`);
  console.table(res.rows);
}

main()
  .catch((e) => {
    console.error('Inspect failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
