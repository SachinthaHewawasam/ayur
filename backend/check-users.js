import pg from 'pg';

const { Client } = pg;

const DATABASE_URL = 'postgresql://acms_user:GXQDne0JIfi9yUhSjUvJxL27cu1Zi7bd@dpg-d45j5rs9c44c73c4svf0-a.singapore-postgres.render.com/ayurvedic_clinic';

async function checkUsers() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log('📋 All Users:\n');
    const users = await client.query(`
      SELECT id, name, email, role, clinic_id, is_active 
      FROM users 
      ORDER BY id
    `);
    
    users.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Clinic ID: ${user.clinic_id}`);
      console.log(`Active: ${user.is_active}`);
      console.log('---');
    });
    
    console.log('\n👨‍⚕️ Doctors only:\n');
    const doctors = await client.query(`
      SELECT id, name, email, clinic_id 
      FROM users 
      WHERE role = 'doctor' AND is_active = true
      ORDER BY id
    `);
    
    console.log(`Total active doctors: ${doctors.rowCount}`);
    doctors.rows.forEach(doc => {
      console.log(`  - ${doc.name} (ID: ${doc.id}, Clinic: ${doc.clinic_id})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();
