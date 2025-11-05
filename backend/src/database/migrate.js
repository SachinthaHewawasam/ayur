import { pool } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - clinics');
    console.log('   - users');
    console.log('   - patients');
    console.log('   - appointments');
    console.log('   - medicines');
    console.log('   - prescriptions');
    console.log('   - stock_movements');
    console.log('   - bills');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
