import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Starting database seeding...');

    await client.query('BEGIN');

    // Get default clinic ID
    const clinicResult = await client.query('SELECT id FROM clinics LIMIT 1');
    const clinicId = clinicResult.rows[0]?.id || 1;

    // Seed users
    console.log('📝 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersData = [
      {
        name: 'Dr. Rajesh Kumar',
        email: 'doctor@clinic.com',
        role: 'doctor',
        phone: '9876543210'
      },
      {
        name: 'Priya Sharma',
        email: 'receptionist@clinic.com',
        role: 'receptionist',
        phone: '9876543211'
      },
      {
        name: 'Amit Patel',
        email: 'pharmacy@clinic.com',
        role: 'pharmacy',
        phone: '9876543212'
      },
      {
        name: 'Admin User',
        email: 'admin@clinic.com',
        role: 'admin',
        phone: '9876543213'
      }
    ];

    for (const user of usersData) {
      await client.query(
        `INSERT INTO users (clinic_id, name, email, password_hash, role, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING`,
        [clinicId, user.name, user.email, hashedPassword, user.role, user.phone]
      );
    }

    // Get doctor ID for appointments
    const doctorResult = await client.query(
      "SELECT id FROM users WHERE role = 'doctor' LIMIT 1"
    );
    const doctorId = doctorResult.rows[0]?.id;

    // Seed sample medicines
    console.log('💊 Seeding medicines...');
    const medicinesData = [
      {
        name: 'Triphala Churna',
        sanskrit_name: 'त्रिफला चूर्ण',
        category: 'Churna',
        manufacturer: 'Himalaya',
        quantity: 100,
        unit: 'grams',
        price: 150.00
      },
      {
        name: 'Ashwagandha Capsules',
        sanskrit_name: 'अश्वगंधा',
        category: 'Capsule',
        manufacturer: 'Patanjali',
        quantity: 60,
        unit: 'capsules',
        price: 250.00
      },
      {
        name: 'Brahmi Ghrita',
        sanskrit_name: 'ब्राह्मी घृत',
        category: 'Ghrita',
        manufacturer: 'Kottakkal',
        quantity: 30,
        unit: 'ml',
        price: 350.00
      },
      {
        name: 'Chyawanprash',
        sanskrit_name: 'च्यवनप्राश',
        category: 'Lehya',
        manufacturer: 'Dabur',
        quantity: 50,
        unit: 'grams',
        price: 180.00
      },
      {
        name: 'Tulsi Kwatha',
        sanskrit_name: 'तुलसी क्वाथ',
        category: 'Kwatha',
        manufacturer: 'Himalaya',
        quantity: 200,
        unit: 'ml',
        price: 120.00
      }
    ];

    for (const medicine of medicinesData) {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);

      await client.query(
        `INSERT INTO medicines (
          clinic_id, name, sanskrit_name, category, manufacturer,
          quantity_stock, unit, price_per_unit, expiry_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          clinicId,
          medicine.name,
          medicine.sanskrit_name,
          medicine.category,
          medicine.manufacturer,
          medicine.quantity,
          medicine.unit,
          medicine.price,
          expiryDate
        ]
      );
    }

    // Seed sample patients
    console.log('👥 Seeding patients...');
    const patientsData = [
      {
        name: 'Ramesh Singh',
        phone: '9123456789',
        age: 45,
        gender: 'Male',
        dosha_type: 'vata_pitta',
        patient_code: 'PAT001'
      },
      {
        name: 'Sunita Devi',
        phone: '9123456790',
        age: 38,
        gender: 'Female',
        dosha_type: 'kapha',
        patient_code: 'PAT002'
      },
      {
        name: 'Arjun Mehta',
        phone: '9123456791',
        age: 52,
        gender: 'Male',
        dosha_type: 'pitta',
        patient_code: 'PAT003'
      }
    ];

    for (const patient of patientsData) {
      await client.query(
        `INSERT INTO patients (
          clinic_id, name, phone, age, gender, dosha_type, patient_code
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          clinicId,
          patient.name,
          patient.phone,
          patient.age,
          patient.gender,
          patient.dosha_type,
          patient.patient_code
        ]
      );
    }

    // Seed sample appointments
    console.log('📅 Seeding appointments...');
    const patients = await client.query('SELECT id FROM patients LIMIT 3');

    for (let i = 0; i < patients.rows.length; i++) {
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + i);

      await client.query(
        `INSERT INTO appointments (
          clinic_id, patient_id, doctor_id, appointment_date,
          appointment_time, status, chief_complaint
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          clinicId,
          patients.rows[i].id,
          doctorId,
          appointmentDate,
          '10:00:00',
          'scheduled',
          'General checkup and consultation'
        ]
      );
    }

    await client.query('COMMIT');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data:');
    console.log('   - 4 users (admin, doctor, receptionist, pharmacy)');
    console.log('   - 5 medicines');
    console.log('   - 3 patients');
    console.log('   - 3 appointments');
    console.log('\n🔑 Default credentials:');
    console.log('   Admin: admin@clinic.com / password123');
    console.log('   Doctor: doctor@clinic.com / password123');
    console.log('   Receptionist: receptionist@clinic.com / password123');
    console.log('   Pharmacy: pharmacy@clinic.com / password123');

    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedDatabase();
