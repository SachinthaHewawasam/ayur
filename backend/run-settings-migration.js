import { pool } from './src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running settings migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'src', 'database', 'migrations', '006_create_settings_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Settings migration completed successfully!');
    console.log('📊 Created:');
    console.log('   - settings table');
    console.log('   - Added phone and specialization to users table');
    console.log('   - Created indexes and triggers');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
