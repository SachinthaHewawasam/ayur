-- Ayurvedic Clinic Management System Database Schema
-- PostgreSQL Database

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if exists (for clean migrations)
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'receptionist', 'pharmacy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'missed', 'rescheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'partial', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'card', 'upi', 'mobile', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE stock_movement_type AS ENUM ('in', 'out', 'adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dosha_type AS ENUM ('vata', 'pitta', 'kapha', 'vata_pitta', 'pitta_kapha', 'vata_kapha', 'tridosha');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Clinics table (Multi-clinic support)
CREATE TABLE clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    license_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    clinic_id INT REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    clinic_id INT REFERENCES clinics(id) ON DELETE CASCADE,
    patient_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    age INT,
    gender VARCHAR(20),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    dosha_type dosha_type,
    allergies TEXT,
    medical_history TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    clinic_id INT REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES users(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment_notes TEXT,
    followup_date DATE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medicines table
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    clinic_id INT REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sanskrit_name VARCHAR(255),
    category VARCHAR(100), -- Churna, Lehya, Kwatha, Taila, Ghrita, etc.
    manufacturer VARCHAR(255),
    batch_number VARCHAR(100),
    manufacturing_date DATE,
    expiry_date DATE,
    quantity_stock INT DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'units', -- units, grams, ml, etc.
    minimum_stock_level INT DEFAULT 10,
    price_per_unit DECIMAL(10, 2),
    description TEXT,
    storage_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    medicine_id INT REFERENCES medicines(id) ON DELETE CASCADE,
    dosage VARCHAR(100), -- e.g., "2 tablets", "5ml", "1 teaspoon"
    frequency VARCHAR(100), -- e.g., "Twice daily", "Before meals"
    duration_days INT,
    quantity_prescribed INT,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock movements table (Inventory tracking)
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    medicine_id INT REFERENCES medicines(id) ON DELETE CASCADE,
    type stock_movement_type NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255), -- 'Prescribed', 'Purchase', 'Expired', 'Damaged', 'Return'
    reference_id INT, -- Could be prescription_id, purchase_order_id, etc.
    notes TEXT,
    performed_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bills table
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    clinic_id INT REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id INT REFERENCES appointments(id) ON DELETE CASCADE,
    bill_number VARCHAR(100) UNIQUE NOT NULL,
    consultation_fee DECIMAL(10, 2) DEFAULT 0,
    medicine_cost DECIMAL(10, 2) DEFAULT 0,
    additional_charges DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method,
    payment_date TIMESTAMP,
    notes TEXT,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_clinic ON users(clinic_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_medicines_clinic ON medicines(clinic_id);
CREATE INDEX idx_prescriptions_appointment ON prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_bills_clinic ON bills(clinic_id);
CREATE INDEX idx_bills_patient ON bills(patient_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON medicines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default clinic (for MVP)
INSERT INTO clinics (name, address, phone, email)
VALUES ('Default Ayurvedic Clinic', 'Sample Address', '1234567890', 'admin@clinic.com')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE clinics IS 'Stores clinic information for multi-clinic support';
COMMENT ON TABLE users IS 'Stores user accounts (doctors, staff, admin)';
COMMENT ON TABLE patients IS 'Stores patient information and medical history';
COMMENT ON TABLE appointments IS 'Stores appointment scheduling and consultation records';
COMMENT ON TABLE medicines IS 'Stores Ayurvedic medicine inventory';
COMMENT ON TABLE prescriptions IS 'Stores prescribed medicines for each appointment';
COMMENT ON TABLE stock_movements IS 'Tracks all inventory movements for medicines';
COMMENT ON TABLE bills IS 'Stores billing and payment information';
