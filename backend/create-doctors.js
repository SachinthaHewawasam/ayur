import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

// Your Render database URL
const DATABASE_URL = 'postgresql://acms_user:GXQDne0JIfi9yUhSjUvJxL27cu1Zi7bd@dpg-d45j5rs9c44c73c4svf0-a.singapore-postgres.render.com/ayurvedic_clinic';

async function createDoctors() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Default password for doctors
    const password = 'doctor123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Doctor 1: Hasintha Hewawasam
    console.log('👨‍⚕️ Creating Dr. Hasintha Hewawasam...');
    const doctor1 = await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash
      RETURNING id, name, email, role
    `, [
      'Dr. Hasintha Hewawasam',
      'hasintha@clinic.com',
      hashedPassword,
      'doctor',
      '+94 77 123 4567'
    ]);
    console.log('✅ Dr. Hasintha Hewawasam created!');

    // Doctor 2: Hirushi Rodrigo
    console.log('👩‍⚕️ Creating Dr. Hirushi Rodrigo...');
    const doctor2 = await client.query(`
      INSERT INTO users (name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash
      RETURNING id, name, email, role
    `, [
      'Dr. Hirushi Rodrigo',
      'hirushi@clinic.com',
      hashedPassword,
      'doctor',
      '+94 77 234 5678'
    ]);
    console.log('✅ Dr. Hirushi Rodrigo created!');

    console.log('\n🎉 All doctors created successfully!\n');
    console.log('📋 Login Credentials:\n');
    
    console.log('👨‍⚕️ Dr. Hasintha Hewawasam:');
    console.log('   Email: hasintha@clinic.com');
    console.log('   Password: doctor123');
    console.log('   ID:', doctor1.rows[0].id);
    
    console.log('\n👩‍⚕️ Dr. Hirushi Rodrigo:');
    console.log('   Email: hirushi@clinic.com');
    console.log('   Password: doctor123');
    console.log('   ID:', doctor2.rows[0].id);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDoctors();
