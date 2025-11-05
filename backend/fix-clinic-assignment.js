import pg from 'pg';

const { Client } = pg;

// Your Render database URL
const DATABASE_URL = 'postgresql://acms_user:GXQDne0JIfi9yUhSjUvJxL27cu1Zi7bd@dpg-d45j5rs9c44c73c4svf0-a.singapore-postgres.render.com/ayurvedic_clinic';

async function fixClinicAssignment() {
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

    // First, create a default clinic if it doesn't exist
    console.log('🏥 Creating default clinic...');
    const clinicResult = await client.query(`
      INSERT INTO clinics (name, address, phone, email)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE 
      SET name = EXCLUDED.name
      RETURNING id, name
    `, [
      'Ayurvedic Wellness Clinic',
      '123 Main Street, Colombo',
      '+94 11 234 5678',
      'info@ayurvedic-clinic.com'
    ]);
    
    const clinicId = clinicResult.rows[0].id;
    console.log('✅ Clinic created/updated!');
    console.log('   Clinic ID:', clinicId);
    console.log('   Name:', clinicResult.rows[0].name);

    // Update all users to belong to this clinic
    console.log('\n👥 Assigning all users to clinic...');
    const updateResult = await client.query(`
      UPDATE users 
      SET clinic_id = $1 
      WHERE clinic_id IS NULL
      RETURNING id, name, email, role
    `, [clinicId]);

    console.log('✅ Users updated!');
    updateResult.rows.forEach(user => {
      console.log(`   - ${user.name} (${user.role}): ${user.email}`);
    });

    // Verify doctors
    console.log('\n👨‍⚕️ Verifying doctors...');
    const doctors = await client.query(`
      SELECT id, name, email, role, clinic_id 
      FROM users 
      WHERE role = 'doctor'
      ORDER BY id
    `);

    console.log('✅ Doctors in system:');
    doctors.rows.forEach(doc => {
      console.log(`   - ${doc.name}: clinic_id = ${doc.clinic_id}`);
    });

    console.log('\n🎉 All users are now assigned to the clinic!');
    console.log('\n📋 Summary:');
    console.log(`   Clinic ID: ${clinicId}`);
    console.log(`   Total users updated: ${updateResult.rowCount}`);
    console.log(`   Total doctors: ${doctors.rowCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixClinicAssignment();
