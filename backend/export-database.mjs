import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = 'postgresql://acms_user:GXQDne0JIfi9yUhSjUvJxL27cu1Zi7bd@dpg-d45j5rs9c44c73c4svf0-a.singapore-postgres.render.com/ayurvedic_clinic';

async function exportDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Render database...');
    await client.connect();
    console.log('✅ Connected!\n');

    let sqlOutput = `-- ACMS Database Export
-- Generated: ${new Date().toISOString()}
-- This file contains all data from your Render database

`;

    // Export clinics
    console.log('📋 Exporting clinics...');
    const clinics = await client.query('SELECT * FROM clinics ORDER BY id');
    if (clinics.rows.length > 0) {
      sqlOutput += `\n-- Clinics\n`;
      clinics.rows.forEach(row => {
        sqlOutput += `INSERT INTO clinics (id, name, address, phone, email, created_at, updated_at) VALUES (${row.id}, ${escape(row.name)}, ${escape(row.address)}, ${escape(row.phone)}, ${escape(row.email)}, ${escape(row.created_at)}, ${escape(row.updated_at)}) ON CONFLICT (id) DO NOTHING;\n`;
      });
    }

    // Export users
    console.log('👥 Exporting users...');
    const users = await client.query('SELECT * FROM users ORDER BY id');
    if (users.rows.length > 0) {
      sqlOutput += `\n-- Users\n`;
      users.rows.forEach(row => {
        sqlOutput += `INSERT INTO users (id, clinic_id, name, email, password_hash, role, phone, specialization, is_active, last_login, created_at, updated_at) VALUES (${row.id}, ${row.clinic_id}, ${escape(row.name)}, ${escape(row.email)}, ${escape(row.password_hash)}, ${escape(row.role)}, ${escape(row.phone)}, ${escape(row.specialization)}, ${row.is_active}, ${escape(row.last_login)}, ${escape(row.created_at)}, ${escape(row.updated_at)}) ON CONFLICT (email) DO NOTHING;\n`;
      });
    }

    // Export patients
    console.log('🏥 Exporting patients...');
    const patients = await client.query('SELECT * FROM patients ORDER BY id');
    if (patients.rows.length > 0) {
      sqlOutput += `\n-- Patients\n`;
      patients.rows.forEach(row => {
        sqlOutput += `INSERT INTO patients (id, clinic_id, patient_code, name, date_of_birth, age, gender, phone, email, address, dosha_type, allergies, medical_history, emergency_contact_name, emergency_contact_phone, is_active, created_at, updated_at) VALUES (${row.id}, ${row.clinic_id}, ${escape(row.patient_code)}, ${escape(row.name)}, ${escape(row.date_of_birth)}, ${row.age}, ${escape(row.gender)}, ${escape(row.phone)}, ${escape(row.email)}, ${escape(row.address)}, ${escape(row.dosha_type)}, ${escape(row.allergies)}, ${escape(row.medical_history)}, ${escape(row.emergency_contact_name)}, ${escape(row.emergency_contact_phone)}, ${row.is_active}, ${escape(row.created_at)}, ${escape(row.updated_at)}) ON CONFLICT (patient_code) DO NOTHING;\n`;
      });
    }

    // Export appointments
    console.log('📅 Exporting appointments...');
    const appointments = await client.query('SELECT * FROM appointments ORDER BY id');
    if (appointments.rows.length > 0) {
      sqlOutput += `\n-- Appointments\n`;
      appointments.rows.forEach(row => {
        sqlOutput += `INSERT INTO appointments (id, clinic_id, patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, status, chief_complaint, diagnosis, treatment_plan, notes, follow_up_date, created_at, updated_at) VALUES (${row.id}, ${row.clinic_id}, ${row.patient_id}, ${row.doctor_id}, ${escape(row.appointment_date)}, ${escape(row.appointment_time)}, ${row.duration_minutes}, ${escape(row.status)}, ${escape(row.chief_complaint)}, ${escape(row.diagnosis)}, ${escape(row.treatment_plan)}, ${escape(row.notes)}, ${escape(row.follow_up_date)}, ${escape(row.created_at)}, ${escape(row.updated_at)});\n`;
      });
    }

    // Export medicines
    console.log('💊 Exporting medicines...');
    const medicines = await client.query('SELECT * FROM medicines ORDER BY id');
    if (medicines.rows.length > 0) {
      sqlOutput += `\n-- Medicines\n`;
      medicines.rows.forEach(row => {
        sqlOutput += `INSERT INTO medicines (id, clinic_id, name, category, description, stock_quantity, unit_price, reorder_level, expiry_date, manufacturer, batch_number, is_active, created_at, updated_at) VALUES (${row.id}, ${row.clinic_id}, ${escape(row.name)}, ${escape(row.category)}, ${escape(row.description)}, ${row.stock_quantity}, ${row.unit_price}, ${row.reorder_level}, ${escape(row.expiry_date)}, ${escape(row.manufacturer)}, ${escape(row.batch_number)}, ${row.is_active}, ${escape(row.created_at)}, ${escape(row.updated_at)});\n`;
      });
    }

    // Export settings
    console.log('⚙️  Exporting settings...');
    const settings = await client.query('SELECT * FROM settings ORDER BY id');
    if (settings.rows.length > 0) {
      sqlOutput += `\n-- Settings\n`;
      settings.rows.forEach(row => {
        sqlOutput += `INSERT INTO settings (id, clinic_id, system_name, clinic_name, clinic_address, clinic_phone, clinic_email, currency, tax_rate, consultation_fee, follow_up_fee, created_at, updated_at) VALUES (${row.id}, ${row.clinic_id}, ${escape(row.system_name)}, ${escape(row.clinic_name)}, ${escape(row.clinic_address)}, ${escape(row.clinic_phone)}, ${escape(row.clinic_email)}, ${escape(row.currency)}, ${row.tax_rate}, ${row.consultation_fee}, ${row.follow_up_fee}, ${escape(row.created_at)}, ${escape(row.updated_at)}) ON CONFLICT (id) DO NOTHING;\n`;
      });
    }

    // Reset sequences
    sqlOutput += `\n-- Reset sequences\n`;
    sqlOutput += `SELECT setval('clinics_id_seq', (SELECT MAX(id) FROM clinics));\n`;
    sqlOutput += `SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));\n`;
    sqlOutput += `SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));\n`;
    sqlOutput += `SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments));\n`;
    sqlOutput += `SELECT setval('medicines_id_seq', (SELECT MAX(id) FROM medicines));\n`;
    sqlOutput += `SELECT setval('settings_id_seq', (SELECT MAX(id) FROM settings));\n`;

    // Write to file
    const outputDir = path.join(__dirname, 'database-init');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputFile = path.join(outputDir, '02-seed-data.sql');
    fs.writeFileSync(outputFile, sqlOutput);

    console.log('\n✅ Database exported successfully!');
    console.log(`📁 File saved to: ${outputFile}`);
    console.log('\n📊 Export Summary:');
    console.log(`   Clinics: ${clinics.rowCount}`);
    console.log(`   Users: ${users.rowCount}`);
    console.log(`   Patients: ${patients.rowCount}`);
    console.log(`   Appointments: ${appointments.rowCount}`);
    console.log(`   Medicines: ${medicines.rowCount}`);
    console.log(`   Settings: ${settings.rowCount}`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

function escape(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  if (value instanceof Date) return `'${value.toISOString()}'`;
  // Escape single quotes
  return `'${String(value).replace(/'/g, "''")}'`;
}

exportDatabase();
