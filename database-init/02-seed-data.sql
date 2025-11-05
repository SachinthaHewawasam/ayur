-- ACMS Database Export
-- Generated: 2025-11-05T12:26:58.105Z
-- This file contains all data from your Render database


-- Clinics
INSERT INTO clinics (id, name, address, phone, email, created_at, updated_at) VALUES (1, 'Default Ayurvedic Clinic', 'Sample Address', '1234567890', 'admin@clinic.com', '2025-11-05T06:11:47.323Z', '2025-11-05T06:11:47.323Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO clinics (id, name, address, phone, email, created_at, updated_at) VALUES (2, 'Ayurvedic Wellness Clinic', '123 Main Street, Colombo', '+94 11 234 5678', 'info@ayurvedic-clinic.com', '2025-11-05T06:44:59.797Z', '2025-11-05T06:44:59.797Z') ON CONFLICT (id) DO NOTHING;

-- Users
INSERT INTO users (id, clinic_id, name, email, password_hash, role, phone, specialization, is_active, last_login, created_at, updated_at) VALUES (1, 2, 'Admin User', 'admin@clinic.com', '$2a$10$rvDGfl7DnpwQzfZ9hNrPdutsdl5JhPI4PMBrrrtpMwEGjWnaUndDi', 'admin', '+94 11 234 5678', NULL, true, '2025-11-05T06:46:43.107Z', '2025-11-05T06:35:07.122Z', '2025-11-05T06:46:43.107Z') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, clinic_id, name, email, password_hash, role, phone, specialization, is_active, last_login, created_at, updated_at) VALUES (2, 2, 'Dr. Hasintha Hewawasam', 'hasintha@clinic.com', '$2a$10$/wFeqRke6.t4N5zhFQFo0.EJaa06XjRc7kb87Fdh7gvvfS4u1h2eG', 'doctor', '+94 77 123 4567', NULL, true, NULL, '2025-11-05T06:39:47.247Z', '2025-11-05T06:44:59.995Z') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, clinic_id, name, email, password_hash, role, phone, specialization, is_active, last_login, created_at, updated_at) VALUES (3, 2, 'Dr. Hirushi Rodrigo', 'hirushi@clinic.com', '$2a$10$/wFeqRke6.t4N5zhFQFo0.EJaa06XjRc7kb87Fdh7gvvfS4u1h2eG', 'doctor', '+94 77 234 5678', NULL, true, NULL, '2025-11-05T06:39:47.294Z', '2025-11-05T06:44:59.995Z') ON CONFLICT (email) DO NOTHING;

-- Patients
INSERT INTO patients (id, clinic_id, patient_code, name, date_of_birth, age, gender, phone, email, address, dosha_type, allergies, medical_history, emergency_contact_name, emergency_contact_phone, is_active, created_at, updated_at) VALUES (1, null, 'PAT00001', 'Chami De Silva', NULL, 26, 'Female', '0771231234', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-05T06:36:35.298Z', '2025-11-05T06:36:35.298Z') ON CONFLICT (patient_code) DO NOTHING;
INSERT INTO patients (id, clinic_id, patient_code, name, date_of_birth, age, gender, phone, email, address, dosha_type, allergies, medical_history, emergency_contact_name, emergency_contact_phone, is_active, created_at, updated_at) VALUES (6, null, 'PAT810664483', 'sachintha hewawasam', NULL, 31, 'Male', '0778975476', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-05T06:43:30.665Z', '2025-11-05T06:43:30.665Z') ON CONFLICT (patient_code) DO NOTHING;
INSERT INTO patients (id, clinic_id, patient_code, name, date_of_birth, age, gender, phone, email, address, dosha_type, allergies, medical_history, emergency_contact_name, emergency_contact_phone, is_active, created_at, updated_at) VALUES (7, 2, 'PAT950575973', 'sachintha hewawasam', NULL, 31, 'Male', '0778975476', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-05T06:45:50.576Z', '2025-11-05T06:45:50.576Z') ON CONFLICT (patient_code) DO NOTHING;
INSERT INTO patients (id, clinic_id, patient_code, name, date_of_birth, age, gender, phone, email, address, dosha_type, allergies, medical_history, emergency_contact_name, emergency_contact_phone, is_active, created_at, updated_at) VALUES (8, 2, 'PAT027600103', 'sachintha hewawasam', NULL, 31, 'Male', '0778975472', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-05T06:47:07.601Z', '2025-11-05T06:47:07.601Z') ON CONFLICT (patient_code) DO NOTHING;
INSERT INTO patients (id, clinic_id, patient_code, name, date_of_birth, age, gender, phone, email, address, dosha_type, allergies, medical_history, emergency_contact_name, emergency_contact_phone, is_active, created_at, updated_at) VALUES (9, 2, 'PAT159997880', 'sachinthahewawasam', NULL, 31, 'Male', '0778975423', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2025-11-05T06:49:19.998Z', '2025-11-05T06:49:19.998Z') ON CONFLICT (patient_code) DO NOTHING;

-- Settings
INSERT INTO settings (id, clinic_id, system_name, clinic_name, clinic_address, clinic_phone, clinic_email, currency, tax_rate, consultation_fee, follow_up_fee, created_at, updated_at) VALUES (1, 1, 'ACMS', NULL, NULL, NULL, NULL, 'LKR', 0.00, 1000.00, 500.00, '2025-11-05T06:08:54.721Z', '2025-11-05T06:08:54.721Z') ON CONFLICT (id) DO NOTHING;
INSERT INTO settings (id, clinic_id, system_name, clinic_name, clinic_address, clinic_phone, clinic_email, currency, tax_rate, consultation_fee, follow_up_fee, created_at, updated_at) VALUES (2, null, 'ACMS', 'Ayurvedic Clinic', '', '', '', 'LKR', 0.00, 1000.00, 500.00, '2025-11-05T06:11:48.006Z', '2025-11-05T06:11:48.006Z') ON CONFLICT (id) DO NOTHING;

-- Reset sequences
SELECT setval('clinics_id_seq', (SELECT MAX(id) FROM clinics));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));
SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments));
SELECT setval('medicines_id_seq', (SELECT MAX(id) FROM medicines));
SELECT setval('settings_id_seq', (SELECT MAX(id) FROM settings));
