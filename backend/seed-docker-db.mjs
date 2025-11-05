import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5433,
  database: 'ayurvedic_clinic',
  user: 'postgres',
  password: 'postgres123'
});

async function seedDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const doctorPassword = await bcrypt.hash('doctor123', 10);

    // Insert admin user
    await client.query(`
      INSERT INTO users (clinic_id, name, email, password_hash, role, is_active)
      VALUES (2, 'Admin User', 'admin@clinic.com', $1, 'admin', true)
      ON CONFLICT (email) DO UPDATE SET password_hash = $1
    `, [adminPassword]);
    console.log('✅ Admin user created');

    // Insert doctor 1
    await client.query(`
      INSERT INTO users (clinic_id, name, email, password_hash, role, phone, is_active)
      VALUES (2, 'Dr. Hasintha Hewawasam', 'hasintha@clinic.com', $1, 'doctor', '0771234567', true)
      ON CONFLICT (email) DO UPDATE SET password_hash = $1
    `, [doctorPassword]);
    console.log('✅ Dr. Hasintha created');

    // Insert doctor 2
    await client.query(`
      INSERT INTO users (clinic_id, name, email, password_hash, role, phone, is_active)
      VALUES (2, 'Dr. Hirushi Rodrigo', 'hirushi@clinic.com', $1, 'doctor', '0777654321', true)
      ON CONFLICT (email) DO UPDATE SET password_hash = $1
    `, [doctorPassword]);
    console.log('✅ Dr. Hirushi created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('  Admin: admin@clinic.com / admin123');
    console.log('  Doctor 1: hasintha@clinic.com / doctor123');
    console.log('  Doctor 2: hirushi@clinic.com / doctor123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

seedDatabase();
