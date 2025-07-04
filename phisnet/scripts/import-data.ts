import { db, pool } from '../server/db';
import fs from 'fs/promises';
import path from 'path';

async function resetSequences() {
  const tables = [
    'users',
    'organizations', 
    'groups',
    'targets',
    'smtp_profiles',
    'email_templates',
    'password_reset_tokens'
  ];

  for (const table of tables) {
    try {
      await pool.query(`
        SELECT setval('${table}_id_seq', (SELECT MAX(id) FROM ${table}))
      `);
      console.log(`Reset sequence for ${table}`);
    } catch (error) {
      console.log(`No sequence found for ${table} or table empty`);
    }
  }
}

async function importData() {
  try {
    // Define import order based on dependencies
    const importOrder = [
      'organizations',
      'users',
      'groups', 
      'smtp_profiles',
      'email_templates',
      'targets',
      'password_reset_tokens',
    ];

    const exportedDbPath = path.join(process.cwd(), 'Exported-DB');
    
    // Import files in specified order
    for (const tableName of importOrder) {
      const filePath = path.join(exportedDbPath, `${tableName}.json`);
      
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        if (data.length > 0) {
          // First truncate the table to avoid conflicts
          try {
            await pool.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
            console.log(`Cleared existing data from ${tableName}`);
          } catch (error) {
            console.log(`Creating new table ${tableName}`);
            const columns = Object.keys(data[0])
              .map(key => `"${key}" TEXT`)
              .join(', ');
              
            await pool.query(`
              CREATE TABLE IF NOT EXISTS "${tableName}" (
                ${columns}
              );
            `);
          }
          
          // Insert data
          for (const row of data) {
            const keys = Object.keys(row);
            const values = Object.values(row);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            
            try {
              await pool.query(
                `INSERT INTO "${tableName}" ("${keys.join('", "')}") 
                 VALUES (${placeholders})`,
                values
              );
            } catch (error) {
              console.error(`Error importing row into ${tableName}:`, error.message);
              continue;
            }
          }
          
          console.log(`Imported ${data.length} rows into ${tableName}`);
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`No data file found for ${tableName}, skipping...`);
        } else {
          console.error(`Error processing ${tableName}:`, error);
        }
      }
    }
    
    // Reset sequences after import
    await resetSequences();
    
    console.log('Data import completed');
    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importData();