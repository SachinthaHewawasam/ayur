import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your Render database URL
const DATABASE_URL = 'postgresql://acms_user:GXQDne0JIfi9yUhSjUvJxL27cu1Zi7bd@dpg-d45j5rs9c44c73c4svf0-a.singapore-postgres.render.com/ayurvedic_clinic';

async function runMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Render database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read and run schema.sql
    console.log('📋 Running schema.sql...');
    const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema created successfully!\n');

    // Add missing columns to settings table
    console.log('📋 Adding additional columns to settings table...');
    await client.query(`
      ALTER TABLE settings 
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'LKR',
      ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2) DEFAULT 1000,
      ADD COLUMN IF NOT EXISTS follow_up_fee DECIMAL(10,2) DEFAULT 500;
    `);
    console.log('✅ Additional columns added!\n');

    // Insert default settings
    console.log('📋 Inserting default settings...');
    await client.query(`
      INSERT INTO settings (
        clinic_name, clinic_address, clinic_phone, clinic_email,
        currency, tax_rate, consultation_fee, follow_up_fee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
    `, [
      'Ayurvedic Clinic',
      '',
      '',
      '',
      'LKR',
      0,
      1000,
      500
    ]);
    console.log('✅ Default settings inserted!\n');

    console.log('🎉 All migrations completed successfully!');
    console.log('\n📊 Database is ready for use!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
